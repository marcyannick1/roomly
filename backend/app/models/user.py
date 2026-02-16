import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel
from app.models.base_class import TimestampMixin

if TYPE_CHECKING:
    from app.models.profile import StudentProfile, LandlordProfile
    from app.models.interaction import Swipe, Notification, Match, Message
    from app.models.property import Property

class User(TimestampMixin, SQLModel, table=True):
    __tablename__ = "users"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=320)
    hashed_password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    is_verified: bool = Field(default=False)
    
    role: str = Field(default="student", index=True) # "student" or "landlord"
    is_onboarded: bool = Field(default=False)
    avatar_url: Optional[str] = None
    
    # Relationships
    student_profile: Optional["StudentProfile"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    landlord_profile: Optional["LandlordProfile"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    
    swipes: List["Swipe"] = Relationship(back_populates="student")
    notifications: List["Notification"] = Relationship(back_populates="user")
    
    # Properties owned by this user (as landlord)
    properties: List["Property"] = Relationship(back_populates="landlord")
    
    # Matches
    matches_as_student: List["Match"] = Relationship(back_populates="student", sa_relationship_kwargs={"primaryjoin": "User.id==Match.student_id"})
    matches_as_landlord: List["Match"] = Relationship(back_populates="landlord", sa_relationship_kwargs={"primaryjoin": "User.id==Match.landlord_id"})
    
    sent_messages: List["Message"] = Relationship(back_populates="sender")
