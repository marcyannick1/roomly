from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.listing_photo import ListingPhoto
from app.schemas.listing_photo import ListingPhotoCreate

# Créer une photo pour un listing
async def create_listing_photo(db: AsyncSession, photo_data: ListingPhotoCreate) -> ListingPhoto:
    db_photo = ListingPhoto(**photo_data.model_dump())
    db.add(db_photo)
    await db.commit()
    await db.refresh(db_photo)
    return db_photo

# Récupérer toutes les photos d'un listing
async def get_photos_by_listing(db: AsyncSession, listing_id: int) -> list[ListingPhoto]:
    result = await db.execute(select(ListingPhoto).where(ListingPhoto.listing_id == listing_id))
    return result.scalars().all()

# Supprimer une photo par id
async def delete_listing_photo(db: AsyncSession, photo_id: int) -> None:
    result = await db.execute(select(ListingPhoto).where(ListingPhoto.id == photo_id))
    photo = result.scalar_one_or_none()
    if photo:
        await db.delete(photo)
        await db.commit()
