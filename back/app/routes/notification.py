from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.controllers import notification as notification_ctrl
from app.schemas.notification import NotificationOut
from app.core.auth_helpers import get_user_from_token
from typing import List

router = APIRouter()

@router.get("/unread-count")
async def get_unread_count_with_token(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Obtenir le nombre de notifications non lues (avec token)"""
    user = await get_user_from_token(token, db)
    count = await notification_ctrl.get_unread_count(db, user.id)
    return {"count": count}

@router.get("", response_model=List[NotificationOut])
async def get_notifications_with_token(
    token: str = Query(...),
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer les notifications de l'utilisateur connecté (avec token)"""
    user = await get_user_from_token(token, db)
    return await notification_ctrl.get_user_notifications(db, user.id, unread_only)

@router.get("/user/{user_id}", response_model=List[NotificationOut])
async def get_user_notifications(
    user_id: int,
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer les notifications d'un utilisateur"""
    return await notification_ctrl.get_user_notifications(db, user_id, unread_only)

@router.get("/user/{user_id}/unread-count")
async def get_unread_count(user_id: int, db: AsyncSession = Depends(get_db)):
    """Obtenir le nombre de notifications non lues"""
    count = await notification_ctrl.get_unread_count(db, user_id)
    return {"count": count}

@router.put("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Marquer une notification comme lue"""
    success = await notification_ctrl.mark_notification_as_read(db, notification_id)
    return {"success": success}

@router.put("/user/{user_id}/read-all")
async def mark_all_as_read(user_id: int, db: AsyncSession = Depends(get_db)):
    """Marquer toutes les notifications comme lues"""
    success = await notification_ctrl.mark_all_notifications_as_read(db, user_id)
    return {"success": success}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Supprimer une notification"""
    success = await notification_ctrl.delete_notification(db, notification_id)
    return {"success": success}
