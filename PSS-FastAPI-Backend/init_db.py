"""
Create database tables. Run once for development (SQLite) or after deploying (PostgreSQL).
Usage: from backend folder run:  python init_db.py
"""
from sqlalchemy import inspect, text

from database import Base, sync_engine
from models.user_response import UserResponse
from models.create_own_post_response import CreateOwnPostResponse
from models.user_feedback import UserFeedback


def add_article_id_if_missing():
    """Add article_id column to existing tables if missing (migration for existing DBs)."""
    with sync_engine.connect() as conn:
        for table, col in [("user_response", "article_id"), ("create_own_post_response", "article_id")]:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} INTEGER"))
                conn.commit()
                print(f"  Added column {table}.{col}")
            except Exception as e:
                err = str(e).lower()
                if "duplicate column" in err or "already exists" in err:
                    pass
                else:
                    raise


def drop_post_id_if_exists():
    """Drop post_id column from user_response (migration: post_id removed, use article_id only)."""
    with sync_engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE user_response DROP COLUMN post_id"))
            conn.commit()
            print("  Dropped column user_response.post_id")
        except Exception as e:
            err = str(e).lower()
            if "no such column" in err or "does not exist" in err:
                pass
            else:
                raise


def ensure_role_column():
    """Add role to the tables that store participant answers."""
    inspector = inspect(sync_engine)
    tables = inspector.get_table_names()
    with sync_engine.connect() as conn:
        for table in ("user_response", "create_own_post_response", "user_feedback"):
            if table not in tables:
                continue
            existing = {col["name"] for col in inspector.get_columns(table)}
            if "role" in existing:
                continue
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN role VARCHAR(100)"))
            conn.commit()
            print(f"  Added column {table}.role")


def ensure_feedback_likert_columns():
    """Add the Likert columns to an existing user_feedback table."""
    inspector = inspect(sync_engine)
    if "user_feedback" not in inspector.get_table_names():
        return
    existing = {col["name"] for col in inspector.get_columns("user_feedback")}
    with sync_engine.connect() as conn:
        for col in (
            "simple_to_use",
            "overall_satisfaction",
            "trust_ai_classification",
            "comfortable_using_ai_response",
            "comfortable_using_ai_response_as_is",
            "comfortable_using_ai_response_as_draft",
        ):
            if col in existing:
                continue
            conn.execute(text(f"ALTER TABLE user_feedback ADD COLUMN {col} INTEGER"))
            conn.commit()
            print(f"  Added column user_feedback.{col}")


def create_tables_sync():
    """Create all tables using sync engine (works with SQLite and PostgreSQL)."""
    Base.metadata.create_all(bind=sync_engine)
    print("Tables created:")
    print("  - user_response")
    print("  - create_own_post_response")
    print("  - user_feedback")
    print("Migration: adding article_id if missing...")
    add_article_id_if_missing()
    print("Migration: dropping post_id if exists...")
    drop_post_id_if_exists()
    print("Migration: adding feedback Likert columns if missing...")
    ensure_feedback_likert_columns()
    print("Migration: adding role if missing...")
    ensure_role_column()


def main():
    create_tables_sync()
    print("\nDatabase initialized. Login uses COMMON_PASSWORD from the environment or .env.")


if __name__ == "__main__":
    main()
