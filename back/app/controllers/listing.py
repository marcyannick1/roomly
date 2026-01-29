from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.libs.cloudinary import upload_to_cloudinary
from app.models.listing import Listing
from app.models.listing_photo import ListingPhoto
from app.schemas.listing import ListingCreate


async def create_listing(
    db: AsyncSession,
    listing: ListingCreate,
    photos: list[UploadFile]
) -> Listing:
    db_listing = Listing(**listing.model_dump())
    db.add(db_listing)
    await db.flush()  # récupère l'id sans commit

    # 🔹 Upload + save photos
    for photo in photos:
        result = await upload_to_cloudinary(photo)

        db.add(
            ListingPhoto(
                url=result,
                listing_id=db_listing.id
            )
        )

    await db.commit()
    await db.refresh(db_listing)
    return db_listing



async def get_listing(db: AsyncSession, Listing_id: int) -> Listing | None:
    result = await db.execute(
        select(Listing).where(Listing.id == Listing_id)
    )
    return result.scalar_one_or_none()


async def get_listings(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
) -> list[Listing]:
    result = await db.execute(
        select(Listing).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def get_listings_by_owner(
    db: AsyncSession,
    owner_id: int,
) -> list[Listing]:
    result = await db.execute(
        select(Listing).where(Listing.owner_id == owner_id)
    )
    return result.scalars().all()


async def delete_listing(db: AsyncSession, Listing_id: int) -> bool:
    Listing = await get_listing(db, Listing_id)
    if not Listing:
        return False
    await db.delete(Listing)
    await db.commit()
    return True
