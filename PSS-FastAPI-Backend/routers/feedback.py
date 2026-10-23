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
    """Save the Likert answers (each optional) and an optional comment."""
    payload = data.model_dump()
    # rate is NOT NULL in existing databases; 0 means overall_satisfaction was skipped.
    payload["rate"] = payload["overall_satisfaction"] or 0
    feedback = UserFeedback(**payload)
    session.add(feedback)
    await session.commit()
    await session.refresh(feedback)
    return feedback
