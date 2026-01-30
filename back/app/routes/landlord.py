from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.landlord import LandlordOut, LandlordCreate
from app.schemas.listing import LikeWithDetailsOut
from app.schemas.match import MatchCreate, MatchOut
from app.controllers import landlord as landlord_ctrl
from app.controllers import user as crud_user
from app.controllers import listing as listing_ctrl
from app.controllers import match as match_ctrl

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

    # Mettre à jour is_landlord de l'utilisateur
    if not user.is_landlord:
        user.is_landlord = True
        db.add(user)
        await db.commit()
        await db.refresh(user)

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

@router.post("/{landlord_id}/match/{student_id}/{listing_id}", response_model=MatchOut)
async def create_match_with_student(
    landlord_id: int,
    student_id: int,
    listing_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Créer un match entre un landlord et un student pour une annonce"""
    # Vérifier que le landlord existe
    landlord = await landlord_ctrl.get_landlord(db, landlord_id)
    if not landlord:
        raise HTTPException(status_code=404, detail="Landlord not found")
    
    # Vérifier que l'annonce appartient au landlord
    listing = await listing_ctrl.get_listing(db, listing_id)
    if not listing or listing.owner_id != landlord.user_id:
        raise HTTPException(status_code=403, detail="Listing does not belong to this landlord")
    
    # Vérifier qu'il y a bien un like de l'étudiant
    has_liked = await listing_ctrl.has_student_liked_listing(db, student_id, listing_id)
    if not has_liked:
        raise HTTPException(status_code=400, detail="Student has not liked this listing")
    
    # Créer le match avec le user_id du landlord (pas l'ID de la table landlords)
    match_data = MatchCreate(
        landlord_id=landlord.user_id,
        student_id=student_id,
        listing_id=listing_id
    )
    
    try:
        return await match_ctrl.create_match(db, match_data)
    except Exception as e:
        # Si le match existe déjà, retourner une erreur 409 Conflict
        if "duplicate key" in str(e) or "UniqueViolationError" in str(e):
            raise HTTPException(status_code=409, detail="Match already exists")
        # Pour les autres erreurs, les relancer
        raise

@router.get("/{landlord_id}/matches", response_model=list[MatchOut])
async def get_landlord_matches(landlord_id: int, db: AsyncSession = Depends(get_db)):
    """Récupérer tous les matches d'un landlord"""
    landlord = await landlord_ctrl.get_landlord(db, landlord_id)
    if not landlord:
        raise HTTPException(status_code=404, detail="Landlord not found")
    return await match_ctrl.get_landlord_matches(db, landlord.user_id)