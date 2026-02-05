from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.schemas.student import StudentCreate, StudentOut
from app.schemas.listing import ListingOut
from app.controllers import student as student_ctrl
from app.controllers import user as crud_user
from app.controllers import listing as listing_ctrl
from app.controllers import notification as notification_ctrl
from app.schemas.notification import NotificationCreate

router = APIRouter(tags=["Students"])

@router.post("/", response_model=StudentOut)
async def create_student(student: StudentCreate, db: AsyncSession = Depends(get_db)):
    return await student_ctrl.create_student(db, student)

@router.get("/profile/{user_id}", response_model=StudentOut)
async def get_student_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    student = await student_ctrl.get_student_by_user(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

@router.post("/profile", response_model=StudentOut)
async def update_or_create_student_profile(student: StudentCreate, db: AsyncSession = Depends(get_db)):
    # Vérifier que l'utilisateur existe
    user = await crud_user.get_user_by_id(db, student.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Chercher si un profil étudiant existe déjà
    existing_student = await student_ctrl.get_student_by_user(db, student.user_id)
    if existing_student:
        # Mettre à jour
        return await student_ctrl.update_student(db, existing_student.id, student)
    else:
        # Créer nouveau profil
        return await student_ctrl.create_student(db, student)

@router.get("/{user_id}/feed", response_model=list[ListingOut])
async def get_student_feed(
    user_id: int, 
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer le feed d'annonces pour un étudiant"""
    from sqlalchemy import select
    from app.models.listing import Listing
    
    # Vérifier que l'étudiant existe
    student = await student_ctrl.get_student_by_user(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    # Récupérer toutes les annonces triées par ID descendant (plus récentes en premier)
    query = select(Listing).options(selectinload(Listing.photos)).order_by(Listing.id.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/{user_id}/like/{listing_id}")
async def like_listing(user_id: int, listing_id: int, db: AsyncSession = Depends(get_db)):
    # Récupérer le profil étudiant à partir du user_id
    student = await student_ctrl.get_student_by_user(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    db_listing = await listing_ctrl.set_listing_reaction(db, listing_id, student.id, is_like=True)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    try:
        student_user = await crud_user.get_user_by_id(db, user_id)
        if db_listing.owner_id:
            notification_data = NotificationCreate(
                user_id=db_listing.owner_id,
                type="listing_liked",
                title="❤️ Nouvelle marque d'intérêt",
                message=f"{student_user.name if student_user else 'Un étudiant'} a liké votre annonce '{db_listing.title}'.",
                listing_id=listing_id,
                landlord_id=db_listing.owner_id
            )
            await notification_ctrl.create_notification(db, notification_data)
    except Exception:
        pass

    return db_listing

@router.post("/{user_id}/dislike/{listing_id}")
async def dislike_listing(user_id: int, listing_id: int, db: AsyncSession = Depends(get_db)):
    # Récupérer le profil étudiant à partir du user_id
    student = await student_ctrl.get_student_by_user(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    db_listing = await listing_ctrl.set_listing_reaction(db, listing_id, student.id, is_like=False)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing

@router.delete("/{user_id}/reaction/{listing_id}")
async def remove_reaction(user_id: int, listing_id: int, db: AsyncSession = Depends(get_db)):
    # Récupérer le profil étudiant à partir du user_id
    student = await student_ctrl.get_student_by_user(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    db_listing = await listing_ctrl.remove_listing_reaction(db, listing_id, student.id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return db_listing


@router.get("/{user_id}/liked", response_model=list[ListingOut])
async def get_student_liked_listings(user_id: int, db: AsyncSession = Depends(get_db)):
    # Récupérer le profil étudiant à partir du user_id
    student = await student_ctrl.get_student_by_user(db, user_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return await listing_ctrl.get_student_liked_listings(db, student.id)
