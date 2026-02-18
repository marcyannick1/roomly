from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.visit import VisitCreate, VisitOut, VisitDecline
from app.controllers import visit as visit_ctrl
from app.controllers import match as match_ctrl
from app.controllers import user as user_ctrl
from app.controllers import student as student_ctrl
from app.controllers import listing as listing_ctrl
from app.controllers import notification as notification_ctrl
from app.schemas.notification import NotificationCreate
from typing import List, Optional

router = APIRouter(tags=["Visits"])

@router.get("", response_model=List[VisitOut])
async def get_user_visits(
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer toutes les visites de l'utilisateur (avec token)"""
    from app.core.auth_helpers import get_user_from_token
    
    user = await get_user_from_token(token, db)
    visits = await visit_ctrl.get_visits_by_user(db, user.id)
    return visits

@router.post("", response_model=VisitOut)
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

    match = await match_ctrl.get_match(db, visit_data.match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    new_visit = await visit_ctrl.create_visit(db, visit_data, user_id)

    # Envoyer notification à l'autre partie
    try:
        student = await student_ctrl.get_student(db, match.student_id)
        student_user = await user_ctrl.get_user_by_id(db, student.user_id) if student else None
        landlord_user = await user_ctrl.get_user_by_id(db, match.landlord_id)
        listing = await listing_ctrl.get_listing(db, match.listing_id)
        
        # Déterminer qui reçoit la notification
        if user_id == match.student_id or (student_user and user_id == student_user.id):
            # L'étudiant propose → notifier le bailleur
            notification_data = NotificationCreate(
                user_id=match.landlord_id,
                type="visit_proposed",
                title="📅 Nouvelle proposition de visite",
                message=f"{student_user.name if student_user else 'Un étudiant'} a proposé une visite pour '{listing.title if listing else 'une annonce'}' le {new_visit.proposed_date.strftime('%d/%m/%Y à %H:%M')}.",
                listing_id=match.listing_id,
                landlord_id=match.landlord_id
            )
            await notification_ctrl.create_notification(db, notification_data)
        else:
            # Le bailleur propose → notifier l'étudiant
            if student_user:
                notification_data = NotificationCreate(
                    user_id=student_user.id,
                    type="visit_proposed",
                    title="📅 Nouvelle proposition de visite",
                    message=f"{landlord_user.name if landlord_user else 'Le bailleur'} vous propose une visite pour '{listing.title if listing else 'une annonce'}' le {new_visit.proposed_date.strftime('%d/%m/%Y à %H:%M')}.",
                    listing_id=match.listing_id
                )
                await notification_ctrl.create_notification(db, notification_data)
    except Exception as e:
        print(f"Erreur lors de la création de la notification: {e}")
        pass

    return new_visit

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
    
    # Envoyer des notifications aux deux parties avec toutes les informations
    try:
        match = await match_ctrl.get_match(db, visit.match_id)
        if match:
            # Récupérer les informations complètes
            student = await student_ctrl.get_student(db, match.student_id)
            student_user = await user_ctrl.get_user_by_id(db, student.user_id) if student else None
            landlord_user = await user_ctrl.get_user_by_id(db, match.landlord_id)
            listing = await listing_ctrl.get_listing(db, match.listing_id)
            
            # Formater la date de la visite
            visit_date = visit.proposed_date.strftime("%d/%m/%Y à %H:%M")
            
            # Notification pour l'étudiant
            if student_user:
                student_message = (
                    f"✅ Visite confirmée!\n\n"
                    f"📍 Logement: {listing.title if listing else 'N/A'}\n"
                    f"📫 Adresse: {listing.address if listing else 'N/A'}\n"
                    f"📅 Date: {visit_date}\n"
                    f"👤 Bailleur: {landlord_user.name if landlord_user else 'N/A'}\n"
                    f"📞 Téléphone: {landlord_user.telephone if landlord_user and landlord_user.telephone else 'Non renseigné'}"
                )
                notification_student = NotificationCreate(
                    user_id=student_user.id,
                    type="visit_accepted",
                    title="✅ Visite acceptée!",
                    message=student_message,
                    listing_id=match.listing_id
                )
                await notification_ctrl.create_notification(db, notification_student)
            
            # Notification pour le bailleur
            if landlord_user:
                landlord_message = (
                    f"✅ Visite confirmée!\n\n"
                    f"📍 Logement: {listing.title if listing else 'N/A'}\n"
                    f"📫 Adresse: {listing.address if listing else 'N/A'}\n"
                    f"📅 Date: {visit_date}\n"
                    f"👤 Étudiant: {student_user.name if student_user else 'N/A'}\n"
                    f"📞 Téléphone: {student_user.telephone if student_user and student_user.telephone else 'Non renseigné'}"
                )
                notification_landlord = NotificationCreate(
                    user_id=landlord_user.id,
                    type="visit_accepted",
                    title="✅ Visite confirmée!",
                    message=landlord_message,
                    listing_id=match.listing_id,
                    landlord_id=landlord_user.id
                )
                await notification_ctrl.create_notification(db, notification_landlord)
    except Exception as e:
        print(f"Erreur lors de la création des notifications: {e}")
        pass
    
    return visit

@router.patch("/{visit_id}/decline", response_model=VisitOut)
async def decline_visit(
    visit_id: int,
    decline_data: VisitDecline = VisitDecline(),
    db: AsyncSession = Depends(get_db)
):
    """Refuser une proposition de visite"""
    visit = await visit_ctrl.update_visit_status(db, visit_id, "declined")
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    try:
        match = await match_ctrl.get_match(db, visit.match_id)
        if match:
            student = await student_ctrl.get_student(db, match.student_id)
            student_user = await user_ctrl.get_user_by_id(db, student.user_id) if student else None
            landlord_user = await user_ctrl.get_user_by_id(db, match.landlord_id)
            listing = await listing_ctrl.get_listing(db, match.listing_id)

            reason_text = decline_data.reason or "Raison non précisée"
            visit_date = visit.proposed_date.strftime("%d/%m/%Y à %H:%M")

            # Notifier le proposant (l'autre partie)
            recipient_user = None
            recipient_type = None
            student_user_id = student_user.id if student_user else None
            landlord_user_id = landlord_user.id if landlord_user else None

            if student_user_id and visit.proposed_by == student_user_id:
                recipient_user = student_user
                recipient_type = "student"
            elif landlord_user_id and visit.proposed_by == landlord_user_id:
                recipient_user = landlord_user
                recipient_type = "landlord"

            if recipient_user:
                other_party_name = landlord_user.name if recipient_type == "student" and landlord_user else "Le bailleur"
                if recipient_type == "landlord":
                    other_party_name = student_user.name if student_user else "L'étudiant"

                notification_message = (
                    f"❌ Visite refusée\n\n"
                    f"📍 Logement: {listing.title if listing else 'N/A'}\n"
                    f"📫 Adresse: {listing.address if listing else 'N/A'}\n"
                    f"📅 Date: {visit_date}\n"
                    f"👤 Refus par: {other_party_name}\n"
                    f"📝 Raison: {reason_text}"
                )

                notification_data = NotificationCreate(
                    user_id=recipient_user.id,
                    type="visit_declined",
                    title="❌ Visite refusée",
                    message=notification_message,
                    listing_id=match.listing_id
                )
                await notification_ctrl.create_notification(db, notification_data)
    except Exception:
        pass

    return visit

@router.delete("/{visit_id}")
async def cancel_visit(visit_id: int, db: AsyncSession = Depends(get_db)):
    """Annuler une visite"""
    visit = await visit_ctrl.delete_visit(db, visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return {"message": "Visit cancelled successfully"}
