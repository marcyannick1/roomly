from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.student import StudentCreate, StudentOut
from app.controllers import student as student_ctrl

router = APIRouter(tags=["Students"])

@router.post("/", response_model=StudentOut)
async def create_student(student: StudentCreate, db: AsyncSession = Depends(get_db)):
    return await student_ctrl.create_student(db, student)
