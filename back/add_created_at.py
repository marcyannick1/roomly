import asyncio
from sqlalchemy import text
from app.db.session import engine

async def add_created_at():
    async with engine.begin() as conn:
        # Ajouter la colonne avec une valeur par défaut
        await conn.execute(text('''
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        '''))
        print('Migration successful: added created_at column')

if __name__ == "__main__":
    asyncio.run(add_created_at())
