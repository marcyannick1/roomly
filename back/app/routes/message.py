from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.session import get_db
from app.core.security import decode_access_token, security
from app.schemas.message import MessageCreate, MessageOut
from app.controllers import message as message_ctrl
from app.controllers import match as match_ctrl
from app.controllers import user as crud_user

class MessageReadResponse(BaseModel):
    success: bool
    count: int

router = APIRouter(tags=["Messages"])

async def get_current_user(credentials = Depends(security), db: AsyncSession = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await crud_user.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/{match_id}/messages", response_model=list[MessageOut])
async def get_match_messages(match_id: int, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    match = await match_ctrl.get_match(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Vérifier si l'utilisateur est le student ou le landlord du match
    is_student = match.student and match.student.user_id == current_user.id
    is_landlord = match.landlord_id == current_user.id
    
    if not is_student and not is_landlord:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    messages = await message_ctrl.get_match_messages(db, match_id)
    return messages

@router.post("/{match_id}/messages", response_model=MessageOut)
async def send_message(match_id: int, message_data: MessageCreate, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    match = await match_ctrl.get_match(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Vérifier si l'utilisateur est le student ou le landlord du match
    is_student = match.student and match.student.user_id == current_user.id
    is_landlord = match.landlord_id == current_user.id
    
    if not is_student and not is_landlord:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    message = await message_ctrl.create_message(db, message_data, match_id, current_user.id)
    return message

@router.put("/{match_id}/read", response_model=MessageReadResponse)
async def mark_messages_as_read(match_id: int, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    match = await match_ctrl.get_match(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Vérifier si l'utilisateur est le student ou le landlord du match
    is_student = match.student and match.student.user_id == current_user.id
    is_landlord = match.landlord_id == current_user.id
    
    if not is_student and not is_landlord:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    count = await message_ctrl.mark_match_messages_as_read(db, match_id, current_user.id)
    return {"success": True, "count": count}
