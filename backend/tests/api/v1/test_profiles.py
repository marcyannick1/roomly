import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_student_profile(client: AsyncClient):
    """Test student registration and profile creation."""
    # Register student
    register_data = {
        "email": "student@test.com",
        "password": "password123",
        "role": "student"
    }
    response = await client.post("/api/v1/auth/register", json=register_data)
    assert response.status_code == 201
    
    # Login
    login_data = {
        "username": "student@test.com",
        "password": "password123"
    }
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Create profile
    profile_data = {
        "first_name": "John",
        "last_name": "Doe",
        "birth_date": "2000-01-01",
        "bio": "Looking for a nice place",
        "city": "Paris",
        "room_type": "studio",
        "budget_min": 500,
        "budget_max": 1000,
        "guarantor_income": 30000.0,
        "furnished": True,
        "smoker": False,
        "pets": False,
        "passions": ["music", "sports"],
        "university": "Sorbonne",
        "study_level": "Master"
    }
    
    response = await client.post(
        "/api/v1/profiles/student",
        json=profile_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "John"
    assert data["city"] == "Paris"
    assert data["budget_max"] == 1000


@pytest.mark.asyncio
async def test_update_student_profile(client: AsyncClient):
    """Test updating student profile."""
    # Register and create profile
    register_data = {
        "email": "student2@test.com",
        "password": "password123",
        "role": "student"
    }
    await client.post("/api/v1/auth/register", json=register_data)
    
    login_data = {"username": "student2@test.com", "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    profile_data = {
        "first_name": "Jane",
        "last_name": "Smith",
        "birth_date": "1999-05-15",
        "city": "Lyon"
    }
    await client.post(
        "/api/v1/profiles/student",
        json=profile_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Update profile
    update_data = {
        "bio": "Updated bio",
        "budget_max": 1200
    }
    response = await client.patch(
        "/api/v1/profiles/student",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["bio"] == "Updated bio"
    assert data["budget_max"] == 1200
    assert data["first_name"] == "Jane"  # Unchanged


@pytest.mark.asyncio
async def test_create_landlord_profile(client: AsyncClient):
    """Test landlord registration and profile creation."""
    register_data = {
        "email": "landlord@test.com",
        "password": "password123",
        "role": "landlord"
    }
    response = await client.post("/api/v1/auth/register", json=register_data)
    assert response.status_code == 201
    
    login_data = {"username": "landlord@test.com", "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    profile_data = {
        "company_name": "Best Properties Ltd",
        "phone_number": "+33123456789",
        "bio": "Professional landlord"
    }
    
    response = await client.post(
        "/api/v1/profiles/landlord",
        json=profile_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == "Best Properties Ltd"
    assert data["phone_number"] == "+33123456789"


@pytest.mark.asyncio
async def test_update_landlord_profile(client: AsyncClient):
    """Test updating landlord profile."""
    register_data = {
        "email": "landlord2@test.com",
        "password": "password123",
        "role": "landlord"
    }
    await client.post("/api/v1/auth/register", json=register_data)
    
    login_data = {"username": "landlord2@test.com", "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    profile_data = {"company_name": "Old Name"}
    await client.post(
        "/api/v1/profiles/landlord",
        json=profile_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    update_data = {"company_name": "New Name", "bio": "Updated"}
    response = await client.patch(
        "/api/v1/profiles/landlord",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == "New Name"
    assert data["bio"] == "Updated"


@pytest.mark.asyncio
async def test_student_cannot_create_landlord_profile(client: AsyncClient):
    """Test role enforcement."""
    register_data = {
        "email": "student3@test.com",
        "password": "password123",
        "role": "student"
    }
    await client.post("/api/v1/auth/register", json=register_data)
    
    login_data = {"username": "student3@test.com", "password": "password123"}
    response = await client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    profile_data = {"company_name": "Fake Company"}
    response = await client.post(
        "/api/v1/profiles/landlord",
        json=profile_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
