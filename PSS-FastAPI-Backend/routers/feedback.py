from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user_feedback import UserFeedback
from schemas.user import UserFeedbackCreate, UserFeedbackRead

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=UserFeedbackRead, status_code=201)
async def create_feedback(
    data: UserFeedbackCreate,
    session: AsyncSession = Depends(get_db),
):
    """Save user feedback (rating and comment)."""
    feedback = UserFeedback(**data.model_dump())
    session.add(feedback)
    await session.commit()
    await session.refresh(feedback)
    return feedback
