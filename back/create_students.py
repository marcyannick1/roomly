#!/usr/bin/env python3
"""Script pour créer les étudiants Emergent dans la base PostgreSQL"""
import asyncio
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

import os
from dotenv import load_dotenv
from sqlalchemy import select

load_dotenv()

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.student import Student
from app.core.security import hash_password


async def create_students():
    """Créer les 2 étudiants Emergent"""
    print("👤 Création des étudiants Emergent...")
    
    students_data = [
        {
            "email": "lucas.bernard@etudiant.fr",
            "password": "password123",
            "first_name": "Lucas",
            "last_name": "Bernard",
            "telephone": "06 11 22 33 44",
            "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "university": "Sorbonne Université",
            "budget_min": 500,
            "budget_max": 900,
            "bio": "Étudiant en 3ème année de droit, recherche studio ou colocation"
        },
        {
            "email": "emma.dubois@etudiant.fr",
            "password": "password123",
            "first_name": "Emma",
            "last_name": "Dubois",
            "telephone": "06 55 66 77 88",
            "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            "university": "Sciences Po Paris",
            "budget_min": 600,
            "budget_max": 1000,
            "bio": "Étudiante en master d'affaires internationales"
        }
    ]
    
    async with AsyncSessionLocal() as db:
        created_count = 0
        
        for data in students_data:
            # Vérifier si l'utilisateur existe déjà
            result = await db.execute(select(User).where(User.email == data["email"]))
            existing_user = result.scalars().first()
            
            if existing_user:
                print(f"  ⏭️  Utilisateur {data['email']} existe déjà")
                continue
            
            # Créer l'utilisateur
            user = User(
                email=data["email"],
                name=f"{data['first_name']} {data['last_name']}",
                hashed_password=hash_password(data["password"]),
                is_landlord=False,
                telephone=data["telephone"],
                photo=data["photo"]
            )
            db.add(user)
            await db.flush()
            
            # Créer le profil étudiant
            student = Student(
                user_id=user.id,
                university=data["university"],
                max_budget=float(data["budget_max"])
            )
            db.add(student)
            await db.flush()
            
            created_count += 1
            print(f"  ✅ Créé: {data['email']}")
        
        await db.commit()
        print(f"\n✅ {created_count} étudiants créés avec succès!\n")
        
        if created_count > 0:
            print("Comptes étudiants:")
            for data in students_data:
                print(f"  • {data['email']} / password123")
            print()


async def main():
    print("=" * 60)
    print("🎓 CRÉATION DES ÉTUDIANTS EMERGENT")
    print("=" * 60)
    print()
    
    try:
        await create_students()
        print("=" * 60)
        print("✨ TERMINÉ!")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
