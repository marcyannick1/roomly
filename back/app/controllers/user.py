from sqlalchemy.future import select
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import hash_password

from app.schemas.user import UserCreate

async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    hashed_password = hash_password(user_data.password)

    db_user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password,
        is_landlord=user_data.is_landlord,
        telephone=user_data.telephone,
        photo=user_data.photo,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()
