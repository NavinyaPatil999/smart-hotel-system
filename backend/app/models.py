from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .database import Base
import enum

class RoomStatus(str, enum.Enum):
    available = "available"
    occupied = "occupied"

class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    checked_in = "checked_in"
    checked_out = "checked_out"

class Guest(Base):
    __tablename__ = "guests"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    aadhar_number = Column(String, unique=True)
    bookings = relationship("Booking", back_populates="guest")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, unique=True, nullable=False)
    type = Column(String)
    price = Column(Float)
    status = Column(Enum(RoomStatus), default=RoomStatus.available)
    bookings = relationship("Booking", back_populates="room")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(Integer, ForeignKey("guests.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    check_in_date = Column(Date)
    check_out_date = Column(Date)
    status = Column(Enum(BookingStatus), default=BookingStatus.pending)
    qr_code = Column(String)
    guest = relationship("Guest", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")

class CheckIn(Base):
    __tablename__ = "checkins"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    id_proof_path = Column(String)
    face_image_path = Column(String)
    ocr_name = Column(String)
    face_confidence = Column(Float)
    verified = Column(String, default="pending")