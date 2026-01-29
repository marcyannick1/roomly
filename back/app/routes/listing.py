from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.listing import ListingCreate, ListingOut
from app.controllers import listing as listing_controller

router = APIRouter(
    tags=["Listings"],
)


@router.post("/", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing: ListingCreate,
    db: AsyncSession = Depends(get_db),
):
    return await listing_controller.create_listing(db, listing)


@router.get("/{listing_id}", response_model=ListingOut)
async def get_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    listing = await listing_controller.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="listing not found")
    return listing


@router.get("/", response_model=list[ListingOut])
async def list_listings(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    return await listing_controller.get_listings(db, skip, limit)


@router.get("/landlord/{landlord_id}", response_model=list[ListingOut])
async def list_listings_by_landlord(
    owner_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await listing_controller.get_listings_by_owner(db, owner_id)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    deleted = await listing_controller.delete_listing(db, listing_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Listing not found")
