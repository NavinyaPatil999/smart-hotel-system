import { useState } from "react";
import axios from "axios";

const API = "https://smart-hotel-system.onrender.com";

const STEPS = ["Find Booking", "Upload Documents", "Verification Result"];

export default function CheckIn() {
  const [step, setStep] = useState(0);
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Find booking by ID
  const findBooking = async () => {
    setError("");
    if (!bookingId) return setError("Please enter a booking ID.");
    try {
      setLoading(true);
      const res = await axios.get(`${API}/checkin/booking/${bookingId}`);
      setBooking(res.data);
      setStep(1);
    } catch {
      setError("Booking not found. Please check the ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Upload and verify
  const verify = async () => {
    setError("");
    if (!idProof || !selfie) {
      return setError("Please upload both Aadhar card and selfie.");
    }
    try {
      setLoading(true);
      const form = new FormData();
      form.append("id_proof", idProof);
      form.append("selfie", selfie);
      const res = await axios.post(`${API}/checkin/verify/${bookingId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ success: true, data: res.data });
      setStep(2);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "object") {
        setResult({ success: false, data: detail });
        setStep(2);
      } else {
        setError(detail || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setBookingId("");
    setBooking(null);
    setIdProof(null);
    setSelfie(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-[#1A1A1A]">Guest Check-in</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">
            AI-powered identity verification
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all ${
                i < step
                  ? "bg-[#3D4839] text-white"
                  : i === step
                  ? "bg-[#3D4839] text-white"
                  : "bg-gray-100 text-[#6B6B6B]"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? "text-[#1A1A1A] font-medium" : "text-[#6B6B6B]"}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 mx-1 ${i < step ? "bg-[#3D4839]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* STEP 0 — Find Booking */}
        {step === 0 && (
          <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6">
            <p className="text-sm font-medium text-[#1A1A1A] mb-4">
              Enter your Booking ID
            </p>
            <input
              type="number"
              placeholder="e.g. 1"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#3D4839] transition mb-4"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && findBooking()}
            />
            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">
                {error}
              </p>
            )}
            <button
              onClick={findBooking}
              disabled={loading}
              className="w-full bg-[#3D4839] hover:bg-[#2e3629] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition"
            >
              {loading ? "Looking up booking..." : "Find Booking"}
            </button>
          </div>
        )}

        {/* STEP 1 — Upload Documents */}
        {step === 1 && booking && (
          <div className="space-y-4">

            {/* Booking Summary Card */}
            <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6">
              <p className="text-sm font-medium text-[#1A1A1A] mb-4">Booking found</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Guest", value: booking.guest?.name },
                  { label: "Room", value: `${booking.room?.room_number} · ${booking.room?.type}` },
                  { label: "Check-in", value: booking.check_in_date },
                  { label: "Check-out", value: booking.check_out_date },
                  { label: "Price", value: `₹${booking.room?.price}/night` },
                  { label: "Status", value: booking.status },
                ].map((item) => (
                  <div key={item.label} className="bg-[#FAF9F6] rounded-xl p-3">
                    <p className="text-xs text-[#6B6B6B] mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-[#1A1A1A] capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Card */}
            <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6">
              <p className="text-sm font-medium text-[#1A1A1A] mb-4">Upload documents</p>
              <div className="grid grid-cols-2 gap-4 mb-4">

                {/* Aadhar Upload */}
                <label className={`cursor-pointer border-2 border-dashed rounded-xl p-5 text-center transition ${
                  idProof ? "border-[#3D4839] bg-[#f0f4ef]" : "border-gray-200 hover:border-[#8C7D6B]"
                }`}>
                  <div className="text-2xl mb-2">🪪</div>
                  <p className="text-xs font-medium text-[#1A1A1A] mb-1">Aadhar Card</p>
                  <p className="text-xs text-[#6B6B6B]">
                    {idProof ? idProof.name : "Click to upload"}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setIdProof(e.target.files[0])}
                  />
                </label>

                {/* Selfie Upload */}
                <label className={`cursor-pointer border-2 border-dashed rounded-xl p-5 text-center transition ${
                  selfie ? "border-[#3D4839] bg-[#f0f4ef]" : "border-gray-200 hover:border-[#8C7D6B]"
                }`}>
                  <div className="text-2xl mb-2">🤳</div>
                  <p className="text-xs font-medium text-[#1A1A1A] mb-1">Live Selfie</p>
                  <p className="text-xs text-[#6B6B6B]">
                    {selfie ? selfie.name : "Click to upload"}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setSelfie(e.target.files[0])}
                  />
                </label>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">
                  {error}
                </p>
              )}

              <button
                onClick={verify}
                disabled={loading}
                className="w-full bg-[#3D4839] hover:bg-[#2e3629] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition"
              >
                {loading ? "Running AI verification..." : "Verify & Check In"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Result */}
        {step === 2 && result && (
          <div className="space-y-4">
            {result.success ? (
              <>
                {/* Success */}
                <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">✅</div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">
                      Check-in Successful!
                    </h3>
                    <p className="text-sm text-[#6B6B6B] mt-1">{result.data.message}</p>
                  </div>

                  {/* Digital Key */}
                  <div className="bg-[#3D4839] rounded-xl p-5 text-center mb-4">
                    <p className="text-xs text-[#9FE1CB] mb-1">Digital Room Key</p>
                    <p className="text-2xl font-semibold text-white tracking-widest">
                      {result.data.digital_key}
                    </p>
                    <p className="text-xs text-[#9FE1CB] mt-2">
                      Room {result.data.room?.room_number} · Floor {result.data.room?.floor}
                    </p>
                  </div>

                  {/* Verification Details */}
                  <div className="bg-[#FAF9F6] rounded-xl p-4 space-y-2">
                    <p className="text-xs font-medium text-[#1A1A1A] mb-3">Verification details</p>
                    {[
                      { label: "OCR Name Extracted", value: result.data.verification?.ocr_name },
                      {
                        label: "Face Match Confidence",
                        value: `${Math.round(result.data.verification?.face_confidence * 100)}%`,
                      },
                      {
                        label: "Name Match Score",
                        value: `${Math.round(result.data.verification?.name_match_score * 100)}%`,
                      },
                      { label: "Check-out Date", value: result.data.check_out_date },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-xs text-[#6B6B6B]">{item.label}</span>
                        <span className="text-xs font-medium text-[#1A1A1A]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Rejection */
              <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">❌</div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A]">
                    Verification Failed
                  </h3>
                  <p className="text-sm text-[#6B6B6B] mt-1">{result.data.message}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-red-700 mb-2">
                    Risk level: {result.data.risk_level?.toUpperCase()}
                  </p>
                  {result.data.reasons?.map((r, i) => (
                    <p key={i} className="text-xs text-red-600">• {r}</p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full border border-[#8C7D6B] text-[#8C7D6B] hover:bg-[#8C7D6B] hover:text-white py-3 rounded-xl text-sm font-medium transition"
            >
              Start New Check-in
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
