import pytest
from httpx import AsyncClient
import uuid


async def create_match(client: AsyncClient):
    """Helper to create a match and return tokens and match_id."""
    # Use unique emails to avoid conflicts between tests
    unique_id = str(uuid.uuid4())[:8]
    landlord_email = f"landlord_msg_{unique_id}@test.com"
    student_email = f"student_msg_{unique_id}@test.com"
    
    # Create landlord
    register_data = {"email": landlord_email, "password": "password123", "role": "landlord"}
    await client.post("/api/v1/auth/register", json=register_data)
    login_data = {"username": landlord_email, "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    landlord_token = response.json()["access_token"]
    
    # Create landlord profile
    profile_data = {"company_name": "Test Company"}
    await client.post(
        "/api/v1/profiles/landlord",
        json=profile_data,
        headers={"Authorization": f"Bearer {landlord_token}"}
    )
    
    # Create student
    register_data = {"email": student_email, "password": "password123", "role": "student"}
    await client.post("/api/v1/auth/register", json=register_data)
    login_data = {"username": student_email, "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    student_token = response.json()["access_token"]
    
    # Create student profile
    profile_data = {
        "first_name": "Test",
        "last_name": "Student",
        "birth_date": "2000-01-01"
    }
    await client.post(
        "/api/v1/profiles/student",
        json=profile_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    # Create property
    property_data = {
        "title": "Test Property",
        "description": "For messaging",
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
        headers={"Authorization": f"Bearer {landlord_token}"}
    )
    property_id = response.json()["id"]
    
    # Student swipes
    swipe_data = {"property_id": property_id, "is_liked": True}
    response = await client.post(
        "/api/v1/interactions/swipe",
        json=swipe_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    swipe_id = response.json()["id"]
    
    # Landlord accepts
    response = await client.post(
        f"/api/v1/interactions/landlord/accept-swipe/{swipe_id}",
        headers={"Authorization": f"Bearer {landlord_token}"}
    )
    match_id = response.json()["id"]
    
    return landlord_token, student_token, match_id


@pytest.mark.asyncio
async def test_send_message(client: AsyncClient):
    """Test sending a message in a match."""
    landlord_token, student_token, match_id = await create_match(client)
    
    message_data = {
        "match_id": match_id,
        "content": "Hello, is the apartment still available?"
    }
    
    response = await client.post(
        "/api/v1/messages/",
        json=message_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["content"] == "Hello, is the apartment still available?"
    assert data["match_id"] == match_id
    assert "id" in data


@pytest.mark.asyncio
async def test_get_messages(client: AsyncClient):
    """Test retrieving chat history."""
    landlord_token, student_token, match_id = await create_match(client)
    
    # Send multiple messages
    messages = [
        "Hello!",
        "Is this still available?",
        "What's the move-in date?"
    ]
    
    for content in messages:
        message_data = {"match_id": match_id, "content": content}
        await client.post(
            "/api/v1/messages/",
            json=message_data,
            headers={"Authorization": f"Bearer {student_token}"}
        )
    
    # Get messages
    response = await client.get(
        f"/api/v1/messages/{match_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["content"] in messages


@pytest.mark.asyncio
async def test_message_updates_match_metadata(client: AsyncClient):
    """Test that sending a message updates match last_message_content."""
    landlord_token, student_token, match_id = await create_match(client)
    
    message_data = {
        "match_id": match_id,
        "content": "This is a test message"
    }
    
    await client.post(
        "/api/v1/messages/",
        json=message_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    # Check match metadata
    response = await client.get(
        "/api/v1/interactions/matches",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    data = response.json()
    assert len(data) == 1
    assert data[0]["last_message_content"] == "This is a test message"
    assert data[0]["unread_count_landlord"] == 1
    assert data[0]["unread_count_student"] == 0


@pytest.mark.asyncio
async def test_long_message_truncated(client: AsyncClient):
    """Test that long messages are truncated in match preview."""
    landlord_token, student_token, match_id = await create_match(client)
    
    long_content = "A" * 300  # 300 characters
    message_data = {
        "match_id": match_id,
        "content": long_content
    }
    
    await client.post(
        "/api/v1/messages/",
        json=message_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    
    # Check match
    response = await client.get(
        "/api/v1/interactions/matches",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    data = response.json()
    assert len(data[0]["last_message_content"]) == 255


@pytest.mark.asyncio
async def test_cannot_message_non_participant(client: AsyncClient):
    """Test that non-participants cannot send messages."""
    landlord_token, student_token, match_id = await create_match(client)
    
    # Create another student
    register_data = {"email": "other_student@test.com", "password": "password123", "role": "student"}
    await client.post("/api/v1/auth/register", json=register_data)
    login_data = {"username": "other_student@test.com", "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    other_token = response.json()["access_token"]
    
    message_data = {
        "match_id": match_id,
        "content": "Trying to hack in"
    }
    
    response = await client.post(
        "/api/v1/messages/",
        json=message_data,
        headers={"Authorization": f"Bearer {other_token}"}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_both_parties_can_message(client: AsyncClient):
    """Test that both student and landlord can send messages."""
    landlord_token, student_token, match_id = await create_match(client)
    
    # Student sends
    message_data = {"match_id": match_id, "content": "Hello from student"}
    response = await client.post(
        "/api/v1/messages/",
        json=message_data,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    
    # Landlord sends
    message_data = {"match_id": match_id, "content": "Hello from landlord"}
    response = await client.post(
        "/api/v1/messages/",
        json=message_data,
        headers={"Authorization": f"Bearer {landlord_token}"}
    )
    assert response.status_code == 200
    
    # Check both messages exist
    response = await client.get(
        f"/api/v1/messages/{match_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    data = response.json()
    assert len(data) == 2
