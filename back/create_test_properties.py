import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.listing import Listing
from app.models.user import User
from datetime import date, timedelta

async def create_test_properties():
    async with AsyncSessionLocal() as db:
        # Trouver l'utilisateur bailleur (bailleur@gmail.fr)
        result = await db.execute(
            select(User).where(User.email == "bailleur@gmail.fr")
        )
        landlord = result.scalar_one_or_none()
        
        if not landlord:
            print("❌ Bailleur non trouvé. Email: bailleur@gmail.fr")
            return
        
        print(f"✅ Bailleur trouvé: {landlord.name} (ID: {landlord.id})")
        
        # 3 annonces de test
        test_properties = [
            {
                "title": "Studio lumineux Montmartre",
                "description": "Charmant studio de 25m² au coeur de Montmartre, proche métro.",
                "price": 850.0,
                "surface": 25.0,
                "city": "Paris",
                "address": "15 Rue Lepic",
                "postal_code": "75018",
                "latitude": 48.8867,
                "longitude": 2.3356,
                "room_type": "studio",
                "furnished": True,
                "charges_included": True,
                "deposit": 850.0,
                "available_from": date.today() + timedelta(days=15),
                "wifi": True,
                "kitchen": True,
                "washing_machine": False,
            },
            {
                "title": "T2 moderne Bastille",
                "description": "Appartement 2 pièces rénové, 45m², balcon, proche commerces.",
                "price": 1250.0,
                "surface": 45.0,
                "city": "Paris",
                "address": "28 Boulevard Richard-Lenoir",
                "postal_code": "75011",
                "latitude": 48.8606,
                "longitude": 2.3727,
                "room_type": "apartment",
                "furnished": True,
                "charges_included": False,
                "deposit": 1250.0,
                "floor": 3,
                "total_floors": 5,
                "available_from": date.today() + timedelta(days=30),
                "wifi": True,
                "kitchen": True,
                "washing_machine": True,
                "balcony": True,
                "elevator": False,
            },
            {
                "title": "Chambre en colocation Marais",
                "description": "Grande chambre 15m² dans coloc de 4, ambiance sympa !",
                "price": 650.0,
                "surface": 15.0,
                "city": "Paris",
                "address": "42 Rue des Archives",
                "postal_code": "75003",
                "latitude": 48.8619,
                "longitude": 2.3588,
                "room_type": "colocation",
                "furnished": True,
                "charges_included": True,
                "deposit": 650.0,
                "floor": 2,
                "total_floors": 4,
                "available_from": date.today() + timedelta(days=7),
                "wifi": True,
                "kitchen": True,
                "washing_machine": True,
                "workspace": True,
            }
        ]
        
        created_count = 0
        for prop_data in test_properties:
            property_obj = Listing(
                owner_id=landlord.id,
                **prop_data
            )
            db.add(property_obj)
            created_count += 1
            print(f"✅ Annonce créée: {prop_data['title']}")
        
        await db.commit()
        print(f"\n🎉 {created_count} annonces créées avec succès!")

if __name__ == "__main__":
    asyncio.run(create_test_properties())
