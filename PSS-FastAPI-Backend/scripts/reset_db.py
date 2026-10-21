"""
Delete all saved participant data, keeping the tables. Use once before the real
study starts to remove test entries.

For SQLite, a backup is made first (see backup_db.py) unless --no-backup is given.
Stop the backend before running this.

Usage (from PSS-FastAPI-Backend):
    python scripts/reset_db.py          # shows row counts and asks you to type DELETE
    python scripts/reset_db.py --yes    # no prompt (for automation)
"""
import argparse
import sys

from sqlalchemy import delete, func, select

from _common import DEFAULT_BACKUP_DIR, MODELS, describe_database, sqlite_path
from database import SyncSessionLocal


def row_counts(session) -> dict[str, int]:
    return {model.__tablename__: session.scalar(select(func.count()).select_from(model)) for model in MODELS}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--yes", action="store_true", help="skip the confirmation prompt")
    parser.add_argument("--no-backup", action="store_true", help="do not back up the SQLite file first")
    args = parser.parse_args()

    print(f"Database: {describe_database()}")
    with SyncSessionLocal() as session:
        counts = row_counts(session)
        for table, count in counts.items():
            print(f"  {table:28} {count} rows")

        if sum(counts.values()) == 0:
            print("Nothing to delete.")
            return

        if not args.yes:
            answer = input("\nThis permanently deletes ALL rows above. Type DELETE to continue: ")
            if answer.strip() != "DELETE":
                sys.exit("Cancelled. Nothing was deleted.")

        if sqlite_path() and not args.no_backup:
            from backup_db import backup

            backup(DEFAULT_BACKUP_DIR)
        elif not sqlite_path():
            print("Not SQLite: no automatic backup was made.")

        for model in MODELS:
            session.execute(delete(model))
        session.commit()

        remaining = row_counts(session)
        print("Deleted. Remaining rows:", ", ".join(f"{t}={n}" for t, n in remaining.items()))


if __name__ == "__main__":
    main()
