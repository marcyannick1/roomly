from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.landlord import LandlordOut, LandlordCreate
from app.schemas.listing import LikeWithDetailsOut
from app.controllers import landlord as landlord_ctrl
from app.controllers import user as crud_user
from app.controllers import listing as listing_ctrl

router = APIRouter(tags=["Landlords"])

@router.post("/", response_model=LandlordOut)
async def create_landlord(landlord: LandlordCreate, db: AsyncSession = Depends(get_db)):
    return await landlord_ctrl.create_landlord(db, landlord)

@router.get("/profile/{user_id}", response_model=LandlordOut)
async def get_landlord_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    landlord = await landlord_ctrl.get_landlord_by_user(db, user_id)
    if not landlord:
        raise HTTPException(status_code=404, detail="Landlord profile not found")
    return landlord

@router.post("/profile", response_model=LandlordOut)
async def update_or_create_landlord_profile(landlord: LandlordCreate, db: AsyncSession = Depends(get_db)):
    # Vérifier que l'utilisateur existe
    user = await crud_user.get_user_by_id(db, landlord.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Chercher si un profil landlord existe déjà
    existing_landlord = await landlord_ctrl.get_landlord_by_user(db, landlord.user_id)
    if existing_landlord:
        # Mettre à jour
        return await landlord_ctrl.update_landlord(db, existing_landlord.id, landlord)
    else:
        # Créer nouveau profil
        return await landlord_ctrl.create_landlord(db, landlord)

@router.get("/{landlord_id}/likes", response_model=list[LikeWithDetailsOut])
async def get_landlord_received_likes(landlord_id: int, db: AsyncSession = Depends(get_db)):
    """Récupérer tous les likes reçus par un landlord sur ses annonces"""
    return await listing_ctrl.get_landlord_received_likes(db, landlord_id)