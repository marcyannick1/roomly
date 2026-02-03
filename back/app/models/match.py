from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    landlord_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # C'est un user_id
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    status = Column(String, default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    listing = relationship("Listing", foreign_keys=[listing_id])
    student = relationship("Student", foreign_keys=[student_id])
    messages = relationship("Message", back_populates="match", cascade="all, delete-orphan")
