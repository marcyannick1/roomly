import asyncio
import uuid
import random
from typing import List, Dict
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, delete

from app.models.user import User
from app.models.profile import StudentProfile, LandlordProfile
from app.models.property import Property, Amenity, PropertyImage, PropertyAmenity
from app.core.security import auth_backend
from app.api.deps import get_async_session, fastapi_users_obj

# Hardcoded amenities for seed
AMENITIES_DATA = [
    {"name": "WiFi", "category": "General", "icon": "wifi"},
    {"name": "Washing Machine", "category": "Appliances", "icon": "local_laundry_service"},
    {"name": "Elevator", "category": "Access", "icon": "elevator"},
    {"name": "Parking", "category": "Access", "icon": "local_parking"},
    {"name": "Balcony", "category": "General", "icon": "balcony"},
    {"name": "Air Conditioning", "category": "General", "icon": "ac_unit"},
]

async def create_users(session: AsyncSession) -> Dict[str, User]:
    users = {}
    
    # helper to create user
    async def create_user(email, password, role="student"):
        # We can use fastapi_users manager or direct DB insert. 
        # Direct DB is faster for seed but we need to hash password.
        # Actually using manager ensures everything is correct.
        # But we need the UserManager instance.
        # Let's simple insert with known hashed password for simplicity or use the manager if possible.
        # For seed script, let's use the explicit manager usage pattern or just direct SQLModel but we need hash.
        # Let's use the UserManager from deps if we can instantiate it easily or just mock the hash.
        from app.core.security import get_jwt_strategy # Not useful for hashing.
        from fastapi_users.password import PasswordHelper
        
        password_helper = PasswordHelper()
        hashed = password_helper.hash(password)
        
        user = User(
            email=email,
            hashed_password=hashed,
            is_active=True,
            is_verified=True,
            is_superuser=False,
            role=role,
            is_onboarded=True
        )
        session.add(user)
        # We need commit to get ID
        await session.commit()
        await session.refresh(user)
        return user

    # Create Students
    users["student1"] = await create_user("student1@example.com", "password", "student")
    users["student2"] = await create_user("student2@example.com", "password", "student")
    
    # Create Landlords
    users["landlord1"] = await create_user("landlord1@example.com", "password", "landlord")
    users["landlord2"] = await create_user("landlord2@example.com", "password", "landlord")
    
    return users

async def create_profiles(session: AsyncSession, users: Dict[str, User]):
    # Student 1
    sp1 = StudentProfile(
        user_id=users["student1"].id,
        first_name="Alice",
        last_name="Doe",
        birth_date=date(2002, 5, 15),
        bio="Quiet bio student, loves reading.",
        city="Paris",
        budget_min=400,
        budget_max=800,
        university="Sorbonne"
    )
    session.add(sp1)
    
    # Student 2
    sp2 = StudentProfile(
        user_id=users["student2"].id,
        first_name="Bob",
        last_name="Smith",
        birth_date=date(2001, 8, 20),
        bio="Party animal but respectful.",
        city="Lyon",
        budget_min=300,
        budget_max=600,
        university="Lyon 2"
    )
    session.add(sp2)
    
    # Landlord 1
    lp1 = LandlordProfile(
        user_id=users["landlord1"].id,
        company_name="Paris Rentals",
        phone_number="+33612345678",
        bio="Professional agency."
    )
    session.add(lp1)

    # Landlord 2
    lp2 = LandlordProfile(
        user_id=users["landlord2"].id,
        company_name=None, # private individual
        phone_number="+33698765432",
        bio="I rent my spare studio."
    )
    session.add(lp2)
    
    await session.commit()

async def create_amenities(session: AsyncSession) -> List[Amenity]:
    amenities = []
    for data in AMENITIES_DATA:
        # Check existence
        existing = (await session.execute(select(Amenity).where(Amenity.name == data["name"]))).scalar_one_or_none()
        if existing:
            amenities.append(existing)
        else:
            amenity = Amenity(**data)
            session.add(amenity)
            amenities.append(amenity)
    await session.commit()
    # refresh all
    for a in amenities:
        await session.refresh(a)
    return amenities

async def create_properties(session: AsyncSession, users: Dict[str, User], amenities: List[Amenity]):
    # Prop 1 by Landlord 1
    p1 = Property(
        landlord_id=users["landlord1"].id,
        title="Cozy Studio in Latin Quarter",
        description="Perfect for students, near university.",
        price=750,
        surface=18,
        city="Paris",
        address="10 Rue des Ecoles",
        postal_code="75005",
        room_type="studio",
        furnished=True,
        available_from=date.today(),
        is_active=True
    )
    session.add(p1)
    await session.commit() 
    await session.refresh(p1)
    
    # Add Amenities to Prop 1
    for a in amenities[:3]: # first 3
        session.add(PropertyAmenity(property_id=p1.id, amenity_id=a.id))
        
    # Add Images to Prop 1
    session.add(PropertyImage(property_id=p1.id, image_url="https://fakeimg.pl/600x400/?text=Studio+1", position=0))
    session.add(PropertyImage(property_id=p1.id, image_url="https://fakeimg.pl/600x400/?text=Studio+2", position=1))

    # Prop 2 by Landlord 2
    p2 = Property(
        landlord_id=users["landlord2"].id,
        title="Shared Flat Room",
        description="Nice room in a 3-bedroom flat.",
        price=450,
        surface=12,
        city="Lyon",
        address="Place Bellecour",
        postal_code="69002",
        room_type="private_room",
        furnished=True,
        available_from=date.today() + timedelta(days=10),
        is_active=True
    )
    session.add(p2)
    await session.commit()
    await session.refresh(p2)
    
    for a in amenities[2:]: # last ones
        session.add(PropertyAmenity(property_id=p2.id, amenity_id=a.id))
        
    session.add(PropertyImage(property_id=p2.id, image_url="https://fakeimg.pl/600x400/?text=Room+1", position=0))
    
    await session.commit()

async def seed_db():
    from app.core.db import async_session_maker
    async with async_session_maker() as session:
        # Clear existing data? Or just append?
        # For safety in this script we won't drop everything blindly unless requested.
        # But for 'seed', cleaning up might be good.
        # Let's assume empty DB for simplicity or check one table.
        
        print("🌱 Seeding Users...")
        users = await create_users(session)
        
        print("🌱 Seeding Profiles...")
        await create_profiles(session, users)
        
        print("🌱 Seeding Amenities...")
        amenities = await create_amenities(session)
        
        print("🌱 Seeding Properties...")
        await create_properties(session, users, amenities)
        
        print("✅ Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_db())
