import uuid
from typing import Optional, List, TYPE_CHECKING
from datetime import date
from sqlmodel import SQLModel, Field, Relationship
from app.models.base_class import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.interaction import Swipe, Match

class PropertyAmenity(SQLModel, table=True):
    __tablename__ = "property_amenities"
    property_id: uuid.UUID = Field(foreign_key="properties.id", primary_key=True)
    amenity_id: uuid.UUID = Field(foreign_key="amenities.id", primary_key=True)

class Amenity(SQLModel, table=True):
    __tablename__ = "amenities"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    category: Optional[str] = None
    icon: Optional[str] = None
    
    properties: List["Property"] = Relationship(back_populates="amenities", link_model=PropertyAmenity)

class Property(TimestampMixin, SQLModel, table=True):
    __tablename__ = "properties"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    landlord_id: uuid.UUID = Field(foreign_key="users.id")
    
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
    
    room_type: str        # e.g., 'studio', '2-room'
    furnished: bool = False
    floor: Optional[int] = None
    total_floors: Optional[int] = None
    
    available_from: date
    min_duration_months: int = 1
    
    is_active: bool = True
    
    # Relationships
    landlord: "User" = Relationship(back_populates="properties")
    amenities: List["Amenity"] = Relationship(back_populates="properties", link_model=PropertyAmenity)
    images: List["PropertyImage"] = Relationship(back_populates="property")
    swipes: List["Swipe"] = Relationship(back_populates="property")
    matches: List["Match"] = Relationship(back_populates="property")

class PropertyImage(SQLModel, table=True):
    __tablename__ = "property_images"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    property_id: uuid.UUID = Field(foreign_key="properties.id")
    image_url: str
    position: int = 0
    
    property: Optional[Property] = Relationship(back_populates="images")
