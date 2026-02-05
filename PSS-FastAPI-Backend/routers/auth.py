from fastapi import APIRouter, HTTPException

from auth import verify_password, create_access_token
from schemas.auth import LoginRequest, Token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login(body: LoginRequest):
    """
    Login with name/email identifier and common password.
    Returns a JWT token with the user identifier.
    """
    if not verify_password(body.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    token = create_access_token(subject=body.username)
    return Token(token=token)
