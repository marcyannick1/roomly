from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.controllers import user as crud_user
from app.schemas.user import UserLogin, UserOut
from app.core.security import verify_password, create_access_token

def convert_user_to_dict(db_user):
    """Convertit un User model en dictionnaire avec user_type"""
    return {
        "id": db_user.id,
        "email": db_user.email,
        "name": db_user.name,
        "is_landlord": db_user.is_landlord,
        "user_type": "landlord" if db_user.is_landlord else "student",
        "provider": db_user.provider
    }

async def login(user: UserLogin, db: AsyncSession):
    db_user = await crud_user.get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Email or password incorrect")
    token = create_access_token({"sub": db_user.email})
    return {
        "session_token": token, 
        "token_type": "bearer",
        "user": convert_user_to_dict(db_user)
    }
