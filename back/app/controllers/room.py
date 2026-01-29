from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.room import Room
from app.schemas.room import RoomCreate


async def create_room(db: AsyncSession, room: RoomCreate) -> Room:
    db_room = Room(**room.model_dump())
    db.add(db_room)
    await db.commit()
    await db.refresh(db_room)
    return db_room


async def get_room(db: AsyncSession, room_id: int) -> Room | None:
    result = await db.execute(
        select(Room).where(Room.id == room_id)
    )
    return result.scalar_one_or_none()


async def get_rooms(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
) -> list[Room]:
    result = await db.execute(
        select(Room).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def get_rooms_by_owner(
    db: AsyncSession,
    owner_id: int,
) -> list[Room]:
    result = await db.execute(
        select(Room).where(Room.owner_id == owner_id)
    )
    return result.scalars().all()


async def delete_room(db: AsyncSession, room_id: int) -> bool:
    room = await get_room(db, room_id)
    if not room:
        return False
    await db.delete(room)
    await db.commit()
    return True
