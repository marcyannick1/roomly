from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.student import Student
from app.schemas.student import StudentCreate

async def create_student(db: AsyncSession, student: StudentCreate) -> Student:
    db_student = Student(**student.model_dump())
    db.add(db_student)
    await db.commit()
    await db.refresh(db_student)
    return db_student

async def get_student_by_user(db: AsyncSession, user_id: int) -> Student | None:
    result = await db.execute(select(Student).where(Student.user_id == user_id))
    return result.scalar_one_or_none()
