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
            "ai_makes_work_manageable",
        ):
            if col in existing:
                continue
            conn.execute(text(f"ALTER TABLE user_feedback ADD COLUMN {col} INTEGER"))
            conn.commit()
            print(f"  Added column user_feedback.{col}")


EVALUATION_COLUMNS = ("empathy", "relevant", "safe")
LEGACY_EVALUATION_SCORES = {
    "Agree": 5,
    "Somewhat Agree": 4,
    "Neutral": 3,
    "Somewhat Disagree": 2,
    "Disagree": 1,
    "Not Applicable": 0,
}


def ensure_numeric_evaluation_columns():
    """Rebuild response tables whose empathy/relevant/safe columns still store text labels.

    SQLite cannot change a column type in place, so the table is recreated from the model
    and old labels are converted to 0-5.
    """
    inspector = inspect(sync_engine)
    tables = inspector.get_table_names()
    for table in ("user_response", "create_own_post_response"):
        if table not in tables:
            continue
        columns = inspector.get_columns(table)
        types = {col["name"]: str(col["type"]).upper() for col in columns}
        if all(types.get(col, "INTEGER") == "INTEGER" for col in EVALUATION_COLUMNS):
            continue

        old_table = f"{table}_old"
        model_table = Base.metadata.tables[table]
        unknown = [col["name"] for col in columns if col["name"] not in model_table.c]
        if unknown:
            raise RuntimeError(f"{table} has columns not in the model {unknown}; refusing to rebuild it")
        common = [col["name"] for col in columns]
        cases = " ".join(f"WHEN '{label}' THEN {score}" for label, score in LEGACY_EVALUATION_SCORES.items())
        select_cols = ", ".join(
            f"CASE TRIM({col}) {cases} "
            f"WHEN '0' THEN 0 WHEN '1' THEN 1 WHEN '2' THEN 2 WHEN '3' THEN 3 WHEN '4' THEN 4 WHEN '5' THEN 5 "
            f"ELSE NULL END"
            if col in EVALUATION_COLUMNS
            else col
            for col in common
        )
        index_names = [index["name"] for index in inspector.get_indexes(table)]
        with sync_engine.begin() as conn:
            conn.execute(text(f"ALTER TABLE {table} RENAME TO {old_table}"))
            for name in index_names:
                conn.execute(text(f"DROP INDEX IF EXISTS {name}"))
            model_table.create(bind=conn)
            conn.execute(text(
                f"INSERT INTO {table} ({', '.join(common)}) SELECT {select_cols} FROM {old_table}"
            ))
            conn.execute(text(f"DROP TABLE {old_table}"))
        print(f"  Converted {table}.empathy/relevant/safe to numeric scores")


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
    print("Migration: converting response evaluations to numeric scores if needed...")
    ensure_numeric_evaluation_columns()


def main():
    create_tables_sync()
    print("\nDatabase initialized. Login uses COMMON_PASSWORD from the environment or .env.")


if __name__ == "__main__":
    main()
