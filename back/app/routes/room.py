from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.room import RoomCreate, RoomOut
from app.controllers import room as room_controller

router = APIRouter(
    tags=["Rooms"],
)


@router.post("/", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
async def create_room(
    room: RoomCreate,
    db: AsyncSession = Depends(get_db),
):
    return await room_controller.create_room(db, room)


@router.get("/{room_id}", response_model=RoomOut)
async def get_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
):
    room = await room_controller.get_room(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.get("/", response_model=list[RoomOut])
async def list_rooms(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    return await room_controller.get_rooms(db, skip, limit)


@router.get("/owner/{owner_id}", response_model=list[RoomOut])
async def list_rooms_by_owner(
    owner_id: int,
    db: AsyncSession = Depends(get_db),
):
    return await room_controller.get_rooms_by_owner(db, owner_id)


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
):
    deleted = await room_controller.delete_room(db, room_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Room not found")
