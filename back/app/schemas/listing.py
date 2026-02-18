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
    rent: Optional[float] = None  # Alias pour price
    surface: Optional[float] = None
    charges_included: Optional[bool] = None
    deposit: Optional[float] = None
    city: Optional[str] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    room_type: Optional[str] = None
    property_type: Optional[str] = None  # Alias pour room_type
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
    colocation: Optional[bool] = None
    rooms: Optional[int] = None  # Nombre de pièces
    bedrooms: Optional[int] = None  # Nombre de chambres
    owner_id: Optional[int] = None
    photos: List[ListingPhotoOut] = []
    images: List[str] = []  # URLs des images pour compatibilité frontend
    is_active: Optional[bool] = True
    amenities: List[str] = []  # Liste des équipements disponibles
    likes_count: int = 0  # Nombre de likes reçus

    class Config:
        from_attributes = True
        
    @property
    def computed_images(self) -> List[str]:
        """Extraire les URLs des photos pour le frontend"""
        return [photo.url for photo in self.photos] if self.photos else []
    
    @property
    def computed_amenities(self) -> List[str]:
        """Liste des équipements disponibles"""
        amenities_list = []
        if self.wifi: amenities_list.append("wifi")
        if self.washing_machine: amenities_list.append("washing_machine")
        if self.kitchen: amenities_list.append("kitchen")
        if self.parking: amenities_list.append("parking")
        if self.elevator: amenities_list.append("elevator")
        if self.workspace: amenities_list.append("workspace")
        if self.pets: amenities_list.append("pets")
        if self.tv: amenities_list.append("tv")
        if self.dryer: amenities_list.append("dryer")
        if self.ac: amenities_list.append("ac")
        if self.garden: amenities_list.append("garden")
        if self.balcony: amenities_list.append("balcony")
        return amenities_list


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
