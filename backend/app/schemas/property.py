from typing import List, Optional
import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict
from app.models.property import Property, PropertyImage, Amenity

# Amenities
class AmenityBase(BaseModel):
    name: str
    category: Optional[str] = None
    icon: Optional[str] = None

class AmenityCreate(AmenityBase):
    pass

class AmenityRead(AmenityBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

# Property Images
class PropertyImageBase(BaseModel):
    image_url: str
    position: int = 0

class PropertyImageCreate(PropertyImageBase):
    pass

class PropertyImageRead(PropertyImageBase):
    id: uuid.UUID
    property_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

# Properties
class PropertyBase(BaseModel):
    title: str
    description: str
    price: float
    surface: float
    charges_included: float = 0.0
    deposit: float = 0.0
    city: str
    address: str
    postal_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    room_type: str
    furnished: bool = False
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    available_from: date
    min_duration_months: int = 1
    is_active: bool = True

class PropertyCreate(PropertyBase):
    amenity_ids: Optional[List[uuid.UUID]] = None
    image_urls: Optional[List[str]] = None 

class PropertyRead(PropertyBase):
    id: uuid.UUID
    landlord_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    amenities: List[AmenityRead] = []
    images: List[PropertyImageRead] = []
    
    model_config = ConfigDict(from_attributes=True)

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    surface: Optional[float] = None
    charges_included: Optional[float] = None
    deposit: Optional[float] = None
    city: Optional[str] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    room_type: Optional[str] = None
    furnished: Optional[bool] = None
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    available_from: Optional[date] = None
    min_duration_months: Optional[int] = None
    is_active: Optional[bool] = None
    amenity_ids: Optional[List[uuid.UUID]] = None # Full update (replace)
