import cloudinary
from cloudinary.uploader import upload
import asyncio
from fastapi import HTTPException, status, UploadFile
from app.core.config import settings

# Configure Cloudinary
if settings.CLOUDINARY_CLOUD_NAME:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )

async def upload_image(image: UploadFile, folder: str = "properties") -> str:
    """
    Uploads an image file to Cloudinary and returns the secure URL.
    """
    if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Supported formats: JPEG, PNG, WEBP."
        )

    try:
        # Read content
        contents = await image.read()
        
        # Run synchronous upload in thread pool
        result = await asyncio.to_thread(
            upload,
            contents,
            folder=folder,
            resource_type="auto"
        )
        return result["secure_url"]
    except Exception as e:
        # Log error in production
        # print(f"Cloudinary Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading image: {str(e)}"
        )
