from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List, Dict

# Schemas pour les annonces (Listings)
class AddressSchema(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None

class ListingCreate(BaseModel):
    listing_id: str
    landlord_id: int
    title: str
    description: Optional[str] = None
    type: str = "studio"
    surface: int
    rooms: int = 1
    furnished: bool = True
    rent: float
    charges: float = 0
    deposit: float
    available_from: Optional[datetime] = None
    address: Optional[AddressSchema] = None
    amenities: Optional[List[str]] = []
    photos: Optional[List[str]] = []
    tenant_criteria: Optional[Dict] = {}
    status: str = "published"

class ListingOut(ListingCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    liked_by: List[int] = []

    class Config:
        from_attributes = True

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    surface: Optional[int] = None
    rooms: Optional[int] = None
    furnished: Optional[bool] = None
    rent: Optional[float] = None
    charges: Optional[float] = None
    deposit: Optional[float] = None
    available_from: Optional[datetime] = None
    address: Optional[AddressSchema] = None
    amenities: Optional[List[str]] = None
    photos: Optional[List[str]] = None
    tenant_criteria: Optional[Dict] = None
    status: Optional[str] = None

# Schemas pour les chambres (Rooms)
class RoomBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    surface: Optional[float] = None
    charges_included: bool = False
    deposit: Optional[float] = None
    city: str
    address: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    room_type: str
    furnished: bool = False
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    available_from: Optional[date] = None
    min_duration_months: Optional[int] = None
    wifi: bool = False
    washing_machine: bool = False
    kitchen: bool = False
    parking: bool = False
    elevator: bool = False

class RoomCreate(RoomBase):
    owner_id: int

class RoomOut(RoomBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
