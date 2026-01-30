from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.landlord import Landlord
from app.schemas.landlord import LandlordCreate

async def create_landlord(db: AsyncSession, landlord: LandlordCreate) -> Landlord:
    db_landlord = Landlord(**landlord.model_dump())
    db.add(db_landlord)
    await db.commit()
    await db.refresh(db_landlord)
    return db_landlord

async def get_landlord_by_user(db: AsyncSession, user_id: int) -> Landlord | None:
    result = await db.execute(select(Landlord).where(Landlord.user_id == user_id))
    return result.scalar_one_or_none()

async def get_landlord(db: AsyncSession, landlord_id: int) -> Landlord | None:
    """Récupérer un landlord par son ID"""
    result = await db.execute(select(Landlord).where(Landlord.id == landlord_id))
    return result.scalar_one_or_none()

async def update_landlord(db: AsyncSession, landlord_id: int, landlord_data: LandlordCreate) -> Landlord:
    """Mettre à jour un profil landlord existant"""
    result = await db.execute(select(Landlord).where(Landlord.id == landlord_id))
    db_landlord = result.scalar_one_or_none()
    
    if not db_landlord:
        return None
    
    # Mettre à jour les champs
    update_data = landlord_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_landlord, field, value)
    
    db.add(db_landlord)
    await db.commit()
    await db.refresh(db_landlord)
    return db_landlord
