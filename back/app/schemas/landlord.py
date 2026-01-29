from pydantic import BaseModel

class LandlordBase(BaseModel):
    company_name: str | None = None

class LandlordCreate(LandlordBase):
    user_id: int

class LandlordOut(LandlordBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
