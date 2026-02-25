from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.api.deps import get_async_session, current_active_user
from app.models.user import User
from app.models.profile import StudentProfile, LandlordProfile
from app.schemas import profile as schemas

router = APIRouter()

# Get My Profile
@router.get("/me/student", response_model=Optional[schemas.StudentProfileRead])
async def get_my_student_profile(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    # Check if user has student profile
    query = select(StudentProfile).where(StudentProfile.user_id == user.id)
    result = await session.execute(query)
    profile = result.scalar_one_or_none()
    return profile

@router.get("/me/landlord", response_model=Optional[schemas.LandlordProfileRead])
async def get_my_landlord_profile(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    query = select(LandlordProfile).where(LandlordProfile.user_id == user.id)
    result = await session.execute(query)
    profile = result.scalar_one_or_none()
    return profile

# Create Profile
@router.post("/student", response_model=schemas.StudentProfileRead)
async def create_student_profile(
    profile_in: schemas.StudentProfileCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    # Check role
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can create student profiles")
    
    # Check if exists
    query = select(StudentProfile).where(StudentProfile.user_id == user.id)
    result = await session.execute(query)
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile already exists",
        )
    
    # Create
    profile = StudentProfile(**profile_in.model_dump(), user_id=user.id)
    session.add(profile)
    # Also update user onboarding
    user.is_onboarded = True
    session.add(user)
    
    await session.commit()
    await session.refresh(profile)
    return profile

@router.post("/landlord", response_model=schemas.LandlordProfileRead)
async def create_landlord_profile(
    profile_in: schemas.LandlordProfileCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    # Check role
    if user.role != "landlord":
        raise HTTPException(status_code=403, detail="Only landlords can create landlord profiles")
    
    # Check if exists
    query = select(LandlordProfile).where(LandlordProfile.user_id == user.id)
    result = await session.execute(query)
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Landlord profile already exists",
        )
    
    profile = LandlordProfile(**profile_in.model_dump(), user_id=user.id)
    session.add(profile)
    
    user.is_onboarded = True
    session.add(user)
    
    await session.commit()
    await session.refresh(profile)
    return profile

# Update Profile
@router.patch("/student", response_model=schemas.StudentProfileRead)
async def update_student_profile(
    profile_in: schemas.StudentProfileUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    query = select(StudentProfile).where(StudentProfile.user_id == user.id)
    result = await session.execute(query)
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    session.add(profile)
    await session.commit()
    await session.refresh(profile)
    return profile

@router.patch("/landlord", response_model=schemas.LandlordProfileRead)
async def update_landlord_profile(
    profile_in: schemas.LandlordProfileUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    query = select(LandlordProfile).where(LandlordProfile.user_id == user.id)
    result = await session.execute(query)
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    session.add(profile)
    await session.commit()
    await session.refresh(profile)
    return profile
