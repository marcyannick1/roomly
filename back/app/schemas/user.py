from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    first_name: Optional[str] = None  # Pour compatibilité frontend
    last_name: Optional[str] = None  # Pour compatibilité frontend
    password: str
    is_landlord: bool = False
    user_type: Optional[str] = None  # 'student' ou 'landlord'
    role: Optional[str] = None  # Alias pour user_type
    telephone: Optional[str] = None
    phone: Optional[str] = None  # Alias pour telephone
    photo: Optional[str] = None
    
    @property
    def computed_name(self) -> str:
        """Calculer le nom complet à partir de first_name et last_name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.name or ""
    
    @property
    def computed_role(self) -> str:
        """Déterminer le rôle"""
        if self.role:
            return self.role
        if self.user_type:
            return self.user_type
        return "landlord" if self.is_landlord else "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_landlord: bool
    user_type: Optional[str] = None
    role: Optional[str] = None  # Alias pour user_type
    telephone: Optional[str] = None
    phone: Optional[str] = None  # Alias
    photo: Optional[str] = None
    provider: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
