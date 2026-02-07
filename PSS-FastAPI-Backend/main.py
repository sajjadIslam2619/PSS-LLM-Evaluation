from pathlib import Path

from dotenv import load_dotenv

# Load .env. Environment variables are checked first; .env is used only for vars not already set.
load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import auth, responses, create_own_post, feedback, posts

settings = get_settings()

app = FastAPI(
    title="PSS LLM Evaluation API",
    description="Backend for Peer Support System LLM Evaluation",
    version="0.1.0",
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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/config")
def health_config():
    """Check whether Azure OpenAI env vars are set (values are not revealed)."""
    s = get_settings()
    return {
        "AZURE_OPENAI_ENDPOINT_set": bool(s.AZURE_OPENAI_ENDPOINT and s.AZURE_OPENAI_ENDPOINT.strip()),
        "AZURE_OPENAI_API_KEY_set": bool(s.AZURE_OPENAI_API_KEY and s.AZURE_OPENAI_API_KEY.strip()),
        "azure_ready": bool(
            s.AZURE_OPENAI_ENDPOINT and s.AZURE_OPENAI_ENDPOINT.strip()
            and s.AZURE_OPENAI_API_KEY and s.AZURE_OPENAI_API_KEY.strip()
        ),
    }
