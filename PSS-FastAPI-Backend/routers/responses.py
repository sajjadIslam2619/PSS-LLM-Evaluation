import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user_response import UserResponse
from schemas.user import UserResponseCreate, UserResponseRead

router = APIRouter(prefix="/responses", tags=["responses"])
logger = logging.getLogger("pss.responses")


def _summary(payload: dict) -> str:
    return (
        f"user={payload['user_identifier']} role={payload['role']} post={payload['article_id']} "
        f"ai_response={'yes' if payload.get('ai_generated_response') else 'no'} "
        f"scores(empathy/relevant/safe)={payload.get('empathy')}/{payload.get('relevant')}/{payload.get('safe')} "
        f"own_response={'yes' if payload.get('modified_response') else 'no'}"
    )


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
        logger.info("Updated Reddit-post answer (id=%s): %s", existing.id, _summary(payload))
        return existing
    else:
        # Insert new record
        response = UserResponse(**payload)
        session.add(response)
        await session.commit()
        await session.refresh(response)
        logger.info("Saved Reddit-post answer (id=%s): %s", response.id, _summary(payload))
        return response
