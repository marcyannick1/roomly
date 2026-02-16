import uuid
from typing import Optional, List, TYPE_CHECKING
from datetime import date
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON

if TYPE_CHECKING:
    from app.models.user import User

class StudentProfile(SQLModel, table=True):
    __tablename__ = "student_profiles"
    
    user_id: uuid.UUID = Field(primary_key=True, foreign_key="users.id")
    
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
    passions: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    university: Optional[str] = None
    study_level: Optional[str] = None
    
    user: "User" = Relationship(back_populates="student_profile")

class LandlordProfile(SQLModel, table=True):
    __tablename__ = "landlord_profiles"
    
    user_id: uuid.UUID = Field(primary_key=True, foreign_key="users.id")
    
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    
    user: "User" = Relationship(back_populates="landlord_profile")
