from pydantic import BaseModel
from typing import Optional

class StudentBase(BaseModel):
    room_type: Optional[str] = None
    furnished: Optional[bool] = False
    smoking: Optional[bool] = False
    pets: Optional[bool] = False
    noise_level: Optional[int] = 5
    max_budget: Optional[float] = 0
    guarantor_income: Optional[float] = 0
    university: Optional[str] = None
    study_level: Optional[str] = None
    passions: Optional[str] = None

class StudentCreate(StudentBase):
    user_id: int

class StudentOut(StudentBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
