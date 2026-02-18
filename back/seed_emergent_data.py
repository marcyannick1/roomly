#!/usr/bin/env python3
"""Script pour créer les annonces Emergent dans la base PostgreSQL"""
import asyncio
import sys
from datetime import date, timedelta
from pathlib import Path

project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

import os
from dotenv import load_dotenv
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

load_dotenv()

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.landlord import Landlord
from app.models.listing import Listing
from app.models.listing_photo import ListingPhoto
from app.core.security import hash_password


async def create_landlords(db: AsyncSession):
    """Créer les bailleurs Emergent"""
    print("👤 Création des bailleurs...")
    
    landlords_data = [
        {
            "email": "pierre.dupont@immo.fr",
            "password": "password123",
            "name": "Pierre Dupont",
            "telephone": "06 12 34 56 78",
            "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            "company_name": "Dupont Immobilier",
            "is_agency": True,
            "bio": "Agence immobilière spécialisée dans le logement étudiant à Paris"
        },
        {
            "email": "marie.martin@gmail.com",
            "password": "password123",
            "name": "Marie Martin",
            "telephone": "06 98 76 54 32",
            "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            "company_name": None,
            "is_agency": False,
            "bio": "Propriétaire de plusieurs studios à Paris"
        }
    ]
    
    created_landlords = []
    
    for data in landlords_data:
        # Vérifier si l'utilisateur existe déjà
        result = await db.execute(select(User).where(User.email == data["email"]))
        existing_user = result.scalars().first()
        
        if existing_user:
            print(f"  ⏭️  Utilisateur {data['email']} existe déjà")
            result = await db.execute(select(Landlord).where(Landlord.user_id == existing_user.id))
            landlord = result.scalars().first()
            if landlord:
                created_landlords.append(landlord)
            continue
        
        # Créer l'utilisateur
        user = User(
            email=data["email"],
            name=data["name"],
            hashed_password=hash_password(data["password"]),
            is_landlord=True,
            telephone=data["telephone"],
            photo=data["photo"]
        )
        db.add(user)
        await db.flush()
        
        # Créer le profil bailleur
        landlord = Landlord(
            user_id=user.id,
            company_name=data["company_name"]
        )
        db.add(landlord)
        await db.flush()
        
        created_landlords.append(landlord)
        print(f"  ✅ Créé: {data['email']}")
    
    await db.commit()
    print(f"✅ {len(created_landlords)} bailleurs créés/trouvés\n")
    return created_landlords


