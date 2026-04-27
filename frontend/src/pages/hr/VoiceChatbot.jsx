import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display:"flex", gap:"12px", flexDirection: isUser?"row-reverse":"row", marginBottom:"16px" }}>
      <div style={{ width:"36px", height:"36px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0, background: isUser?"linear-gradient(135deg,#7c3aed,#a78bfa)":"rgba(255,255,255,0.08)" }}>
        {isUser ? "👤" : "🤖"}
      </div>
      <div style={{ maxWidth:"75%", background: isUser?"linear-gradient(135deg,#7c3aed,#a78bfa)":"rgba(255,255,255,0.06)", borderRadius: isUser?"16px 4px 16px 16px":"4px 16px 16px 16px", padding:"12px 16px", fontSize:"14px", color:"#fff", lineHeight:"1.6" }}>
        {msg.text}
        {msg.isVoice && <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)", marginLeft:"8px" }}>🎤</span>}
      </div>
    </div>
  );
}

export default function VoiceChatbot() {
  const toast = useToast();
  const [messages,  setMessages]  = useState([{
    role:"assistant",
    text:"Hi! I'm NeuraHR Voice Assistant 🎤 You can type or speak your HR questions. Try saying 'What is the leave policy?' or click the mic button!",
  }]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking,  setSpeaking]  = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [suggestions] = useState([
    "What is the leave policy?",
    "How many sick leaves do I get?",
    "What is the WFH policy?",
    "When is salary processed?",
    "What is the notice period?",
    "How does referral bonus work?",
  ]);
  const bottomRef   = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice not supported in this browser. Use Chrome.");
      setVoiceEnabled(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      sendMessage(transcript, true);
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error("Voice recognition failed. Try again.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setListening(true);
    toast.info("Listening… speak now!");
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const speak = (text) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = 0.9;
    utter.pitch = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en-US"));
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const sendMessage = async (text, isVoice = false) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg = { role:"user", text:userText, isVoice };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = messages.slice(-10).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [m.text],
    }));

    try {
      const { data } = await api.post("/chatbot/message", { message:userText, history });
      const reply = data.reply;
      setMessages(prev => [...prev, { role:"assistant", text:reply }]);
      if (isVoice || voiceEnabled) speak(reply);
    } catch (err) {
      const errMsg = "Sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role:"assistant", text:errMsg }]);
      toast.error("Chatbot error. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <div style={s.headerIcon}>🎤</div>
          <div>
            <h1 style={s.title}>AI Voice HR Assistant</h1>
            <p style={s.sub}>Ask HR questions by voice or text — powered by Groq LLaMA-3</p>
          </div>
          <div style={s.controls}>
            <button onClick={() => { setVoiceEnabled(!voiceEnabled); if(speaking) stopSpeaking(); }}
              style={{ ...s.controlBtn, background: voiceEnabled ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)", borderColor: voiceEnabled ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)", color: voiceEnabled ? "#34d399" : "rgba(255,255,255,0.4)" }}>
              {voiceEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
            </button>
            {speaking && (
              <button onClick={stopSpeaking} style={s.stopBtn}>⏹ Stop</button>
            )}
          </div>
        </div>

        {/* Chat window */}
        <div style={s.chatWindow}>
          {/* Suggestions */}
          {messages.length === 1 && (
            <div style={s.suggestions}>
              <div style={s.suggestionsTitle}>Try asking:</div>
              <div style={s.suggestionsGrid}>
                {suggestions.map((sg,i) => (
                  <button key={i} onClick={() => sendMessage(sg)}
                    style={s.suggestionBtn}
                    onMouseEnter={e => e.currentTarget.style.borderColor="#a78bfa"}
                    onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>
                    {sg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((msg,i) => <Message key={i} msg={msg}/>)}
            {loading && (
              <div style={{ display:"flex", gap:"12px" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>🤖</div>
                <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:"4px 16px 16px 16px", padding:"12px 16px", display:"flex", gap:"6px", alignItems:"center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:"8px", height:"8px", borderRadius:"50%", background:"rgba(255,255,255,0.3)", animation:"bounce 0.6s ease infinite", animationDelay:`${i*0.15}s` }}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Voice visualizer */}
          {listening && (
            <div style={s.voiceVisualizer}>
              <div style={s.voiceWaves}>
                {[...Array(7)].map((_,i) => (
                  <div key={i} style={{ ...s.wave, animationDelay:`${i*0.1}s`, height:`${20 + Math.random()*30}px` }}/>
                ))}
              </div>
              <span style={s.listeningText}>Listening… speak now</span>
            </div>
          )}

          {/* Input bar */}
          <div style={s.inputBar}>
            <button
              onMouseDown={startListening}
              onMouseUp={stopListening}
              onTouchStart={startListening}
              onTouchEnd={stopListening}
              disabled={!voiceEnabled}
              style={{ ...s.micBtn, background: listening ? "linear-gradient(135deg,#dc2626,#f87171)" : "rgba(255,255,255,0.06)", animation: listening ? "pulse 1s ease infinite" : "none" }}>
              {listening ? "🔴" : "🎤"}
            </button>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask anything about HR policies… or click mic to speak"
              disabled={loading}
              style={s.input}/>
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={s.sendBtn}>Send</button>
          </div>
          <div style={s.micHint}>Hold mic button to speak · Release to send</div>
        </div>
      </div>

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes waveAnim{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}
      `}</style>
    </div>
  );
}

const s = {
  root:{ minHeight:"100vh", background:"#0a0a0f", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  content:{ maxWidth:"800px", margin:"0 auto", padding:"40px 24px" },
  header:{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"24px", flexWrap:"wrap" },
  headerIcon:{ fontSize:"36px" },
  title:{ fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 0 4px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 },
  controls:{ marginLeft:"auto", display:"flex", gap:"8px", alignItems:"center" },
  controlBtn:{ border:"1px solid", borderRadius:"10px", padding:"8px 16px", fontSize:"13px", fontWeight:"600", cursor:"pointer" },
  stopBtn:{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:"10px", padding:"8px 16px", color:"#f87171", fontSize:"13px", fontWeight:"600", cursor:"pointer" },
  chatWindow:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"20px", overflow:"hidden" },
  suggestions:{ padding:"24px", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  suggestionsTitle:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"12px" },
  suggestionsGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" },
  suggestionBtn:{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"10px 14px", color:"rgba(255,255,255,0.6)", fontSize:"13px", cursor:"pointer", textAlign:"left", transition:"border-color 0.2s" },
  messages:{ padding:"24px", minHeight:"300px", maxHeight:"450px", overflowY:"auto" },
  voiceVisualizer:{ display:"flex", alignItems:"center", justifyContent:"center", gap:"16px", padding:"16px", background:"rgba(239,68,68,0.05)", borderTop:"1px solid rgba(239,68,68,0.15)" },
  voiceWaves:{ display:"flex", alignItems:"center", gap:"4px" },
  wave:{ width:"4px", background:"#f87171", borderRadius:"100px", animation:"waveAnim 0.6s ease infinite" },
  listeningText:{ color:"#f87171", fontSize:"14px", fontWeight:"600" },
  inputBar:{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"16px", display:"flex", gap:"10px", alignItems:"center" },
  micBtn:{ width:"44px", height:"44px", borderRadius:"50%", border:"none", fontSize:"20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" },
  input:{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", padding:"12px 16px", color:"#fff", fontSize:"14px", outline:"none" },
  sendBtn:{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none", borderRadius:"12px", padding:"12px 20px", color:"#fff", fontWeight:"700", fontSize:"14px", cursor:"pointer" },
  micHint:{ textAlign:"center", fontSize:"11px", color:"rgba(255,255,255,0.2)", padding:"0 16px 12px" },
};
