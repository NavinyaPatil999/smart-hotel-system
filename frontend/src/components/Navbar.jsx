import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BedDouble, CalendarCheck, LogIn, LogOut, Sparkles } from 'lucide-react'

const links = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/rooms', label: 'Rooms', icon: BedDouble },
  { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { path: '/checkin', label: 'Check-in', icon: LogIn },
  { path: '/checkout', label: 'Checkout', icon: LogOut },
]

export default function Navbar() {
  const location = useLocation()
  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-[#3D4839] to-[#5a6b54] rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-[#3D4839] to-[#5a6b54] bg-clip-text text-transparent">Smart Hotel</h1>
            <p className="text-xs text-slate-500">Management System</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path} className="relative">
                <motion.div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${active ? 'text-[#3D4839]' : 'text-slate-600 hover:text-[#3D4839] hover:bg-green-50/50'}`}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </motion.div>
                {active && (
                  <motion.div layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#3D4839]/10 to-[#5a6b54]/10 rounded-xl border border-[#3D4839]/20"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
