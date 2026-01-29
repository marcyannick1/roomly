from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.landlord import LandlordOut, LandlordCreate
from app.schemas.student import StudentCreate, StudentOut
from app.controllers import student as student_ctrl

router = APIRouter(tags=["Landlords"])

@router.post("/", response_model=LandlordOut)
async def create_landlord(landlord: LandlordCreate, db: AsyncSession = Depends(get_db)):
    return await student_ctrl.create_student(db, landlord)
