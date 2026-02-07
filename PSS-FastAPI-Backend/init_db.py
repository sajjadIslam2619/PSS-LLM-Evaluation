"""
Create database tables. Run once for development (SQLite) or after deploying (PostgreSQL).
Usage: from backend folder run:  python init_db.py
"""
from sqlalchemy import text

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


def main():
    create_tables_sync()
    print("\nDatabase initialized. Use common password 'demo123' for login.")


if __name__ == "__main__":
    main()
