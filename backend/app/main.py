from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from .database import engine, Base, get_db
from .routes import bookings, rooms, checkin, checkout
from groq import Groq as GroqClient
import os

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Hotel Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rooms.router, prefix="/rooms", tags=["Rooms"])
app.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
app.include_router(checkin.router, prefix="/checkin", tags=["Check-In"])
app.include_router(checkout.router, prefix="/checkout", tags=["Check-Out"])

@app.get("/")
def root():
    return {"message": "Smart Hotel API is running 🏨"}

@app.post("/seed-rooms")
def seed_rooms(db: Session = Depends(get_db)):
    from .models import Room
    db.query(Room).delete()
    db.commit()
    rooms_data = [
        Room(room_number=101, type="standard", price=2500.0, status="available"),
        Room(room_number=201, type="deluxe", price=4500.0, status="available"),
        Room(room_number=301, type="suite", price=8000.0, status="available"),
        Room(room_number=102, type="standard", price=2500.0, status="available"),
        Room(room_number=202, type="deluxe", price=4500.0, status="available"),
    ]
    db.add_all(rooms_data)
    db.commit()
    return {"message": "Rooms seeded successfully"}

@app.post("/chat")
async def chat(request: dict):
    messages = request.get("messages", [])
    key = os.getenv("GROQ_API_KEY")
    print(f"GROQ KEY LOADED: {key[:10] if key else 'NOT FOUND'}")
    try:
        client = GroqClient(api_key=key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are Aria, a friendly hotel concierge for Smart Hotel. Help guests with bookings, check-in, checkout, and room info. Rooms: Standard ₹2500, Deluxe ₹4500, Suite ₹8000. Keep replies short and warm. Use emojis occasionally."
                },
                *messages
            ],
            max_tokens=300
        )
        reply = response.choices[0].message.content if response and response.choices else "No response"
        return {"reply": reply}
    except Exception as e:
        print(f"GROQ ERROR: {e}")
        return {"error": str(e)}