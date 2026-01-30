from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.match import MatchCreate, MatchOut, MatchUpdate
from app.controllers import match as match_controller

router = APIRouter(
    tags=["Matches"],
)


@router.post("/", response_model=MatchOut, status_code=status.HTTP_201_CREATED)
async def create_match(
    match: MatchCreate,
    db: AsyncSession = Depends(get_db)
):
    """Créer un nouveau match"""
    return await match_controller.create_match(db, match)


@router.get("/{match_id}", response_model=MatchOut)
async def get_match(
    match_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer un match par son ID"""
    match = await match_controller.get_match(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.get("/student/{student_id}", response_model=list[MatchOut])
async def get_student_matches(
    student_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer tous les matches d'un étudiant par son student_id"""
    return await match_controller.get_student_matches(db, student_id)


@router.get("/user/{user_id}", response_model=list[MatchOut])
async def get_user_matches(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer tous les matches d'un étudiant par son user_id"""
    from app.controllers import student as student_ctrl
    
    # Récupérer le student_id à partir du user_id
    student = await student_ctrl.get_student_by_user(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return await match_controller.get_student_matches(db, student.id)


@router.get("/landlord/{landlord_id}")
async def get_landlord_matches(
    landlord_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer tous les matches d'un bailleur"""
    return await match_controller.get_landlord_matches(db, landlord_id)


@router.get("/listing/{listing_id}", response_model=list[MatchOut])
async def get_listing_matches(
    listing_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer tous les matches pour une annonce"""
    return await match_controller.get_listing_matches(db, listing_id)


@router.patch("/{match_id}", response_model=MatchOut)
async def update_match_status(
    match_id: int,
    match_update: MatchUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Mettre à jour le statut d'un match"""
    match = await match_controller.update_match_status(db, match_id, match_update.status)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_match(
    match_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Supprimer un match"""
    deleted = await match_controller.delete_match(db, match_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Match not found")
