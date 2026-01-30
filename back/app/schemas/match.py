from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MatchBase(BaseModel):
    landlord_id: int
    student_id: int
    listing_id: int
    status: Optional[str] = "pending"


class MatchCreate(MatchBase):
    pass


class MatchUpdate(BaseModel):
    status: str


class MatchOut(MatchBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
