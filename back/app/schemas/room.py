from pydantic import BaseModel

class RoomCreate(BaseModel):
    title: str
    description: str | None = None
    price: float
    owner_id: int

class RoomOut(RoomCreate):
    id: int

    class Config:
        orm_mode = True
