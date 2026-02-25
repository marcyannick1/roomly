from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, desc, delete
from sqlalchemy.orm import selectinload

from app.api.deps import get_async_session, current_active_user
from app.models.user import User
from app.models.property import Property, PropertyAmenity, Amenity, PropertyImage
from app.schemas import property as schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.PropertyRead])
async def list_properties(
    session: AsyncSession = Depends(get_async_session),
    skip: int = 0,
    limit: int = 100,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
):
    """List active properties with optional filters."""
    query = select(Property).options(selectinload(Property.amenities), selectinload(Property.images))
    
    if city:
        query = query.where(Property.city == city)
    if min_price:
        query = query.where(Property.price >= min_price)
    if max_price:
        query = query.where(Property.price <= max_price)
        
    query = query.where(Property.is_active == True)
    query = query.order_by(desc(Property.created_at)).offset(skip).limit(limit)
    
    result = await session.execute(query)
    return result.scalars().all()

@router.get("/me", response_model=List[schemas.PropertyRead])
async def list_my_properties(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Landlord: List own properties."""
    if user.role != "landlord":
        raise HTTPException(status_code=403, detail="Not a landlord")
        
    query = select(Property).where(Property.landlord_id == user.id).options(
        selectinload(Property.amenities), 
        selectinload(Property.images)
    )
    result = await session.execute(query)
    return result.scalars().all()

@router.get("/{property_id}", response_model=schemas.PropertyRead)
async def get_property(
    property_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
):
    """Get a single property by ID."""
    query = select(Property).where(Property.id == property_id).options(
        selectinload(Property.amenities), 
        selectinload(Property.images)
    )
    result = await session.execute(query)
    prop = result.scalar_one_or_none()
    
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    return prop

@router.post("/", response_model=schemas.PropertyRead)
async def create_property(
    property_in: schemas.PropertyCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Create a new property listing (landlords only)."""
    if user.role != "landlord" and not user.is_superuser:
        raise HTTPException(status_code=403, detail="Only landlords can post properties")
    
    amenity_ids = property_in.amenity_ids or []
    image_urls = property_in.image_urls or []
    
    property_data = property_in.model_dump(exclude={"amenity_ids", "image_urls"})
    property_obj = Property(**property_data, landlord_id=user.id)
    
    session.add(property_obj)
    await session.commit()
    await session.refresh(property_obj)
    
    if amenity_ids:
        for amenity_id in amenity_ids:
            prop_amenity = PropertyAmenity(property_id=property_obj.id, amenity_id=amenity_id)
            session.add(prop_amenity)
    
    if image_urls:
        for idx, url in enumerate(image_urls):
            img = PropertyImage(property_id=property_obj.id, image_url=url, position=idx)
            session.add(img)

    await session.commit()
    
    stmt = select(Property).options(
        selectinload(Property.amenities), 
        selectinload(Property.images)
    ).where(Property.id == property_obj.id)
    result = await session.execute(stmt)
    property_obj = result.scalar_one()

    return property_obj

@router.patch("/{property_id}", response_model=schemas.PropertyRead)
async def update_property(
    property_id: uuid.UUID,
    property_in: schemas.PropertyUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Update a property (landlord only)."""
    query = select(Property).where(Property.id == property_id).options(
        selectinload(Property.amenities), 
        selectinload(Property.images)
    )
    result = await session.execute(query)
    prop = result.scalar_one_or_none()
    
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if prop.landlord_id != user.id and not user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to update this property")

    update_data = property_in.model_dump(exclude_unset=True, exclude={"amenity_ids"})
    for key, value in update_data.items():
        setattr(prop, key, value)
        
    if property_in.amenity_ids is not None:
        stmt_del = delete(PropertyAmenity).where(PropertyAmenity.property_id == prop.id)
        await session.execute(stmt_del)
        
        for amenity_id in property_in.amenity_ids:
            prop_amenity = PropertyAmenity(property_id=prop.id, amenity_id=amenity_id)
            session.add(prop_amenity)

    session.add(prop)
    await session.commit()
    await session.refresh(prop)
    return prop

@router.delete("/{property_id}")
async def delete_property(
    property_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Delete a property (landlord only)."""
    query = select(Property).where(Property.id == property_id)
    result = await session.execute(query)
    prop = result.scalar_one_or_none()
    
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if prop.landlord_id != user.id and not user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to delete this property")
    
    await session.delete(prop)
    await session.commit()
    return {"message": "Property deleted"}