async def create_emergent_listings(db: AsyncSession, landlords: list):
    """Créer les 8 annonces Emergent"""
    print("🏠 Création des annonces Emergent...")
    
    if len(landlords) < 2:
        print("❌ Besoin de 2 bailleurs minimum")
        return
    
    # Récupérer les IDs des propriétaires (users)
    result = await db.execute(select(User).where(User.id == landlords[0].user_id))
    owner1 = result.scalars().first()
    result = await db.execute(select(User).where(User.id == landlords[1].user_id))
    owner2 = result.scalars().first()
    
    listings_data = [
        {
            "title": "Studio lumineux Quartier Latin",
            "description": "Charmant studio de 25m² au cœur du Quartier Latin. Parfait pour étudiant. Proche métro et commerces. Entièrement rénové avec cuisine équipée.",
            "price": 750.00,
            "surface": 25.0,
            "charges_included": True,
            "deposit": 750.00,
            "city": "Paris 5e",
            "address": "15 Rue de la Harpe",
            "postal_code": "75005",
            "latitude": 48.8520,
            "longitude": 2.3458,
            "room_type": "studio",
            "furnished": True,
            "floor": 2,
            "total_floors": 5,
            "available_from": date.today() + timedelta(days=30),
            "min_duration_months": 9,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": True,
            "pets": False,
            "tv": False,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": False,
            "owner_id": owner1.id,
            "photos": [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
            ]
        },
        {
            "title": "T2 moderne République",
            "description": "Bel appartement 2 pièces de 35m² refait à neuf. Idéal pour couple d'étudiants. Balcon, calme, proche transports.",
            "price": 1100.00,
            "surface": 35.0,
            "charges_included": True,
            "deposit": 1100.00,
            "city": "Paris 11e",
            "address": "42 Boulevard Voltaire",
            "postal_code": "75011",
            "latitude": 48.8639,
            "longitude": 2.3677,
            "room_type": "t2",
            "furnished": True,
            "floor": 4,
            "total_floors": 6,
            "available_from": date.today() + timedelta(days=15),
            "min_duration_months": 12,
            "wifi": True,
            "washing_machine": False,
            "kitchen": True,
            "parking": True,
            "elevator": True,
            "workspace": True,
            "pets": False,
            "tv": True,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": True,
            "owner_id": owner1.id,
            "photos": [
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
                "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
            ]
        },
        {
            "title": "Chambre en colocation - Bastille",
            "description": "Grande chambre de 14m² dans colocation de 3. Appartement spacieux avec parties communes. Ambiance conviviale, colocataires sympas.",
            "price": 650.00,
            "surface": 14.0,
            "charges_included": True,
            "deposit": 650.00,
            "city": "Paris 11e",
            "address": "8 Rue de Lappe",
            "postal_code": "75011",
            "latitude": 48.8534,
            "longitude": 2.3702,
            "room_type": "colocation",
            "furnished": True,
            "floor": 2,
            "total_floors": 4,
            "available_from": date.today() + timedelta(days=30),
            "min_duration_months": 6,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": True,
            "pets": False,
            "tv": True,
            "dryer": True,
            "ac": False,
            "garden": False,
            "balcony": False,
            "owner_id": owner2.id,
            "photos": [
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
                "https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800"
            ]
        },
        {
            "title": "Studio cosy Montmartre",
            "description": "Petit studio plein de charme sur les hauteurs de Montmartre. Vue dégagée, quartier vivant et artistique. Idéal pour étudiant en art!",
            "price": 800.00,
            "surface": 22.0,
            "charges_included": True,
            "deposit": 800.00,
            "city": "Paris 18e",
            "address": "23 Rue Lepic",
            "postal_code": "75018",
            "latitude": 48.8847,
            "longitude": 2.3345,
            "room_type": "studio",
            "furnished": True,
            "floor": 5,
            "total_floors": 6,
            "available_from": date.today() + timedelta(days=10),
            "min_duration_months": 9,
            "wifi": True,
            "washing_machine": False,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": True,
            "pets": False,
            "tv": False,
            "dryer": False,
            "ac": False,
            "garden": False,
            "balcony": False,
            "owner_id": owner2.id,
            "photos": [
                "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800",
                "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"
            ]
        },
        {
            "title": "T3 familial Belleville",
            "description": "Grand 3 pièces de 65m² idéal pour colocation. 2 chambres, salon spacieux, cuisine séparée. Quartier branché et multiculturel.",
            "price": 1400.00,
            "surface": 65.0,
            "charges_included": True,
            "deposit": 1400.00,
            "city": "Paris 20e",
            "address": "56 Rue de Belleville",
            "postal_code": "75020",
            "latitude": 48.8714,
            "longitude": 2.3847,
            "room_type": "t3",
            "furnished": False,
            "floor": 3,
            "total_floors": 5,
            "available_from": date.today() + timedelta(days=60),
            "min_duration_months": 12,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": False,
            "workspace": True,
            "pets": True,
            "tv": False,
            "dryer": False,
            "ac": False,
            "garden": True,
            "balcony": False,
            "owner_id": owner1.id,
            "photos": [
                "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"
            ]
        },
        {
            "title": "Studio neuf La Défense",
            "description": "Studio moderne de 28m² dans résidence récente. Parfait pour étudiant en école de commerce. Proche universités et transports.",
            "price": 850.00,
            "surface": 28.0,
            "charges_included": True,
            "deposit": 850.00,
            "city": "Puteaux",
            "address": "12 Esplanade de La Défense",
            "postal_code": "92800",
            "latitude": 48.8917,
            "longitude": 2.2373,
            "room_type": "studio",
            "furnished": True,
            "floor": 8,
            "total_floors": 15,
            "available_from": date.today() + timedelta(days=45),
            "min_duration_months": 12,
            "wifi": True,
            "washing_machine": False,
            "kitchen": True,
            "parking": True,
            "elevator": True,
            "workspace": True,
            "pets": False,
            "tv": True,
            "dryer": False,
            "ac": True,
            "garden": False,
            "balcony": False,
            "owner_id": owner1.id,
            "photos": [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
            ]
        },
        {
            "title": "Chambre étudiante Vincennes",
            "description": "Chambre meublée de 12m² dans maison avec jardin. Calme, proche bois de Vincennes. Famille propriétaire sympathique.",
            "price": 550.00,
            "surface": 12.0,
            "charges_included": True,
            "deposit": 550.00,
            "city": "Vincennes",
            "address": "34 Avenue de Paris",
            "postal_code": "94300",
            "latitude": 48.8472,
            "longitude": 2.4393,
            "room_type": "colocation",
            "furnished": True,
            "floor": 0,
            "total_floors": 2,
            "available_from": date.today() + timedelta(days=10),
            "min_duration_months": 6,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": True,
            "elevator": False,
            "workspace": True,
            "pets": False,
            "tv": True,
            "dryer": False,
            "ac": False,
            "garden": True,
            "balcony": False,
            "owner_id": owner2.id,
            "photos": [
                "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
                "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
                "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
            ]
        },
        {
            "title": "Loft atypique Canal Saint-Martin",
            "description": "Superbe loft de 45m² sous verrière. Espace unique avec mezzanine. Quartier tendance du Canal Saint-Martin.",
            "price": 1200.00,
            "surface": 45.0,
            "charges_included": True,
            "deposit": 1200.00,
            "city": "Paris 10e",
            "address": "78 Quai de Valmy",
            "postal_code": "75010",
            "latitude": 48.8722,
            "longitude": 2.3658,
            "room_type": "t2",
            "furnished": True,
            "floor": 6,
            "total_floors": 6,
            "available_from": date.today() + timedelta(days=60),
            "min_duration_months": 12,
            "wifi": True,
            "washing_machine": True,
            "kitchen": True,
            "parking": False,
            "elevator": True,
            "workspace": True,
            "pets": True,
            "tv": True,
            "dryer": True,
            "ac": True,
            "garden": False,
            "balcony": False,
            "owner_id": owner1.id,
            "photos": [
                "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
                "https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800"
            ]
        }
    ]
    
    created_count = 0
    
    for data in listings_data:
        photos = data.pop("photos")
        
        # Créer l'annonce
        listing = Listing(**data)
        db.add(listing)
        await db.flush()
        
        # Créer les photos
        for idx, photo_url in enumerate(photos):
            photo = ListingPhoto(
                listing_id=listing.id,
                url=photo_url
            )
            db.add(photo)
        
        created_count += 1
        print(f"  ✅ {created_count}/8: {data['title']}")
    
    await db.commit()
    print(f"\n✅ {created_count} annonces Emergent créées avec succès!\n")


async def main():
    print("=" * 60)
    print("🌟 SEED DATA EMERGENT POUR ROOMLY")
    print("=" * 60)
    print()
    
    async with AsyncSessionLocal() as db:
        try:
            # 1. Créer les bailleurs
            landlords = await create_landlords(db)
            
            # 2. Créer les annonces
            await create_emergent_listings(db, landlords)
            
            print("=" * 60)
            print("✨ SEED EMERGENT TERMINÉ AVEC SUCCÈS!")
            print("=" * 60)
            print()
            print("Comptes créés:")
            print("  • pierre.dupont@immo.fr / password123 (Agence)")
            print("  • marie.martin@gmail.com / password123 (Particulier)")
            print()
            print("8 annonces parisiennes créées avec photos Unsplash")
            print()
            
        except Exception as e:
            print(f"\n❌ Erreur: {e}")
            import traceback
            traceback.print_exc()
            await db.rollback()


if __name__ == "__main__":
    asyncio.run(main())
