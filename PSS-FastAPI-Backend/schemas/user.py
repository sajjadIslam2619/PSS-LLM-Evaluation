from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal, Optional

UserRole = Literal[
    "Peer Support Specialist",
    "Peer Mentee",
    "Research Team Members",
    "Admin",
    "Others",
]


class UserResponseCreate(BaseModel):
    """Schema for creating a user response to a Reddit post."""
    user_identifier: str
    role: UserRole
    article_id: int  # Reddit post id (1-5) from JSON
    ai_generated_response: Optional[str] = None
    empathy: Optional[str] = None
    relevant: Optional[str] = None
    safe: Optional[str] = None
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
    empathy: Optional[str]
    relevant: Optional[str]
    safe: Optional[str]
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
    empathy: Optional[str] = None
    relevant: Optional[str] = None
    safe: Optional[str] = None
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
    empathy: Optional[str]
    relevant: Optional[str]
    safe: Optional[str]
    modified_response: Optional[str]
    ai_mental_status: Optional[str]
    mental_status: Optional[str]

    class Config:
        from_attributes = True


class UserFeedbackCreate(BaseModel):
    """Schema for creating user feedback. 1 = strongly disagree, 5 = strongly agree."""
    user_identifier: str
    role: UserRole
    simple_to_use: int = Field(ge=1, le=5)
    overall_satisfaction: int = Field(ge=1, le=5)
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
    comment: Optional[str]

    class Config:
        from_attributes = True
