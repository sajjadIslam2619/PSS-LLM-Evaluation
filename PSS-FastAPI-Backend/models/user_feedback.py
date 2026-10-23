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
    role: Mapped[str] = mapped_column(String(100), nullable=True)
    response_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    rate: Mapped[int] = mapped_column(Integer, nullable=False)  # copy of overall_satisfaction
    simple_to_use: Mapped[int] = mapped_column(Integer, nullable=True)  # 1 strongly disagree, 5 strongly agree
    overall_satisfaction: Mapped[int] = mapped_column(Integer, nullable=True)  # 1 strongly disagree, 5 strongly agree
    trust_ai_classification: Mapped[int] = mapped_column(Integer, nullable=True)  # 1 strongly disagree, 5 strongly agree
    comfortable_using_ai_response: Mapped[int] = mapped_column(Integer, nullable=True)  # no longer asked; kept for older data
    comfortable_using_ai_response_as_is: Mapped[int] = mapped_column(Integer, nullable=True)  # 1 strongly disagree, 5 strongly agree
    comfortable_using_ai_response_as_draft: Mapped[int] = mapped_column(Integer, nullable=True)  # 1 strongly disagree, 5 strongly agree
    comment: Mapped[str] = mapped_column(Text, nullable=True)
