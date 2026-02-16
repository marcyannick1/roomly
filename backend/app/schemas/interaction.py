import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.property import PropertyRead

# --- Swipes ---
class SwipeBase(BaseModel):
    property_id: uuid.UUID
    is_liked: bool

class SwipeCreate(SwipeBase):
    pass

class SwipeRead(SwipeBase):
    id: uuid.UUID
    student_id: uuid.UUID
    # created_at: datetime
    # property: PropertyRead
    model_config = ConfigDict(from_attributes=True)

from app.schemas.profile import StudentProfileRead
class SwipeWithStudent(SwipeRead):
    student_id: uuid.UUID
    property: PropertyRead
    student: Optional[StudentProfileRead] = None 
    pass

# --- Matches ---
class MatchBase(BaseModel):
    pass

class MatchRead(BaseModel):
    id: uuid.UUID
    swipe_id: uuid.UUID
    student_id: uuid.UUID
    landlord_id: uuid.UUID
    property_id: uuid.UUID
    status: str
    last_message_content: Optional[str] = None
    unread_count_student: int
    unread_count_landlord: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Messages ---
class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    match_id: uuid.UUID

class MessageRead(MessageBase):
    id: uuid.UUID
    match_id: uuid.UUID
    sender_id: uuid.UUID
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Notifications ---
class NotificationBase(BaseModel):
    type: str
    reference_id: uuid.UUID
    is_read: bool

class NotificationRead(NotificationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
