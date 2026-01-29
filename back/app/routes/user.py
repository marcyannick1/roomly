from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.controllers import user as crud_user
from app.controllers import auth as auth_controller
from app.schemas.user import UserCreate, UserOut
from app.db.session import get_db
from app.core.security import create_access_token

router = APIRouter()

@router.post("/", response_model=dict)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await crud_user.create_user(db, user)
    token = create_access_token({"sub": db_user.email})
    
    return {
        "session_token": token,
        "token_type": "bearer",
        "user": auth_controller.convert_user_to_dict(db_user)
    }

@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    db_user = await crud_user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user": auth_controller.convert_user_to_dict(db_user)
    }
