import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

const ROLE_META = {
  admin:    { title: "Admin Dashboard",    sub: "Full system control",         icon: "⚙️", accent: "#a78bfa" },
  hr:       { title: "HR Dashboard",       sub: "Recruitment & screening hub", icon: "👥", accent: "#60a5fa" },
  manager:  { title: "Manager Dashboard",  sub: "Team management overview",    icon: "📊", accent: "#fbbf24" },
  employee: { title: "Employee Dashboard", sub: "Your personal workspace",     icon: "👤", accent: "#34d399" },
};

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

function StatCard({ label, value, sub, accent, icon, loading }) {
  return (
    <div style={{ ...cardStyles.stat, borderColor: accent + "20" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
      <div style={{ ...cardStyles.statIcon, background: accent + "15", color: accent }}>{icon}</div>
      <div style={cardStyles.statNum}>
        {loading ? <span style={cardStyles.shimmer}>—</span> : <AnimatedNumber value={value} />}
      </div>
      <div style={cardStyles.statLabel}>{label}</div>
      <div style={cardStyles.statSub}>{sub}</div>
    </div>
  );
}

function DonutChart({ hire = 0, consider = 0, reject = 0 }) {
  const total = hire + consider + reject || 1;
  const hirepct = (hire / total) * 100;
  const conspct = (consider / total) * 100;
  const rejpct  = (reject / total) * 100;

  // SVG donut
  const r = 54, circ = 2 * Math.PI * r;
  const hireLen = (hire / total) * circ;
  const consLen = (consider / total) * circ;
  const rejLen  = (reject / total) * circ;

  return (
    <div style={chartStyles.wrap}>
      <h3 style={chartStyles.title}>Screening Breakdown</h3>
      <div style={chartStyles.inner}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#1a1a2e" strokeWidth="18"/>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#10b981" strokeWidth="18"
            strokeDasharray={`${hireLen} ${circ}`} strokeLinecap="butt"
            transform="rotate(-90 70 70)" style={{ transition: "stroke-dasharray 1s ease" }}/>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f59e0b" strokeWidth="18"
            strokeDasharray={`${consLen} ${circ}`} strokeDashoffset={-hireLen}
            strokeLinecap="butt" transform="rotate(-90 70 70)" style={{ transition: "all 1s ease" }}/>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#ef4444" strokeWidth="18"
            strokeDasharray={`${rejLen} ${circ}`} strokeDashoffset={-(hireLen + consLen)}
            strokeLinecap="butt" transform="rotate(-90 70 70)" style={{ transition: "all 1s ease" }}/>
          <text x="70" y="65" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="700">{hire + consider + reject}</text>
          <text x="70" y="82" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">total</text>
        </svg>
        <div style={chartStyles.legend}>
          {[
            { label: "Hire", count: hire, pct: hirepct, color: "#10b981" },
            { label: "Consider", count: consider, pct: conspct, color: "#f59e0b" },
            { label: "Reject", count: reject, pct: rejpct, color: "#ef4444" },
          ].map(item => (
            <div key={item.label} style={chartStyles.legendItem}>
              <div style={{ ...chartStyles.dot, background: item.color }} />
              <div>
                <div style={chartStyles.legendLabel}>{item.label}</div>
                <div style={chartStyles.legendCount}>{item.count} <span style={{ color: item.color }}>({Math.round(item.pct)}%)</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, sub, accent, onClick }) {
  return (
    <button onClick={onClick} style={{ ...qaStyles.btn }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <span style={qaStyles.icon}>{icon}</span>
      <div>
        <div style={qaStyles.title}>{title}</div>
        <div style={qaStyles.sub}>{sub}</div>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ screenings: 0, users: 0, hire: 0, consider: 0, reject: 0 });
  const [loading, setLoading] = useState(true);
  const meta = ROLE_META[user?.role] || ROLE_META.employee;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === "admin" || user?.role === "hr") {
          const { data } = await api.get("/recruitment/results");
          const hire    = data.filter(r => r.recommendation === "Hire").length;
          const consider= data.filter(r => r.recommendation === "Consider").length;
          const reject  = data.filter(r => r.recommendation === "Reject").length;
          setStats(s => ({ ...s, screenings: data.length, hire, consider, reject }));
        }
        if (user?.role === "admin") {
          const { data } = await api.get("/auth/users");
          setStats(s => ({ ...s, users: data.length }));
        }
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  return (
    <div style={pageStyles.root}>
      <Navbar />
      <div style={pageStyles.content}>

        {/* Header */}
        <div style={pageStyles.header}>
          <div style={pageStyles.headerLeft}>
            <span style={pageStyles.headerIcon}>{meta.icon}</span>
            <div>
              <h1 style={pageStyles.title}>{meta.title}</h1>
              <p style={pageStyles.sub}>{meta.sub}</p>
            </div>
          </div>
          <div style={{ ...pageStyles.welcomeBadge, borderColor: meta.accent + "30", color: meta.accent }}>
            Welcome back, {user?.name} 👋
          </div>
        </div>

        {/* Stats */}
        {(user?.role === "admin" || user?.role === "hr") && (
          <div style={pageStyles.statsGrid}>
            <StatCard label="Resumes Screened" value={stats.screenings} sub="AI-powered analysis" accent="#a78bfa" icon="📄" loading={loading}/>
            {user?.role === "admin" && <StatCard label="Total Users" value={stats.users} sub="Across all roles" accent="#60a5fa" icon="👥" loading={loading}/>}
            <StatCard label="Hire Recommendations" value={stats.hire} sub="Strong candidates" accent="#34d399" icon="✅" loading={loading}/>
            <StatCard label="Rejections" value={stats.reject} sub="Not a fit" accent="#f87171" icon="❌" loading={loading}/>
          </div>
        )}

        {/* Chart + Actions row */}
        <div style={pageStyles.row}>
          {(user?.role === "admin" || user?.role === "hr") && (
            <DonutChart hire={stats.hire} consider={stats.consider} reject={stats.reject} />
          )}

          <div style={pageStyles.actionsWrap}>
            <h3 style={pageStyles.actionsTitle}>Quick Actions</h3>
            <div style={pageStyles.actionsGrid}>
              {(user?.role === "admin" || user?.role === "hr") && (
                <QuickAction icon="📄" title="Screen a Resume" sub="Upload PDF → AI evaluation" accent="#a78bfa" onClick={() => navigate("/hr/resume")}/>
              )}
              <QuickAction icon="💬" title="HR Chatbot" sub="Ask about policies instantly" accent="#60a5fa" onClick={() => navigate("/hr/chat")}/>
              {(user?.role === "admin" || user?.role === "hr") && (
                <QuickAction icon="📋" title="Past Screenings" sub="View all candidates" accent="#fbbf24" onClick={() => navigate("/hr/resume")}/>
              )}
              {user?.role === "admin" && (
                <QuickAction icon="👥" title="Manage Employees" sub="View & add team members" accent="#34d399" onClick={() => navigate("/hr/employees")}/>
              )}
            </div>
          </div>
        </div>

        {/* Employee banner */}
        {(user?.role === "manager" || user?.role === "employee") && (
          <div style={pageStyles.banner}>
            <div style={pageStyles.bannerIcon}>💬</div>
            <div>
              <div style={pageStyles.bannerTitle}>Need HR help?</div>
              <div style={pageStyles.bannerSub}>Instantly get answers about leave policy, WFH rules, payroll, and more.</div>
            </div>
            <button onClick={() => navigate("/hr/chat")} style={pageStyles.bannerBtn}>Open Chatbot →</button>
          </div>
        )}
      </div>
    </div>
  );
}

const pageStyles = {
  root: { minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  content: { maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px", flexWrap: "wrap", gap: "16px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "16px" },
  headerIcon: { fontSize: "36px" },
  title: { fontSize: "26px", fontWeight: "800", color: "#fff", margin: 0 },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 },
  welcomeBadge: { border: "1px solid", borderRadius: "100px", padding: "8px 18px", fontSize: "13px", fontWeight: "600", background: "rgba(255,255,255,0.03)" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" },
  row: { display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "28px" },
  actionsWrap: { flex: 1, minWidth: "300px" },
  actionsTitle: { fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px", marginTop: 0 },
  actionsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  banner: {
    background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)",
    borderRadius: "16px", padding: "24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap",
  },
  bannerIcon: { fontSize: "32px" },
  bannerTitle: { color: "#93c5fd", fontWeight: "700", fontSize: "16px", marginBottom: "4px" },
  bannerSub: { color: "rgba(255,255,255,0.4)", fontSize: "14px" },
  bannerBtn: {
    marginLeft: "auto", background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
    border: "none", borderRadius: "10px", padding: "10px 20px",
    color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer",
  },
};

const cardStyles = {
  stat: {
    background: "rgba(255,255,255,0.03)", border: "1px solid",
    borderRadius: "16px", padding: "22px", transition: "transform 0.2s",
    cursor: "default",
  },
  statIcon: { width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginBottom: "14px" },
  statNum: { fontSize: "34px", fontWeight: "800", color: "#fff", lineHeight: 1, marginBottom: "6px" },
  statLabel: { fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "2px" },
  statSub: { fontSize: "11px", color: "rgba(255,255,255,0.25)" },
  shimmer: { color: "rgba(255,255,255,0.2)" },
};

const chartStyles = {
  wrap: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px", minWidth: "280px" },
  title: { fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 0, marginBottom: "20px" },
  inner: { display: "flex", alignItems: "center", gap: "24px" },
  legend: { display: "flex", flexDirection: "column", gap: "14px" },
  legendItem: { display: "flex", alignItems: "center", gap: "10px" },
  dot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
  legendLabel: { fontSize: "12px", color: "rgba(255,255,255,0.4)" },
  legendCount: { fontSize: "16px", fontWeight: "700", color: "#fff" },
};

const qaStyles = {
  btn: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px", padding: "16px", cursor: "pointer", textAlign: "left",
    display: "flex", alignItems: "flex-start", gap: "12px", transition: "all 0.2s", width: "100%",
  },
  icon: { fontSize: "22px", lineHeight: 1 },
  title: { fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "4px" },
  sub: { fontSize: "12px", color: "rgba(255,255,255,0.35)" },
};
