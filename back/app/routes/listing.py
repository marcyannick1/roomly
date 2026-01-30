from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, Form, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date

from app.db.session import get_db
from app.schemas.listing import ListingCreate, ListingOut
from app.controllers import listing as listing_controller

router = APIRouter(
    tags=["Listings"],
)


@router.post("/", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
async def create_listing(
    # Champs obligatoires
    title: str = Form(...),
    room_type: str = Form(...),
    price: float = Form(...),
    city: str = Form(...),
    owner_id: int = Form(...),
    
    # Champs texte optionnels
    description: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None),
    
    # Champs numériques optionnels
    surface: Optional[float] = Form(None),
    deposit: Optional[float] = Form(None),
    floor: Optional[int] = Form(None),
    total_floors: Optional[int] = Form(None),
    min_duration_months: Optional[int] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    
    # Date optionnelle
    available_from: Optional[date] = Form(None),
    
    # Booléens
    charges_included: bool = Form(False),
    furnished: bool = Form(False),
    
    # Équipements
    wifi: bool = Form(False),
    workspace: bool = Form(False),
    parking: bool = Form(False),
    pets: bool = Form(False),
    tv: bool = Form(False),
    elevator: bool = Form(False),
    washing_machine: bool = Form(False),
    dryer: bool = Form(False),
    ac: bool = Form(False),
    kitchen: bool = Form(False),
    garden: bool = Form(False),
    balcony: bool = Form(False),
    
    # Photos
    photos: List[UploadFile] = File(default=[]),
    
    db: AsyncSession = Depends(get_db),
):
    # Créer l'objet ListingCreate depuis les Form data
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
    return await listing_controller.create_listing(db, listing, photos)


@router.get("/{listing_id}", response_model=ListingOut)
async def get_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    listing = await listing_controller.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="listing not found")
    return listing


@router.get("/", response_model=list[ListingOut])
async def list_listings(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    return await listing_controller.get_listings(db, skip, limit)


@router.get("/landlord/{landlord_id}", response_model=list[ListingOut])
async def list_listings_by_landlord(
    landlord_id: int,  # ✅ Correspond au nom dans l'URL
    db: AsyncSession = Depends(get_db),
):
    return await listing_controller.get_listings_by_owner(db, landlord_id)


@router.put("/{listing_id}", response_model=ListingOut)
async def update_listing(
    listing_id: int,
    # Champs optionnels (pour update)
    title: Optional[str] = Form(None),
    room_type: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    city: Optional[str] = Form(None),
    owner_id: Optional[int] = Form(None),
    
    # Champs texte optionnels
    description: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None),
    
    # Champs numériques optionnels
    surface: Optional[float] = Form(None),
    deposit: Optional[float] = Form(None),
    floor: Optional[int] = Form(None),
    total_floors: Optional[int] = Form(None),
    min_duration_months: Optional[int] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    
    # Date optionnelle
    available_from: Optional[date] = Form(None),
    
    # Booléens optionnels
    charges_included: Optional[bool] = Form(None),
    furnished: Optional[bool] = Form(None),
    
    # Équipements optionnels
    wifi: Optional[bool] = Form(None),
    workspace: Optional[bool] = Form(None),
    parking: Optional[bool] = Form(None),
    pets: Optional[bool] = Form(None),
    tv: Optional[bool] = Form(None),
    elevator: Optional[bool] = Form(None),
    washing_machine: Optional[bool] = Form(None),
    dryer: Optional[bool] = Form(None),
    ac: Optional[bool] = Form(None),
    kitchen: Optional[bool] = Form(None),
    garden: Optional[bool] = Form(None),
    balcony: Optional[bool] = Form(None),
    
    # Photos
    photos: List[UploadFile] = File(default=[]),
    
    db: AsyncSession = Depends(get_db),
):
    # Récupérer le listing existant pour les valeurs par défaut
    db_listing = await listing_controller.get_listing(db, listing_id)
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
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
    updated = await listing_controller.update_listing(db, listing_id, listing, photos)
    if not updated:
        raise HTTPException(status_code=404, detail="Listing not found")
    return updated


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    deleted = await listing_controller.delete_listing(db, listing_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Listing not found")


@router.get("/{listing_id}/interested-students")
async def get_interested_students(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await listing_controller.get_interested_students(db, listing_id)
