from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.message import Message
from app.schemas.message import MessageCreate


async def create_message(db: AsyncSession, message_data: MessageCreate, match_id: int, sender_id: int) -> Message:
    """Créer un nouveau message"""
    message_dict = message_data.model_dump()
    message_dict['match_id'] = match_id
    message_dict['sender_id'] = sender_id
    message = Message(**message_dict)
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


async def get_match_messages(db: AsyncSession, match_id: int, limit: int = 100) -> list[Message]:
    """Récupérer tous les messages d'une conversation (match)"""
    result = await db.execute(
        select(Message)
        .where(Message.match_id == match_id)
        .order_by(desc(Message.created_at))
        .limit(limit)
    )
    messages = result.scalars().all()
    # Inverser l'ordre pour afficher du plus ancien au plus récent
    return list(reversed(messages))


async def mark_message_as_read(db: AsyncSession, message_id: int) -> Message:
    """Marquer un message comme lu"""
    result = await db.execute(select(Message).where(Message.id == message_id))
    message = result.scalar_one_or_none()
    
    if not message:
        return None
    
    message.is_read = True
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


async def mark_match_messages_as_read(db: AsyncSession, match_id: int, user_id: int) -> int:
    """Marquer tous les messages non lus d'une conversation comme lus (pour un utilisateur)"""
    result = await db.execute(
        select(Message)
        .where(
            Message.match_id == match_id,
            Message.is_read == False,
            Message.sender_id != user_id
        )
    )
    messages = result.scalars().all()
    
    for message in messages:
        message.is_read = True
        db.add(message)
    
    await db.commit()
    return len(messages)
