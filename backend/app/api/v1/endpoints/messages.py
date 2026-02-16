from typing import List
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, desc

from app.api.deps import get_async_session, current_active_user
from app.models.user import User
from app.models.interaction import Match, Message, Notification
from app.schemas import interaction as schemas

router = APIRouter()

@router.get("/{match_id}", response_model=List[schemas.MessageRead])
async def get_messages(
    match_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    skip: int = 0,
    limit: int = 100,
):
    """Get chat history for a match."""
    match = await session.get(Match, match_id)
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    if match.student_id != user.id and match.landlord_id != user.id:
        raise HTTPException(status_code=403, detail="Not a participant in this match")
        
    query = select(Message).where(Message.match_id == match_id)
    query = query.order_by(desc(Message.created_at)).offset(skip).limit(limit)
    result = await session.execute(query)
    
    return result.scalars().all()

@router.post("/", response_model=schemas.MessageRead)
async def send_message(
    message_in: schemas.MessageCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Send a message in a match."""
    match = await session.get(Match, message_in.match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    if match.student_id != user.id and match.landlord_id != user.id:
        raise HTTPException(status_code=403, detail="Not a participant")
    
    message = Message(
        match_id=match.id,
        sender_id=user.id,
        content=message_in.content,
        is_read=False,
    )
    session.add(message)
    
    match.last_message_at = datetime.utcnow()
    match.last_message_content = message_in.content[:255]

    if user.id == match.student_id:
        match.unread_count_landlord += 1
        recipient_id = match.landlord_id
    else:
        match.unread_count_student += 1
        recipient_id = match.student_id
        
    session.add(match)
    
    notif = Notification(
        user_id=recipient_id,
        type="new_message",
        reference_id=match.id,
        is_read=False
    )
    session.add(notif)
    
    await session.commit()
    await session.refresh(message)
    return message
