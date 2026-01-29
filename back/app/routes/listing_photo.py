from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.listing_photo import ListingPhotoCreate, ListingPhotoOut
from app.controllers import listing_photo as photo_ctrl

router = APIRouter(prefix="/listing-photos", tags=["Listing Photos"])

# Créer une photo
@router.post("/", response_model=ListingPhotoOut, status_code=status.HTTP_201_CREATED)
async def create_photo(photo: ListingPhotoCreate, db: AsyncSession = Depends(get_db)):
    return await photo_ctrl.create_listing_photo(db, photo)

# Récupérer toutes les photos d'un listing
@router.get("/{listing_id}", response_model=list[ListingPhotoOut])
async def get_photos(listing_id: int, db: AsyncSession = Depends(get_db)):
    return await photo_ctrl.get_photos_by_listing(db, listing_id)

# Supprimer une photo
@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(photo_id: int, db: AsyncSession = Depends(get_db)):
    await photo_ctrl.delete_listing_photo(db, photo_id)
    return {"detail": "Photo deleted"}
