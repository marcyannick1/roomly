from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    is_landlord: bool = False

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    is_landlord: bool
    provider: str

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
