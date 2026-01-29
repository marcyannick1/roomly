from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.landlord import Landlord
from app.schemas.landlord import LandlordCreate

async def create_landlord(db: AsyncSession, student: LandlordCreate) -> Landlord:
    db_landlord = Landlord(**student.model_dump())
    db.add(db_landlord)
    await db.commit()
    await db.refresh(db_landlord)
    return db_landlord

async def get_landlord_by_user(db: AsyncSession, user_id: int) -> Landlord | None:
    result = await db.execute(select(Landlord).where(Landlord.user_id == user_id))
    return result.scalar_one_or_none()
