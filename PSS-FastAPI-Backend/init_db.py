"""
Create database tables. Run once for development (SQLite) or after deploying (PostgreSQL).
Usage: python -m init_db
"""
from database import Base, sync_engine
from models.user_response import UserResponse
from models.create_own_post_response import CreateOwnPostResponse
from models.user_feedback import UserFeedback


def create_tables_sync():
    """Create all tables using sync engine (works with SQLite and PostgreSQL)."""
    Base.metadata.create_all(bind=sync_engine)
    print("Tables created:")
    print("  - user_response")
    print("  - create_own_post_response")
    print("  - user_feedback")


def main():
    create_tables_sync()
    print("\nDatabase initialized. Use common password 'demo123' for login.")


if __name__ == "__main__":
    main()
