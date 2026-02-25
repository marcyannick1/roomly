import pytest
from httpx import AsyncClient


async def create_user_with_token(client: AsyncClient, email: str, role: str = "student"):
    """Helper to create user and return token."""
    register_data = {"email": email, "password": "password123", "role": role}
    await client.post("/api/v1/auth/register", json=register_data)
    
    login_data = {"username": email, "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_delete_own_account(client: AsyncClient):
    """Test user deleting their own account."""
    token = await create_user_with_token(client, "delete_me@test.com")
    
    response = await client.delete(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    
    # Try to login again (should fail)
    login_data = {"username": "delete_me@test.com", "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 400  # Bad credentials


@pytest.mark.asyncio
async def test_deleted_user_cannot_access_endpoints(client: AsyncClient):
    """Test that deleted users cannot access protected endpoints."""
    token = await create_user_with_token(client, "delete_access@test.com")
    
    # Delete account
    await client.delete(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Try to access protected endpoint
    response = await client.get(
        "/api/v1/profiles/me/student",
        headers={"Authorization": f"Bearer {token}"}
    )
    # Token is invalid after user deletion
    assert response.status_code == 401
