import logging

from fastapi import APIRouter, HTTPException

from auth import verify_password, create_access_token
from schemas.auth import LoginRequest, Token

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("pss.auth")


@router.post("/login", response_model=Token)
async def login(body: LoginRequest):
    """
    Login with email and common password.
    Returns a JWT token with the user identifier.
    """
    if not verify_password(body.password):
        logger.warning("Login failed (wrong password) for %s", body.username)
        raise HTTPException(status_code=401, detail="Invalid password")
    token = create_access_token(subject=body.username)
    logger.info("Login: %s", body.username)
    return Token(token=token)
