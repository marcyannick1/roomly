from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    # Préférences logement
    room_type = Column(String)  # Studio, T1, T2, Colocation
    furnished = Column(Boolean, default=False)
    smoking = Column(Boolean, default=False)
    pets = Column(Boolean, default=False)
    noise_level = Column(Integer)  # 1-10
    max_budget = Column(Float)
    guarantor_income = Column(Float)

    # Études
    university = Column(String)
    study_level = Column(String)
    passions = Column(String)  # libre, peut stocker CSV ou JSON

    # Relations
    user = relationship("User", back_populates="student")
    likes = relationship("Like", back_populates="student", cascade="all, delete-orphan")
