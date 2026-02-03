from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
from typing import List

async def create_notification(db: AsyncSession, notification: NotificationCreate) -> Notification:
    """Créer une nouvelle notification"""
    db_notification = Notification(**notification.dict())
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification

async def get_user_notifications(db: AsyncSession, user_id: int, unread_only: bool = False) -> List[Notification]:
    """Récupérer les notifications d'un utilisateur"""
    query = select(Notification).where(Notification.user_id == user_id)
    
    if unread_only:
        query = query.where(Notification.is_read == False)
    
    query = query.order_by(Notification.created_at.desc())
    
    result = await db.execute(query)
    return result.scalars().all()

async def mark_notification_as_read(db: AsyncSession, notification_id: int) -> bool:
    """Marquer une notification comme lue"""
    result = await db.execute(
        update(Notification)
        .where(Notification.id == notification_id)
        .values(is_read=True)
    )
    await db.commit()
    return result.rowcount > 0

async def mark_all_notifications_as_read(db: AsyncSession, user_id: int) -> bool:
    """Marquer toutes les notifications d'un utilisateur comme lues"""
    result = await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id)
        .where(Notification.is_read == False)
        .values(is_read=True)
    )
    await db.commit()
    return result.rowcount > 0

async def get_unread_count(db: AsyncSession, user_id: int) -> int:
    """Obtenir le nombre de notifications non lues"""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user_id)
        .where(Notification.is_read == False)
    )
    return len(result.scalars().all())
