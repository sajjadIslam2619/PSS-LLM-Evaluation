from fastapi import APIRouter, Depends
from sqlalchemy import select
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
    """Save or update a user's response to a Reddit post. Checks by user_identifier + article_id."""
    payload = data.model_dump()
    
    # Check if record exists
    result = await session.execute(
        select(UserResponse).where(
            UserResponse.user_identifier == payload["user_identifier"],
            UserResponse.article_id == payload["article_id"]
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        # Update existing record
        for key, value in payload.items():
            if key != "user_identifier" and key != "article_id":  # Don't update the key fields
                setattr(existing, key, value)
        await session.commit()
        await session.refresh(existing)
        return existing
    else:
        # Insert new record
        response = UserResponse(**payload)
        session.add(response)
        await session.commit()
        await session.refresh(response)
        return response
