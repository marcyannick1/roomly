"""
Routes additionnelles pour compatibilité frontend Emergent
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.auth_helpers import get_user_from_token
from app.controllers import listing as listing_ctrl
from app.schemas.listing import ListingOut
from typing import List

router = APIRouter(tags=["Properties Landlord"])


@router.get("/landlord/my", response_model=List[dict])
async def get_my_properties(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer toutes les annonces du bailleur connecté"""
    user = await get_user_from_token(token, db)
    
    if not user.is_landlord:
        raise HTTPException(status_code=403, detail="Only landlords can access this endpoint")
    
    # Utiliser directement user.id car dans Roomly, le owner_id des listings = user_id
    listings = await listing_ctrl.get_listings_by_owner(db, user.id)
    
    # Formater pour le frontend
    formatted_listings = []
    for listing in listings:
        listing_dict = {
            "id": listing.id,
            "title": listing.title,
            "address": listing.address or "",
            "city": listing.city,
            "price": listing.price,
            "rent": listing.price,
            "surface": listing.surface,
            "room_type": listing.room_type,
            "property_type": listing.room_type,
            "description": listing.description or "",
            "is_active": True,  # Par défaut toutes les annonces sont actives
            "images": [photo.url for photo in listing.photos] if listing.photos else [],
            "likes_count": listing.likes_count,  # Ajouter le count des likes
        }
        formatted_listings.append(listing_dict)
    
    return formatted_listings
