import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Receipt, LogOut, CheckCircle2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Checkout() {
  const [bookingId, setBookingId] = useState('')
  const [summary, setSummary] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchSummary = async () => {
    setError('')
    if (!bookingId) return setError('Please enter a booking ID.')
    try {
      setLoading(true)
      const res = await axios.get(`${API}/checkout/summary/${bookingId}`)
      setSummary(res.data)
    } catch { setError('Booking not found or not checked in yet.') }
    finally { setLoading(false) }
  }

  const doCheckout = async () => {
    try {
      setLoading(true)
      const res = await axios.post(`${API}/checkout/${bookingId}`)
      setResult(res.data); setSummary(null)
    } catch (err) { setError(err.response?.data?.detail || 'Checkout failed.') }
    finally { setLoading(false) }
  }

  const reset = () => { setBookingId(''); setSummary(null); setResult(null); setError('') }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Check-out</h1>
          <p className="text-slate-500 mt-1">Review your stay and complete checkout</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 */}
          {!summary && !result && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-[#3D4839]" />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">Enter Booking ID</h3>
                  <p className="text-xs text-slate-400">View your bill and checkout</p>
                </div>
              </div>
              <input type="number" placeholder="e.g. 12345"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839] mb-4"
                value={bookingId} onChange={e => setBookingId(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchSummary()} />
              {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">{error}</p>}
              <motion.button onClick={fetchSummary} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-[#3D4839] to-[#5a6b54] text-white py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Receipt className="w-4 h-4" />
                {loading ? 'Loading...' : 'View Bill →'}
              </motion.button>
            </motion.div>
          )}

          {/* Bill Summary */}
          {summary && !result && (
            <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-5">Stay Summary</h3>
              <div className="bg-slate-50 rounded-xl p-5 space-y-3 mb-5">
                {[
                  ['Guest', summary.guest_name],
                  ['Room', summary.room_number],
                  ['Check-in', summary.check_in],
                  ['Check-out', summary.check_out],
                  ['Nights stayed', summary.nights],
                  ['Price per night', `₹${summary.price_per_night}`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-slate-400">{l}</span>
                    <span className="font-medium text-slate-700">{v}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">Total Bill</span>
                  <span className="font-bold text-[#3D4839] text-xl">₹{summary.total_bill}</span>
                </div>
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">{error}</p>}
              <div className="space-y-3">
                <motion.button onClick={doCheckout} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full bg-gradient-to-r from-[#3D4839] to-[#5a6b54] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  <LogOut className="w-4 h-4" />
                  {loading ? 'Processing...' : 'Confirm Check-out'}
                </motion.button>
                <button onClick={reset} className="w-full border border-slate-200 text-slate-500 hover:bg-slate-50 py-3 rounded-xl text-sm transition">Cancel</button>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {result && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="text-center mb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900">See you soon! 👋</h3>
                <p className="text-sm text-slate-500 mt-1">{result.message}</p>
              </div>
              {result.summary && (
                <div className="bg-gradient-to-br from-[#3D4839] to-[#5a6b54] rounded-2xl p-5 mb-4 text-white">
                  {[
                    ['Guest', result.summary.guest_name],
                    ['Room', result.summary.room_number],
                    ['Nights stayed', result.summary.nights],
                    ['Total charged', `₹${result.summary.total_bill}`],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm py-1.5 border-b border-white/10 last:border-0">
                      <span className="text-green-200">{l}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={reset} className="w-full border-2 border-[#3D4839] text-[#3D4839] hover:bg-[#3D4839] hover:text-white py-3 rounded-xl font-medium transition">
                New Check-out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
