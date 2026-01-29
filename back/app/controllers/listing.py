from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.listing import Listing
from app.schemas.listing import ListingCreate


async def create_Listing(db: AsyncSession, Listing: ListingCreate) -> Listing:
    db_Listing = Listing(**Listing.model_dump())
    db.add(db_Listing)
    await db.commit()
    await db.refresh(db_Listing)
    return db_Listing


async def get_Listing(db: AsyncSession, Listing_id: int) -> Listing | None:
    result = await db.execute(
        select(Listing).where(Listing.id == Listing_id)
    )
    return result.scalar_one_or_none()


async def get_Listings(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
) -> list[Listing]:
    result = await db.execute(
        select(Listing).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def get_Listings_by_owner(
    db: AsyncSession,
    owner_id: int,
) -> list[Listing]:
    result = await db.execute(
        select(Listing).where(Listing.owner_id == owner_id)
    )
    return result.scalars().all()


async def delete_Listing(db: AsyncSession, Listing_id: int) -> bool:
    Listing = await get_Listing(db, Listing_id)
    if not Listing:
        return False
    await db.delete(Listing)
    await db.commit()
    return True
