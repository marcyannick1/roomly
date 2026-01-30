from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.schemas.student import StudentOut


class ListingPhotoOut(BaseModel):
    id: int
    url: str
    listing_id: int

    class Config:
        from_attributes = True


class ListingBase(BaseModel):
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
    workspace: bool = False
    pets: bool = False
    tv: bool = False
    dryer: bool = False
    ac: bool = False
    garden: bool = False
    balcony: bool = False

class ListingCreate(ListingBase):
    owner_id: int

class ListingOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: Optional[float] = None
    surface: Optional[float] = None
    charges_included: Optional[bool] = None
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
    wifi: Optional[bool] = None
    washing_machine: Optional[bool] = None
    kitchen: Optional[bool] = None
    parking: Optional[bool] = None
    elevator: Optional[bool] = None
    workspace: Optional[bool] = None
    pets: Optional[bool] = None
    tv: Optional[bool] = None
    dryer: Optional[bool] = None
    ac: Optional[bool] = None
    garden: Optional[bool] = None
    balcony: Optional[bool] = None
    owner_id: Optional[int] = None
    photos: List[ListingPhotoOut] = []

    class Config:
        from_attributes = True


class LikeWithDetailsOut(BaseModel):
    """Schema pour un like avec les détails de l'étudiant et du listing"""
    id: int
    student_id: int
    listing_id: int
    is_like: Optional[bool] = None
    created_at: datetime
    
    # Relations
    student: Optional["StudentWithUserOut"] = None
    listing: Optional[ListingOut] = None
    match: Optional[dict] = None  # Informations sur le match éventuel

    class Config:
        from_attributes = True


class StudentWithUserOut(BaseModel):
    """Schema simplifié pour un étudiant avec ses infos utilisateur"""
    id: int
    user_id: int
    university: Optional[str] = None
    study_level: Optional[str] = None
    # Infos de l'utilisateur
    name: Optional[str] = None
    photo: Optional[str] = None
    
    class Config:
        from_attributes = True
