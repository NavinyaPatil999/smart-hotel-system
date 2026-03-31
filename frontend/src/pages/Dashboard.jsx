import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Home, CheckCircle2, XCircle, TrendingUp, Users, Calendar, DollarSign, Activity } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function Dashboard() {
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/rooms/`).catch(() => ({ data: [] })),
      axios.get(`${API}/bookings/`).catch(() => ({ data: [] }))
    ]).then(([r, b]) => { setRooms(r.data || []); setBookings(b.data || []) })
      .finally(() => setLoading(false))
  }, [])

  const available = rooms.filter(r => r.status === 'available').length
  const occupied = rooms.filter(r => r.status === 'occupied').length
  const occupancyRate = rooms.length > 0 ? ((occupied / rooms.length) * 100).toFixed(1) : 0
  const avgPrice = rooms.length > 0 ? rooms.reduce((s, r) => s + r.price, 0) / rooms.length : 0
  const revenue = (occupied * avgPrice * 30).toFixed(0)

  const topStats = [
    { title: 'Total Rooms', value: rooms.length, icon: Home, gradient: 'from-[#3D4839] to-[#5a6b54]', bg: 'bg-green-50', text: 'text-[#3D4839]' },
    { title: 'Available', value: available, icon: CheckCircle2, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { title: 'Occupied', value: occupied, icon: XCircle, gradient: 'from-red-400 to-rose-500', bg: 'bg-red-50', text: 'text-red-500' },
    { title: 'Occupancy Rate', value: `${occupancyRate}%`, icon: TrendingUp, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600' },
  ]

  const metrics = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, sub: '+12% from last month' },
    { label: 'Active Guests', value: occupied, icon: Users, sub: '+8% from last month' },
    { label: 'Monthly Revenue', value: `₹${Number(revenue).toLocaleString()}`, icon: DollarSign, sub: '+15% from last month' },
    { label: 'Check-ins Today', value: bookings.filter(b => b.status === 'checked_in').length, icon: Activity, sub: '+5% from last month' },
  ]

  const typeGroups = rooms.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc }, {})
  const typeColors = ['#3D4839', '#5a6b54', '#8fa882', '#2d5a27']

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <motion.div className="w-8 h-8 border-4 border-[#3D4839] border-t-transparent rounded-full"
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <motion.div initial="hidden" animate="show" variants={container}>
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
        </motion.div>

        {/* Top Stats */}
        <motion.div variants={container} className="grid grid-cols-4 gap-4 mb-5">
          {topStats.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div key={i} variants={fadeUp}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                whileHover={{ y: -2 }}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${s.text}`} />
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-1">{s.title}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>{s.value}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Metrics */}
        <motion.div variants={container} className="grid grid-cols-4 gap-4 mb-6">
          {metrics.map((m, i) => {
            const Icon = m.icon
            return (
              <motion.div key={i} variants={fadeUp}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                whileHover={{ y: -2 }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{m.value}</p>
                    <p className="text-xs text-emerald-600 mt-1">{m.sub}</p>
                  </div>
                  <Icon className="w-6 h-6 text-slate-200" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Charts */}
        <motion.div variants={container} className="grid grid-cols-2 gap-6">
          {/* Room Types */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-5">Room Types Distribution</h3>
            <div className="space-y-4">
              {Object.entries(typeGroups).map(([type, count], i) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium capitalize text-slate-700">{type}</span>
                    <span className="text-slate-400">{count} rooms ({rooms.length ? ((count/rooms.length)*100).toFixed(0) : 0}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ backgroundColor: typeColors[i % typeColors.length] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${rooms.length ? (count/rooms.length)*100 : 0}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Status + Recent */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-5">Room Status Overview</h3>
            <div className="space-y-4 mb-6">
              {[
                { label: 'Available', count: available, color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                { label: 'Occupied', count: occupied, color: '#ef4444', bg: 'bg-red-50', text: 'text-red-500' },
              ].map((s, i) => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className={`flex items-center gap-2 font-medium text-slate-700`}>
                      <span className={`w-5 h-5 ${s.bg} ${s.text} rounded-full flex items-center justify-center text-xs`}>
                        {s.label === 'Available' ? '✓' : '✗'}
                      </span>{s.label}
                    </span>
                    <span className="text-slate-400">{s.count} rooms</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ backgroundColor: s.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${rooms.length ? (s.count/rooms.length)*100 : 0}%` }}
                      transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }} />
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Bookings</h4>
            {bookings.length === 0 ? (
              <p className="text-sm text-slate-400">No bookings yet.</p>
            ) : (
              <div className="space-y-2">
                {bookings.slice(-3).reverse().map((b, i) => (
                  <motion.div key={i} variants={fadeUp}
                    className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                    <span className="text-sm font-medium text-slate-700">Booking #{b.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      b.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                      b.status === 'checked_out' ? 'bg-slate-100 text-slate-600' : 'bg-yellow-100 text-yellow-700'
                    }`}>{b.status}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
