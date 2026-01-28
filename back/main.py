from fastapi import FastAPI
from app.db.session import engine
from app.models.user import Base as UserBase
from app.routes import user
from app.routes import auth

app = FastAPI(title="Roomly Backend")

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(UserBase.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Hello World"}

app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
