from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Booking, Room, RoomStatus, Guest
from ..schemas import BookingCreate, BookingOut
import qrcode, os
from datetime import date

router = APIRouter()

@router.post("/with-guest")
def create_booking_with_guest(
    name: str, email: str, phone: str, aadhar: str,
    room_id: int, check_in_date: str, check_out_date: str,
    db: Session = Depends(get_db)
):
    guest = db.query(Guest).filter(Guest.email == email).first()
    if not guest:
        guest = Guest(name=name, email=email, phone=phone, aadhar_number=aadhar)
        db.add(guest)
        db.commit()
        db.refresh(guest)

    room = db.query(Room).filter(Room.id == room_id).first()
    if not room or room.status != RoomStatus.available:
        raise HTTPException(status_code=400, detail="Room not available")

    booking = Booking(
        guest_id=guest.id, room_id=room_id,
        check_in_date=date.fromisoformat(check_in_date),
        check_out_date=date.fromisoformat(check_out_date),
        status="confirmed"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    qr = qrcode.make(f"booking:{booking.id}|guest:{guest.id}|room:{room_id}")
    os.makedirs("qr_codes", exist_ok=True)
    qr.save(f"qr_codes/booking_{booking.id}.png")
    booking.qr_code = f"qr_codes/booking_{booking.id}.png"
    room.status = RoomStatus.occupied
    db.commit()

    return {"message": "Booking confirmed ✅", "booking_id": booking.id, "guest": name, "room": room.room_number}