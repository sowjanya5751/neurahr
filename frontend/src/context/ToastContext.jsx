import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error:   (msg) => addToast(msg, "error"),
    info:    (msg) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={styles.container}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...styles.toast, ...styles[t.type] }}>
            <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            <span style={{ color:"#fff", fontWeight:"500" }}>{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = {
  container:{ position:"fixed", bottom:"24px", right:"24px", zIndex:9999, display:"flex", flexDirection:"column", gap:"10px", pointerEvents:"none" },
  toast:{ display:"flex", alignItems:"center", gap:"10px", padding:"12px 18px", borderRadius:"12px", fontSize:"14px", fontWeight:"600", fontFamily:"'DM Sans','Segoe UI',sans-serif", backdropFilter:"blur(12px)", border:"1px solid", animation:"slideIn 0.3s ease", minWidth:"260px" },
  success:{ background:"rgba(16,185,129,0.15)", borderColor:"rgba(16,185,129,0.3)", color:"#34d399" },
  error:  { background:"rgba(239,68,68,0.15)",  borderColor:"rgba(239,68,68,0.3)",  color:"#f87171" },
  info:   { background:"rgba(96,165,250,0.15)", borderColor:"rgba(96,165,250,0.3)", color:"#60a5fa" },
};