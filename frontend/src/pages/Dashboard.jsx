import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'https://smart-hotel-system.onrender.com'

function Dashboard() {
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    axios.get(`${API}/rooms/`).then(r => setRooms(r.data))
    axios.get(`${API}/bookings/`).then(r => setBookings(r.data))
  }, [])

  const available = rooms.filter(r => r.status === 'available').length
  const occupied = rooms.filter(r => r.status === 'occupied').length

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Rooms</p>
          <p className="text-4xl font-bold text-blue-600">{rooms.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Available</p>
          <p className="text-4xl font-bold text-green-600">{available}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Occupied</p>
          <p className="text-4xl font-bold text-red-600">{occupied}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-400">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Guest</th>
                <th className="pb-2">Room</th>
                <th className="pb-2">Check In</th>
                <th className="pb-2">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map(b => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2">{b.guest_name}</td>
                  <td className="py-2">Room {b.room_id}</td>
                  <td className="py-2">{b.check_in}</td>
                  <td className="py-2">{b.check_out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Dashboard
