from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Booking, BookingStatus, Room, RoomStatus, Guest

router = APIRouter(tags=["Checkout"])


@router.post("/{booking_id}")
def checkout(booking_id: int, db: Session = Depends(get_db)):
    """
    Guest checkout flow:
    1. Validate booking exists and is checked in
    2. Mark booking as checked_out
    3. Mark room as available
    4. Return stay summary with bill
    """

    # Fetch booking
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Must be checked in to check out
    if booking.status != BookingStatus.checked_in:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot checkout. Booking status is '{booking.status.value}'"
        )

    # Fetch guest and room
    guest = db.query(Guest).filter(Guest.id == booking.guest_id).first()
    room = db.query(Room).filter(Room.id == booking.room_id).first()

    # Calculate bill
    delta = booking.check_out_date - booking.check_in_date
    nights = max(delta.days, 1)
    total_bill = nights * room.price

    # Update statuses
    booking.status = BookingStatus.checked_out
    room.status = RoomStatus.available
    db.commit()

    return {
        "status": "checked_out",
        "message": f"Thank you for staying with us, {guest.name}!",
        "summary": {
            "guest_name": guest.name,
            "room_number": room.room_number,
            "room_type": room.type,
            "check_in": str(booking.check_in_date),
            "check_out": str(booking.check_out_date),
            "nights": nights,
            "price_per_night": room.price,
            "total_bill": total_bill
        }
    }


@router.get("/summary/{booking_id}")
def get_checkout_summary(booking_id: int, db: Session = Depends(get_db)):
    """Preview checkout bill without actually checking out."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    guest = db.query(Guest).filter(Guest.id == booking.guest_id).first()
    room = db.query(Room).filter(Room.id == booking.room_id).first()

    delta = booking.check_out_date - booking.check_in_date
    nights = max(delta.days, 1)
    total_bill = nights * room.price

    return {
        "guest_name": guest.name,
        "room_number": room.room_number,
        "nights": nights,
        "price_per_night": room.price,
        "total_bill": total_bill,
        "current_status": booking.status.value
    }
