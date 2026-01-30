from pydantic import BaseModel

from app.schemas.listing import ListingOut


class RecommendationOut(BaseModel):
    score: float
    reasons: list[str]
    listing: ListingOut

    class Config:
        from_attributes = True

