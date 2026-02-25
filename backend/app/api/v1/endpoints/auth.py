from fastapi import APIRouter

from app.api.deps import fastapi_users_obj # Assuming this is the FastAPIUsers object
from app.core.security import auth_backend
from app.schemas.user import UserCreate, UserRead

router = APIRouter()

# Login / Logout
router.include_router(
    fastapi_users_obj.get_auth_router(auth_backend),
    tags=["auth"],
)

# Registration
router.include_router(
    fastapi_users_obj.get_register_router(UserRead, UserCreate),
    tags=["auth"],
)

# Password Reset
router.include_router(
    fastapi_users_obj.get_reset_password_router(),
    tags=["auth"],
)

# Verify Email
router.include_router(
    fastapi_users_obj.get_verify_router(UserRead),
    tags=["auth"],
)
