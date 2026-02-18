from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, Form, File, Body
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
    return await listing_controller.create_listing(
        db=db,
        title=title,
        room_type=room_type,
        price=price,
        city=city,
        owner_id=owner_id,
        description=description,
        address=address,
        postal_code=postal_code,
        surface=surface,
        deposit=deposit,
        floor=floor,
        total_floors=total_floors,
        min_duration_months=min_duration_months,
        latitude=latitude,
        longitude=longitude,
        available_from=available_from,
        charges_included=charges_included,
        furnished=furnished,
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
        photos=photos,
    )


@router.post("/json", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
async def create_listing_json(
    listing: ListingCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create listing from JSON payload (for frontend compatibility)"""
    return await listing_controller.create_listing(
        db=db,
        title=listing.title,
        room_type=listing.room_type,
        price=listing.price,
        city=listing.city,
        owner_id=listing.owner_id,
        description=listing.description,
        address=listing.address,
        postal_code=listing.postal_code,
        surface=listing.surface,
        deposit=listing.deposit,
        floor=listing.floor,
        total_floors=listing.total_floors,
        min_duration_months=listing.min_duration_months,
        latitude=listing.latitude,
        longitude=listing.longitude,
        available_from=listing.available_from,
        charges_included=listing.charges_included,
        furnished=listing.furnished,
        wifi=listing.wifi,
        workspace=listing.workspace,
        parking=listing.parking,
        pets=listing.pets,
        tv=listing.tv,
        elevator=listing.elevator,
        washing_machine=listing.washing_machine,
        dryer=listing.dryer,
        ac=listing.ac,
        kitchen=listing.kitchen,
        garden=listing.garden,
        balcony=listing.balcony,
        photos=[],
    )


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
    updated = await listing_controller.update_listing_from_form(
        db=db,
        listing_id=listing_id,
        title=title,
        room_type=room_type,
        price=price,
        city=city,
        owner_id=owner_id,
        description=description,
        address=address,
        postal_code=postal_code,
        surface=surface,
        deposit=deposit,
        floor=floor,
        total_floors=total_floors,
        min_duration_months=min_duration_months,
        latitude=latitude,
        longitude=longitude,
        available_from=available_from,
        charges_included=charges_included,
        furnished=furnished,
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
        photos=photos,
    )
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
