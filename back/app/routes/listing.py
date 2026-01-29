from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.controllers import listing as crud_listing
from app.schemas.room import ListingCreate, ListingOut, ListingUpdate
from fastapi.security import HTTPBearer

router = APIRouter(tags=["Listings"])

@router.post("/", response_model=ListingOut)
async def create_listing(listing_data: ListingCreate, db: AsyncSession = Depends(get_db)):
    """Créer une nouvelle annonce"""
    # Vérifier si l'annonce existe déjà
    existing = await crud_listing.get_listing_by_id(db, listing_data.listing_id)
    if existing:
        raise HTTPException(status_code=400, detail="Listing already exists")
    
    db_listing = await crud_listing.create_listing(db, listing_data)
    return db_listing

@router.get("/{listing_id}", response_model=ListingOut)
async def get_listing(listing_id: str, db: AsyncSession = Depends(get_db)):
    """Récupérer une annonce par son ID"""
    db_listing = await crud_listing.get_listing_by_id(db, listing_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing

@router.get("/landlord/{landlord_id}")
async def get_landlord_listings(landlord_id: int, db: AsyncSession = Depends(get_db)):
    """Récupérer toutes les annonces d'un propriétaire"""
    listings = await crud_listing.get_landlord_listings(db, landlord_id)
    return listings

@router.put("/{listing_id}", response_model=ListingOut)
async def update_listing(listing_id: str, listing_data: ListingUpdate, db: AsyncSession = Depends(get_db)):
    """Mettre à jour une annonce"""
    db_listing = await crud_listing.update_listing(db, listing_id, listing_data)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing

@router.delete("/{listing_id}")
async def delete_listing(listing_id: str, db: AsyncSession = Depends(get_db)):
    """Supprimer une annonce"""
    result = await crud_listing.delete_listing(db, listing_id)
    if not result:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing deleted"}

@router.post("/{listing_id}/like/{student_id}")
async def like_listing(listing_id: str, student_id: int, db: AsyncSession = Depends(get_db)):
    """Ajouter un like à une annonce"""
    db_listing = await crud_listing.add_like_to_listing(db, listing_id, student_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing

@router.delete("/{listing_id}/like/{student_id}")
async def unlike_listing(listing_id: str, student_id: int, db: AsyncSession = Depends(get_db)):
    """Retirer un like d'une annonce"""
    db_listing = await crud_listing.remove_like_from_listing(db, listing_id, student_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing

@router.get("/{listing_id}/interested-students")
async def get_interested_students(listing_id: str, db: AsyncSession = Depends(get_db)):
    """Récupérer les étudiants intéressés par une annonce"""
    db_listing = await crud_listing.get_listing_by_id(db, listing_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    return {
        "listing_id": listing_id,
        "interested_students": db_listing.liked_by or []
    }

