from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.create_own_post_response import CreateOwnPostResponse
from schemas.user import CreateOwnPostResponseCreate, CreateOwnPostResponseRead

router = APIRouter(prefix="/create-own-post", tags=["create-own-post"])


@router.post("", response_model=CreateOwnPostResponseRead, status_code=201)
async def create_own_post_response(
    data: CreateOwnPostResponseCreate,
    session: AsyncSession = Depends(get_db),
):
    """Save or update a user's response to their own created post. Checks by user_identifier + article_id.
    If article_id not provided, generates new one. If exists, updates the record."""
    payload = data.model_dump()
    
    # If article_id provided, check for existing record
    article_id = payload.get("article_id")
    if article_id:
        result = await session.execute(
            select(CreateOwnPostResponse).where(
                CreateOwnPostResponse.user_identifier == payload["user_identifier"],
                CreateOwnPostResponse.article_id == article_id
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            # Update existing record
            for key, value in payload.items():
                if key != "user_identifier" and key != "article_id":
                    setattr(existing, key, value)
            await session.commit()
            await session.refresh(existing)
            return existing
    
    # No article_id or not found: generate new article_id and insert
    max_result = await session.execute(select(func.max(CreateOwnPostResponse.article_id)))
    max_article_id = max_result.scalar()
    new_article_id = (max_article_id or 0) + 1
    payload["article_id"] = new_article_id  # Set in payload instead of passing separately
    response = CreateOwnPostResponse(**payload)
    session.add(response)
    await session.commit()
    await session.refresh(response)
    return response
