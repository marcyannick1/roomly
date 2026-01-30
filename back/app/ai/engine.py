from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sklearn.metrics.pairwise import cosine_similarity

from app.ai.embeddings import create_student_embedding, create_listing_embedding
from app.ai.rules import apply_business_rules
from app.models.student import Student
from app.models.listing import Listing
from app.ai.schemas import RecommendationOut


class AIRecommendationEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_recommendations(
        self,
        student_id: int,
        limit: int = 20
    ) -> List[RecommendationOut]:

        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()
        if not student:
            return []

        student_vec = create_student_embedding(student)

        query = select(Listing).options(selectinload(Listing.photos))
        if student.max_budget:
            query = query.where(Listing.price <= student.max_budget * 1.2)

        listings_result = await self.db.execute(query)
        listings = listings_result.scalars().all()

        recommendations = []

        for listing in listings:
            listing_vec = create_listing_embedding(listing)

            similarity = cosine_similarity(
                student_vec.reshape(1, -1),
                listing_vec.reshape(1, -1)
            )[0][0]

            score = similarity * 100
            rules = apply_business_rules(student, listing)
            final_score = score * rules["multiplier"]

            recommendations.append(
                RecommendationOut(
                    listing=listing,  # 👈 objet complet
                    score=round(final_score, 2),
                    reasons=rules["reasons"]
                )
            )

        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]
