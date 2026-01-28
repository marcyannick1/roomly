from sqlalchemy.future import select
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.hash import bcrypt

async def create_user(db: AsyncSession, user_data):
    password = user_data.password[:72]
    hashed_password = bcrypt.hash(password)

    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password,
        is_landlord=user_data.is_landlord
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()
