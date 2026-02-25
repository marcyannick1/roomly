import pytest
from httpx import AsyncClient


async def create_landlord_with_token(client: AsyncClient, email: str = "landlord_prop@test.com"):
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


async def create_student_with_token(client: AsyncClient, email: str = "student_prop@test.com"):
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
async def test_create_property(client: AsyncClient):
    """Test creating a property as landlord."""
    token = await create_landlord_with_token(client, "landlord_create@test.com")
    
    property_data = {
        "title": "Beautiful Studio in Paris",
        "description": "Cozy studio near metro",
        "price": 800.0,
        "surface": 25.0,
        "charges_included": 50.0,
        "deposit": 800.0,
        "city": "Paris",
        "address": "123 Rue de la Paix",
        "postal_code": "75001",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "room_type": "studio",
        "furnished": True,
        "floor": 3,
        "total_floors": 5,
        "available_from": "2026-03-01",
        "min_duration_months": 6,
        "is_active": True
    }
    
    response = await client.post(
        "/api/v1/properties/",
        json=property_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Beautiful Studio in Paris"
    assert data["price"] == 800.0
    assert data["city"] == "Paris"
    assert "id" in data


@pytest.mark.asyncio
async def test_student_cannot_create_property(client: AsyncClient):
    """Test that students cannot create properties."""
    token = await create_student_with_token(client, "student_noprop@test.com")
    
    property_data = {
        "title": "Fake Property",
        "description": "Should fail",
        "price": 500.0,
        "surface": 20.0,
        "city": "Paris",
        "address": "123 Street",
        "postal_code": "75001",
        "room_type": "studio",
        "available_from": "2026-03-01"
    }
    
    response = await client.post(
        "/api/v1/properties/",
        json=property_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_properties(client: AsyncClient):
    """Test listing properties with filters."""
    token = await create_landlord_with_token(client, "landlord_list@test.com")
    
    # Create multiple properties
    properties = [
        {"title": "Paris Studio", "price": 700.0, "city": "Paris", "surface": 20.0, "address": "1 Rue", "postal_code": "75001", "room_type": "studio", "available_from": "2026-03-01", "description": "Nice"},
        {"title": "Lyon Apartment", "price": 900.0, "city": "Lyon", "surface": 40.0, "address": "2 Rue", "postal_code": "69001", "room_type": "T2", "available_from": "2026-03-01", "description": "Great"},
        {"title": "Paris T2", "price": 1200.0, "city": "Paris", "surface": 45.0, "address": "3 Rue", "postal_code": "75002", "room_type": "T2", "available_from": "2026-03-01", "description": "Luxury"},
    ]
    
    for prop in properties:
        await client.post(
            "/api/v1/properties/",
            json=prop,
            headers={"Authorization": f"Bearer {token}"}
        )
    
    # List all
    response = await client.get("/api/v1/properties/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    
    # Filter by city
    response = await client.get("/api/v1/properties/?city=Paris")
    assert response.status_code == 200
    data = response.json()
    assert all(p["city"] == "Paris" for p in data)
    
    # Filter by price range
    response = await client.get("/api/v1/properties/?min_price=800&max_price=1000")
    assert response.status_code == 200
    data = response.json()
    assert all(800 <= p["price"] <= 1000 for p in data)


@pytest.mark.asyncio
async def test_get_property_by_id(client: AsyncClient):
    """Test getting a single property."""
    token = await create_landlord_with_token(client, "landlord_get@test.com")
    
    property_data = {
        "title": "Test Property",
        "description": "For testing",
        "price": 750.0,
        "surface": 30.0,
        "city": "Paris",
        "address": "Test Street",
        "postal_code": "75001",
        "room_type": "studio",
        "available_from": "2026-03-01"
    }
    
    create_response = await client.post(
        "/api/v1/properties/",
        json=property_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    property_id = create_response.json()["id"]
    
    response = await client.get(f"/api/v1/properties/{property_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == property_id
    assert data["title"] == "Test Property"


@pytest.mark.asyncio
async def test_update_property(client: AsyncClient):
    """Test updating a property."""
    token = await create_landlord_with_token(client, "landlord_update@test.com")
    
    property_data = {
        "title": "Original Title",
        "description": "Original",
        "price": 800.0,
        "surface": 25.0,
        "city": "Paris",
        "address": "Street",
        "postal_code": "75001",
        "room_type": "studio",
        "available_from": "2026-03-01"
    }
    
    create_response = await client.post(
        "/api/v1/properties/",
        json=property_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    property_id = create_response.json()["id"]
    
    update_data = {
        "title": "Updated Title",
        "price": 850.0,
        "is_active": False
    }
    
    response = await client.patch(
        f"/api/v1/properties/{property_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["price"] == 850.0
    assert data["is_active"] is False
    assert data["city"] == "Paris"  # Unchanged


@pytest.mark.asyncio
async def test_delete_property(client: AsyncClient):
    """Test deleting a property."""
    token = await create_landlord_with_token(client, "landlord_delete@test.com")
    
    property_data = {
        "title": "To Delete",
        "description": "Will be deleted",
        "price": 700.0,
        "surface": 20.0,
        "city": "Paris",
        "address": "Street",
        "postal_code": "75001",
        "room_type": "studio",
        "available_from": "2026-03-01"
    }
    
    create_response = await client.post(
        "/api/v1/properties/",
        json=property_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    property_id = create_response.json()["id"]
    
    response = await client.delete(
        f"/api/v1/properties/{property_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    
    # Verify it's deleted
    response = await client.get(f"/api/v1/properties/{property_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_my_properties(client: AsyncClient):
    """Test landlord listing their own properties."""
    token = await create_landlord_with_token(client, "landlord_my@test.com")
    
    # Create properties
    for i in range(3):
        property_data = {
            "title": f"My Property {i}",
            "description": "Mine",
            "price": 800.0,
            "surface": 25.0,
            "city": "Paris",
            "address": f"{i} Street",
            "postal_code": "75001",
            "room_type": "studio",
            "available_from": "2026-03-01"
        }
        await client.post(
            "/api/v1/properties/",
            json=property_data,
            headers={"Authorization": f"Bearer {token}"}
        )
    
    response = await client.get(
        "/api/v1/properties/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert all("My Property" in p["title"] for p in data)


@pytest.mark.asyncio
async def test_unauthorized_update(client: AsyncClient):
    """Test that landlords cannot update other's properties."""
    token1 = await create_landlord_with_token(client, "landlord1@test.com")
    token2 = await create_landlord_with_token(client, "landlord2@test.com")
    
    property_data = {
        "title": "Landlord 1 Property",
        "description": "Owned by landlord 1",
        "price": 800.0,
        "surface": 25.0,
        "city": "Paris",
        "address": "Street",
        "postal_code": "75001",
        "room_type": "studio",
        "available_from": "2026-03-01"
    }
    
    create_response = await client.post(
        "/api/v1/properties/",
        json=property_data,
        headers={"Authorization": f"Bearer {token1}"}
    )
    property_id = create_response.json()["id"]
    
    # Try to update with token2
    update_data = {"title": "Hacked"}
    response = await client.patch(
        f"/api/v1/properties/{property_id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert response.status_code == 403
