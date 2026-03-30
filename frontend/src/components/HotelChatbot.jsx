import { useState, useRef, useEffect } from "react";

export default function HotelChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm Aria, your Smart Hotel concierge 🏨 How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
  const res = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: newMessages }),
  });
  if (!res.ok) throw new Error("Server error");
  const data = await res.json();
  console.log("Aria response:", data);
  setMessages([...newMessages, { role: "assistant", content: data.reply || data.error || "No response" }]);
  } catch (err) {
  console.error("Chat error:", err);
  setMessages([...newMessages, { role: "assistant", content: "Backend not reachable. Is uvicorn running?" }]);
  } finally {
  setLoading(false);
  }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#3D4839] hover:bg-[#2e3629] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
        title="Chat with Aria"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-100"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="bg-[#3D4839] px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#9FE1CB] flex items-center justify-center text-[#3D4839] font-bold text-sm">A</div>
            <div>
              <p className="text-white font-medium text-sm">Aria</p>
              <p className="text-[#9FE1CB] text-xs">Smart Hotel Concierge</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#9FE1CB] rounded-full animate-pulse" />
              <span className="text-xs text-[#9FE1CB]">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAF9F6]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-[#3D4839] text-white rounded-br-sm"
                    : "bg-white text-[#1A1A1A] shadow-sm rounded-bl-sm border border-gray-100"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 flex gap-1.5 items-center">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 bg-[#8C7D6B] rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 bg-[#FAF9F6] flex gap-2 flex-wrap">
              {["How to book?", "Check-in process", "Room prices"].map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs bg-white border border-gray-200 text-[#6B6B6B] rounded-full px-3 py-1.5 hover:border-[#3D4839] hover:text-[#3D4839] transition">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask Aria anything..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3D4839] transition"
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="w-10 h-10 bg-[#3D4839] hover:bg-[#2e3629] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}