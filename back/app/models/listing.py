from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, ForeignKey
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    description = Column(String)

    price = Column(Float, nullable=False)
    surface = Column(Float)
    charges_included = Column(Boolean, default=False)
    deposit = Column(Float)

    city = Column(String, nullable=False)
    address = Column(String)
    postal_code = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

    room_type = Column(String, nullable=False)
    furnished = Column(Boolean, default=False)
    floor = Column(Integer)
    total_floors = Column(Integer)

    available_from = Column(Date)
    min_duration_months = Column(Integer)

    wifi = Column(Boolean, default=False)
    washing_machine = Column(Boolean, default=False)
    kitchen = Column(Boolean, default=False)
    parking = Column(Boolean, default=False)
    elevator = Column(Boolean, default=False)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    photos = relationship("ListingPhoto", back_populates="listing", cascade="all, delete-orphan")
