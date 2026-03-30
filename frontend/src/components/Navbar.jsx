import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()
  const links = [
    { path: '/', label: '🏠 Dashboard' },
    { path: '/rooms', label: '🛏️ Rooms' },
    { path: '/bookings', label: '📋 Bookings' },
    { path: '/checkin', label: '✅ Check-in' },
    { path: '/checkout', label: '🏁 Checkout' },
  ]

  return (
    <nav className="bg-[#3D4839] text-white px-6 py-4 flex items-center gap-8 shadow-lg">
      <h1 className="text-xl font-bold tracking-wide">🏨 Smart Hotel</h1>
      <div className="flex gap-6">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm font-medium transition ${
              location.pathname === link.path
                ? 'text-white underline underline-offset-4'
                : 'text-[#c8d5c6] hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default Navbar