from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user_response import UserResponse
from schemas.user import UserResponseCreate, UserResponseRead

router = APIRouter(prefix="/responses", tags=["responses"])


@router.post("", response_model=UserResponseRead, status_code=201)
async def create_user_response(
    data: UserResponseCreate,
    session: AsyncSession = Depends(get_db),
):
    """Save a user's response to a Reddit post."""
    response = UserResponse(**data.model_dump())
    session.add(response)
    await session.commit()
    await session.refresh(response)
    return response
