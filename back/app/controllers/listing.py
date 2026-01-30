from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import date

from app.libs.cloudinary import upload_to_cloudinary
from app.models.listing import Listing
from app.models.listing_photo import ListingPhoto
from app.models.like import Like
from app.models.student import Student
from app.schemas.listing import ListingCreate


async def create_listing(
    db: AsyncSession,
    title: str,
    room_type: str,
    price: float,
    city: str,
    owner_id: int,
    description: Optional[str],
    address: Optional[str],
    postal_code: Optional[str],
    surface: Optional[float],
    deposit: Optional[float],
    floor: Optional[int],
    total_floors: Optional[int],
    min_duration_months: Optional[int],
    latitude: Optional[float],
    longitude: Optional[float],
    available_from: Optional[date],
    charges_included: bool,
    furnished: bool,
    wifi: bool,
    workspace: bool,
    parking: bool,
    pets: bool,
    tv: bool,
    elevator: bool,
    washing_machine: bool,
    dryer: bool,
    ac: bool,
    kitchen: bool,
    garden: bool,
    balcony: bool,
    photos: list[UploadFile],
) -> Listing:
    listing = ListingCreate(
        title=title,
        description=description,
        room_type=room_type,
        price=price,
        surface=surface,
        deposit=deposit,
        charges_included=charges_included,
        furnished=furnished,
        city=city,
        address=address,
        postal_code=postal_code,
        latitude=latitude,
        longitude=longitude,
        floor=floor,
        total_floors=total_floors,
        available_from=available_from,
        min_duration_months=min_duration_months,
        wifi=wifi,
        workspace=workspace,
        parking=parking,
        pets=pets,
        tv=tv,
        elevator=elevator,
        washing_machine=washing_machine,
        dryer=dryer,
        ac=ac,
        kitchen=kitchen,
        garden=garden,
        balcony=balcony,
        owner_id=owner_id,
    )

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


async def set_listing_reaction(
    db: AsyncSession,
    listing_id: int,
    student_id: int,
    is_like: bool
) -> Listing | None:
    # Vérifier que l'annonce existe
    listing = await get_listing(db, listing_id)
    if not listing:
        return None

    # Vérifier si une réaction existe déjà
    result = await db.execute(
        select(Like).where(
            (Like.listing_id == listing_id) & (Like.student_id == student_id)
        )
    )
    existing_reaction = result.scalar_one_or_none()

    if existing_reaction:
        # Mettre à jour la réaction existante
        existing_reaction.is_like = is_like
    else:
        # Créer une nouvelle réaction
        new_reaction = Like(student_id=student_id, listing_id=listing_id, is_like=is_like)
        db.add(new_reaction)

    await db.commit()
    return listing


async def remove_listing_reaction(
    db: AsyncSession,
    listing_id: int,
    student_id: int
) -> Listing | None:
    # Vérifier que l'annonce existe
    listing = await get_listing(db, listing_id)
    if not listing:
        return None

    # Supprimer la réaction si elle existe
    result = await db.execute(
        select(Like).where(
            (Like.listing_id == listing_id) & (Like.student_id == student_id)
        )
    )
    reaction = result.scalar_one_or_none()

    if reaction:
        await db.delete(reaction)
        await db.commit()

    return listing


async def get_interested_students(
    db: AsyncSession,
    listing_id: int
):
    # Récupérer tous les étudiants qui ont liké cette annonce (is_like = True)
    result = await db.execute(
        select(Like).where((Like.listing_id == listing_id) & (Like.is_like == True))
    )
    likes = result.scalars().all()
    return likes


async def get_student_liked_listings(
    db: AsyncSession,
    student_id: int
) -> list[Listing]:
    # Récupérer toutes les annonces likées par cet étudiant (is_like = True)
    result = await db.execute(
        select(Listing)
        .join(Like, Like.listing_id == Listing.id)
        .where((Like.student_id == student_id) & (Like.is_like == True))
        .options(selectinload(Listing.photos))
    )
    return result.scalars().all()

