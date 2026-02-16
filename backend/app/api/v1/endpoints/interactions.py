from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, desc
from sqlalchemy.orm import selectinload

from app.api.deps import get_async_session, current_active_user
from app.models.user import User
from app.models.interaction import Swipe, Match, Notification
from app.models.property import Property
from app.schemas import interaction as schemas

router = APIRouter()

# --- Student Actions ---

@router.post("/swipe", response_model=schemas.SwipeRead)
async def create_swipe(
    swipe_in: schemas.SwipeCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Student swipes on a property.
    If is_liked=True, it's a Like.
    If is_liked=False, it's a Dislike (Pass).
    """
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can swipe")

    # Check if property exists
    prop = await session.get(Property, swipe_in.property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    # Check if already swiped
    query = select(Swipe).where(
        Swipe.student_id == user.id,
        Swipe.property_id == swipe_in.property_id
    )
    existing = await session.execute(query)
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already swiped on this property")

    swipe = Swipe(
        student_id=user.id,
        property_id=swipe_in.property_id,
        is_liked=swipe_in.is_liked
    )
    session.add(swipe)
    await session.commit()
    await session.refresh(swipe)
    return swipe

@router.delete("/swipe/{property_id}")
async def delete_swipe(
    property_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Remove a like/dislike (swipe)"""
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can remove swipes")
    
    query = select(Swipe).where(Swipe.student_id == user.id, Swipe.property_id == property_id)
    result = await session.execute(query)
    swipe = result.scalar_one_or_none()
    
    if not swipe:
        raise HTTPException(status_code=404, detail="Swipe not found")
        
    stmt_match = select(Match).where(Match.swipe_id == swipe.id)
    match_result = await session.execute(stmt_match)
    existing_match = match_result.scalar_one_or_none()
    
    if existing_match:
         raise HTTPException(status_code=400, detail="Cannot remove like because a match already exists.")
         
    await session.delete(swipe)
    await session.commit()
    return {"message": "Swipe removed"}
    
@router.get("/my-likes", response_model=List[schemas.SwipeRead])
async def get_my_likes(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    skip: int = 0,
    limit: int = 100,
):
    """List properties the student liked."""
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Only students have likes")
    
    query = select(Swipe).where(Swipe.student_id == user.id, Swipe.is_liked == True)
    query = query.offset(skip).limit(limit)
    result = await session.execute(query)
    return result.scalars().all()

# --- Landlord Actions ---

@router.get("/landlord/received-likes", response_model=List[schemas.SwipeWithStudent])
async def get_received_likes(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    skip: int = 0,
    limit: int = 100,
):
    """See students who liked their properties."""
    if user.role != "landlord":
        raise HTTPException(status_code=403, detail="Only landlords can view received likes")

    # Join Swipes with Properties where Property.landlord_id == user.id
    # Also fetch the Property details
    query = (
        select(Swipe)
        .join(Property)
        .where(
            Property.landlord_id == user.id,
            Swipe.is_liked == True
        )
        .options(
            selectinload(Swipe.property).selectinload(Property.amenities),
            selectinload(Swipe.property).selectinload(Property.images),
            selectinload(Swipe.student).selectinload(User.student_profile)
        )
    )
    
    # Add pagination
    query = query.offset(skip).limit(limit)
    
    result = await session.execute(query)
    swipes = result.scalars().all()
    
    # Manually construct response to map User -> StudentProfile
    response = []
    for swipe in swipes:
        student_profile = swipe.student.student_profile if swipe.student else None
        
        item = schemas.SwipeWithStudent(
            id=swipe.id,
            student_id=swipe.student_id,
            property_id=swipe.property_id,
            is_liked=swipe.is_liked,
            property=swipe.property,
            student=student_profile
        )
        response.append(item)

    return response

@router.post("/landlord/accept-swipe/{swipe_id}", response_model=schemas.MatchRead)
async def accept_swipe(
    swipe_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Landlord accepts a student's like -> Creates a Match"""
    if user.role != "landlord":
        raise HTTPException(status_code=403, detail="Only landlords can accept swipes")

    # Get swipe
    stmt = select(Swipe).join(Property).where(Swipe.id == swipe_id).options(selectinload(Swipe.property))
    result = await session.execute(stmt)
    swipe = result.scalar_one_or_none()

    if not swipe:
        raise HTTPException(status_code=404, detail="Swipe not found")
    
    # Verify ownership
    if swipe.property.landlord_id != user.id:
        raise HTTPException(status_code=403, detail="Not your property")

    # Check if match already exists
    stmt_match = select(Match).where(Match.swipe_id == swipe.id)
    existing_match = await session.execute(stmt_match)
    if existing_match.scalar_one_or_none():
         raise HTTPException(status_code=400, detail="Match already exists")

    # Create Match
    match = Match(
        swipe_id=swipe.id,
        student_id=swipe.student_id,
        property_id=swipe.property_id,
        landlord_id=user.id,
        status="accepted"
    )
    session.add(match)
    
    # Create Notification for Student
    notif = Notification(
        user_id=swipe.student_id,
        type="match_created",
        reference_id=match.id,
        is_read=False
    )
    session.add(notif)

    await session.commit()
    await session.refresh(match)
    return match

@router.post("/landlord/reject-swipe/{swipe_id}")
async def reject_swipe(
    swipe_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Landlord rejects a like."""
    if user.role != "landlord":
        raise HTTPException(status_code=403, detail="Only landlords can reject swipes")

    stmt = select(Swipe).join(Property).where(Swipe.id == swipe_id).options(selectinload(Swipe.property))
    result = await session.execute(stmt)
    swipe = result.scalar_one_or_none()
    
    if not swipe or swipe.property.landlord_id != user.id:
        raise HTTPException(status_code=404, detail="Swipe not found or access denied")
    
    match = Match(
        swipe_id=swipe.id,
        student_id=swipe.student_id,
        property_id=swipe.property_id,
        landlord_id=user.id,
        status="rejected"
    )
    session.add(match)
    
    # Create Notification for Student
    notif = Notification(
        user_id=swipe.student_id,
        type="match_rejected",
        reference_id=match.id,
        is_read=False
    )
    session.add(notif)
    
    await session.commit()
    return {"message": "Swipe rejected"}

# --- Common Actions ---

@router.get("/matches", response_model=List[schemas.MatchRead])
async def get_my_matches(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    skip: int = 0,
    limit: int = 100,
):
    """Get matches for the current user (Student or Landlord)."""
    
    if user.role == "student":
        query = select(Match).where(Match.student_id == user.id, Match.status == "accepted")
    else:
        query = select(Match).where(Match.landlord_id == user.id, Match.status == "accepted")
    
    query = query.order_by(desc(Match.created_at)).offset(skip).limit(limit)
    
    result = await session.execute(query)
    return result.scalars().all()
