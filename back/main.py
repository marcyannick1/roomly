from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user
from app.routes import auth
from app.routes import listing
from app.routes import listing_photo
from app.routes import student
from app.routes import landlord
from app.routes import notification
from app.routes import message
from app.routes import visit
from app.routes import swipe
from app.routes import stats
from app.routes import properties_extra
# from app.routes import ai  # Temporairement désactivé - dépendances AI manquantes
from app.routes import match

app = FastAPI(title="Roomly Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "🏡 Roomly API v1.0"}

# === Routes standards ===
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(student.router, prefix="/students", tags=["Students"])
app.include_router(landlord.router, prefix="/landlords", tags=["Landlords"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(listing.router, prefix="/listings", tags=["Listings"])
app.include_router(listing_photo.router, prefix="/listing-photos", tags=["Listing Photos"])
app.include_router(match.router, prefix="/matches", tags=["Matches"])
app.include_router(message.router, prefix="/conversations", tags=["Messages"])
app.include_router(notification.router, prefix="/notifications", tags=["Notifications"])
app.include_router(visit.router, prefix="/visits", tags=["Visits"])

# === Routes avec préfixe /api (pour compatibilité nouveau frontend) ===
app.include_router(auth.router, prefix="/api/auth", tags=["Auth API"])
app.include_router(user.router, prefix="/api/users", tags=["Users API"])
app.include_router(student.router, prefix="/api/students", tags=["Students API"])
app.include_router(landlord.router, prefix="/api/landlords", tags=["Landlords API"])
app.include_router(swipe.router, prefix="/api", tags=["Swipes"])  # Routes swipes AVANT properties (pour /api/properties/swipe)
app.include_router(properties_extra.router, prefix="/api/properties", tags=["Properties Extra API"])  # Routes spécifiques D'ABORD
app.include_router(listing.router, prefix="/api/properties", tags=["Properties API"])  # Routes génériques avec params APRÈS
app.include_router(listing.router, prefix="/api/listings", tags=["Listings API"])
app.include_router(match.router, prefix="/api/matches", tags=["Matches API"])
app.include_router(message.router, prefix="/api/messages", tags=["Messages API"])
app.include_router(notification.router, prefix="/api/notifications", tags=["Notifications API"])
app.include_router(visit.router, prefix="/api/visits", tags=["Visits API"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats API"])  # Routes stats
# app.include_router(ai.router, prefix="/ai", tags=["AI"])  # Temporairement désactivé

