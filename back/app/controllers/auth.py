from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.controllers import user as crud_user
from app.schemas.user import UserLogin, UserOut
from app.core.security import verify_password, create_access_token

def convert_user_to_dict(db_user):
    """Convertit un User model en dictionnaire avec user_type et compatibilité frontend"""
    # Extraire first_name et last_name du nom complet
    name_parts = db_user.name.split(' ', 1) if db_user.name else ['', '']
    first_name = name_parts[0] if len(name_parts) > 0 else ''
    last_name = name_parts[1] if len(name_parts) > 1 else ''
    
    role = "landlord" if db_user.is_landlord else "student"
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "name": db_user.name,
        "first_name": first_name,
        "last_name": last_name,
        "is_landlord": db_user.is_landlord,
        "user_type": role,
        "role": role,
        "provider": db_user.provider,
        "phone": db_user.telephone,
        "telephone": db_user.telephone,
        "photo": db_user.photo
    }

async def login(user: UserLogin, db: AsyncSession):
    db_user = await crud_user.get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Email or password incorrect")
    token = create_access_token({"sub": db_user.email})
    return {
        "session_token": token,
        "token": token,  # Alias
        "token_type": "bearer",
        "user": convert_user_to_dict(db_user)
    }
