from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.db.session import engine
from app.db.base import Base
import traceback

# Import all models to register them with SQLAlchemy
from app.models.user import User
from app.models.student import Student
from app.models.landlord import Landlord
from app.models.room import Room
from app.models.listing import Listing
from app.routes import user, auth, room, student, landlord

try:
    from app.routes import listing
except ImportError:
    listing = None

app = FastAPI(title="Roomly Backend")

# CORS middleware - MUST be added FIRST before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to log errors and return detailed response"""
    print(f"Exception occurred: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
    )

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(student.router, prefix="/students", tags=["Students"])
app.include_router(landlord.router, prefix="/landlords", tags=["Landlords"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(room.router, prefix="/room", tags=["Rooms"])
if listing:
    app.include_router(listing.router, prefix="/listings", tags=["Listings"])
