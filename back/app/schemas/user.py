from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    is_landlord: bool = False
    user_type: Optional[str] = None  # 'student' ou 'landlord'
    telephone: Optional[str] = None
    photo: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    is_landlord: bool
    user_type: Optional[str] = None
    telephone: Optional[str] = None
    photo: Optional[str] = None
    provider: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
