import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = 'https://smart-hotel-system.onrender.com'

function Bookings() {
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [form, setForm] = useState({
    name: '', email: '', phone: '', aadhar: '',
    room_id: '', check_in: '', check_out: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    axios.get(`${API}/rooms/available`).then(r => setRooms(r.data))
    axios.get(`${API}/bookings/`).then(r => setBookings(r.data)).catch(() => {})
  }, [])

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    const { name, email, phone, aadhar, room_id, check_in, check_out } = form
    if (!name || !email || !phone || !aadhar || !room_id || !check_in || !check_out)
      return setError('Please fill all fields.')
    if (new Date(check_out) <= new Date(check_in))
      return setError('Check-out must be after check-in.')
    try {
      const res = await axios.post(`${API}/bookings/with-guest`, null, {
        params: { name, email, phone, aadhar, room_id, check_in_date: check_in, check_out_date: check_out }
      })
      setSuccess(`Booking confirmed! Your Booking ID is: ${res.data.booking_id}`)
      toast.success('Booking created!')
      setForm({ name: '', email: '', phone: '', aadhar: '', room_id: '', check_in: '', check_out: '' })
      axios.get(`${API}/rooms/available`).then(r => setRooms(r.data))
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[24px] shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-6">New Booking</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Guest Name', key: 'name', placeholder: 'Navinya Patil' },
            { label: 'Email', key: 'email', placeholder: 'guest@email.com' },
            { label: 'Phone', key: 'phone', placeholder: '9876543210' },
            { label: 'Aadhar Number', key: 'aadhar', placeholder: '1234 5678 9012' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">{f.label}</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839]"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Select Room</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839]"
              value={form.room_id}
              onChange={e => setForm({ ...form, room_id: e.target.value })}
            >
              <option value="">-- Select a room --</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>Room {r.room_number} — {r.type} (₹{r.price}/night)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Check-in Date</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839]"
              value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#6B6B6B] mb-1 block">Check-out Date</label>
            <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839]"
              value={form.check_out} onChange={e => setForm({ ...form, check_out: e.target.value })} />
          </div>
        </div>

        {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 mt-4">{error}</p>}
        {success && <p className="text-xs text-green-700 bg-green-50 rounded-xl px-4 py-2 mt-4 font-medium">{success}</p>}

        <button onClick={handleSubmit}
          className="w-full mt-4 bg-[#3D4839] hover:bg-[#2e3629] text-white py-3 rounded-xl text-sm font-medium transition">
          Create Booking
        </button>
      </div>
    </div>
  )
}

export default Bookings
