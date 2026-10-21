"""Shared setup so scripts use the backend's database no matter where they are run from."""
import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_BACKUP_DIR = BACKEND_DIR / "backups"

# The default DATABASE_URL (sqlite:///./pss.db) is relative to the backend folder.
os.chdir(BACKEND_DIR)
sys.path.insert(0, str(BACKEND_DIR))
# Stop SQLAlchemy from printing every query; a real DEBUG env var still wins.
os.environ.setdefault("DEBUG", "false")

from sqlalchemy.engine import make_url  # noqa: E402

from config import get_settings  # noqa: E402
from models.create_own_post_response import CreateOwnPostResponse  # noqa: E402
from models.user_feedback import UserFeedback  # noqa: E402
from models.user_response import UserResponse  # noqa: E402

MODELS = (UserResponse, CreateOwnPostResponse, UserFeedback)


def database_url():
    return make_url(get_settings().sync_database_url)


def sqlite_path() -> Path | None:
    """Absolute path of the SQLite file, or None when the database is not SQLite."""
    url = database_url()
    if url.get_backend_name() != "sqlite" or not url.database:
        return None
    return (BACKEND_DIR / url.database).resolve()


def describe_database() -> str:
    path = sqlite_path()
    if path:
        return f"SQLite file {path}"
    return f"{database_url().get_backend_name()} database {database_url().render_as_string(hide_password=True)}"
