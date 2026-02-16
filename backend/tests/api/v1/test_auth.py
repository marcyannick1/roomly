import pytest
from httpx import AsyncClient
from app.core.config import settings
from urllib.parse import urlencode

@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    # Register
    register_data = {
        "email": "test@example.com",
        "password": "password123",
        "is_active": True,
        "is_superuser": False,
        "is_verified": False
    }
    response = await client.post("/api/v1/auth/register", json=register_data)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    
    # Login
    # fastapi-users /login endpoint expects `username` and `password` as application/x-www-form-urlencoded
    # by default if using OAuth2PasswordRequestForm
    
    login_data = {
        "username": "test@example.com",
        "password": "password123"
    }
    
    response = await client.post("/api/v1/auth/login", data=login_data)
    
    # If 404, try /jwt/login
    if response.status_code == 404:
         response = await client.post("/api/v1/auth/jwt/login", data=login_data)

    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()
    assert "access_token" in token 
    return token["access_token"]
