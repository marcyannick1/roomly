from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class VisitCreate(BaseModel):
    match_id: int
    proposed_date: datetime
    notes: Optional[str] = None

class VisitOut(BaseModel):
    id: int
    match_id: int
    proposed_by: int
    proposed_date: datetime
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class VisitUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
