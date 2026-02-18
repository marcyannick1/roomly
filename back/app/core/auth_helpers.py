"""
Helper pour l'authentification via query param token
Compatible avec le nouveau frontend
"""
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import decode_access_token
from app.controllers import user as crud_user
from app.models.user import User


async def get_user_from_token(token: str, db: AsyncSession) -> User:
    """
    Récupère l'utilisateur à partir d'un token.
    Utilisé par le nouveau frontend qui passe ?token=xxx
    
    Args:
        token: JWT token string
        db: Database session
        
    Returns:
        User object
        
    Raises:
        HTTPException: Si le token est invalide ou l'utilisateur n'existe pas
    """
    try:
        payload = decode_access_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    user = await crud_user.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_optional_user_from_token(token: str | None, db: AsyncSession) -> User | None:
    """
    Récupère l'utilisateur si un token est fourni, sinon retourne None.
    
    Args:
        token: JWT token string (optional)
        db: Database session
        
    Returns:
        User object or None
    """
    if not token:
        return None
    
    try:
        return await get_user_from_token(token, db)
    except:
        return None
