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
from invites import is_valid_invite
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
    role: str
    invite: str | None = None


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

    Requires a valid invite code for this email and role (see invites.py), an eligible role,
    and at least one saved answer under that email and role.
    """
    email = data.email.strip().lower()
    role = data.role
    if not EMAIL_PATTERN.match(email):
        raise HTTPException(status_code=422, detail="Invalid email address")
    if role not in ELIGIBLE_ROLES:
        return {"status": "skipped", "reason": "role is not eligible"}
    if not is_valid_invite(email, role, data.invite):
        return {"status": "skipped", "reason": "not logged in from a valid invite link"}
    settings = get_settings()
    if not settings.email_ready:
        return {"status": "skipped", "reason": "email is not configured"}

    saved = union_all(
        select(UserResponse.id).where(
            func.lower(UserResponse.user_identifier) == email, UserResponse.role == role
        ),
        select(CreateOwnPostResponse.id).where(
            func.lower(CreateOwnPostResponse.user_identifier) == email, CreateOwnPostResponse.role == role
        ),
    ).subquery()
    if not await session.scalar(select(func.count()).select_from(saved)):
        return {"status": "skipped", "reason": "no saved answers"}

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
