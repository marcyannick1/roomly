import sys
sys.path.insert(0, '/app')

from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.student import Student
from app.models.listing import Listing
from app.ai.engine import AIRecommendationEngine

from typing import List, Dict
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta

default_args = {
    "owner": "roomly",
    "retries": 1,
    "retry_delay": timedelta(minutes=5)
}

# --------------------
# Tasks
# --------------------
def fetch_recent_profiles(**context):
    """
    Fetch students and listings that have been recently updated or created.
    Returns profile IDs to be processed.
    """
    db = next(get_db())

    # Get students updated/created in the last 24 hours
    cutoff_date = datetime.now() - timedelta(days=1)

    students_query = select(Student.id).where(
        Student.updated_at >= cutoff_date
    )
    students_result = db.execute(students_query)
    student_ids = [row[0] for row in students_result.fetchall()]

    # Get listings updated/created in the last 24 hours
    listings_query = select(Listing.id).where(
        Listing.updated_at >= cutoff_date
    )
    listings_result = db.execute(listings_query)
    listing_ids = [row[0] for row in listings_result.fetchall()]

    # Push to XCom for next task
    context['ti'].xcom_push(key='student_ids', value=student_ids)
    context['ti'].xcom_push(key='listing_ids', value=listing_ids)

    print(f"Found {len(student_ids)} students and {len(listing_ids)} listings to process")

    db.close()


async def compute_matching_scores(**context):
    """
    Compute matching scores for all active students.
    """
    from app.db.session import AsyncSessionLocal

    db = AsyncSessionLocal()

    try:
        # Get all active students
        students_query = select(Student).where(Student.is_active == True)
        students_result = await db.execute(students_query)
        students = students_result.scalars().all()

        all_recommendations = []

        # Compute recommendations for each student
        engine = AIRecommendationEngine(db)

        for student in students:
            recommendations = await engine.get_recommendations(
                student_id=student.id,
                limit=10
            )

            for rec in recommendations:
                all_recommendations.append({
                    'student_id': student.id,
                    'listing_id': rec.listing.id,
                    'score': rec.score,
                    'reasons': rec.reasons
                })

        # Push to XCom
        context['ti'].xcom_push(key='all_recommendations', value=all_recommendations)

        print(f"Computed {len(all_recommendations)} recommendations for {len(students)} students")

    finally:
        await db.close()


def filter_high_scores(**context):
    """
    Filter recommendations to keep only high-quality matches (score >= 70).
    """
    ti = context['ti']
    all_recommendations = ti.xcom_pull(key='all_recommendations', task_ids='compute_matching_scores')

    # Filter high scores
    high_score_recommendations = [
        rec for rec in all_recommendations
        if rec['score'] >= 70
    ]

    # Group by student
    student_recommendations = {}
    for rec in high_score_recommendations:
        student_id = rec['student_id']
        if student_id not in student_recommendations:
            student_recommendations[student_id] = []
        student_recommendations[student_id].append(rec)

    # Push to XCom
    context['ti'].xcom_push(key='student_recommendations', value=student_recommendations)

    print(f"Filtered to {len(high_score_recommendations)} high-quality matches for {len(student_recommendations)} students")


with DAG(
    dag_id="daily_matching_suggestions",
    start_date=datetime(2026, 1, 1),
    schedule_interval="0 6 * * *",
    catchup=False,
    default_args=default_args
) as dag:

    fetch_data = PythonOperator(
        task_id="fetch_recent_profiles",
        python_callable=fetch_recent_profiles
    )

    compute_scores = PythonOperator(
        task_id="compute_matching_scores",
        python_callable=compute_matching_scores
    )

    filter_scores = PythonOperator(
        task_id="filter_high_scores",
        python_callable=filter_high_scores
    )

    notify = PythonOperator(
        task_id="send_notifications",
        python_callable=send_matching_notifications
    )

    fetch_data >> compute_scores >> filter_scores >> notify
