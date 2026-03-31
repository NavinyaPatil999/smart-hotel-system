import { useState } from "react";
import axios from "axios";

const API = "https://smart-hotel-system.onrender.com";

export default function Checkout() {
  const [bookingId, setBookingId] = useState("");
  const [summary, setSummary] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    setError("");
    if (!bookingId) return setError("Please enter a booking ID.");
    try {
      setLoading(true);
      const res = await axios.get(`${API}/checkout/summary/${bookingId}`);
      setSummary(res.data);
    } catch {
      setError("Booking not found or not checked in yet.");
    } finally {
      setLoading(false);
    }
  };

  const doCheckout = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/checkout/${bookingId}`);
      setResult(res.data);
      setSummary(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setBookingId("");
    setSummary(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6">
      <div className="max-w-xl mx-auto">

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-[#1A1A1A]">Check-out</h2>
          <p className="text-sm text-[#6B6B6B] mt-1">Review your stay and check out</p>
        </div>

        {/* Booking ID input */}
        {!summary && !result && (
          <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6">
            <p className="text-sm font-medium text-[#1A1A1A] mb-4">Enter your Booking ID</p>
            <input
              type="number"
              placeholder="e.g. 1"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#3D4839] transition mb-4"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchSummary()}
            />
            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-4">{error}</p>
            )}
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="w-full bg-[#3D4839] hover:bg-[#2e3629] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition"
            >
              {loading ? "Loading..." : "View Bill"}
            </button>
          </div>
        )}

        {/* Bill Summary */}
        {summary && !result && (
          <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 space-y-4">
            <p className="text-sm font-medium text-[#1A1A1A]">Stay Summary</p>

            <div className="bg-[#FAF9F6] rounded-xl p-4 space-y-3">
              {[
                { label: "Guest", value: summary.guest_name },
                { label: "Room", value: summary.room_number },
                { label: "Check-in", value: summary.check_in },
                { label: "Check-out", value: summary.check_out },
                { label: "Nights", value: summary.nights },
                { label: "Price per night", value: `₹${summary.price_per_night}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-xs text-[#6B6B6B]">{item.label}</span>
                  <span className="text-xs font-medium text-[#1A1A1A]">{item.value}</span>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-[#1A1A1A]">Total Bill</span>
                <span className="text-sm font-semibold text-[#3D4839]">₹{summary.total_bill}</span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}

            <button
              onClick={doCheckout}
              disabled={loading}
              className="w-full bg-[#3D4839] hover:bg-[#2e3629] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition"
            >
              {loading ? "Checking out..." : "Confirm Check-out"}
            </button>
            <button
              onClick={reset}
              className="w-full border border-gray-200 text-[#6B6B6B] py-3 rounded-xl text-sm transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-3">👋</div>
              <h3 className="text-lg font-semibold text-[#1A1A1A]">See you soon!</h3>
              <p className="text-sm text-[#6B6B6B] mt-1">{result.message}</p>
            </div>

            <div className="bg-[#FAF9F6] rounded-xl p-4 space-y-3">
              {[
                { label: "Guest", value: result.summary?.guest_name },
                { label: "Room", value: result.summary?.room_number },
                { label: "Nights stayed", value: result.summary?.nights },
                { label: "Total charged", value: `₹${result.summary?.total_bill}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-xs text-[#6B6B6B]">{item.label}</span>
                  <span className="text-xs font-medium text-[#1A1A1A]">{item.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={reset}
              className="w-full border border-[#8C7D6B] text-[#8C7D6B] hover:bg-[#8C7D6B] hover:text-white py-3 rounded-xl text-sm font-medium transition"
            >
              New Check-out
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
