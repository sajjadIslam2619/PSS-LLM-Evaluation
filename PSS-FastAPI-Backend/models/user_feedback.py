"""
Table: user-feedback
Saves user feedback (rating and comment).
"""
from sqlalchemy import String, DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from database import Base


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_identifier: Mapped[str] = mapped_column(String(255), nullable=False, index=True)  # name/email
    response_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    rate: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5 stars
    comment: Mapped[str] = mapped_column(Text, nullable=True)
