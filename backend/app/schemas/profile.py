import uuid
from typing import Optional, List
from datetime import date
from pydantic import BaseModel, ConfigDict
from app.models.profile import StudentProfile, LandlordProfile

# Shared properties
class StudentProfileBase(BaseModel):
    first_name: str
    last_name: str
    birth_date: date
    bio: Optional[str] = None
    city: Optional[str] = None
    room_type: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    guarantor_income: Optional[float] = None
    
    furnished: Optional[bool] = None
    smoker: Optional[bool] = None
    pets: Optional[bool] = None
    passions: Optional[List[str]] = None
    
    university: Optional[str] = None
    study_level: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[date] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    room_type: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    guarantor_income: Optional[float] = None
    
    furnished: Optional[bool] = None
    smoker: Optional[bool] = None
    pets: Optional[bool] = None
    passions: Optional[List[str]] = None
    
    university: Optional[str] = None
    study_level: Optional[str] = None

class StudentProfileRead(StudentProfileBase):
    user_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


class LandlordProfileBase(BaseModel):
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None

class LandlordProfileCreate(LandlordProfileBase):
    pass

class LandlordProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None

class LandlordProfileRead(LandlordProfileBase):
    user_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)
