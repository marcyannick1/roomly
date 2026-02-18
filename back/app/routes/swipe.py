from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.db.session import get_db
from app.controllers import student as student_ctrl
from app.controllers import listing as listing_ctrl
from app.controllers import match as match_ctrl
from app.controllers import notification as notification_ctrl
from app.controllers import user as user_ctrl
from app.schemas.match import MatchCreate
from app.schemas.notification import NotificationCreate

router = APIRouter(tags=["Swipes"])


class SwipeRequest(BaseModel):
    property_id: int
    listing_id: int = None  # Alias
    action: str  # "like", "dislike", "superlike"


class SwipeResponse(BaseModel):
    success: bool
    match: bool = False
    message: str = ""


@router.post("/swipes", response_model=SwipeResponse)
async def create_swipe(
    swipe: SwipeRequest,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Créer un swipe (like/dislike) pour une annonce.
    Compatible avec le frontend Emergent.
    """
    from app.core.auth_helpers import get_user_from_token
    from app.models.like import Like
    from sqlalchemy import select
    
    # Authentifier l'utilisateur
    user = await get_user_from_token(token, db)
    
    if user.is_landlord:
        raise HTTPException(status_code=403, detail="Only students can swipe")
    
    # Récupérer le profil étudiant
    student = await student_ctrl.get_student_by_user(db, user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    # ID de l'annonce (supporter les deux formats)
    listing_id = swipe.listing_id or swipe.property_id
    
    # Vérifier si le listing existe
    listing = await listing_ctrl.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Créer ou mettre à jour le like
    is_like = swipe.action in ["like", "superlike"]
    
    # Vérifier si un like existe déjà
    query = select(Like).where(Like.student_id == student.id, Like.listing_id == listing_id)
    result = await db.execute(query)
    existing_like = result.scalars().first()
    
    if existing_like:
        existing_like.is_like = is_like
    else:
        new_like = Like(student_id=student.id, listing_id=listing_id, is_like=is_like)
        db.add(new_like)
    
    await db.commit()
    
    # Si c'est un like, créer un match
    match_created = False
    if is_like:
        # Créer le match
        match_data = MatchCreate(
            student_id=student.id,  # Utiliser student.id, pas user.id
            landlord_id=listing.owner_id,
            listing_id=listing_id
        )
        try:
            await match_ctrl.create_match(db, match_data)
            match_created = True
            
            # Créer notification pour le bailleur
            notif_data = NotificationCreate(
                user_id=listing.owner_id,
                type="match",
                content=f"{user.name} a liké votre annonce: {listing.title}",
                reference_type="match",
                reference_id=listing_id
            )
            await notification_ctrl.create_notification(db, notif_data)
        except:
            pass  # Match peut déjà exister
    
    return SwipeResponse(
        success=True,
        match=match_created,
        message="Swipe enregistré avec succès"
    )


@router.get("/properties/swipe")
async def get_swipe_properties(
    token: str = Query(...),
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer les annonces pour swiper (non encore swipées par l'étudiant)"""
    from app.core.auth_helpers import get_user_from_token
    from sqlalchemy import select, and_
    from sqlalchemy.orm import selectinload
    from app.models.listing import Listing
    from app.models.like import Like
    
    # Authentifier
    user = await get_user_from_token(token, db)
    
    if user.is_landlord:
        raise HTTPException(status_code=403, detail="Only students can swipe")
    
    # Récupérer le profil étudiant
    from app.controllers import student as student_ctrl
    student = await student_ctrl.get_student_by_user(db, user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    # Récupérer les IDs des annonces déjà swipées
    liked_query = select(Like.listing_id).where(Like.student_id == student.id)
    liked_result = await db.execute(liked_query)
    liked_ids = [row[0] for row in liked_result.all()]
    
    # Récupérer les annonces non swipées
    query = (
        select(Listing)
        .options(selectinload(Listing.photos))
        .where(~Listing.id.in_(liked_ids) if liked_ids else True)
        .order_by(Listing.id.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    listings = result.scalars().all()
    
    # Formater pour le frontend
    return [format_listing_for_frontend(listing) for listing in listings]


def format_listing_for_frontend(listing) -> dict:
    """Formater un listing pour le frontend avec compatibilité"""
    # Construction manuelle pour éviter les problèmes de lazy loading Pydantic v2
    listing_dict = {
        "id": listing.id,
        "title": listing.title,
        "description": listing.description,
        "price": listing.price,
        "surface": listing.surface,
        "city": listing.city,
        "address": listing.address,
        "postal_code": listing.postal_code,
        "room_type": listing.room_type,
        "furnished": listing.furnished,
        "wifi": listing.wifi,
        "washing_machine": listing.washing_machine,
        "kitchen": listing.kitchen,
        "parking": listing.parking,
        "elevator": listing.elevator,
        "images": [photo.url for photo in (listing.photos or [])]
    }
    
    # Ajouter les champs pour compatibilité frontend
    listing_dict["rent"] = listing_dict.get("price")
    listing_dict["property_type"] = listing_dict.get("room_type")
    
    # Ajouter amenities
    amenities = []
    if listing.wifi:
        amenities.append("wifi")
    if listing.washing_machine:
        amenities.append("washing_machine")
    if listing.kitchen:
        amenities.append("kitchen")
    if listing.parking:
        amenities.append("parking")
    if listing.elevator:
        amenities.append("elevator")
    if listing.workspace:
        amenities.append("workspace")
    if listing.pets:
        amenities.append("pets")
    if listing.tv:
        amenities.append("tv")
    if listing.dryer:
        amenities.append("dryer")
    if listing.ac:
        amenities.append("ac")
    if listing.garden:
        amenities.append("garden")
    if listing.balcony:
        amenities.append("balcony")
    listing_dict["amenities"] = amenities
    
    return listing_dict
