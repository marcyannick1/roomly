from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, UniqueConstraint
from datetime import datetime
from app.db.base import Base


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    landlord_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    status = Column(String, default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint('student_id', 'listing_id', name='uq_match_student_listing'),)
