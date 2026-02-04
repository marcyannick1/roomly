from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.visit import Visit
from app.schemas.visit import VisitCreate
from datetime import datetime

async def create_visit(db: AsyncSession, visit_data: VisitCreate, proposed_by: int):
    """Créer une nouvelle proposition de visite"""
    db_visit = Visit(
        match_id=visit_data.match_id,
        proposed_by=proposed_by,
        proposed_date=visit_data.proposed_date,
        notes=visit_data.notes,
        status="pending"
    )
    db.add(db_visit)
    await db.commit()
    await db.refresh(db_visit)
    return db_visit

async def get_visit_by_id(db: AsyncSession, visit_id: int):
    """Récupérer une visite par son ID"""
    result = await db.execute(select(Visit).where(Visit.id == visit_id))
    return result.scalar_one_or_none()

async def get_visits_by_user(db: AsyncSession, user_id: int):
    """Récupérer toutes les visites d'un utilisateur (étudiant ou bailleur)"""
    from app.models.match import Match
    from sqlalchemy.orm import selectinload
    
    # Récupérer les visites où l'utilisateur est soit le proposant, soit impliqué dans le match
    result = await db.execute(
        select(Visit)
        .join(Match, Visit.match_id == Match.id)
        .where(
            (Visit.proposed_by == user_id) | 
            (Match.landlord_id == user_id) |
            (Match.student_id == user_id)
        )
        .options(selectinload(Visit.match))
        .order_by(Visit.proposed_date.desc())
    )
    return result.scalars().all()

async def get_visits_by_match(db: AsyncSession, match_id: int):
    """Récupérer toutes les visites pour un match"""
    result = await db.execute(
        select(Visit)
        .where(Visit.match_id == match_id)
        .order_by(Visit.proposed_date.desc())
    )
    return result.scalars().all()

async def update_visit_status(db: AsyncSession, visit_id: int, status: str):
    """Mettre à jour le statut d'une visite"""
    visit = await get_visit_by_id(db, visit_id)
    if visit:
        visit.status = status
        visit.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(visit)
    return visit

async def delete_visit(db: AsyncSession, visit_id: int):
    """Supprimer une visite (annulation)"""
    visit = await get_visit_by_id(db, visit_id)
    if visit:
        await db.delete(visit)
        await db.commit()
    return visit
