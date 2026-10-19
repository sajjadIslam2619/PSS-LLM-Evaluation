"""Download saved participant data as a zip of CSV files."""
import csv
import io
import secrets
import zipfile
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from database import get_db
from models.create_own_post_response import CreateOwnPostResponse
from models.user_feedback import UserFeedback
from models.user_response import UserResponse

router = APIRouter(tags=["export"])

TABLES = (
    ("user_feedback.csv", UserFeedback),
    ("user_response.csv", UserResponse),
    ("create_own_post_response.csv", CreateOwnPostResponse),
)


def _keys_match(provided: str, expected: str) -> bool:
    if not provided or not expected:
        return False
    return secrets.compare_digest(provided, expected)


def _cell(value):
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.isoformat(sep=" ")
    return value


def _to_csv(model, rows) -> str:
    columns = [column.name for column in model.__table__.columns]
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(columns)
    for row in rows:
        writer.writerow([_cell(getattr(row, name)) for name in columns])
    return buffer.getvalue()


@router.get("/export")
async def export_data(
    key: str | None = Query(default=None),
    x_export_key: str | None = Header(default=None),
    session: AsyncSession = Depends(get_db),
):
    """Return a zip of user_feedback, user_response, and create_own_post_response."""
    settings = get_settings()
    if not settings.EXPORT_KEY:
        raise HTTPException(status_code=503, detail="Export is disabled. Set EXPORT_KEY.")
    provided = x_export_key or key or ""
    if not _keys_match(provided, settings.EXPORT_KEY):
        raise HTTPException(status_code=403, detail="Invalid export key")

    archive = io.BytesIO()
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for filename, model in TABLES:
            result = await session.execute(select(model).order_by(model.id))
            csv_text = _to_csv(model, result.scalars().all())
            bundle.writestr(filename, csv_text.encode("utf-8-sig"))

    return Response(
        content=archive.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=pss-data.zip"},
    )
