"""Application logging. Lines go to stderr, which systemd stores in the journal
(read them with `sudo journalctl -u pss`). Set LOG_LEVEL=DEBUG in .env for more detail."""
import logging
import os
import re

LOG_FORMAT = "%(asctime)s %(levelname)-7s %(name)s: %(message)s"
SECRET_QUERY = re.compile(r"((?:^|[?&])(?:key|pass|password|token)=)[^&\s]*", re.IGNORECASE)


class RedactSecretsInUrls(logging.Filter):
    """Uvicorn's access log prints full URLs, e.g. /export?key=...; hide those values."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.args, tuple):
            record.args = tuple(SECRET_QUERY.sub(r"\1***", a) if isinstance(a, str) else a for a in record.args)
        return True


def setup_logging() -> None:
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    root = logging.getLogger()
    if not any(getattr(h, "_pss", False) for h in root.handlers):
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(LOG_FORMAT))
        handler._pss = True
        root.addHandler(handler)
    root.setLevel(level)
    access = logging.getLogger("uvicorn.access")
    if not any(isinstance(f, RedactSecretsInUrls) for f in access.filters):
        access.addFilter(RedactSecretsInUrls())
    # Library chatter that would drown out the app's own lines.
    for noisy in ("httpx", "httpcore", "openai", "urllib3", "filelock", "huggingface_hub", "transformers"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
    # With DEBUG=true SQLAlchemy echoes SQL through its own handler; don't print it twice.
    logging.getLogger("sqlalchemy").propagate = False
