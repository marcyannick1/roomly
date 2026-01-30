import cloudinary
import os
from fastapi import HTTPException, status, UploadFile
from dotenv import load_dotenv
import asyncio
from cloudinary.uploader import upload


load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

async def upload_to_cloudinary(image: UploadFile) -> str:
    if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format"
        )


    try:
        # Lire le contenu du fichier
        contents = await image.read()
        await image.seek(0)  # Reset pour réutilisation si besoin
        
        result = await asyncio.to_thread(
            upload,
            contents,
            folder="listings",
            resource_type="auto"
        )
        return result["secure_url"]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading image: {str(e)}"
        )

