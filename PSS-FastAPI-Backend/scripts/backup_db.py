"""
Back up the SQLite database to a timestamped, compressed file.

Safe to run while the backend is running: it uses SQLite's backup API, which
produces a consistent copy even if a participant is saving at the same moment.

Usage (from PSS-FastAPI-Backend):
    python scripts/backup_db.py                  # backups/pss-YYYYmmdd-HHMMSS.db.gz, keeps newest 10
    python scripts/backup_db.py --dest D:/pss-backups --keep 20

On a Linux server, schedule it daily with cron, e.g.:
    0 3 * * * cd /path/to/PSS-FastAPI-Backend && venv/bin/python scripts/backup_db.py

For PostgreSQL, use pg_dump or your provider's automated backups (e.g. RDS snapshots) instead.
"""
import argparse
import gzip
import shutil
import sqlite3
import sys
import tempfile
from datetime import datetime
from pathlib import Path

from _common import DEFAULT_BACKUP_DIR, describe_database, sqlite_path

DEFAULT_KEEP = 10


def backup(dest: Path, keep: int = DEFAULT_KEEP) -> Path:
    source = sqlite_path()
    if source is None:
        sys.exit(f"{describe_database()} is not SQLite. Use pg_dump or managed backups instead.")
    if not source.exists():
        sys.exit(f"Database file not found: {source}")

    dest.mkdir(parents=True, exist_ok=True)
    target = dest / f"{source.stem}-{datetime.now():%Y%m%d-%H%M%S}.db.gz"

    with tempfile.TemporaryDirectory() as tmp:
        snapshot = Path(tmp) / source.name
        src_conn = sqlite3.connect(source)
        dst_conn = sqlite3.connect(snapshot)
        try:
            src_conn.backup(dst_conn)
        finally:
            dst_conn.close()
            src_conn.close()
        with open(snapshot, "rb") as raw, gzip.open(target, "wb") as packed:
            shutil.copyfileobj(raw, packed)

    old_backups = sorted(dest.glob(f"{source.stem}-*.db.gz"), reverse=True)[keep:]
    for old in old_backups:
        old.unlink()

    print(f"Backed up {source} -> {target} ({target.stat().st_size / 1024:.1f} KB)")
    if old_backups:
        print(f"Removed {len(old_backups)} old backup(s), keeping the newest {keep}")
    return target


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dest", type=Path, default=DEFAULT_BACKUP_DIR, help="folder for backups (default: backups/)")
    parser.add_argument(
        "--keep", type=int, default=DEFAULT_KEEP, help=f"number of newest backups to keep (default: {DEFAULT_KEEP})"
    )
    args = parser.parse_args()
    if args.keep < 1:
        parser.error("--keep must be at least 1")
    backup(args.dest.resolve(), args.keep)


if __name__ == "__main__":
    main()
