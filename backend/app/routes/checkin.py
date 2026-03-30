from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Booking, BookingStatus, Room, RoomStatus, CheckIn, Guest
from ai_module.ocr import extract_aadhar_details, compare_names
from ai_module.face_match import compare_faces
from ai_module.fraud import run_fraud_check
import shutil
import os
import uuid

# No prefix here — main.py already adds /checkin
router = APIRouter(tags=["Check-In"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_upload(file: UploadFile) -> str:
    """Save uploaded file and return its path."""
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return path


@router.get("/booking/{booking_id}")
def get_booking_details(booking_id: int, db: Session = Depends(get_db)):
    """
    Fetch booking + guest + room details by booking ID.
    Guest uses this to verify their booking exists before uploading documents.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    guest = db.query(Guest).filter(Guest.id == booking.guest_id).first()
    room = db.query(Room).filter(Room.id == booking.room_id).first()

    return {
        "booking_id": booking.id,
        "status": booking.status,
        "check_in_date": str(booking.check_in_date),
        "check_out_date": str(booking.check_out_date),
        "guest": {
            "name": guest.name,
            "email": guest.email,
            "phone": guest.phone
        },
        "room": {
            "room_number": room.room_number,
            "type": room.type,
            "price": room.price
        }
    }


@router.post("/verify/{booking_id}")
async def verify_and_checkin(
    booking_id: int,
    id_proof: UploadFile = File(...),
    selfie: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Full check-in verification flow:
    1. Validate booking exists and is in correct state
    2. Save uploaded images
    3. Run OCR on Aadhar card
    4. Run face match between Aadhar photo and selfie
    5. Run fraud detection
    6. If verified: assign room key, update booking + room status
    7. Return result with digital key or rejection reason
    """

    # Step 1 — Fetch booking
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Step 2 — Check booking is in valid state
    if booking.status == BookingStatus.checked_in:
        raise HTTPException(status_code=400, detail="Already checked in")
    if booking.status == BookingStatus.checked_out:
        raise HTTPException(status_code=400, detail="Booking is closed")

    # Step 3 — Fetch guest name for comparison
    guest = db.query(Guest).filter(Guest.id == booking.guest_id).first()
    room = db.query(Room).filter(Room.id == booking.room_id).first()

    # Step 4 — Save uploaded files
    id_path = save_upload(id_proof)
    selfie_path = save_upload(selfie)

    # Step 5 — Run OCR on Aadhar
    ocr_result = extract_aadhar_details(id_path, booking_name=guest.name)
    extracted_name = ocr_result["extracted_name"]

    # Step 6 — Compare names
    name_result = compare_names(extracted_name, guest.name)

    # Step 7 — Run face match
    face_result = compare_faces(id_path, selfie_path)

    # Step 8 — Run fraud check
    fraud_result = run_fraud_check(
        face_confidence=face_result["confidence"],
        name_match=name_result["match"],
        name_score=name_result["score"],
        booking_status=booking.status.value
    )

    # Step 9 — Save CheckIn record
    checkin_record = CheckIn(
        booking_id=booking_id,
        id_proof_path=id_path,
        face_image_path=selfie_path,
        ocr_name=extracted_name,
        face_confidence=face_result["confidence"],
        verified="approved" if not fraud_result["is_fraud"] else "rejected"
    )
    db.add(checkin_record)

    # Step 10 — If approved, update booking + room
    if not fraud_result["is_fraud"]:
        booking.status = BookingStatus.checked_in
        room.status = RoomStatus.occupied
        db.commit()
        db.refresh(checkin_record)

        return {
            "status": "approved",
            "message": "Check-in successful! Welcome to the hotel.",
            "digital_key": f"KEY-{booking_id:04d}-{room.room_number}",
            "room": {
                "room_number": room.room_number,
                "type": room.type,
                "floor": str(room.room_number)[0]
            },
            "guest_name": guest.name,
            "check_out_date": str(booking.check_out_date),
            "verification": {
                "ocr_name": extracted_name,
                "face_confidence": face_result["confidence"],
                "name_match_score": name_result["score"]
            }
        }

    # Step 11 — If rejected
    else:
        db.commit()
        raise HTTPException(
            status_code=403,
            detail={
                "status": "rejected",
                "message": "Identity verification failed.",
                "reasons": fraud_result["reasons"],
                "risk_level": fraud_result["risk_level"],
                "summary": fraud_result["summary"]
            }
        )


@router.get("/status/{booking_id}")
def get_checkin_status(booking_id: int, db: Session = Depends(get_db)):
    """Check the verification status of a booking's check-in."""
    record = db.query(CheckIn).filter(CheckIn.booking_id == booking_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="No check-in record found")
    return {
        "booking_id": booking_id,
        "verified": record.verified,
        "ocr_name": record.ocr_name,
        "face_confidence": record.face_confidence
    }
