from sqlalchemy.future import select
from app.models.room import Room
from sqlalchemy.ext.asyncio import AsyncSession

async def create_room(db: AsyncSession, room_data):
    db_room = Room(**room_data.dict())
    db.add(db_room)
    await db.commit()
    await db.refresh(db_room)
    return db_room

async def get_rooms(db: AsyncSession):
    result = await db.execute(select(Room))
    return result.scalars().all()
