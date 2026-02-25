from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_async_session, current_active_user
from app.models.user import User

router = APIRouter()


@router.get("/me")
async def get_me(user: User = Depends(current_active_user)):
    """Get current authenticated user."""
    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "is_onboarded": user.is_onboarded,
        "avatar_url": user.avatar_url,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.delete("/me")
async def delete_me(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Delete current user account."""
    await session.delete(user)
    await session.commit()
    return {"message": "User deleted"}
