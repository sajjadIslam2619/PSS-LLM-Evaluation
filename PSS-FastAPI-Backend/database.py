"""
Database connection and session. Works with SQLite (dev) and PostgreSQL (prod).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from config import get_settings

settings = get_settings()

# Synchronous engine (for migrations, create_all, or sync scripts)
sync_engine = create_engine(
    settings.sync_database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.sync_database_url else {},
    echo=settings.DEBUG,
)

# Async engine for FastAPI request handlers
async_engine = create_async_engine(
    settings.async_database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.async_database_url else {},
    echo=settings.DEBUG,
)


class Base(DeclarativeBase):
    """Base class for all models."""

    pass


AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)


def get_sync_session():
    """Sync session for migrations / CLI (e.g. create tables)."""
    session = SyncSessionLocal()
    try:
        yield session
    finally:
        session.close()


async def get_db():
    """Dependency: async DB session for FastAPI."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
