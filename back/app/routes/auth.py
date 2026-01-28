from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.controllers import auth as auth_controller
from app.schemas.user import UserLogin

router = APIRouter(tags=["Auth"])

@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    return await auth_controller.login(user, db)
