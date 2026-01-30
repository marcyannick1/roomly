from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.landlord import LandlordOut, LandlordCreate
from app.schemas.student import StudentCreate, StudentOut
from app.controllers import landlord as landlord_ctrl

router = APIRouter(tags=["Landlords"])

@router.post("/", response_model=LandlordOut)
async def create_landlord(landlord: LandlordCreate, db: AsyncSession = Depends(get_db)):
    return await landlord_ctrl.create_landlord(db, landlord)
