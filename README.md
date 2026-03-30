# Smart Hotel Management System

An AI-powered full-stack hotel management system with QR-based check-in, Aadhar OCR identity verification, face match simulation, and real-time room management.

## Features
- Online booking with QR code generation
- QR-based self check-in
- Aadhar OCR + face match verification
- Fraud detection on identity mismatch
- Real-time room status dashboard
- Admin panel for managing bookings

## Tech Stack
- Frontend: React, Tailwind CSS, Framer Motion
- Backend: Python, FastAPI, SQLAlchemy
- Database: PostgreSQL via Supabase
- Deployment: Vercel + Render

## Getting Started

### Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

### Frontend
cd frontend
npm install
npm run dev
