import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = 'https://smart-hotel-system.onrender.com'

function Rooms() {
  const [rooms, setRooms] = useState([])

  const fetchRooms = () => {
    axios.get(`${API}/rooms/`).then(r => setRooms(r.data))
  }

  useEffect(() => { fetchRooms() }, [])

  const updateStatus = (id, status) => {
    axios.put(`${API}/rooms/${id}`, { status })
      .then(() => {
        toast.success('Room updated!')
        fetchRooms()
      })
      .catch(() => toast.error('Failed to update'))
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-[#1A1A1A]">Rooms</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Manage room availability and status
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-4 text-center">
            <p className="text-2xl font-semibold text-[#1A1A1A]">{rooms.length}</p>
            <p className="text-xs text-[#6B6B6B] mt-1">Total Rooms</p>
          </div>
          <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-4 text-center">
            <p className="text-2xl font-semibold text-[#3D4839]">
              {rooms.filter(r => r.status === 'available').length}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-1">Available</p>
          </div>
          <div className="bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-4 text-center">
            <p className="text-2xl font-semibold text-[#8C7D6B]">
              {rooms.filter(r => r.status === 'occupied').length}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-1">Occupied</p>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div
              key={room.id}
              className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] transition-shadow"
            >
              {/* Room Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">
                  Room {room.room_number}
                </h3>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  room.status === 'available'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {room.status}
                </span>
              </div>

              {/* Room Details */}
              <div className="mb-5 space-y-1">
                <p className="text-sm text-[#6B6B6B]">
                  <span className="text-[#8C7D6B] font-medium">Type: </span>
                  {room.type}
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  <span className="text-[#8C7D6B] font-medium">Price: </span>
                  ₹{room.price}/night
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(room.id, 'available')}
                  className="flex-1 text-xs bg-[#3D4839] hover:bg-[#2e3629] text-white py-2 rounded-xl transition"
                >
                  Set Available
                </button>
                <button
                  onClick={() => updateStatus(room.id, 'occupied')}
                  className="flex-1 text-xs border border-[#8C7D6B] text-[#8C7D6B] hover:bg-[#8C7D6B] hover:text-white py-2 rounded-xl transition"
                >
                  Set Occupied
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Rooms
