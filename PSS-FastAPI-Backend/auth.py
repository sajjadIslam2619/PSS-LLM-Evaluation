from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt

from config import get_settings

settings = get_settings()

# Common password for all users (no user table)
COMMON_PASSWORD = "demo123"


def create_access_token(subject: str) -> str:
    """Create JWT token for user identifier (name/email)."""
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """Decode JWT token and return user identifier."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


def verify_password(password: str) -> bool:
    """Verify password matches common password."""
    return password == COMMON_PASSWORD
