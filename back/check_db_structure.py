import asyncio
from app.db.session import get_db
from sqlalchemy import text

async def check_structure():
    async for db in get_db():
        print("=== STUDENTS (avec info user) ===")
        result = await db.execute(text('''
            SELECT s.id as student_id, s.user_id, u.email, u.name, u.is_landlord
            FROM students s
            JOIN users u ON s.user_id = u.id
            LIMIT 10
        '''))
        for row in result:
            print(f"  Student ID: {row[0]}, User ID: {row[1]}, Email: {row[2]}, Name: {row[3]}, is_landlord: {row[4]}")
        
        print("\n=== LANDLORDS (avec info user) ===")
        result = await db.execute(text('''
            SELECT l.id as landlord_id, l.user_id, u.email, u.name, u.is_landlord
            FROM landlords l
            JOIN users u ON l.user_id = u.id
            LIMIT 10
        '''))
        for row in result:
            print(f"  Landlord ID: {row[0]}, User ID: {row[1]}, Email: {row[2]}, Name: {row[3]}, is_landlord: {row[4]}")
        
        print("\n=== MATCHES EXISTANTS ===")
        result = await db.execute(text('''
            SELECT m.id, m.student_id, m.landlord_id, m.listing_id, m.status
            FROM matches m
            ORDER BY m.id DESC
            LIMIT 5
        '''))
        for row in result:
            print(f"  Match ID: {row[0]}, Student: {row[1]}, Landlord: {row[2]}, Listing: {row[3]}, Status: {row[4]}")
        
        break

if __name__ == "__main__":
    asyncio.run(check_structure())
