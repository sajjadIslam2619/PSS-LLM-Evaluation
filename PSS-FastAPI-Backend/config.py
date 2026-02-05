"""
Application configuration. Uses environment variables.
- Development: SQLite (default)
- Production: Set DATABASE_URL to PostgreSQL connection string.
"""
import os
from functools import lru_cache


class Settings:
    """Application settings from environment."""

    # Database: SQLite for development, PostgreSQL for production
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./pss.db",
    )

    # Async URL: SQLite uses aiosqlite; PostgreSQL uses asyncpg
    @property
    def async_database_url(self) -> str:
        if self.DATABASE_URL.startswith("sqlite"):
            return self.DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://", 1)
        if "postgresql://" in self.DATABASE_URL and "asyncpg" not in self.DATABASE_URL:
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.DATABASE_URL

    @property
    def sync_database_url(self) -> str:
        """Synchronous URL for create_all / migrations (sync engine)."""
        url = self.DATABASE_URL
        if "postgresql+asyncpg" in url:
            return url.replace("postgresql+asyncpg://", "postgresql://", 1)
        if url.startswith("sqlite+aiosqlite"):
            return url.replace("sqlite+aiosqlite://", "sqlite://", 1)
        return url

    # Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # App
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Hugging Face: token for model download (detect-labels). Read from env first, then from .env file.
    HUGGINGFACE_TOKEN: str = os.getenv("HUGGINGFACE_TOKEN", "")


@lru_cache
def get_settings() -> Settings:
    return Settings()
