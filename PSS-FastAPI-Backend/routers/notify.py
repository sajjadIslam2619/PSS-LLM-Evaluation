"""Thank-you email with the gift card link, sent when a participant clicks "Save and Exit"."""
import logging
import re

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import delete, func, select, union_all
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import SyncSessionLocal, get_db
from mailer import completion_email_body, send_email
from models.completion_email import CompletionEmail
from models.create_own_post_response import CreateOwnPostResponse
from models.user_response import UserResponse

router = APIRouter(prefix="/notify", tags=["notify"])
logger = logging.getLogger(__name__)

ELIGIBLE_ROLES = ("Peer Support Specialist", "Veteran")
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
SUBJECT = "Thank you for participating in the PSS LLM Evaluation study"


class CompletionEmailRequest(BaseModel):
    email: str


def _deliver(record_id: int, email: str) -> None:
    settings = get_settings()
    try:
        send_email(email, SUBJECT, completion_email_body(settings.GIFT_CARD_LINK))
        logger.info("Completion email sent to %s", email)
    except Exception:
        logger.exception("Completion email to %s failed", email)
        # Forget the attempt so the next "Save and Exit" tries again.
        with SyncSessionLocal() as session:
            session.execute(delete(CompletionEmail).where(CompletionEmail.id == record_id))
            session.commit()


@router.post("/completion-email")
async def send_completion_email(
    data: CompletionEmailRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
):
    """Email the gift card link once per participant.

    Only addresses that saved at least one answer as a Peer Support Specialist or Veteran
    qualify; the role comes from the saved answers, not from the request.
    """
    email = data.email.strip().lower()
    if not EMAIL_PATTERN.match(email):
        raise HTTPException(status_code=422, detail="Invalid email address")
    settings = get_settings()
    if not settings.email_ready:
        return {"status": "skipped", "reason": "email is not configured"}

    saved_roles = union_all(
        select(UserResponse.role).where(func.lower(UserResponse.user_identifier) == email),
        select(CreateOwnPostResponse.role).where(func.lower(CreateOwnPostResponse.user_identifier) == email),
    ).subquery()
    role = await session.scalar(
        select(saved_roles.c.role).where(saved_roles.c.role.in_(ELIGIBLE_ROLES)).limit(1)
    )
    if role is None:
        return {"status": "skipped", "reason": "no saved answers from an eligible role"}

    if await session.scalar(select(CompletionEmail.id).where(CompletionEmail.email == email)):
        return {"status": "skipped", "reason": "already sent"}

    record = CompletionEmail(email=email, role=role)
    session.add(record)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        return {"status": "skipped", "reason": "already sent"}

    background_tasks.add_task(_deliver, record.id, email)
    return {"status": "queued"}
