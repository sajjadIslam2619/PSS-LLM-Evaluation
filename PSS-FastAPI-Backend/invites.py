"""Signed invite codes. A code ties an invite link to one email and role, so only
participants invited by the research team can receive the thank-you email."""
import base64
import hashlib
import hmac
from urllib.parse import urlencode

from config import get_settings

DEFAULT_APP_URL = "https://sajjadislam2619.github.io/PSS-LLM-Evaluation/"


def invite_code(email: str, role: str) -> str:
    message = f"{email.strip().lower()}\n{role}".encode()
    digest = hmac.new(get_settings().SECRET_KEY.encode(), message, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(digest[:18]).decode()


def is_valid_invite(email: str, role: str, code: str | None) -> bool:
    return bool(code) and hmac.compare_digest(invite_code(email, role), code)


def invite_link(email: str, role: str, app_url: str = DEFAULT_APP_URL, include_password: bool = True) -> str:
    params = {"email": email.strip().lower(), "role": role}
    if include_password:
        params["pass"] = get_settings().COMMON_PASSWORD
    params["invite"] = invite_code(email, role)
    return f"{app_url}?{urlencode(params)}"
