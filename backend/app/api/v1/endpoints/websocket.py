from typing import Dict, Set
import uuid
import json
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.api.deps import get_async_session
from app.models.user import User
from app.models.interaction import Match, Message, Notification
from app.core.security import auth_backend

router = APIRouter()

# Store active WebSocket connections: {match_id: {user_id: websocket}}
active_connections: Dict[uuid.UUID, Dict[uuid.UUID, WebSocket]] = {}


async def get_user_from_token(token: str, session: AsyncSession) -> User:
    """Authenticate user from WebSocket token."""
    from fastapi_users.authentication import AuthenticationBackend
    from fastapi_users import models
    
    # Use fastapi-users strategy to verify token
    strategy = auth_backend.get_strategy()
    user = await strategy.read_token(token, user_manager=None)
    
    if not user:
        raise ValueError("Invalid token")
    
    # Fetch full user from DB
    result = await session.execute(select(User).where(User.id == user))
    db_user = result.scalar_one_or_none()
    
    if not db_user or not db_user.is_active:
        raise ValueError("User not found or inactive")
    
    return db_user


@router.websocket("/ws/{match_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    match_id: uuid.UUID,
    token: str = Query(...),
):
    """
    WebSocket endpoint for real-time messaging.
    
    Connect: ws://localhost:8000/api/v1/ws/{match_id}?token=YOUR_JWT_TOKEN
    
    Send message:
    {
        "type": "message",
        "content": "Hello!"
    }
    
    Receive message:
    {
        "type": "message",
        "id": "uuid",
        "sender_id": "uuid",
        "content": "Hello!",
        "created_at": "2026-02-16T00:00:00"
    }
    """
    await websocket.accept()
    
    session = None
    user = None
    
    try:
        # Get DB session
        async for db_session in get_async_session():
            session = db_session
            break
        
        # Authenticate user
        try:
            user = await get_user_from_token(token, session)
        except Exception as e:
            await websocket.send_json({"type": "error", "message": "Authentication failed"})
            await websocket.close()
            return
        
        # Verify user is participant in match
        match = await session.get(Match, match_id)
        if not match:
            await websocket.send_json({"type": "error", "message": "Match not found"})
            await websocket.close()
            return
        
        if match.student_id != user.id and match.landlord_id != user.id:
            await websocket.send_json({"type": "error", "message": "Not a participant"})
            await websocket.close()
            return
        
        # Register connection
        if match_id not in active_connections:
            active_connections[match_id] = {}
        active_connections[match_id][user.id] = websocket
        
        # Send connection success
        await websocket.send_json({
            "type": "connected",
            "match_id": str(match_id),
            "user_id": str(user.id)
        })
        
        # Listen for messages
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "message":
                content = data.get("content", "").strip()
                
                if not content:
                    await websocket.send_json({"type": "error", "message": "Empty message"})
                    continue
                
                # Save message to DB
                message = Message(
                    match_id=match_id,
                    sender_id=user.id,
                    content=content,
                    is_read=False,
                )
                session.add(message)
                
                # Update match metadata
                match.last_message_at = datetime.utcnow()
                match.last_message_content = content[:255]
                
                # Determine recipient
                if user.id == match.student_id:
                    match.unread_count_landlord += 1
                    recipient_id = match.landlord_id
                else:
                    match.unread_count_student += 1
                    recipient_id = match.student_id
                
                session.add(match)
                
                # Create notification
                notif = Notification(
                    user_id=recipient_id,
                    type="new_message",
                    reference_id=match_id,
                    is_read=False
                )
                session.add(notif)
                
                await session.commit()
                await session.refresh(message)
                
                # Broadcast to all participants in this match
                message_data = {
                    "type": "message",
                    "id": str(message.id),
                    "sender_id": str(message.sender_id),
                    "content": message.content,
                    "created_at": message.created_at.isoformat(),
                    "is_read": message.is_read
                }
                
                for conn_user_id, conn_ws in active_connections[match_id].items():
                    try:
                        await conn_ws.send_json(message_data)
                    except:
                        # Connection might be dead, will be cleaned up
                        pass
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Cleanup connection
        if match_id in active_connections and user and user.id in active_connections[match_id]:
            del active_connections[match_id][user.id]
            if not active_connections[match_id]:
                del active_connections[match_id]
        
        if session:
            await session.close()
