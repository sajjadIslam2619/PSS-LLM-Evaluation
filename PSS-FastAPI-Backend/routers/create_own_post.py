from fastapi import APIRouter, Depends
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
    """Save a user's response to their own created post."""
    response = CreateOwnPostResponse(**data.model_dump())
    session.add(response)
    await session.commit()
    await session.refresh(response)
    return response
