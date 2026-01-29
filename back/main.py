from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.models.user import Base as UserBase
from app.routes import user, auth, room, student, landlord

try:
    from app.routes import listing
except ImportError:
    listing = None

app = FastAPI(title="Roomly Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(UserBase.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(student.router, prefix="/student", tags=["Students"])
app.include_router(landlord.router, prefix="/landlord", tags=["Landlords"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(room.router, prefix="/room", tags=["Rooms"])
if listing:
    app.include_router(listing.router, prefix="/listings", tags=["Listings"])
