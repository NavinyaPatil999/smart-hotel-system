import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Bookings from './pages/Bookings'
import CheckIn from './pages/CheckIn'
import Checkout from './pages/Checkout'
import Navbar from './components/Navbar'
import HotelChatbot from './components/HotelChatbot'


function App() {
return (
  <BrowserRouter>
    <Toaster position="top-right" />
    <Navbar />
    <div className="min-h-screen bg-[#FAF9F6] p-6">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </div>
    <HotelChatbot />
  </BrowserRouter>
)}
export default App