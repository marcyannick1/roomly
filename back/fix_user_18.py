import asyncio
from sqlalchemy import select, update
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.landlord import Landlord
from app.models.student import Student

async def fix_user_18():
    async with AsyncSessionLocal() as db:
        # Récupérer l'utilisateur 18
        result = await db.execute(select(User).where(User.id == 18))
        user = result.scalar_one_or_none()
        
        if not user:
            print("❌ Utilisateur 18 introuvable")
            return
        
        print(f"✅ Utilisateur trouvé: {user.name} ({user.email})")
        print(f"   is_landlord actuel: {user.is_landlord}")
        
        # Vérifier s'il a un profil landlord
        landlord_result = await db.execute(select(Landlord).where(Landlord.user_id == 18))
        landlord = landlord_result.scalar_one_or_none()
        
        # Vérifier s'il a un profil student
        student_result = await db.execute(select(Student).where(Student.user_id == 18))
        student = student_result.scalar_one_or_none()
        
        print(f"   Profil landlord: {'✅ Existe' if landlord else '❌ N existe pas'}")
        print(f"   Profil student: {'✅ Existe' if student else '❌ N existe pas'}")
        
        if landlord and not user.is_landlord:
            print("\n🔧 Correction: Mise à jour de is_landlord = True")
            user.is_landlord = True
            db.add(user)
            await db.commit()
            print("✅ Correction appliquée!")
        elif landlord and user.is_landlord:
            print("\n✅ Utilisateur déjà correctement configuré")
        else:
            print("\n⚠️  Aucun profil landlord trouvé pour cet utilisateur")

if __name__ == "__main__":
    asyncio.run(fix_user_18())
