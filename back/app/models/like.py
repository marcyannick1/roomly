from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    is_like = Column(Boolean, nullable=True)  # True = like, False = dislike, None = ni like ni dislike
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    student = relationship("Student", back_populates="likes")
    listing = relationship("Listing", back_populates="likes")

    __table_args__ = (UniqueConstraint('student_id', 'listing_id', name='uq_student_listing'),)
