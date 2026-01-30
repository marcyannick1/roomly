from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.libs.cloudinary import upload_to_cloudinary
from app.models.listing import Listing
from app.models.listing_photo import ListingPhoto
from app.models.like import Like
from app.models.match import Match
from app.schemas.listing import ListingCreate


async def create_listing(
    db: AsyncSession,
    listing: ListingCreate,
    photos: list[UploadFile]
) -> Listing:
    # Les équipements sont déjà mappés dans le formulaire
    listing_data = listing.model_dump()
    
    db_listing = Listing(**listing_data)
    db.add(db_listing)
    await db.flush()  # récupère l'id sans commit

    # 🔹 Upload + save photos
    for photo in photos:
        result = await upload_to_cloudinary(photo)

        db.add(
            ListingPhoto(
                url=result,
                listing_id=db_listing.id
            )
        )

    await db.commit()
    
    # Recharger avec les photos
    result = await db.execute(
        select(Listing).where(Listing.id == db_listing.id).options(selectinload(Listing.photos))
    )
    return result.scalar_one()



async def get_listing(db: AsyncSession, Listing_id: int) -> Listing | None:
    result = await db.execute(
        select(Listing).where(Listing.id == Listing_id).options(selectinload(Listing.photos))
    )
    return result.scalar_one_or_none()


async def get_listings(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
) -> list[Listing]:
    result = await db.execute(
        select(Listing).options(selectinload(Listing.photos)).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def get_listings_by_owner(
    db: AsyncSession,
    owner_id: int,
) -> list[Listing]:
    result = await db.execute(
        select(Listing).where(Listing.owner_id == owner_id).options(selectinload(Listing.photos))
    )
    return result.scalars().all()


async def update_listing(
    db: AsyncSession,
    listing_id: int,
    listing: ListingCreate,
    photos: list[UploadFile]
) -> Listing | None:
    # Récupérer le listing existant
    db_listing = await get_listing(db, listing_id)
    if not db_listing:
        return None
    
    # Mettre à jour les champs
    listing_data = listing.model_dump()
    for key, value in listing_data.items():
        if key != 'owner_id':  # Ne pas modifier le propriétaire
            setattr(db_listing, key, value)
    
    # Upload nouvelles photos si fournies
    if photos and len(photos) > 0:
        for photo in photos:
            result = await upload_to_cloudinary(photo)
            db.add(
                ListingPhoto(
                    url=result,
                    listing_id=db_listing.id
                )
            )
    
    await db.commit()
    
    # Recharger avec les photos
    result = await db.execute(
        select(Listing).where(Listing.id == listing_id).options(selectinload(Listing.photos))
    )
    return result.scalar_one()


async def delete_listing(db: AsyncSession, Listing_id: int) -> bool:
    Listing = await get_listing(db, Listing_id)
    if not Listing:
        return False
    await db.delete(Listing)
    await db.commit()
    return True


async def add_like_to_listing(
    db: AsyncSession,
    listing_id: int,
    student_id: int
) -> Listing | None:
    # Vérifier que l'annonce existe
    listing = await get_listing(db, listing_id)
    if not listing:
        return None
    
    # Vérifier si le like existe déjà
    result = await db.execute(
        select(Like).where(
            (Like.listing_id == listing_id) & (Like.student_id == student_id)
        )
    )
    existing_like = result.scalar_one_or_none()
    
    if not existing_like:
        # Créer un nouveau like
        new_like = Like(student_id=student_id, listing_id=listing_id)
        db.add(new_like)
        await db.commit()
    
    return listing


async def remove_like_from_listing(
    db: AsyncSession,
    listing_id: int,
    student_id: int
) -> Listing | None:
    # Vérifier que l'annonce existe
    listing = await get_listing(db, listing_id)
    if not listing:
        return None
    
    # Supprimer le like s'il existe
    result = await db.execute(
        select(Like).where(
            (Like.listing_id == listing_id) & (Like.student_id == student_id)
        )
    )
    like = result.scalar_one_or_none()
    
    if like:
        await db.delete(like)
        await db.commit()
    
    return listing


async def get_interested_students(
    db: AsyncSession,
    listing_id: int
):
    # Récupérer tous les étudiants qui ont liké cette annonce
    result = await db.execute(
        select(Like).where(Like.listing_id == listing_id)
    )
    likes = result.scalars().all()
    return likes


async def get_student_liked_listings(
    db: AsyncSession,
    student_id: int
) -> list[Listing]:
    # Récupérer toutes les annonces liées par cet étudiant
    result = await db.execute(
        select(Listing)
        .join(Like, Like.listing_id == Listing.id)
        .where(Like.student_id == student_id)
        .options(selectinload(Listing.photos))
    )
    return result.scalars().all()


async def create_match(
    db: AsyncSession,
    landlord_id: int,
    student_id: int,
    listing_id: int
) -> Match | None:
    # Vérifier que l'annonce existe
    listing = await get_listing(db, listing_id)
    if not listing:
        return None
    
    # Vérifier si un match existe déjà
    result = await db.execute(
        select(Match).where(
            (Match.listing_id == listing_id) & (Match.student_id == student_id)
        )
    )
    existing_match = result.scalar_one_or_none()
    
    if existing_match:
        return existing_match
    
    # Créer un nouveau match
    new_match = Match(
        landlord_id=landlord_id,
        student_id=student_id,
        listing_id=listing_id,
        status="pending"
    )
    db.add(new_match)
    await db.commit()
    await db.refresh(new_match)
    return new_match


async def get_student_matches(
    db: AsyncSession,
    student_id: int
):
    # Récupérer tous les matches d'un étudiant
    result = await db.execute(
        select(Match).where(Match.student_id == student_id)
    )
    matches = result.scalars().all()
    return matches


async def get_landlord_matches(
    db: AsyncSession,
    landlord_id: int
):
    # Récupérer tous les matches d'un bailleur
    result = await db.execute(
        select(Match).where(Match.landlord_id == landlord_id)
    )
    matches = result.scalars().all()
    return matches


async def get_all_listings(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
) -> list[Listing]:
    result = await db.execute(
        select(Listing).options(selectinload(Listing.photos)).offset(skip).limit(limit)
    )
    return result.scalars().all()
