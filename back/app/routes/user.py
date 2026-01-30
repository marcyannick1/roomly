from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.controllers import user as user_controller
from app.controllers import auth as auth_controller
from app.schemas.user import UserCreate, UserOut
from app.db.session import get_db
from app.core.security import create_access_token
from app.libs.cloudinary import upload_to_cloudinary
from pydantic import BaseModel

class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None

router = APIRouter()

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await user_controller.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = await user_controller.create_user(db, user)
    return db_user

@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    db_user = await user_controller.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.patch("/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user_update: UserUpdate, db: AsyncSession = Depends(get_db)):
    db_user = await user_controller.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Vérifier si l'email est déjà utilisé par un autre utilisateur
    if user_update.email and user_update.email != db_user.email:
        existing_user = await user_controller.get_user_by_email(db, user_update.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")
        db_user.email = user_update.email
    
    if user_update.name:
        db_user.name = user_update.name
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.post("/{user_id}/photo")
async def upload_profile_photo(
    user_id: int,
    photo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    db_user = await user_controller.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Upload vers Cloudinary
    photo_url = await upload_to_cloudinary(photo)
    
    # Mettre à jour le profil utilisateur
    db_user.photo = photo_url
    await db.commit()
    await db.refresh(db_user)
    
    return {"photo_url": photo_url}

@router.delete("/{user_id}/photo")
async def delete_profile_photo(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    db_user = await user_controller.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Supprimer la photo de profil
    db_user.photo = None
    await db.commit()
    await db.refresh(db_user)
    
    return {"message": "Photo supprimée avec succès"}

@router.delete("/{user_id}")
async def delete_user_account(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    from app.models.student import Student
    from app.models.landlord import Landlord
    from app.models.like import Like
    from app.models.match import Match
    from app.models.listing import Listing
    from app.models.listing_photo import ListingPhoto
    from sqlalchemy import select, delete
    
    db_user = await user_controller.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Supprimer les données associées selon le type d'utilisateur
    if db_user.is_landlord:
        # Récupérer le landlord
        landlord_result = await db.execute(select(Landlord).where(Landlord.user_id == user_id))
        landlord = landlord_result.scalar_one_or_none()
        
        if landlord:
            # Supprimer les photos des annonces du landlord
            listings_result = await db.execute(select(Listing).where(Listing.owner_id == landlord.id))
            listings = listings_result.scalars().all()
            for listing in listings:
                await db.execute(delete(ListingPhoto).where(ListingPhoto.listing_id == listing.id))
                await db.execute(delete(Like).where(Like.listing_id == listing.id))
                await db.execute(delete(Match).where(Match.listing_id == listing.id))
            
            # Supprimer les annonces
            await db.execute(delete(Listing).where(Listing.owner_id == landlord.id))
            
            # Supprimer le landlord
            await db.delete(landlord)
    else:
        # Récupérer l'étudiant
        student_result = await db.execute(select(Student).where(Student.user_id == user_id))
        student = student_result.scalar_one_or_none()
        
        if student:
            # Supprimer les likes et matches de l'étudiant
            await db.execute(delete(Like).where(Like.student_id == student.id))
            await db.execute(delete(Match).where(Match.student_id == student.id))
            
            # Supprimer l'étudiant
            await db.delete(student)
    
    # Supprimer l'utilisateur
    await db.delete(db_user)
    await db.commit()
    
    return {"message": "Compte supprimé avec succès"}
