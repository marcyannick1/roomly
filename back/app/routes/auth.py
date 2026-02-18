from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.controllers import auth as auth_controller
from app.controllers import user as crud_user
from app.schemas.user import UserLogin, UserCreate
from app.core.security import decode_access_token
from app.models.user import User
from typing import Optional

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

async def get_current_user_from_query(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Obtient l'utilisateur actuel à partir du token JWT en query param"""
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
    
    # Gérer les alias de champs
    if user.first_name and user.last_name:
        user.name = f"{user.first_name} {user.last_name}"
    elif not user.name:
        user.name = user.email.split('@')[0]
    
    if user.phone and not user.telephone:
        user.telephone = user.phone
    
    # Déterminer is_landlord à partir de role
    if user.role:
        user.is_landlord = user.role == "landlord"
    elif user.user_type:
        user.is_landlord = user.user_type == "landlord"
    
    # Créer l'utilisateur
    db_user = await crud_user.create_user(db, user)
    
    # Générer le token
    from app.core.security import create_access_token
    token = create_access_token({"sub": db_user.email})
    
    return {
        "session_token": token,
        "token": token,  # Alias
        "token_type": "bearer",
        "user": auth_controller.convert_user_to_dict(db_user)
    }

@router.get("/me")
async def get_current_user_info(
    token: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer l'utilisateur actuel (supporte token en query param ou header)"""
    
    # Si token en query param, l'utiliser
    if token:
        user = await get_current_user_from_query(token, db)
    else:
        # Sinon, essayer le header Authorization
        raise HTTPException(status_code=401, detail="No authentication token provided")
    
    return {
        "user": auth_controller.convert_user_to_dict(user)
    }

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user_endpoint)):    # Avec JWT stateless, le logout est côté client (suppression du token)
    return {"message": "Logged out successfully"}

@router.put("/profile")
async def update_profile(
    profile_data: dict,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Mettre à jour le profil de l'utilisateur"""
    from app.core.auth_helpers import get_user_from_token
    from app.controllers import user as user_ctrl
    
    user = await get_user_from_token(token, db)
    
    # Mettre à jour les champs autorisés
    if "name" in profile_data:
        user.name = profile_data["name"]
    if "first_name" in profile_data:
        # Le modèle User n'a pas first_name, on le met dans name
        if "last_name" in profile_data:
            user.name = f"{profile_data['first_name']} {profile_data['last_name']}"
        else:
            user.name = profile_data["first_name"]
    if "telephone" in profile_data:
        user.telephone = profile_data["telephone"]
    if "photo" in profile_data:
        user.photo = profile_data["photo"]
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "success": True,
        "user": auth_controller.convert_user_to_dict(user)
    }