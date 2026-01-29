from pydantic import BaseModel
from datetime import date
from typing import Optional


class RoomBase(BaseModel):
    title: str
    description: Optional[str] = None

    # 💰 Prix & surface
    price: float
    surface: Optional[float] = None  # m²
    charges_included: bool = False
    deposit: Optional[float] = None

    # 📍 Localisation
    city: str
    address: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # 🏠 Logement
    room_type: str  # studio, chambre, colocation, T1...
    furnished: bool = False
    floor: Optional[int] = None
    total_floors: Optional[int] = None

    # 📅 Disponibilité
    available_from: Optional[date] = None
    min_duration_months: Optional[int] = None

    # 🔌 Équipements
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
        from_attributes = True  # pydantic v2
