from fastapi import APIRouter
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from fastapi.responses import RedirectResponse
from app.db.session import AsyncSession, get_db
from app.crud import user as crud_user
from app.core.security import create_access_token

router = APIRouter()
oauth = OAuth()

# Config Google OAuth
oauth.register(
    name='google',
    client_id='TON_CLIENT_ID',
    client_secret='TON_CLIENT_SECRET',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@router.get("/login/google")
async def google_login(request: Request):
    redirect_uri = request.url_for('google_auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/auth/google")
async def google_auth(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = await oauth.google.parse_id_token(request, token)
    email = user_info['email']

    # Vérifie si l'utilisateur existe déjà
    db_user = await crud_user.get_user_by_email(db, email)
    if not db_user:
        # Création automatique
        db_user = await crud_user.create_user(db, {
            "email": email,
            "name": user_info.get('name', 'No Name'),
            "password": "random_password"  # nécessaire mais pas utilisé
        })

    jwt_token = create_access_token({"sub": db_user.email})
    return {"access_token": jwt_token, "token_type": "bearer"}
