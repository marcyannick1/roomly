from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    is_landlord: bool = False
    telephone: Optional[str] = None
    photo: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    is_landlord: bool
    telephone: Optional[str] = None
    photo: Optional[str] = None
    provider: str | None = None

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
