from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_async_session, current_active_user
from app.models.user import User

router = APIRouter()

@router.delete("/me")
async def delete_me(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Delete current user account."""
    # Note: Ensure Database is configured with ON DELETE CASCADE for relationships 
    # to avoid IntegrityErrors, or manually delete related items here.
    
    await session.delete(user)
    await session.commit()
    return {"message": "User deleted"}
