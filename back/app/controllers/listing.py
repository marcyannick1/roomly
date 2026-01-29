from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.listing import Listing
from app.schemas.room import ListingCreate, ListingUpdate

async def create_listing(db: AsyncSession, listing_data: ListingCreate):
    """Créer une nouvelle annonce"""
    # Converter l'address en dict si elle existe
    address_dict = {}
    if listing_data.address:
        address_dict = listing_data.address.dict()
    
    db_listing = Listing(
        listing_id=listing_data.listing_id,
        landlord_id=listing_data.landlord_id,
        title=listing_data.title,
        description=listing_data.description,
        type=listing_data.type,
        surface=listing_data.surface,
        rooms=listing_data.rooms,
        furnished=listing_data.furnished,
        rent=listing_data.rent,
        charges=listing_data.charges,
        deposit=listing_data.deposit,
        available_from=listing_data.available_from,
        address=address_dict,
        amenities=listing_data.amenities or [],
        photos=listing_data.photos or [],
        tenant_criteria=listing_data.tenant_criteria or {},
        status=listing_data.status
    )
    db.add(db_listing)
    await db.commit()
    await db.refresh(db_listing)
    return db_listing

async def get_listing_by_id(db: AsyncSession, listing_id: str):
    """Récupérer une annonce par son ID"""
    result = await db.execute(select(Listing).where(Listing.listing_id == listing_id))
    return result.scalars().first()

async def get_listing_by_db_id(db: AsyncSession, db_id: int):
    """Récupérer une annonce par son ID de base de données"""
    result = await db.execute(select(Listing).where(Listing.id == db_id))
    return result.scalars().first()

async def get_landlord_listings(db: AsyncSession, landlord_id: int):
    """Récupérer toutes les annonces d'un propriétaire"""
    result = await db.execute(
        select(Listing).where(Listing.landlord_id == landlord_id)
    )
    return result.scalars().all()

async def get_all_listings(db: AsyncSession):
    """Récupérer toutes les annonces"""
    result = await db.execute(select(Listing))
    return result.scalars().all()

async def update_listing(db: AsyncSession, listing_id: str, listing_data: ListingUpdate):
    """Mettre à jour une annonce"""
    db_listing = await get_listing_by_id(db, listing_id)
    if not db_listing:
        return None
    
    update_data = listing_data.dict(exclude_unset=True)
    if "address" in update_data and update_data["address"]:
        update_data["address"] = update_data["address"].dict()
    
    for field, value in update_data.items():
        setattr(db_listing, field, value)
    
    await db.commit()
    await db.refresh(db_listing)
    return db_listing

async def delete_listing(db: AsyncSession, listing_id: str):
    """Supprimer une annonce"""
    db_listing = await get_listing_by_id(db, listing_id)
    if not db_listing:
        return None
    
    await db.delete(db_listing)
    await db.commit()
    return True

async def add_like_to_listing(db: AsyncSession, listing_id: str, student_id: int):
    """Ajouter un like à une annonce"""
    db_listing = await get_listing_by_id(db, listing_id)
    if not db_listing:
        return None
    
    if student_id not in db_listing.liked_by:
        db_listing.liked_by.append(student_id)
        await db.commit()
        await db.refresh(db_listing)
    
    return db_listing

async def remove_like_from_listing(db: AsyncSession, listing_id: str, student_id: int):
    """Retirer un like d'une annonce"""
    db_listing = await get_listing_by_id(db, listing_id)
    if not db_listing:
        return None
    
    if student_id in db_listing.liked_by:
        db_listing.liked_by.remove(student_id)
        await db.commit()
        await db.refresh(db_listing)
    
    return db_listing

