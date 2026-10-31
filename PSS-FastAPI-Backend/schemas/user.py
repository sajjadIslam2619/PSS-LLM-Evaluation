from pydantic import BaseModel, Field
from datetime import datetime
from typing import Annotated, Literal, Optional

UserRole = Literal[
    "Peer Support Specialist",
    "Veteran",
    "Research Team Member",
    "Admin",
    "Others",
]

# 1 = strongly disagree … 5 = strongly agree, 0 = not applicable
EvaluationScore = Annotated[int, Field(ge=0, le=5)]


class UserResponseCreate(BaseModel):
    """Schema for creating a user response to a Reddit post."""
    user_identifier: str
    role: UserRole
    article_id: int  # Reddit post id (1-5) from JSON
    ai_generated_response: Optional[str] = None
    empathy: Optional[EvaluationScore] = None
    relevant: Optional[EvaluationScore] = None
    safe: Optional[EvaluationScore] = None
    modified_response: Optional[str] = None
    mental_status: Optional[str] = None  # comma-separated labels


class UserResponseRead(BaseModel):
    """Schema for reading a user response."""
    id: int
    user_identifier: str
    role: Optional[UserRole] = None
    response_date: datetime
    article_id: int
    ai_generated_response: Optional[str]
    empathy: Optional[int]
    relevant: Optional[int]
    safe: Optional[int]
    modified_response: Optional[str]
    mental_status: Optional[str]

    class Config:
        from_attributes = True


class CreateOwnPostResponseCreate(BaseModel):
    """Schema for creating a response to user's own post."""
    user_identifier: str
    role: UserRole
    article_id: Optional[int] = None  # If provided, updates existing record; otherwise creates new
    post_content: Optional[str] = None
    ai_generated_response: Optional[str] = None
    empathy: Optional[EvaluationScore] = None
    relevant: Optional[EvaluationScore] = None
    safe: Optional[EvaluationScore] = None
    modified_response: Optional[str] = None
    ai_mental_status: Optional[str] = None  # comma-separated
    mental_status: Optional[str] = None  # comma-separated


class CreateOwnPostResponseRead(BaseModel):
    """Schema for reading a create-own-post response."""
    id: int
    user_identifier: str
    role: Optional[UserRole] = None
    response_date: datetime
    article_id: Optional[int] = None
    post_content: Optional[str]
    ai_generated_response: Optional[str]
    empathy: Optional[int]
    relevant: Optional[int]
    safe: Optional[int]
    modified_response: Optional[str]
    ai_mental_status: Optional[str]
    mental_status: Optional[str]

    class Config:
        from_attributes = True


class UserFeedbackCreate(BaseModel):
    """Schema for creating user feedback. 1 = strongly disagree, 5 = strongly agree."""
    user_identifier: str
    role: UserRole
    simple_to_use: Optional[int] = Field(default=None, ge=1, le=5)
    overall_satisfaction: Optional[int] = Field(default=None, ge=1, le=5)
    trust_ai_classification: Optional[int] = Field(default=None, ge=1, le=5)
    comfortable_using_ai_response_as_is: Optional[int] = Field(default=None, ge=1, le=5)
    comfortable_using_ai_response_as_draft: Optional[int] = Field(default=None, ge=1, le=5)
    ai_makes_work_manageable: Optional[int] = Field(default=None, ge=1, le=5)
    comment: Optional[str] = None


class UserFeedbackRead(BaseModel):
    """Schema for reading user feedback."""
    id: int
    user_identifier: str
    role: Optional[UserRole] = None
    response_date: datetime
    rate: int
    simple_to_use: Optional[int] = None
    overall_satisfaction: Optional[int] = None
    trust_ai_classification: Optional[int] = None
    comfortable_using_ai_response: Optional[int] = None
    comfortable_using_ai_response_as_is: Optional[int] = None
    comfortable_using_ai_response_as_draft: Optional[int] = None
    ai_makes_work_manageable: Optional[int] = None
    comment: Optional[str]

    class Config:
        from_attributes = True
