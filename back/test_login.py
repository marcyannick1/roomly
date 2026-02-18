import asyncio
from app.db.session import get_db
from app.models.user import User
from sqlalchemy import select
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

async def test_login():
    async for db in get_db():
        result = await db.execute(select(User))
        users = result.scalars().all()
        print(f"\n📋 {len(users)} utilisateurs trouvés:\n")
        
        for user in users[:10]:  # Limit to 10
            print(f"Email: {user.email}")
            print(f"Type: {user.user_type}")
            
            # Test passwords
            for pwd in ['password', 'password123', 'Password1', 'test', 'ipssi123']:
                if pwd_context.verify(pwd, user.hashed_password):
                    print(f"✅ Mot de passe: '{pwd}'")
                    break
            else:
                print("❌ Mot de passe non standard")
            print()
        break

asyncio.run(test_login())
