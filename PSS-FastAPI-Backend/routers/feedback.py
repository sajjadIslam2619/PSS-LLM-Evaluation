import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.user_feedback import UserFeedback
from schemas.user import UserFeedbackCreate, UserFeedbackRead

router = APIRouter(prefix="/feedback", tags=["feedback"])
logger = logging.getLogger("pss.feedback")

LIKERT_FIELDS = (
    "simple_to_use",
    "overall_satisfaction",
    "trust_ai_classification",
    "comfortable_using_ai_response_as_is",
    "comfortable_using_ai_response_as_draft",
    "ai_makes_work_manageable",
)


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
    answered = sum(payload.get(field) is not None for field in LIKERT_FIELDS)
    logger.info(
        "Saved feedback (id=%s): user=%s role=%s answered=%s/%s comment=%s",
        feedback.id, payload["user_identifier"], payload["role"], answered, len(LIKERT_FIELDS),
        "yes" if (payload.get("comment") or "").strip() else "no",
    )
    return feedback
