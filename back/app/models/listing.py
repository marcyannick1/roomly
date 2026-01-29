from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from datetime import datetime
from app.models.user import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(String, unique=True, index=True, nullable=False)
    landlord_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, default="studio")  # studio, t1, t2, colocation
    surface = Column(Integer, nullable=False)
    rooms = Column(Integer, default=1)
    furnished = Column(Boolean, default=True)
    rent = Column(Float, nullable=False)
    charges = Column(Float, default=0)
    deposit = Column(Float, nullable=False)
    available_from = Column(DateTime, nullable=True)
    address = Column(JSON, nullable=True)  # {street, city, postal_code}
    amenities = Column(JSON, default=[])
    photos = Column(JSON, default=[])
    tenant_criteria = Column(JSON, default={})
    status = Column(String, default="published")  # published, draft, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    liked_by = Column(JSON, default=[])

