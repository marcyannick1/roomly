from sqlalchemy.future import select
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from app.schemas.user import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    password = user_data.password

    # sécurité : bcrypt max 72 bytes
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password too long (max 72 bytes)")

    hashed_password = pwd_context.hash(password)

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
