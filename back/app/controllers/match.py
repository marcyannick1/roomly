from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.match import Match
from app.schemas.match import MatchCreate


async def create_match(
    db: AsyncSession,
    match_data: MatchCreate
) -> Match:
    """Créer un nouveau match"""
    new_match = Match(**match_data.model_dump())
    db.add(new_match)
    await db.commit()
    await db.refresh(new_match)
    return new_match


async def get_match(db: AsyncSession, match_id: int) -> Match | None:
    """Récupérer un match par son ID"""
    result = await db.execute(
        select(Match).where(Match.id == match_id)
    )
    return result.scalar_one_or_none()


async def get_student_matches(
    db: AsyncSession,
    student_id: int
) -> list[Match]:
    """Récupérer tous les matches d'un étudiant"""
    result = await db.execute(
        select(Match).where(Match.student_id == student_id)
    )
    return result.scalars().all()


async def get_landlord_matches(
    db: AsyncSession,
    landlord_id: int
) -> list[Match]:
    """Récupérer tous les matches d'un bailleur"""
    result = await db.execute(
        select(Match).where(Match.landlord_id == landlord_id)
    )
    return result.scalars().all()


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
