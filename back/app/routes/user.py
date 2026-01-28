from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.controllers import user as crud_user
from app.schemas.user import UserCreate, UserOut
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=UserOut)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await crud_user.create_user(db, user)
    return db_user
