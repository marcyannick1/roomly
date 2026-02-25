from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, 
    profiles, 
    properties, 
    interactions, 
    amenities, 
    messages, 
    notifications,
    users,
    media,
    websocket
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(interactions.router, prefix="/interactions", tags=["interactions"])
api_router.include_router(amenities.router, prefix="/amenities", tags=["amenities"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
api_router.include_router(websocket.router, tags=["websocket"])
