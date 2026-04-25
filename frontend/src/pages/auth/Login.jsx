import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const DEMO_CREDS = [
  { role: "Admin",    email: "admin@neurahr.com",    password: "Admin123",  color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
  { role: "HR",       email: "hr@neurahr.com",        password: "Hr123456",  color: "#60a5fa", bg: "rgba(96,165,250,0.08)"  },
  { role: "Manager",  email: "manager@neurahr.com",   password: "Mgr12345",  color: "#fbbf24", bg: "rgba(251,191,36,0.08)"  },
  { role: "Employee", email: "employee@neurahr.com",  password: "Emp12345",  color: "#34d399", bg: "rgba(52,211,153,0.08)"  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.access_token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check credentials.");
    } finally { setLoading(false); }
  };

  const fillDemo = (cred) => setForm({ email: cred.email, password: cred.password });

  return (
    <div style={styles.root}>
      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.container}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>⚡</div>
            <h1 style={styles.logoText}>Neura<span style={{ color: "#a78bfa" }}>HR</span></h1>
          </div>
          <h2 style={styles.heroTitle}>AI-Powered<br/>HR Management</h2>
          <p style={styles.heroSub}>Screen resumes in seconds. Answer HR queries instantly. Manage your team intelligently.</p>
          <div style={styles.featureList}>
            {["🤖 AI Resume Screening", "💬 HR Policy Chatbot", "👥 Role-based Access", "📊 Analytics Dashboard"].map((f, i) => (
              <div key={i} style={{ ...styles.featureItem, animationDelay: `${i * 0.1}s` }}>{f}</div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div style={styles.rightPanel}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Welcome back</h2>
            <p style={styles.cardSub}>Sign in to your workspace</p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={styles.input}
                  placeholder="you@neurahr.com"
                  onFocus={e => e.target.style.borderColor = "#a78bfa"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={styles.input}
                  placeholder="••••••••"
                  onFocus={e => e.target.style.borderColor = "#a78bfa"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
              <button type="submit" disabled={loading} style={styles.submitBtn}
                onMouseEnter={e => !loading && (e.target.style.opacity = "0.9")}
                onMouseLeave={e => e.target.style.opacity = "1"}>
                {loading ? <span style={styles.spinner} /> : null}
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>Demo Accounts</span>
              <span style={styles.dividerLine} />
            </div>

            <div style={styles.demoGrid}>
              {DEMO_CREDS.map((c) => (
                <button key={c.role} onClick={() => fillDemo(c)}
                  style={{ ...styles.demoBtn, borderColor: c.color + "40", background: c.bg }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = c.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = c.color + "40"}>
                  <span style={{ ...styles.demoRole, color: c.color }}>{c.role}</span>
                  <span style={styles.demoEmail}>{c.email}</span>
                </button>
              ))}
            </div>
            <p style={styles.demoHint}>Click any role to auto-fill</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.05)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(0.95)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,20px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  orb1: {
    position: "absolute", top: "-20%", left: "-10%",
    width: "600px", height: "600px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
    animation: "float1 8s ease-in-out infinite", pointerEvents: "none",
  },
  orb2: {
    position: "absolute", bottom: "-20%", right: "-10%",
    width: "500px", height: "500px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
    animation: "float2 10s ease-in-out infinite", pointerEvents: "none",
  },
  orb3: {
    position: "absolute", top: "50%", left: "50%",
    width: "300px", height: "300px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)",
    animation: "float3 12s ease-in-out infinite", pointerEvents: "none",
  },
  container: {
    display: "flex", gap: "48px", alignItems: "center",
    maxWidth: "900px", width: "100%", position: "relative", zIndex: 1,
  },
  leftPanel: { flex: 1, display: "flex", flexDirection: "column", gap: "24px" },
  logoArea: { display: "flex", alignItems: "center", gap: "12px" },
  logoIcon: { fontSize: "28px" },
  logoText: { fontSize: "28px", fontWeight: "800", color: "#fff", margin: 0 },
  heroTitle: {
    fontSize: "42px", fontWeight: "800", color: "#fff", lineHeight: "1.15",
    margin: 0, letterSpacing: "-1px",
  },
  heroSub: { color: "rgba(255,255,255,0.5)", fontSize: "15px", lineHeight: "1.6", margin: 0 },
  featureList: { display: "flex", flexDirection: "column", gap: "10px" },
  featureItem: {
    color: "rgba(255,255,255,0.7)", fontSize: "14px",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", padding: "10px 16px",
    animation: "fadeUp 0.5s ease both",
  },
  rightPanel: { width: "380px", flexShrink: 0 },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px", padding: "36px",
    backdropFilter: "blur(20px)",
  },
  cardTitle: { fontSize: "22px", fontWeight: "700", color: "#fff", margin: "0 0 4px" },
  cardSub: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: "0 0 24px" },
  errorBox: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171", borderRadius: "10px", padding: "12px 16px",
    fontSize: "13px", marginBottom: "16px",
  },
  fieldGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" },
  input: {
    width: "100%", background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
    padding: "11px 14px", color: "#fff", fontSize: "14px",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
  },
  submitBtn: {
    width: "100%", background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    border: "none", borderRadius: "10px", padding: "13px",
    color: "#fff", fontSize: "15px", fontWeight: "700",
    cursor: "pointer", marginTop: "8px", transition: "opacity 0.2s",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
  },
  spinner: {
    width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  divider: { display: "flex", alignItems: "center", gap: "10px", margin: "24px 0 16px" },
  dividerLine: { flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" },
  dividerText: { fontSize: "11px", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" },
  demoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  demoBtn: {
    background: "transparent", border: "1px solid", borderRadius: "10px",
    padding: "10px 12px", cursor: "pointer", textAlign: "left", transition: "border-color 0.2s",
    display: "flex", flexDirection: "column", gap: "2px",
  },
  demoRole: { fontSize: "12px", fontWeight: "700" },
  demoEmail: { fontSize: "10px", color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  demoHint: { textAlign: "center", fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "10px", marginBottom: 0 },
};
