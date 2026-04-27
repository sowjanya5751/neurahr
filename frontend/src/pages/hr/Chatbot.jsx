import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display:"flex", gap:"12px", flexDirection:isUser?"row-reverse":"row", marginBottom:"16px" }}>
      <div style={{ width:"34px", height:"34px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0, background:isUser?"linear-gradient(135deg,#7c3aed,#a78bfa)":"rgba(255,255,255,0.08)" }}>
        {isUser ? "👤" : "🤖"}
      </div>
      <div style={{ maxWidth:"75%", background:isUser?"linear-gradient(135deg,#7c3aed,#a78bfa)":"rgba(255,255,255,0.07)", borderRadius:isUser?"16px 4px 16px 16px":"4px 16px 16px 16px", padding:"12px 16px", fontSize:"14px", color:"#fff", lineHeight:"1.6" }}>
        {msg.text}
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/chatbot/suggestions")
      .then(({ data }) => setSuggestions(data.suggestions || []))
      .catch(() => {});
    setMessages([{ role:"assistant", text:"Hi! I'm NeuraHR Assistant 👋 I can answer all your HR-related questions — leave policy, WFH rules, payroll, and more. How can I help you today?" }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setSuggestions([]);
    setMessages(prev => [...prev, { role:"user", text:userText }]);
    setLoading(true);

    const history = messages.slice(-10).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [m.text],
    }));

    try {
      const { data } = await api.post("/chatbot/message", { message:userText, history });
      setMessages(prev => [...prev, { role:"assistant", text:data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role:"assistant",
        text: err.response?.data?.detail?.includes("quota")
          ? "I'm temporarily unavailable due to API limits. Please try again in a moment."
          : "Sorry, something went wrong. Please try again.",
      }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <h1 style={s.title}>💬 HR Chatbot</h1>
          <p style={s.sub}>Ask anything about company HR policies</p>
        </div>

        <div style={s.chatWindow}>
          {/* Messages area */}
          <div style={s.messages}>
            {messages.map((msg, i) => <Message key={i} msg={msg}/>)}

            {loading && (
              <div style={{ display:"flex", gap:"12px" }}>
                <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px" }}>🤖</div>
                <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:"4px 16px 16px 16px", padding:"12px 16px", display:"flex", gap:"6px", alignItems:"center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:"8px", height:"8px", borderRadius:"50%", background:"rgba(255,255,255,0.4)", animation:"bounce 0.6s ease infinite", animationDelay:`${i*0.15}s` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div style={s.suggestionsWrap}>
              {suggestions.slice(0,4).map((sg, i) => (
                <button key={i} onClick={() => sendMessage(sg)} style={s.suggestionBtn}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#a78bfa"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}>
                  {sg}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={s.inputBar}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about leave, WFH, payroll, policies…"
              disabled={loading}
              style={s.input}
              onFocus={e => e.target.style.borderColor = "#a78bfa"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ ...s.sendBtn, opacity:(loading || !input.trim()) ? 0.4 : 1 }}>
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

const s = {
  root:{ minHeight:"100vh", background:"#0a0a0f", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  content:{ maxWidth:"800px", margin:"0 auto", padding:"40px 24px" },
  header:{ marginBottom:"24px" },
  title:{ fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 0 6px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 },
  chatWindow:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"20px", overflow:"hidden", display:"flex", flexDirection:"column" },
  messages:{ flex:1, overflowY:"auto", padding:"24px", minHeight:"420px", maxHeight:"500px" },
  suggestionsWrap:{ padding:"12px 20px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", flexWrap:"wrap", gap:"8px" },
  suggestionBtn:{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"100px", padding:"7px 14px", color:"rgba(255,255,255,0.6)", fontSize:"12px", cursor:"pointer", transition:"border-color 0.2s" },
  inputBar:{ borderTop:"1px solid rgba(255,255,255,0.07)", padding:"16px 20px", display:"flex", gap:"12px", alignItems:"center" },
  input:{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", padding:"12px 16px", color:"#fff", fontSize:"14px", outline:"none", transition:"border-color 0.2s", fontFamily:"inherit" },
  sendBtn:{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none", borderRadius:"12px", padding:"12px 24px", color:"#fff", fontWeight:"700", fontSize:"14px", cursor:"pointer", transition:"opacity 0.2s" },
};
