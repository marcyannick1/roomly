from typing import Dict, List
from sqlalchemy import select

from back.app.db.session import get_db
from back.app.models.student import Student
from back.app.models.listing import Listing


def send_matching_notifications(**context):
    """
    Send notifications to students about their new matching recommendations.
    """
    ti = context['ti']
    student_recommendations = ti.xcom_pull(
        key='student_recommendations',
        task_ids='filter_high_scores'
    )

    if not student_recommendations:
        print("No high-quality matches to notify")
        return

    db = next(get_db())

    notifications_sent = 0

    try:
        for student_id, recommendations in student_recommendations.items():
            # Get student info
            student_query = select(Student).where(Student.id == student_id)
            student_result = db.execute(student_query)
            student = student_result.scalar_one_or_none()

            if not student or not student.email:
                continue

            # Get top 3 recommendations
            top_recs = sorted(recommendations, key=lambda x: x['score'], reverse=True)[:3]

            # Get listing details
            listing_ids = [rec['listing_id'] for rec in top_recs]
            listings_query = select(Listing).where(Listing.id.in_(listing_ids))
            listings_result = db.execute(listings_query)
            listings = {listing.id: listing for listing in listings_result.scalars().all()}

            # Build notification message
            message_parts = [
                f"Bonjour {student.first_name},\n",
                "Nous avons trouvé de nouveaux logements qui pourraient vous intéresser !\n"
            ]

            for rec in top_recs:
                listing = listings.get(rec['listing_id'])
                if listing:
                    message_parts.append(
                        f"\n- {listing.title} à {listing.city}"
                        f"\n  Prix: {listing.price}€/mois"
                        f"\n  Score de compatibilité: {rec['score']:.0f}%"
                    )
                    if rec['reasons']:
                        message_parts.append(f"\n  Raisons: {', '.join(rec['reasons'][:2])}")

            message_parts.append("\n\nConnectez-vous pour voir plus de détails !")

            message = "".join(message_parts)

            # TODO: Integrate with actual email/notification service
            # For now, just log the notification
            print(f"Notification for {student.email}:")
            print(message)
            print("-" * 50)

            notifications_sent += 1

        print(f"Sent {notifications_sent} notifications")

    finally:
        db.close()
