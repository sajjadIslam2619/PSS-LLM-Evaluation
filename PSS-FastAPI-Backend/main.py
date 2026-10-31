from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

# Load .env. Environment variables are checked first; .env is used only for vars not already set.
load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from init_db import ensure_feedback_likert_columns, ensure_numeric_evaluation_columns, ensure_role_column
from routers import auth, responses, create_own_post, feedback, posts, export

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_feedback_likert_columns()
    ensure_role_column()
    ensure_numeric_evaluation_columns()
    yield


app = FastAPI(
    title="PSS LLM Evaluation API",
    description="Backend for Peer Support System LLM Evaluation",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(responses.router)
app.include_router(create_own_post.router)
app.include_router(feedback.router)
app.include_router(posts.router)
app.include_router(export.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/config")
def health_config():
    """Check whether the LLM env vars are set (values are not revealed)."""
    s = get_settings()
    return {
        "OPENAI_ENDPOINT_set": bool(s.OPENAI_ENDPOINT.strip()),
        "OPENAI_API_KEY_set": bool(s.OPENAI_API_KEY.strip()),
        "OPENAI_MODEL": s.OPENAI_MODEL,
        "llm_ready": bool(s.OPENAI_API_KEY.strip()),
    }
