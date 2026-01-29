from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    is_landlord: bool = False
    user_type: str = None  # 'student' ou 'landlord'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    is_landlord: bool
    user_type: str
    provider: str

    class Config:
        from_attributes = True
