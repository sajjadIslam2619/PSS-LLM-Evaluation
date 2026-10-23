import asyncio
import json
import logging
import threading
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/posts", tags=["posts"])
HF_DETECT_LABELS_MODEL = "SajjadIslam/multiMentalRoBERTA-6-class"
_classifier_pipeline = None
_classifier_lock = threading.Lock()

# Path to redditPosts.json
POSTS_FILE = Path(__file__).parent.parent / "data" / "redditPosts.json"

DETECT_LABELS_ERROR_MSG = "Something went wrong, no mental status detected by AI"


class DetectLabelsRequest(BaseModel):
    post_content: str = ""


@router.get("/reddit")
async def get_reddit_posts():
    """Get the 5 Reddit posts from redditPosts.json."""
    try:
        with open(POSTS_FILE, "r", encoding="utf-8") as f:
            posts = json.load(f)
        return {"posts": posts}
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Reddit posts file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON in posts file")


@router.post("/detect-labels", response_model=dict)
async def detect_labels(body: DetectLabelsRequest):
    """Return AI-detected mental state labels (6-class) via Hugging Face. No dummy fallback."""
    content = (body.post_content or "").strip()
    if not content:
        return {"labels": []}

    settings = get_settings()

    def _run_local_classification():
        global _classifier_pipeline
        with _classifier_lock:
            if _classifier_pipeline is None:
                from transformers import pipeline
                _classifier_pipeline = pipeline(
                    "text-classification",
                    model=HF_DETECT_LABELS_MODEL,
                    top_k=None,
                    truncation=True,
                    token=settings.HUGGINGFACE_TOKEN or None,
                )
        return _classifier_pipeline(content)

    try:
        # Run in thread pool (model load + inference can be slow)
        result = await asyncio.to_thread(_run_local_classification)
        if result is None:
            result = []
        if isinstance(result, dict):
            result = [result]
        if not isinstance(result, list):
            result = list(result) if hasattr(result, "__iter__") else []
        # Flatten: pipeline can return [[{...}, {...}]] or [{...}, {...}]
        flat = []
        for item in result:
            if isinstance(item, list):
                flat.extend(item)
            else:
                flat.append(item)
        # Extract (label, score), sort by score descending, take top 2
        with_scores = []
        for item in flat:
            label = item.get("label", getattr(item, "label", None)) if isinstance(item, dict) else getattr(item, "label", None)
            score = item.get("score", getattr(item, "score", 0)) if isinstance(item, dict) else getattr(item, "score", 0)
            if label is not None:
                with_scores.append((str(label), float(score)))
        with_scores.sort(key=lambda x: x[1], reverse=True)
        top2 = with_scores[:2]
        labels = [{"name": label, "percentage": round(score * 100, 2)} for label, score in top2]
        if not labels:
            logger.warning("detect-labels: No labels from model. Raw: %s", result)
            return {"labels": [], "error": DETECT_LABELS_ERROR_MSG}
        return {"labels": labels}
    except Exception as e:
        logger.exception("detect-labels: Request failed: %s", e)
        return {"labels": [], "error": DETECT_LABELS_ERROR_MSG}


def _default_response_for_post(post_content: str, post_id: int | None) -> str | None:
    """Return curated fallback text from redditPosts.json when AI generation fails."""
    try:
        with open(POSTS_FILE, "r", encoding="utf-8") as f:
            posts = json.load(f)
    except (OSError, json.JSONDecodeError):
        return None
    if not isinstance(posts, list):
        return None
    content_norm = (post_content or "").strip()
    if post_id is not None:
        for p in posts:
            if isinstance(p, dict) and p.get("id") == post_id:
                dr = p.get("default-response")
                if isinstance(dr, str) and dr.strip():
                    return dr.strip()
    for p in posts:
        if not isinstance(p, dict):
            continue
        if (p.get("content") or "").strip() == content_norm:
            dr = p.get("default-response")
            if isinstance(dr, str) and dr.strip():
                return dr.strip()
    return None


class GenerateResponseRequest(BaseModel):
    post_content: str = ""
    post_id: int | None = None


SYSTEM_PROMPT = """You are a supportive peer support specialist. The user will share a social media post (which may describe difficult feelings or experiences). Write a short, empathetic, and safe response that:
- Acknowledges their feelings without diagnosing
- Is supportive and non-judgmental
- Suggests reaching out to trusted people or professionals if appropriate
- Stays concise (a few sentences)."""


def _call_llm(content: str, settings) -> str:
    from openai import OpenAI
    client = OpenAI(
        base_url=settings.OPENAI_ENDPOINT.strip().rstrip("/") or None,
        api_key=settings.OPENAI_API_KEY,
    )
    extra = {}
    if settings.OPENAI_TEMPERATURE.strip():
        extra["temperature"] = float(settings.OPENAI_TEMPERATURE)
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": content},
        ],
        max_completion_tokens=512,
        model=settings.OPENAI_MODEL,
        **extra,
    )
    if response.choices and response.choices[0].message.content:
        return response.choices[0].message.content.strip()
    return ""


# Shown to user when config is missing; detailed message only in server logs.
CONFIG_ERROR_MSG = "Something went wrong calling the AI API."


def _model_statuses(settings, llm_connected: bool, llm_detail: str) -> list[dict]:
    """Connection status of the response-generation model, shown in the UI when a fallback response is used."""
    return [
        {
            "name": f"AI model ({settings.OPENAI_MODEL})",
            "task": "Response generation",
            "connected": llm_connected,
            "detail": llm_detail,
        },
    ]


@router.post("/generate-response", response_model=dict)
async def generate_response(body: GenerateResponseRequest):
    """Generate an AI response for the post with the configured OpenAI-compatible model.

    `source` is "ai" for a model-generated response, "default" for the curated fallback
    from redditPosts.json, or "none" when nothing could be returned.
    """
    content = (body.post_content or "").strip()
    settings = get_settings()
    if not content:
        return {"response": "", "error": None, "source": "none", "models": []}

    def _result(response: str, source: str, error: str | None, llm_connected: bool, llm_detail: str) -> dict:
        return {
            "response": response,
            "error": error,
            "source": source,
            "models": _model_statuses(settings, llm_connected, llm_detail),
        }

    def _fallback_or_error(error: str | None, llm_detail: str) -> dict:
        fallback = _default_response_for_post(content, body.post_id)
        if fallback:
            return _result(fallback, "default", None, False, llm_detail)
        return _result("", "none", error, False, llm_detail)

    if not settings.OPENAI_API_KEY.strip():
        logger.warning("generate-response: OPENAI_API_KEY not set")
        return _fallback_or_error(CONFIG_ERROR_MSG, "Not configured (API key missing)")

    try:
        text = await asyncio.to_thread(_call_llm, content, settings)
    except Exception as e:
        logger.exception("generate-response: LLM call failed: %s", e)
        err_msg = str(e).strip() or "The AI service failed. Please try again later."
        return _fallback_or_error(err_msg, "Request failed")

    if not (text or "").strip():
        return _fallback_or_error(None, "Returned an empty response")
    return _result(text.strip(), "ai", None, True, "Connected")
