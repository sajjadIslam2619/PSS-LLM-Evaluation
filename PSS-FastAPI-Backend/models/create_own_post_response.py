"""
Table: create_own_post_response
Saves responses for user-created posts.
"""
from sqlalchemy import String, DateTime, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from database import Base


class CreateOwnPostResponse(Base):
    __tablename__ = "create_own_post_response"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_identifier: Mapped[str] = mapped_column(String(255), nullable=False, index=True)  # name/email
    response_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    article_id: Mapped[int] = mapped_column(Integer, nullable=True)  # max(existing) + 1
    post_content: Mapped[str] = mapped_column(Text, nullable=True)  # user's post content
    ai_generated_response: Mapped[str] = mapped_column(String(2000), nullable=True)
    empathy: Mapped[str] = mapped_column(String(50), nullable=True)
    relevant: Mapped[str] = mapped_column(String(50), nullable=True)
    safe: Mapped[str] = mapped_column(String(50), nullable=True)
    modified_response: Mapped[str] = mapped_column(String(2000), nullable=True)  # user's custom response
    ai_mental_status: Mapped[str] = mapped_column(String(500), nullable=True)  # AI-detected labels (comma-separated)
    mental_status: Mapped[str] = mapped_column(String(500), nullable=True)  # user-selected labels (comma-separated)
