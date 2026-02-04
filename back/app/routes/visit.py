from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.visit import VisitCreate, VisitOut
from app.controllers import visit as visit_ctrl
from app.controllers import user as user_ctrl
from typing import List

router = APIRouter(tags=["Visits"])

@router.post("/", response_model=VisitOut)
async def create_visit(
    visit_data: VisitCreate,
    user_id: int,  # ID de l'utilisateur qui propose la visite
    db: AsyncSession = Depends(get_db)
):
    """Proposer une visite"""
    # Vérifier que l'utilisateur existe
    user = await user_ctrl.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return await visit_ctrl.create_visit(db, visit_data, user_id)

@router.get("/user/{user_id}", response_model=List[VisitOut])
async def get_user_visits(user_id: int, db: AsyncSession = Depends(get_db)):
    """Récupérer toutes les visites d'un utilisateur"""
    return await visit_ctrl.get_visits_by_user(db, user_id)

@router.get("/match/{match_id}", response_model=List[VisitOut])
async def get_match_visits(match_id: int, db: AsyncSession = Depends(get_db)):
    """Récupérer toutes les visites pour un match"""
    return await visit_ctrl.get_visits_by_match(db, match_id)

@router.patch("/{visit_id}/accept", response_model=VisitOut)
async def accept_visit(visit_id: int, db: AsyncSession = Depends(get_db)):
    """Accepter une proposition de visite"""
    visit = await visit_ctrl.update_visit_status(db, visit_id, "accepted")
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit

@router.patch("/{visit_id}/decline", response_model=VisitOut)
async def decline_visit(visit_id: int, db: AsyncSession = Depends(get_db)):
    """Refuser une proposition de visite"""
    visit = await visit_ctrl.update_visit_status(db, visit_id, "declined")
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit

@router.delete("/{visit_id}")
async def cancel_visit(visit_id: int, db: AsyncSession = Depends(get_db)):
    """Annuler une visite"""
    visit = await visit_ctrl.delete_visit(db, visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return {"message": "Visit cancelled successfully"}
