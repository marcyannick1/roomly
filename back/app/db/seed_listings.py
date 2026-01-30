import random
import sys
from datetime import date, timedelta
from pathlib import Path

from faker import Faker
from sqlalchemy.orm import Session

# Add project root to path
project_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Import all models first so SQLAlchemy can resolve relationships
from app.models.user import User
from app.models.student import Student
from app.models.landlord import Landlord
from app.models.listing import Listing
from app.models.listing_photo import ListingPhoto

# Create synchronous engine for seeding
DATABASE_URL = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)

fake = Faker("fr_FR")

ROOM_TYPES = ["studio", "chambre", "t2", "t3", "colocation"]
CITIES = [
    ("Paris", "750"),
    ("Lyon", "690"),
    ("Marseille", "130"),
    ("Toulouse", "310"),
    ("Bordeaux", "330"),
    ("Lille", "590"),
    ("Nantes", "440"),
]

PHOTO_URLS = [
    "https://picsum.photos/800/600",
    "https://picsum.photos/801/600",
    "https://picsum.photos/802/600",
    "https://picsum.photos/803/600",
]


def create_listing(owner_id: int) -> Listing:
    city, postal_prefix = random.choice(CITIES)
    surface = random.randint(9, 80)

    listing = Listing(
        title=f"{random.choice(['Joli', 'Charmant', 'Cosy', 'Spacieux'])} "
              f"{random.choice(['studio', 'appartement', 'logement'])} à {city}",
        description=fake.paragraph(nb_sentences=4),
        price=random.randint(350, 1200),
        surface=surface,
        charges_included=random.choice([True, False]),
        deposit=random.randint(300, 1200),

        city=city,
        address=fake.street_address(),
        postal_code=f"{postal_prefix}{random.randint(0, 9)}{random.randint(0, 9)}",
        latitude=float(fake.latitude()),
        longitude=float(fake.longitude()),

        room_type=random.choice(ROOM_TYPES),
        furnished=random.choice([True, False]),
        floor=random.randint(0, 7),
        total_floors=random.randint(1, 8),

        available_from=date.today() + timedelta(days=random.randint(0, 60)),
        min_duration_months=random.choice([1, 3, 6, 9, 12]),

        wifi=random.choice([True, False]),
        washing_machine=random.choice([True, False]),
        kitchen=True,
        parking=random.choice([True, False]),
        elevator=random.choice([True, False]),

        owner_id=owner_id,
    )

    # Photos
    for _ in range(random.randint(2, 5)):
        listing.photos.append(
            ListingPhoto(
                url=random.choice(PHOTO_URLS)
            )
        )

    return listing


def seed_listings(nb_listings: int = 200):
    db: Session = SessionLocal()

    owners = db.query(User).all()
    if not owners:
        raise Exception("Aucun user trouvé. Seed les users d'abord.")

    listings = []
    for _ in range(nb_listings):
        owner = random.choice(owners)
        listings.append(create_listing(owner.id))

    db.add_all(listings)
    db.commit()
    db.close()

    print(f"✅ {nb_listings} listings créés avec succès")


if __name__ == "__main__":
    seed_listings(300)
