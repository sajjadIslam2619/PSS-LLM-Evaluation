"""
Table: user-response
Saves responses to the 5 Reddit posts.
"""
from sqlalchemy import String, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from database import Base


class UserResponse(Base):
    __tablename__ = "user_response"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_identifier: Mapped[str] = mapped_column(String(255), nullable=False, index=True)  # name/email
    response_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    article_id: Mapped[int] = mapped_column(Integer, nullable=False)  # Reddit post id (1-5) or create-own-post id
    ai_generated_response: Mapped[str] = mapped_column(String(2000), nullable=True)
    empathy: Mapped[str] = mapped_column(String(50), nullable=True)  # Agree, Somewhat Agree, etc.
    relevant: Mapped[str] = mapped_column(String(50), nullable=True)
    safe: Mapped[str] = mapped_column(String(50), nullable=True)
    modified_response: Mapped[str] = mapped_column(String(2000), nullable=True)  # user's custom response
    mental_status: Mapped[str] = mapped_column(String(500), nullable=True)  # comma-separated labels
