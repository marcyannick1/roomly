#!/usr/bin/env python3
"""Script rapide pour ajouter les colonnes manquantes à la table users"""
import asyncio
from sqlalchemy import text
from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        # Ajouter les colonnes si elles n'existent pas
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS telephone VARCHAR"))
            print("✓ Colonne telephone ajoutée")
        except Exception as e:
            print(f"Colonne telephone : {e}")
        
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS photo VARCHAR"))
            print("✓ Colonne photo ajoutée")
        except Exception as e:
            print(f"Colonne photo : {e}")
        
        await conn.commit()
        print("✓ Migration terminée")

if __name__ == "__main__":
    asyncio.run(main())
