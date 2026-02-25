from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.api.deps import get_async_session, current_active_user
from app.models.user import User
from app.models.property import Property, PropertyImage
from app.schemas import property as schemas
from app.services.media import upload_image

router = APIRouter()

@router.post("/properties/{property_id}/images", response_model=schemas.PropertyImageRead)
async def add_property_image(
    property_id: uuid.UUID,
    file: UploadFile = File(...),
    position: int = Form(0),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Upload an image to Cloudinary and add it to a property."""
    # Check Property
    prop = await session.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if prop.landlord_id != user.id and not user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Upload Image
    try:
        url = await upload_image(file, folder="roomly/properties")
    except Exception as e:
        # Re-raise HTTP exceptions from service
        raise e 
    
    # Save to DB
    img = PropertyImage(
        property_id=property_id,
        image_url=url,
        position=position
    )
    session.add(img)
    await session.commit()
    await session.refresh(img)
    return img

@router.delete("/images/{image_id}")
async def delete_property_image(
    image_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Delete a property image."""
    img = await session.get(PropertyImage, image_id)
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
        
    # Check Property Ownership
    prop = await session.get(Property, img.property_id)
    if not prop:
         raise HTTPException(status_code=404, detail="Property not found")
         
    if prop.landlord_id != user.id and not user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # TODO: Optionally delete from Cloudinary too if using public_id extraction
    
    await session.delete(img)
    await session.commit()
    return {"message": "Image deleted"}

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Upload user avatar to Cloudinary."""
    url = await upload_image(file, folder="roomly/avatars")
    
    user.avatar_url = url
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    return {"avatar_url": url}

@router.delete("/avatar")
async def delete_avatar(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Remove user avatar."""
    user.avatar_url = None
    session.add(user)
    await session.commit()
    
    return {"message": "Avatar deleted"}
