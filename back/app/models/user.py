from sqlalchemy import Column, String, Boolean, Integer, DateTime
from sqlalchemy.sql import func
from app.db.base import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_landlord = Column(Boolean, default=False)

    provider = Column(String, default="email")
    # Nouveaux champs
    telephone = Column(String, nullable=True)
    photo = Column(String, nullable=True)  # URL ou chemin
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    student = relationship("Student", back_populates="user", uselist=False)
    landlord = relationship("Landlord", back_populates="user", uselist=False)

    @property
    def user_type(self):
        """Retourne le type d'utilisateur basé sur is_landlord"""
        return "landlord" if self.is_landlord else "student"
