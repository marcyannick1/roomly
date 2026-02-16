import pytest
from httpx import AsyncClient


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


async def create_property(client: AsyncClient, token: str, title: str = "Test Property"):
    """Helper to create a property."""
    property_data = {
        "title": title,
        "description": "Test description",
        "price": 800.0,
        "surface": 25.0,
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
    return response.json()["id"]


@pytest.mark.asyncio
async def test_swipe_like(client: AsyncClient):
    """Test student liking a property."""
    landlord_token = await create_landlord_with_token(client, "landlord_swipe@test.com")
    student_token = await create_student_with_token(client, "student_swipe@test.com")
    
    property_id = await create_property(client, landlord_token)
    
    swipe_data = {
        "property_id": property_id,
        "is_liked": True
    }
    
    response = await client.post(
        "/api/v1/interactions/swipe",
        json=swipe_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_liked"] is True
    assert data["property_id"] == property_id


@pytest.mark.asyncio
async def test_swipe_dislike(client: AsyncClient):
    """Test student disliking a property."""
    landlord_token = await create_landlord_with_token(client, "landlord_dislike@test.com")
    student_token = await create_student_with_token(client, "student_dislike@test.com")
    
    property_id = await create_property(client, landlord_token)
    
    swipe_data = {
        "property_id": property_id,
        "is_liked": False
    }
    
    response = await client.post(
        "/api/v1/interactions/swipe",
        json=swipe_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_liked"] is False


@pytest.mark.asyncio
async def test_get_my_likes(client: AsyncClient):
    """Test getting student's liked properties."""
    landlord_token = await create_landlord_with_token(client, "landlord_likes@test.com")
    student_token = await create_student_with_token(client, "student_likes@test.com")
    
    # Create and like multiple properties
    for i in range(3):
        property_id = await create_property(client, landlord_token, f"Property {i}")
        swipe_data = {"property_id": property_id, "is_liked": True}
        await client.post(
            "/api/v1/interactions/swipe",
            json=swipe_data,
            headers={"Authorization": f"Bearer {student_token}"}
        )
    
    response = await client.get(
        "/api/v1/interactions/my-likes",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert all(swipe["is_liked"] for swipe in data)


@pytest.mark.asyncio
async def test_remove_like(client: AsyncClient):
    """Test student removing a like."""
    landlord_token = await create_landlord_with_token(client, "landlord_remove@test.com")
    student_token = await create_student_with_token(client, "student_remove@test.com")
    
    property_id = await create_property(client, landlord_token)
    
    # Like property
    swipe_data = {"property_id": property_id, "is_liked": True}
    await client.post(
        "/api/v1/interactions/swipe",
        json=swipe_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    # Remove like
    response = await client.delete(
        f"/api/v1/interactions/swipe/{property_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    
    # Verify it's removed
    response = await client.get(
        "/api/v1/interactions/my-likes",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    data = response.json()
    assert len(data) == 0


@pytest.mark.asyncio
async def test_landlord_received_likes(client: AsyncClient):
    """Test landlord viewing received likes."""
    landlord_token = await create_landlord_with_token(client, "landlord_received@test.com")
    student1_token = await create_student_with_token(client, "student1_received@test.com")
    student2_token = await create_student_with_token(client, "student2_received@test.com")
    
    property_id = await create_property(client, landlord_token)
    
    # Two students like the property
    for token in [student1_token, student2_token]:
        swipe_data = {"property_id": property_id, "is_liked": True}
        await client.post(
            "/api/v1/interactions/swipe",
            json=swipe_data,
            headers={"Authorization": f"Bearer {token}"}
        )
    
    response = await client.get(
        "/api/v1/interactions/landlord/received-likes",
        headers={"Authorization": f"Bearer {landlord_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.asyncio
async def test_accept_swipe_creates_match(client: AsyncClient):
    """Test landlord accepting a swipe creates a match."""
    landlord_token = await create_landlord_with_token(client, "landlord_accept@test.com")
    student_token = await create_student_with_token(client, "student_accept@test.com")
    
    property_id = await create_property(client, landlord_token)
    
    # Student likes
    swipe_data = {"property_id": property_id, "is_liked": True}
    swipe_response = await client.post(
        "/api/v1/interactions/swipe",
        json=swipe_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    swipe_id = swipe_response.json()["id"]
    
    # Landlord accepts
    response = await client.post(
        f"/api/v1/interactions/landlord/accept-swipe/{swipe_id}",
        headers={"Authorization": f"Bearer {landlord_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "accepted"
    assert "id" in data


@pytest.mark.asyncio
async def test_reject_swipe(client: AsyncClient):
    """Test landlord rejecting a swipe."""
    landlord_token = await create_landlord_with_token(client, "landlord_reject@test.com")
    student_token = await create_student_with_token(client, "student_reject@test.com")
    
    property_id = await create_property(client, landlord_token)
    
    # Student likes
    swipe_data = {"property_id": property_id, "is_liked": True}
    swipe_response = await client.post(
        "/api/v1/interactions/swipe",
        json=swipe_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    swipe_id = swipe_response.json()["id"]
    
    # Landlord rejects
    response = await client.post(
        f"/api/v1/interactions/landlord/reject-swipe/{swipe_id}",
        headers={"Authorization": f"Bearer {landlord_token}"}
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_matches(client: AsyncClient):
    """Test getting user matches."""
    landlord_token = await create_landlord_with_token(client, "landlord_matches@test.com")
    student_token = await create_student_with_token(client, "student_matches@test.com")
    
    property_id = await create_property(client, landlord_token)
    
    # Create match
    swipe_data = {"property_id": property_id, "is_liked": True}
    swipe_response = await client.post(
        "/api/v1/interactions/swipe",
        json=swipe_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    swipe_id = swipe_response.json()["id"]
    
    await client.post(
        f"/api/v1/interactions/landlord/accept-swipe/{swipe_id}",
        headers={"Authorization": f"Bearer {landlord_token}"}
    )
    
    # Student checks matches
    response = await client.get(
        "/api/v1/interactions/matches",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "accepted"
    
    # Landlord checks matches
    response = await client.get(
        "/api/v1/interactions/matches",
        headers={"Authorization": f"Bearer {landlord_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


@pytest.mark.asyncio
async def test_cannot_swipe_twice(client: AsyncClient):
    """Test that students cannot swipe the same property twice."""
    landlord_token = await create_landlord_with_token(client, "landlord_twice@test.com")
    student_token = await create_student_with_token(client, "student_twice@test.com")
    
    property_id = await create_property(client, landlord_token)
    
    swipe_data = {"property_id": property_id, "is_liked": True}
    
    # First swipe
    response = await client.post(
        "/api/v1/interactions/swipe",
        json=swipe_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    
    # Second swipe
    response = await client.post(
        "/api/v1/interactions/swipe",
        json=swipe_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 400
