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

async def get_student(db: AsyncSession, student_id: int) -> Student | None:
    result = await db.execute(select(Student).where(Student.id == student_id))
    return result.scalar_one_or_none()

async def get_student_by_user(db: AsyncSession, user_id: int) -> Student | None:
    result = await db.execute(select(Student).where(Student.user_id == user_id))
    return result.scalar_one_or_none()

async def update_student(db: AsyncSession, student_id: int, student_data: StudentCreate) -> Student:
    """Mettre à jour un profil étudiant existant"""
    result = await db.execute(select(Student).where(Student.id == student_id))
    db_student = result.scalar_one_or_none()
    
    if not db_student:
        return None
    
    # Mettre à jour les champs
    update_data = student_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_student, field, value)
    
    db.add(db_student)
    await db.commit()
    await db.refresh(db_student)
    return db_student
