from pydantic import BaseModel

class RecommendationOut(BaseModel):
    listing_id: int
    score: float
    reasons: list[str]
