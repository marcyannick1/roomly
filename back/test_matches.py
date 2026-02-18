#!/usr/bin/env python3
"""Test direct de la fonction get_student_matches"""
import asyncio
import os
os.environ['DATABASE_URL'] = 'postgresql+asyncpg://postgres:root@localhost/roomly'

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.student import Student
from app.models.match import Match
from app.controllers import match as match_controller
from sqlalchemy import select

async def test():
    try:
        # Créer une session de test
        engine = create_async_engine(os.environ['DATABASE_URL'], echo=False)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as db:
            # Récupérer l'étudiant Emma (user_id = 30)
            result = await db.execute(select(Student).where(Student.user_id == 30))
            student = result.scalar_one_or_none()
            
            if not student:
                print("✗ Student not found for user_id=30")
                return
            
            print(f"✓ Found student: {student.id}")
            
            # Appeler la fonction test
            try:
                matches = await match_controller.get_student_matches(db, student.id)
                print(f"✓ got {len(matches)} matches: {matches}")
            except Exception as e:
                print(f"✗ Error in get_student_matches: {e}")
                import traceback
                traceback.print_exc()
        
        await engine.dispose()
    except Exception as e:
        print(f"✗ Database error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
