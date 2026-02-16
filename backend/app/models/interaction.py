import uuid
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from app.models.base_class import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.property import Property

class Swipe(SQLModel, table=True):
    __tablename__ = "swipes"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    student_id: uuid.UUID = Field(foreign_key="users.id")
    property_id: uuid.UUID = Field(foreign_key="properties.id")
    is_liked: bool
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    student: "User" = Relationship(back_populates="swipes")
    property: "Property" = Relationship(back_populates="swipes")
    match: Optional["Match"] = Relationship(back_populates="swipe", sa_relationship_kwargs={"uselist": False})

class Match(TimestampMixin, SQLModel, table=True):
    __tablename__ = "matches"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    swipe_id: uuid.UUID = Field(foreign_key="swipes.id")
    student_id: uuid.UUID = Field(foreign_key="users.id")
    property_id: uuid.UUID = Field(foreign_key="properties.id")
    landlord_id: uuid.UUID = Field(foreign_key="users.id")
    
    status: str = "pending" # pending, accepted, rejected
    last_message_at: Optional[datetime] = None
    last_message_content: Optional[str] = None
    unread_count_student: int = 0
    unread_count_landlord: int = 0
    
    # Relationships
    swipe: "Swipe" = Relationship(back_populates="match")
    student: "User" = Relationship(back_populates="matches_as_student", sa_relationship_kwargs={"foreign_keys": "Match.student_id"})
    landlord: "User" = Relationship(back_populates="matches_as_landlord", sa_relationship_kwargs={"foreign_keys": "Match.landlord_id"})
    property: "Property" = Relationship(back_populates="matches")
    messages: List["Message"] = Relationship(back_populates="match")

class Message(SQLModel, table=True):
    __tablename__ = "messages"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    match_id: uuid.UUID = Field(foreign_key="matches.id")
    sender_id: uuid.UUID = Field(foreign_key="users.id")
    content: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    match: Optional[Match] = Relationship(back_populates="messages")
    sender: "User" = Relationship(back_populates="sent_messages")

class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id")
    type: str # e.g. "match_created", "like_received"
    reference_id: uuid.UUID # Can point to Match ID, Property ID, etc.
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: "User" = Relationship(back_populates="notifications")
