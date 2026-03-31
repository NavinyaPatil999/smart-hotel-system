import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { User, Mail, Phone, CreditCard, BedDouble, Calendar } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Bookings() {
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', aadhar: '', room_id: '', check_in: '', check_out: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get(`${API}/rooms/available`).then(r => setRooms(r.data)).catch(() => {})
    axios.get(`${API}/bookings/`).then(r => setBookings(r.data)).catch(() => {})
  }, [])

  const selectedRoom = rooms.find(r => r.id === parseInt(form.room_id))
  const nights = form.check_in && form.check_out ? Math.max(0, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / 86400000)) : 0
  const total = selectedRoom ? selectedRoom.price * nights : 0

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    const { name, email, phone, aadhar, room_id, check_in, check_out } = form
    if (!name || !email || !phone || !aadhar || !room_id || !check_in || !check_out) return setError('Please fill all fields.')
    if (new Date(check_out) <= new Date(check_in)) return setError('Check-out must be after check-in.')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/bookings/with-guest`, null, {
        params: { name, email, phone, aadhar, room_id, check_in_date: check_in, check_out_date: check_out }
      })
      setSuccess(`Booking confirmed! Your Booking ID is: #${res.data.booking_id}`)
      toast.success('Booking created! 🎉')
      setForm({ name: '', email: '', phone: '', aadhar: '', room_id: '', check_in: '', check_out: '' })
      axios.get(`${API}/rooms/available`).then(r => setRooms(r.data)).catch(() => {})
      axios.get(`${API}/bookings/`).then(r => setBookings(r.data)).catch(() => {})
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed.')
    } finally { setLoading(false) }
  }

  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'John Doe', icon: User },
    { key: 'email', label: 'Email Address', placeholder: 'john@example.com', icon: Mail, type: 'email' },
    { key: 'phone', label: 'Phone Number', placeholder: '9876543210', icon: Phone },
    { key: 'aadhar', label: 'Aadhar Number', placeholder: '1234 5678 9012', icon: CreditCard },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Bookings</h1>
          <p className="text-slate-500 mt-1">Create a new reservation for your guests</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Form */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            {/* Guest Info Section */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-[#3D4839]" />
              </span>
              <h3 className="font-semibold text-slate-900">Guest Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {fields.map(({ key, label, placeholder, icon: Icon, type = 'text' }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">{label} <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input type={type} placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839] transition"
                      value={form[key]} onChange={e => set(key, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Booking Details */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#3D4839]" />
              </span>
              <h3 className="font-semibold text-slate-900">Booking Details</h3>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Select Room <span className="text-red-400">*</span></label>
                <div className="relative">
                  <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839] appearance-none"
                    value={form.room_id} onChange={e => set('room_id', e.target.value)}>
                    <option value="">Choose a room...</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number} — {r.type} (₹{r.price}/night)</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['check_in', 'Check-in Date'], ['check_out', 'Check-out Date']].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">{label} <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input type="date" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839]"
                        value={form[key]} onChange={e => set(key, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2.5 mb-4">{error}</motion.p>}
            {success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2.5 mb-4 font-medium">{success}</motion.p>}

            <motion.button onClick={handleSubmit} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full bg-gradient-to-r from-[#3D4839] to-[#5a6b54] text-white py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? '⏳ Creating...' : '✨ Create Booking →'}
            </motion.button>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Booking Summary</h3>
              {!selectedRoom ? (
                <div className="text-center py-8">
                  <BedDouble className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Select a room to see pricing</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className={`h-20 rounded-xl bg-gradient-to-br from-[#3D4839] to-[#5a6b54] flex items-center justify-center`}>
                    <BedDouble className="w-8 h-8 text-white/30" />
                  </div>
                  {[
                    ['Room', `Room ${selectedRoom.room_number}`],
                    ['Type', selectedRoom.type],
                    ['Price/night', `₹${selectedRoom.price}`],
                    ['Nights', nights || '—'],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-slate-400">{l}</span>
                      <span className="font-medium capitalize text-slate-800">{v}</span>
                    </div>
                  ))}
                  {nights > 0 && (
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold text-slate-800">Total</span>
                      <span className="font-bold text-[#3D4839] text-lg">₹{total.toLocaleString()}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* All Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-900 mb-3">All Bookings</h3>
              {bookings.length === 0 ? (
                <p className="text-sm text-slate-400">No bookings yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {bookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm font-medium text-slate-700">#{b.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        b.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                        b.status === 'checked_out' ? 'bg-slate-100 text-slate-600' : 'bg-yellow-100 text-yellow-700'
                      }`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
