from pydantic import BaseModel

class ListingPhotoBase(BaseModel):
    listing_id: int
    url: str

class ListingPhotoCreate(ListingPhotoBase):
    pass

class ListingPhotoOut(ListingPhotoBase):
    id: int

    class Config:
        from_attributes = True
