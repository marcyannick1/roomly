from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.controllers import auth as auth_controller
from app.controllers import user as crud_user
from app.schemas.user import UserLogin, UserCreate
from app.core.security import decode_access_token
from app.models.user import User

router = APIRouter(tags=["Auth"])
security = HTTPBearer()

async def get_current_user_endpoint(credentials = Depends(security), db: AsyncSession = Depends(get_db)):
    """Obtient l'utilisateur actuel à partir du token JWT"""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await crud_user.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    return await auth_controller.login(user, db)

@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Vérifier si l'utilisateur existe
    existing_user = await crud_user.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Créer l'utilisateur
    db_user = await crud_user.create_user(db, user)
    
    # Générer le token
    from app.core.security import create_access_token
    token = create_access_token({"sub": db_user.email})
    
    return {
        "session_token": token,
        "token_type": "bearer",
        "user": auth_controller.convert_user_to_dict(db_user)
    }

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user_endpoint)):
    return {
        "user": auth_controller.convert_user_to_dict(current_user)
    }

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user_endpoint)):    # Avec JWT stateless, le logout est côté client (suppression du token)
    return {"message": "Logged out successfully"}