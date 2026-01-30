from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user
from app.routes import auth
from app.routes import listing
from app.routes import listing_photo
from app.routes import student
from app.routes import landlord
from app.routes import ai

app = FastAPI(title="Roomly Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(student.router, prefix="/students", tags=["Students"])
app.include_router(landlord.router, prefix="/landlords", tags=["Landlords"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(listing.router, prefix="/listings", tags=["Listings"])
app.include_router(listing_photo.router, prefix="/listing-photos", tags=["Listing Photos"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
