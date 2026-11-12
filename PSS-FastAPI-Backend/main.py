import logging
import time
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

# Load .env. Environment variables are checked first; .env is used only for vars not already set.
load_dotenv(Path(__file__).parent / ".env")

from logging_config import setup_logging

setup_logging()

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.exception_handlers import request_validation_exception_handler
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from init_db import (
    ensure_completion_email_table,
    ensure_feedback_likert_columns,
    ensure_numeric_evaluation_columns,
    ensure_role_column,
)
from routers import auth, responses, create_own_post, feedback, posts, export, notify

logger = logging.getLogger("pss")
settings = get_settings()

SLOW_REQUEST_SECONDS = 15


def _log_startup_summary() -> None:
    """Which settings are in place (never their values), so a misconfigured server shows up at once."""
    s = get_settings()
    database = s.DATABASE_URL.split("@")[-1] if "@" in s.DATABASE_URL else s.DATABASE_URL
    logger.info("Starting PSS backend | database=%s | debug=%s", database, s.DEBUG)
    logger.info(
        "Settings | login password set=%s | export key set=%s | AI key set=%s | AI model=%s | "
        "custom AI endpoint=%s | email ready=%s",
        bool(s.COMMON_PASSWORD), bool(s.EXPORT_KEY), bool(s.OPENAI_API_KEY.strip()), s.OPENAI_MODEL,
        bool(s.OPENAI_ENDPOINT.strip()), s.email_ready,
    )
    if not s.COMMON_PASSWORD:
        logger.warning("COMMON_PASSWORD is not set: every login will fail")
    if not s.OPENAI_API_KEY.strip():
        logger.warning("OPENAI_API_KEY is not set: participants will get the fallback responses")
    if s.SECRET_KEY == "dev-secret-change-in-production":
        logger.warning("SECRET_KEY is the development default; set a real one in .env")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    _log_startup_summary()
    try:
        ensure_feedback_likert_columns()
        ensure_role_column()
        ensure_numeric_evaluation_columns()
        ensure_completion_email_table()
    except Exception:
        logger.exception("Database check at startup failed")
        raise
    logger.info("Startup complete")
    yield
    logger.info("Shutting down")


app = FastAPI(
    title="PSS LLM Evaluation API",
    description="Backend for Peer Support System LLM Evaluation",
    version="0.1.0",
    lifespan=lifespan,
)


@app.middleware("http")
async def log_failed_and_slow_requests(request: Request, call_next):
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        raise
    elapsed = time.perf_counter() - start
    if response.status_code >= 500:
        logger.error("%s %s returned %s after %.1fs", request.method, request.url.path, response.status_code, elapsed)
    elif elapsed > SLOW_REQUEST_SECONDS:
        logger.warning("Slow request: %s %s took %.1fs", request.method, request.url.path, elapsed)
    return response


@app.exception_handler(RequestValidationError)
async def log_rejected_request(request: Request, exc: RequestValidationError):
    # Field names and reasons only; the submitted values may contain participant text.
    problems = "; ".join(f"{'.'.join(str(p) for p in e.get('loc', []))}: {e.get('msg')}" for e in exc.errors())
    logger.warning("Rejected %s %s (422): %s", request.method, request.url.path, problems)
    return await request_validation_exception_handler(request, exc)


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
app.include_router(notify.router)


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
        "email_ready": s.email_ready,
    }
