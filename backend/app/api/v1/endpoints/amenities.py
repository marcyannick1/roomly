from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, desc
from app.api.deps import get_async_session, current_active_user, current_superuser
from app.models.property import Amenity
from app.models.user import User

from app.schemas.property import AmenityRead, AmenityCreate

router = APIRouter()

@router.get("/", response_model=List[AmenityRead])
async def list_amenities(
    session: AsyncSession = Depends(get_async_session),
    skip: int = 0,
    limit: int = 100,
):
    query = select(Amenity).offset(skip).limit(limit)
    result = await session.execute(query)
    return result.scalars().all()

@router.post("/", response_model=AmenityRead)
async def create_amenity(
    amenity_in: AmenityCreate,
    user: User = Depends(current_superuser), # restricted to admin
    session: AsyncSession = Depends(get_async_session),
):
    amenity = Amenity(**amenity_in.model_dump())
    session.add(amenity)
    await session.commit()
    await session.refresh(amenity)
    return amenity

@router.delete("/{amenity_id}")
async def delete_amenity(
    amenity_id: uuid.UUID,
    user: User = Depends(current_superuser), # restricted to admin
    session: AsyncSession = Depends(get_async_session),
):
    amenity = await session.get(Amenity, amenity_id)
    if not amenity:
        raise HTTPException(status_code=404, detail="Amenity not found")
    await session.delete(amenity)
    await session.commit()
    return {"message": "Amenity deleted"}
