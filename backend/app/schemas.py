from pydantic import BaseModel
from datetime import date
from typing import Optional

class GuestCreate(BaseModel):
    name: str
    email: str
    phone: str
    aadhar_number: str

class GuestOut(GuestCreate):
    id: int
    class Config:
        from_attributes = True

class RoomOut(BaseModel):
    id: int
    room_number: str
    type: str
    price: float
    status: str
    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    guest_id: int
    room_id: int
    check_in_date: date
    check_out_date: date

class BookingOut(BaseModel):
    id: int
    guest_id: int
    room_id: int
    check_in_date: date
    check_out_date: date
    status: str
    qr_code: Optional[str] = None
    class Config:
        from_attributes = True