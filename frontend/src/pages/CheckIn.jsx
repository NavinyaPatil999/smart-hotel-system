import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Upload, CheckCircle2, XCircle, Key, LogIn } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const STEPS = ['Find Booking', 'Upload Documents', 'Verification Result']

export default function CheckIn() {
  const [step, setStep] = useState(0)
  const [bookingId, setBookingId] = useState('')
  const [booking, setBooking] = useState(null)
  const [idProof, setIdProof] = useState(null)
  const [selfie, setSelfie] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const findBooking = async () => {
    setError('')
    if (!bookingId) return setError('Please enter a booking ID.')
    try {
      setLoading(true)
      const res = await axios.get(`${API}/checkin/booking/${bookingId}`)
      setBooking(res.data); setStep(1)
    } catch { setError('Booking not found. Please check the ID.') }
    finally { setLoading(false) }
  }

  const verify = async () => {
    setError('')
    if (!idProof || !selfie) return setError('Please upload both Aadhar card and selfie.')
    try {
      setLoading(true)
      const form = new FormData()
      form.append('id_proof', idProof); form.append('selfie', selfie)
      const res = await axios.post(`${API}/checkin/verify/${bookingId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult({ success: true, data: res.data }); setStep(2)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'object') { setResult({ success: false, data: detail }); setStep(2) }
      else setError(detail || 'Verification failed.')
    } finally { setLoading(false) }
  }

  const reset = () => { setStep(0); setBookingId(''); setBooking(null); setIdProof(null); setSelfie(null); setResult(null); setError('') }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Guest Check-in</h1>
          <p className="text-slate-500 mt-1">AI-powered identity verification system</p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      i < step ? 'bg-[#3D4839] text-white' :
                      i === step ? 'bg-gradient-to-br from-[#3D4839] to-[#5a6b54] text-white shadow-lg' :
                      'bg-slate-100 text-slate-400'
                    }`}
                    animate={{ scale: i === step ? 1.1 : 1 }}>
                    {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                  </motion.div>
                  <span className={`text-xs font-medium mt-1.5 text-center ${i === step ? 'text-[#3D4839]' : 'text-slate-400'}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 mb-4 ${i < step ? 'bg-[#3D4839]' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0 */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-[#3D4839]" />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">Enter Booking ID</h3>
                  <p className="text-xs text-slate-400">Start the check-in process</p>
                </div>
              </div>
              <input type="number" placeholder="e.g. 12345"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4839] mb-4"
                value={bookingId} onChange={e => setBookingId(e.target.value)} onKeyDown={e => e.key === 'Enter' && findBooking()} />
              {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">{error}</p>}
              <motion.button onClick={findBooking} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-[#3D4839] to-[#5a6b54] text-white py-3 rounded-xl font-medium transition disabled:opacity-50">
                {loading ? '⏳ Looking up...' : 'Find Booking →'}
              </motion.button>
            </motion.div>
          )}

          {/* Step 1 */}
          {step === 1 && booking && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <p className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Booking found
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['Guest', booking.guest?.name],
                    ['Room', `${booking.room?.room_number} · ${booking.room?.type}`],
                    ['Check-in', booking.check_in_date],
                    ['Check-out', booking.check_out_date],
                    ['Price', `₹${booking.room?.price}/night`],
                    ['Status', booking.status],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-1">{l}</p>
                      <p className="text-sm font-medium text-slate-700 capitalize">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <p className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#3D4839]" /> Upload documents
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { key: 'id', label: 'Aadhar Card', emoji: '🪪', file: idProof, set: setIdProof },
                    { key: 'selfie', label: 'Live Selfie', emoji: '🤳', file: selfie, set: setSelfie },
                  ].map(item => (
                    <label key={item.key} className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition ${
                      item.file ? 'border-[#3D4839] bg-green-50' : 'border-slate-200 hover:border-[#3D4839]'
                    }`}>
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <p className="text-sm font-medium text-slate-700 mb-1">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.file ? `✓ ${item.file.name}` : 'Click to upload'}</p>
                      <input type="file" accept="image/*" className="hidden" onChange={e => item.set(e.target.files[0])} />
                    </label>
                  ))}
                </div>
                {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">{error}</p>}
                <motion.button onClick={verify} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full bg-gradient-to-r from-[#3D4839] to-[#5a6b54] text-white py-3 rounded-xl font-medium transition disabled:opacity-50">
                  {loading ? '🤖 Running AI verification...' : '✅ Verify & Check In'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2 */}
          {step === 2 && result && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {result.success ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="text-center mb-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                      className="text-5xl mb-3">✅</motion.div>
                    <h3 className="text-xl font-bold text-slate-900">Check-in Successful!</h3>
                    <p className="text-sm text-slate-500 mt-1">{result.data.message}</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#3D4839] to-[#5a6b54] rounded-2xl p-5 text-center mb-4">
                    <Key className="w-5 h-5 text-green-200 mx-auto mb-1" />
                    <p className="text-xs text-green-200 mb-1">Digital Room Key</p>
                    <p className="text-3xl font-bold text-white tracking-widest">{result.data.digital_key}</p>
                    <p className="text-xs text-green-200 mt-2">Room {result.data.room?.room_number}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    {[
                      ['OCR Name', result.data.verification?.ocr_name],
                      ['Face Confidence', `${Math.round((result.data.verification?.face_confidence || 0) * 100)}%`],
                      ['Name Match', `${Math.round((result.data.verification?.name_match_score || 0) * 100)}%`],
                      ['Check-out', result.data.check_out_date],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between text-sm">
                        <span className="text-slate-400">{l}</span>
                        <span className="font-medium text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-3">❌</div>
                    <h3 className="text-xl font-bold text-slate-900">Verification Failed</h3>
                    <p className="text-sm text-slate-500 mt-1">{result.data.message}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-red-700 mb-2">Risk: {result.data.risk_level?.toUpperCase()}</p>
                    {result.data.reasons?.map((r, i) => <p key={i} className="text-xs text-red-600">• {r}</p>)}
                  </div>
                </div>
              )}
              <motion.button onClick={reset} whileTap={{ scale: 0.98 }}
                className="w-full border-2 border-[#3D4839] text-[#3D4839] hover:bg-[#3D4839] hover:text-white py-3 rounded-xl font-medium transition">
                Start New Check-in
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
