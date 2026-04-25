import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
        ${isUser ? "bg-violet-600" : "bg-gray-700"}`}>
        {isUser ? "👤" : "🤖"}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? "bg-violet-600 text-white rounded-tr-sm"
          : "bg-gray-800 text-gray-200 rounded-tl-sm"}`}>
        {msg.text}
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/chatbot/suggestions")
      .then(({ data }) => setSuggestions(data.suggestions || []))
      .catch(() => {});

    setMessages([{
      role: "assistant",
      text: "Hi! I'm NeuraHR Assistant 👋 I can answer all your HR-related questions — leave policy, WFH rules, payroll, and more. How can I help you today?",
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setSuggestions([]);

    const userMsg = { role: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Build history for Gemini (last 10 messages)
    const history = messages.slice(-10).map((m) => ({
      role:  m.role === "user" ? "user" : "model",
      parts: [m.text],
    }));

    try {
      const { data } = await api.post("/chatbot/message", {
        message: userText,
        history,
      });
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: err.response?.data?.detail?.includes("quota")
          ? "I'm temporarily unavailable due to API limits. Please try again in a minute."
          : "Sorry, something went wrong. Please try again.",
      }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">HR Chatbot</h1>
          <p className="text-gray-500 text-sm mt-1">Ask anything about company HR policies</p>
        </div>

        {/* Chat window */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col overflow-hidden" style={{ minHeight: "500px" }}>
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map((msg, i) => <Message key={i} msg={msg}/>)}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0,1,2].map((i) => (
                    <div key={i} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {suggestions.slice(0,4).map((s,i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-800 p-4 flex gap-3">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about leave, WFH, payroll, policies…"
              disabled={loading}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"/>
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
