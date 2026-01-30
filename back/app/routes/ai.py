from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.ai.engine import AIRecommendationEngine
from app.ai.schemas import RecommendationOut

router = APIRouter(
    tags=["AI"]
)


@router.get(
    "/recommendations/{student_id}",
    response_model=list[RecommendationOut]
)
async def get_recommendations(
    student_id: int,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    engine = AIRecommendationEngine(db)
    recommendations = await engine.get_recommendations(
        student_id=student_id,
        limit=limit
    )

    if not recommendations:
        raise HTTPException(
            status_code=404,
            detail="No recommendations found for this student"
        )

    return recommendations
