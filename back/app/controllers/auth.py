from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.controllers import user as crud_user
from app.schemas.user import UserLogin
from app.core.security import verify_password, create_access_token

async def login(user: UserLogin, db: AsyncSession):
    db_user = await crud_user.get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Email or password incorrect")
    token = create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}
