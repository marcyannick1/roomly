import uuid
from fastapi_users import schemas
from typing import Optional

class UserRead(schemas.BaseUser[uuid.UUID]):
    role: str
    is_onboarded: bool

class UserCreate(schemas.BaseUserCreate):
    role: str = "student"  # Default to student

class UserUpdate(schemas.BaseUserUpdate):
    pass
