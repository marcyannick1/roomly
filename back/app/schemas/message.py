from pydantic import BaseModel
from datetime import datetime


class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    id: int
    match_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
