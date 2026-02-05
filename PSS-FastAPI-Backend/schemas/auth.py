from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str  # name/email identifier
    password: str


class Token(BaseModel):
    token: str
