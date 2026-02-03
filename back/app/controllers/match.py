from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.match import Match
from app.models.listing import Listing
from app.models.user import User
from app.schemas.match import MatchCreate


async def create_match(
    db: AsyncSession,
    match_data: MatchCreate
) -> dict:
    """Créer un nouveau match avec détails complets"""
    from app.schemas.listing import ListingOut
    
    new_match = Match(**match_data.model_dump())
    db.add(new_match)
    await db.commit()
    await db.refresh(new_match)
    
    # Charger les relations pour le retour
    result = await db.execute(
        select(Match)
        .where(Match.id == new_match.id)
        .options(
            selectinload(Match.listing).selectinload(Listing.photos)
        )
    )
    match = result.scalar_one()
    
    # Récupérer le landlord
    landlord_result = await db.execute(
        select(User).where(User.id == match.landlord_id)
    )
    landlord = landlord_result.scalar_one_or_none()
    
    # Formater pour le retour
    return {
        'id': match.id,
        'landlord_id': match.landlord_id,
        'student_id': match.student_id,
        'listing_id': match.listing_id,
        'status': match.status,
        'created_at': match.created_at,
        'listing': ListingOut.from_orm(match.listing).model_dump(),
        'landlord': {
            'id': landlord.id,
            'name': landlord.name,
            'email': landlord.email,
            'photo': landlord.photo
        } if landlord else None
    }


async def get_match(db: AsyncSession, match_id: int) -> Match | None:
    """Récupérer un match par son ID avec relations chargées"""
    result = await db.execute(
        select(Match)
        .where(Match.id == match_id)
        .options(selectinload(Match.student))
    )
    return result.scalar_one_or_none()


async def get_student_matches(
    db: AsyncSession,
    student_id: int
) -> list:
    """Récupérer tous les matches d'un étudiant avec détails"""
    from app.schemas.listing import ListingOut
    
    result = await db.execute(
        select(Match)
        .where(Match.student_id == student_id)
        .options(
            selectinload(Match.listing).selectinload(Listing.photos)
        )
    )
    matches = result.scalars().all()
    
    # Formater avec les détails
    formatted_matches = []
    for match in matches:
        # landlord_id dans la table matches est en fait le user_id du landlord
        landlord_result = await db.execute(
            select(User).where(User.id == match.landlord_id)
        )
        landlord_user = landlord_result.scalar_one_or_none()
        
        # Convertir le listing en dict via Pydantic
        listing_dict = ListingOut.from_orm(match.listing).dict() if match.listing else None
        
        match_dict = {
            "id": match.id,
            "landlord_id": match.landlord_id,
            "student_id": match.student_id,
            "listing_id": match.listing_id,
            "status": match.status,
            "created_at": match.created_at,
            "listing": listing_dict,
            "landlord": {
                "id": landlord_user.id,
                "name": landlord_user.name,
                "email": landlord_user.email,
                "photo": landlord_user.photo
            } if landlord_user else None
        }
        formatted_matches.append(match_dict)
    
    return formatted_matches


async def get_landlord_matches(
    db: AsyncSession,
    landlord_id: int
) -> list:
    """Récupérer tous les matches d'un bailleur avec détails"""
    from app.schemas.listing import ListingOut
    from app.models.student import Student
    
    result = await db.execute(
        select(Match)
        .where(Match.landlord_id == landlord_id)
        .options(
            selectinload(Match.listing).selectinload(Listing.photos),
            selectinload(Match.student).selectinload(Student.user)
        )
    )
    matches = result.scalars().all()
    
    # Formater avec les détails
    formatted_matches = []
    for match in matches:
        # Convertir le listing en dict via Pydantic
        listing_dict = ListingOut.from_orm(match.listing).dict() if match.listing else None
        
        # Récupérer les infos de l'étudiant
        student_data = None
        if match.student:
            student_data = {
                'id': match.student.id,
                'user_id': match.student.user_id,
                'name': match.student.user.name if match.student.user else None,
                'photo': match.student.user.photo if match.student.user else None,
                'university': match.student.university,
                'study_level': match.student.study_level,
                'passions': match.student.passions
            }
        
        match_dict = {
            'id': match.id,
            'landlord_id': match.landlord_id,
            'student_id': match.student_id,
            'listing_id': match.listing_id,
            'status': match.status,
            'created_at': match.created_at,
            'listing': listing_dict,
            'student': student_data
        }
        formatted_matches.append(match_dict)
    
    return formatted_matches


async def get_listing_matches(
    db: AsyncSession,
    listing_id: int
) -> list[Match]:
    """Récupérer tous les matches pour une annonce"""
    result = await db.execute(
        select(Match).where(Match.listing_id == listing_id)
    )
    return result.scalars().all()


async def update_match_status(
    db: AsyncSession,
    match_id: int,
    status: str
) -> Match | None:
    """Mettre à jour le statut d'un match"""
    match = await get_match(db, match_id)
    if not match:
        return None

    match.status = status
    await db.commit()
    await db.refresh(match)
    return match


async def delete_match(db: AsyncSession, match_id: int) -> bool:
    """Supprimer un match"""
    match = await get_match(db, match_id)
    if not match:
        return False

    await db.delete(match)
    await db.commit()
    return True
