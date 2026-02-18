from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.match import MatchCreate, MatchOut, MatchUpdate
from app.controllers import match as match_controller
from app.core.auth_helpers import get_user_from_token

router = APIRouter(
    tags=["Matches"],
)


@router.get("/")
async def get_matches_with_token(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer tous les matches de l'utilisateur connecté (avec token)"""
    user = await get_user_from_token(token, db)
    
    if user.is_landlord:
        # Pour un bailleur, récupérer les matches de toutes ses annonces
        return await match_controller.get_landlord_matches(db, user.id)
    else:
        # Pour un étudiant, récupérer ses matches
        from app.controllers import student as student_ctrl
        student = await student_ctrl.get_student_by_user(db, user.id)
        if not student:
            return []
        return await match_controller.get_student_matches(db, student.id)


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
    token: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer un match par son ID"""
    # Vérifier l'authentification si token fourni
    if token:
        user = await get_user_from_token(token, db)
        # Vérifier que l'utilisateur a accès à ce match
        match = await match_controller.get_match(db, match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Vérifier si l'utilisateur est le student ou le landlord du match
        from app.controllers import student as student_ctrl
        student = await student_ctrl.get_student_by_user(db, user.id) if not user.is_landlord else None
        
        is_student = student and match.student_id == student.id
        is_landlord = user.is_landlord and match.landlord_id == user.id
        
        if not is_student and not is_landlord:
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        return match
    else:
        match = await match_controller.get_match(db, match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        return match
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
