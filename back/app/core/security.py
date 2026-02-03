import bcrypt
from datetime import datetime, timedelta
import jwt
from fastapi.security import HTTPBearer
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

SECRET_KEY = "change_this_to_a_random_secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24

security = HTTPBearer()

def hash_password(password: str) -> str:
    # Encoder en UTF-8 et tronquer à 72 bytes
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    # Encoder en UTF-8 et tronquer à 72 bytes
    password_bytes = password.encode('utf-8')[:72]
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_access_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


async def get_current_user(credentials = Depends(security), db: AsyncSession = Depends(None)):
    """Obtenir l'utilisateur courant à partir du token JWT"""
    from app.db.session import get_db
    from app.controllers import user as crud_user
    
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Obtenez une session si elle n'existe pas
    if db is None:
        async for session in get_db():
            db = session
            break
    
    user = await crud_user.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "is_landlord": user.is_landlord,
        "photo": user.photo
    }
