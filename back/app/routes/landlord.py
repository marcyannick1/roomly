from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.landlord import LandlordOut, LandlordCreate
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

@router.post("/{landlord_id}/match/{student_id}/{listing_id}")
async def create_match(
    landlord_id: int,
    student_id: int,
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    match = await listing_ctrl.create_match(db, landlord_id, student_id, listing_id)
    if not match:
        raise HTTPException(status_code=404, detail="Listing not found")
    return match

@router.get("/{landlord_id}/matches")
async def get_landlord_matches(
    landlord_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await listing_ctrl.get_landlord_matches(db, landlord_id)
