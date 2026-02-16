import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
from io import BytesIO


async def create_landlord_with_token(client: AsyncClient, email: str):
    """Helper to create landlord and return token."""
    register_data = {"email": email, "password": "password123", "role": "landlord"}
    await client.post("/api/v1/auth/register", json=register_data)
    
    login_data = {"username": email, "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    # Create landlord profile
    profile_data = {"company_name": "Test Company"}
    await client.post(
        "/api/v1/profiles/landlord",
        json=profile_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    return token


async def create_student_with_token(client: AsyncClient, email: str):
    """Helper to create student and return token."""
    register_data = {"email": email, "password": "password123", "role": "student"}
    await client.post("/api/v1/auth/register", json=register_data)
    
    login_data = {"username": email, "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    # Create student profile
    profile_data = {
        "first_name": "Test",
        "last_name": "Student",
        "birth_date": "2000-01-01"
    }
    await client.post(
        "/api/v1/profiles/student",
        json=profile_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    return token


@pytest.mark.asyncio
@patch('app.services.media.upload_image', new_callable=AsyncMock)
async def test_upload_avatar(mock_upload, client: AsyncClient):
    """Test uploading user avatar."""
    mock_upload.return_value = "https://res.cloudinary.com/test/avatar.jpg"
    
    token = await create_student_with_token(client, "student_avatar@test.com")
    
    # Create fake image file
    fake_image = BytesIO(b"fake image content")
    files = {"file": ("avatar.jpg", fake_image, "image/jpeg")}
    
    response = await client.post(
        "/api/v1/media/avatar",
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "avatar_url" in data
    assert data["avatar_url"] == "https://res.cloudinary.com/test/avatar.jpg"


@pytest.mark.asyncio
async def test_delete_avatar(client: AsyncClient):
    """Test deleting user avatar."""
    token = await create_student_with_token(client, "student_del_avatar@test.com")
    
    response = await client.delete(
        "/api/v1/media/avatar",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Avatar deleted"


@pytest.mark.asyncio
@patch('app.services.media.upload_image', new_callable=AsyncMock)
async def test_upload_property_image(mock_upload, client: AsyncClient):
    """Test uploading property image."""
    mock_upload.return_value = "https://res.cloudinary.com/test/property.jpg"
    
    token = await create_landlord_with_token(client, "landlord_img@test.com")
    
    # Create property
    property_data = {
        "title": "Test Property",
        "description": "Test",
        "price": 800.0,
        "surface": 25.0,
        "city": "Paris",
        "address": "Street",
        "postal_code": "75001",
        "room_type": "studio",
        "available_from": "2026-03-01"
    }
    response = await client.post(
        "/api/v1/properties/",
        json=property_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    property_id = response.json()["id"]
    
    # Upload image
    fake_image = BytesIO(b"fake image content")
    files = {"file": ("property.jpg", fake_image, "image/jpeg")}
    data = {"position": "0"}
    
    response = await client.post(
        f"/api/v1/media/properties/{property_id}/images",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    result = response.json()
    assert result["image_url"] == "https://res.cloudinary.com/test/property.jpg"
    assert result["property_id"] == property_id


@pytest.mark.asyncio
async def test_delete_property_image(client: AsyncClient):
    """Test deleting property image."""
    token = await create_landlord_with_token(client, "landlord_delimg@test.com")
    
    # Create property with image URL
    property_data = {
        "title": "Test Property",
        "description": "Test",
        "price": 800.0,
        "surface": 25.0,
        "city": "Paris",
        "address": "Street",
        "postal_code": "75001",
        "room_type": "studio",
        "available_from": "2026-03-01",
        "image_urls": ["https://example.com/image.jpg"]
    }
    response = await client.post(
        "/api/v1/properties/",
        json=property_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    property_data = response.json()
    image_id = property_data["images"][0]["id"]
    
    # Delete image
    response = await client.delete(
        f"/api/v1/media/images/{image_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Image deleted"


@pytest.mark.asyncio
@patch('app.services.media.upload_image', new_callable=AsyncMock)
async def test_cannot_upload_to_others_property(mock_upload, client: AsyncClient):
    """Test that landlords cannot upload images to other landlords' properties."""
    mock_upload.return_value = "https://res.cloudinary.com/test/hack.jpg"
    
    token1 = await create_landlord_with_token(client, "landlord1_img@test.com")
    token2 = await create_landlord_with_token(client, "landlord2_img@test.com")
    
    # Landlord 1 creates property
    property_data = {
        "title": "Test Property",
        "description": "Test",
        "price": 800.0,
        "surface": 25.0,
        "city": "Paris",
        "address": "Street",
        "postal_code": "75001",
        "room_type": "studio",
        "available_from": "2026-03-01"
    }
    response = await client.post(
        "/api/v1/properties/",
        json=property_data,
        headers={"Authorization": f"Bearer {token1}"}
    )
    property_id = response.json()["id"]
    
    # Landlord 2 tries to upload image
    fake_image = BytesIO(b"fake image content")
    files = {"file": ("hack.jpg", fake_image, "image/jpeg")}
    data = {"position": "0"}
    
    response = await client.post(
        f"/api/v1/media/properties/{property_id}/images",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert response.status_code == 403
