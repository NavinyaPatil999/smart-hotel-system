from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Room
from ..schemas import RoomOut
from typing import List

router = APIRouter()

@router.get("/", response_model=List[RoomOut])
def get_all_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()

@router.get("/available", response_model=List[RoomOut])
def get_available_rooms(db: Session = Depends(get_db)):
    return db.query(Room).filter(Room.status == "available").all()