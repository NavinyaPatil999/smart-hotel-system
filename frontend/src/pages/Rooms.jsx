import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { BedDouble, Search, CheckCircle2, XCircle, Users, Wifi, Coffee, Tv } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const amenityIcons = [
  { icon: Users, label: '2-4 guests' },
  { icon: Wifi, label: 'WiFi' },
  { icon: Coffee, label: 'Coffee' },
  { icon: Tv, label: 'TV' },
]
const gradients = {
  standard: 'from-[#3D4839] to-[#5a6b54]',
  deluxe: 'from-[#2d5a27] to-[#4a8a43]',
  suite: 'from-[#1a3a18] to-[#3D4839]',
}

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchRooms = () => {
    axios.get(`${API}/rooms/`)
      .then(r => { setRooms(r.data); setFiltered(r.data) })
      .catch(() => toast.error('Failed to fetch rooms'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRooms() }, [])

  useEffect(() => {
    let result = [...rooms]
    if (search) result = result.filter(r => r.room_number.toString().includes(search) || r.type.includes(search.toLowerCase()))
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter)
    if (typeFilter !== 'all') result = result.filter(r => r.type === typeFilter)
    setFiltered(result)
  }, [search, statusFilter, typeFilter, rooms])

  const updateStatus = (id, status) => {
    axios.put(`${API}/rooms/${id}`, { status })
      .then(() => { toast.success('Room updated!'); fetchRooms() })
      .catch(() => toast.error('Failed to update'))
  }

  const available = rooms.filter(r => r.status === 'available').length
  const occupied = rooms.filter(r => r.status === 'occupied').length

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <motion.div className="w-8 h-8 border-4 border-[#3D4839] border-t-transparent rounded-full"
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Rooms Management</h1>
          <p className="text-slate-500 mt-1">Manage room availability and status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Rooms', value: rooms.length, icon: BedDouble, bg: 'bg-green-50', text: 'text-[#3D4839]' },
            { label: 'Available', value: available, icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600' },
            { label: 'Occupied', value: occupied, icon: XCircle, bg: 'bg-red-50', text: 'text-red-500' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -2 }}>
                <div>
                  <p className="text-sm text-slate-500">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
                </div>
                <span className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${s.text}`} />
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839]"
                placeholder="Search by room number or type..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839]"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
            <select className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839]"
              value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-3">Showing: <span className="font-medium text-slate-600">{filtered.length} of {rooms.length} rooms</span></p>
        </div>

        {/* Room Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div className="grid grid-cols-3 gap-5" layout>
            {filtered.map((room, i) => (
              <motion.div key={room.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }} layout>
                {/* Card Header */}
                <div className={`h-40 bg-gradient-to-br ${gradients[room.type] || gradients.standard} relative flex items-center justify-center`}>
                  <BedDouble className="w-16 h-16 text-white/20" />
                  <span className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${
                    room.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}>{room.status}</span>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800">Room {room.room_number}</h3>
                    <span className="text-[#3D4839] font-bold text-sm">₹{room.price}<span className="text-xs font-normal text-slate-400">/night</span></span>
                  </div>
                  <p className="text-sm text-slate-500 capitalize mb-3">{room.type}</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {amenityIcons.map(({ icon: Icon, label }) => (
                      <span key={label} className="flex items-center gap-1 text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-lg">
                        <Icon className="w-3 h-3" />{label}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => updateStatus(room.id, 'available')}
                      className="flex-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl transition font-medium">
                      Set Available
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => updateStatus(room.id, 'occupied')}
                      className="flex-1 text-xs border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-xl transition font-medium">
                      Set Occupied
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
