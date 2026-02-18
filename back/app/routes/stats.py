"""
Routes statistiques pour le frontend
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.core.auth_helpers import get_user_from_token
from app.models.listing import Listing
from app.models.like import Like
from app.models.match import Match
from app.models.user import User

router = APIRouter(tags=["Stats"])


@router.get("/landlord")
async def get_landlord_stats(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer les statistiques d'un bailleur"""
    user = await get_user_from_token(token, db)
    
    if not user.is_landlord:
        return {
            "active_properties": 0,
            "total_properties": 0,
            "total_views": 0,
            "total_likes": 0,
            "total_matches": 0
        }
    
    # Compter les annonces
    total_properties_query = select(func.count(Listing.id)).where(Listing.owner_id == user.id)
    total_properties_result = await db.execute(total_properties_query)
    total_properties = total_properties_result.scalar() or 0
    
    # Compter les likes reçus
    likes_query = select(func.count(Like.id)).join(Listing).where(Listing.owner_id == user.id)
    likes_result = await db.execute(likes_query)
    total_likes = likes_result.scalar() or 0
    
    # Compter les matches
    matches_query = select(func.count(Match.id)).where(Match.landlord_id == user.id)
    matches_result = await db.execute(matches_query)
    total_matches = matches_result.scalar() or 0
    
    return {
        "active_properties": total_properties,
        "total_properties": total_properties,
        "total_views": total_likes * 2,  # Approximation
        "total_likes": total_likes,
        "total_matches": total_matches
    }
