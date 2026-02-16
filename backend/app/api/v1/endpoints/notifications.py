from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, desc, update

from app.api.deps import get_async_session, current_active_user
from app.models.user import User
from app.models.interaction import Notification
from app.schemas import interaction as schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.NotificationRead])
async def list_notifications(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    skip: int = 0,
    limit: int = 20,
):
    query = select(Notification).where(Notification.user_id == user.id)
    query = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit)
    result = await session.execute(query)
    return result.scalars().all()

@router.patch("/{notif_id}/read", response_model=schemas.NotificationRead)
async def mark_notif_read(
    notif_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    notif = await session.get(Notification, notif_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if notif.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your notification")
        
    notif.is_read = True
    session.add(notif)
    await session.commit()
    await session.refresh(notif)
    return notif