async def get_all_listings(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
) -> list[Listing]:
    result = await db.execute(
        select(Listing).options(selectinload(Listing.photos)).offset(skip).limit(limit)
    )
    return result.scalars().all()




async def update_listing_from_form(
    db: AsyncSession,
    listing_id: int,
    title: Optional[str],
    room_type: Optional[str],
    price: Optional[float],
    city: Optional[str],
    owner_id: Optional[int],
    description: Optional[str],
    address: Optional[str],
    postal_code: Optional[str],
    surface: Optional[float],
    deposit: Optional[float],
    floor: Optional[int],
    total_floors: Optional[int],
    min_duration_months: Optional[int],
    latitude: Optional[float],
    longitude: Optional[float],
    available_from: Optional[date],
    charges_included: Optional[bool],
    furnished: Optional[bool],
    wifi: Optional[bool],
    workspace: Optional[bool],
    parking: Optional[bool],
    pets: Optional[bool],
    tv: Optional[bool],
    elevator: Optional[bool],
    washing_machine: Optional[bool],
    dryer: Optional[bool],
    ac: Optional[bool],
    kitchen: Optional[bool],
    garden: Optional[bool],
    balcony: Optional[bool],
    photos: list[UploadFile],
) -> Listing | None:
    # Récupérer le listing existant pour les valeurs par défaut
    db_listing = await get_listing(db, listing_id)
    if not db_listing:
        return None

    # Créer l'objet ListingCreate en utilisant les valeurs existantes comme fallback
    listing = ListingCreate(
        title=title or db_listing.title,
        description=description or db_listing.description,
        room_type=room_type or db_listing.room_type,
        price=price if price is not None else db_listing.price,
        surface=surface if surface is not None else db_listing.surface,
        deposit=deposit if deposit is not None else db_listing.deposit,
        charges_included=charges_included if charges_included is not None else db_listing.charges_included,
        furnished=furnished if furnished is not None else db_listing.furnished,
        city=city or db_listing.city,
        address=address or db_listing.address,
        postal_code=postal_code or db_listing.postal_code,
        latitude=latitude if latitude is not None else db_listing.latitude,
        longitude=longitude if longitude is not None else db_listing.longitude,
        floor=floor if floor is not None else db_listing.floor,
        total_floors=total_floors if total_floors is not None else db_listing.total_floors,
        available_from=available_from or db_listing.available_from,
        min_duration_months=min_duration_months if min_duration_months is not None else db_listing.min_duration_months,
        wifi=wifi if wifi is not None else db_listing.wifi,
        workspace=workspace if workspace is not None else db_listing.workspace,
        parking=parking if parking is not None else db_listing.parking,
        pets=pets if pets is not None else db_listing.pets,
        tv=tv if tv is not None else db_listing.tv,
        elevator=elevator if elevator is not None else db_listing.elevator,
        washing_machine=washing_machine if washing_machine is not None else db_listing.washing_machine,
        dryer=dryer if dryer is not None else db_listing.dryer,
        ac=ac if ac is not None else db_listing.ac,
        kitchen=kitchen if kitchen is not None else db_listing.kitchen,
        garden=garden if garden is not None else db_listing.garden,
        balcony=balcony if balcony is not None else db_listing.balcony,
        owner_id=owner_id or db_listing.owner_id,
    )
    return await update_listing(db, listing_id, listing, photos)


async def get_landlord_received_likes(
    db: AsyncSession,
    landlord_id: int
) -> list[Like]:
    """Récupérer tous les likes reçus par un landlord sur toutes ses annonces"""
    result = await db.execute(
        select(Like)
        .join(Listing, Like.listing_id == Listing.id)
        .where((Listing.owner_id == landlord_id) & (Like.is_like == True))
        .options(selectinload(Like.student), selectinload(Like.listing))
    )
    return result.scalars().all()
