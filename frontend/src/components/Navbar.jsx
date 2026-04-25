import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

const ROLE_LINKS = {
  admin:    [
    { to: "/dashboard",     label: "Dashboard" },
    { to: "/hr/resume",     label: "Resume Screener" },
    { to: "/hr/chat",       label: "HR Chatbot" },
    { to: "/hr/employees",  label: "Employees" },
  ],
  hr:       [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/hr/resume", label: "Resume Screener" },
    { to: "/hr/chat",   label: "HR Chatbot" },
  ],
  manager:  [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/hr/chat",   label: "HR Chatbot" },
  ],
  employee: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/hr/chat",   label: "HR Chatbot" },
  ],
};

const ROLE_COLORS = {
  admin:    { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  hr:       { color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  manager:  { color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  employee: { color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const links     = ROLE_LINKS[user?.role] || [];
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.employee;

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/dashboard" style={styles.logo}>
          Neura<span style={{ color: "#a78bfa" }}>HR</span>
        </Link>
        <div style={styles.links}>
          {links.map(l => {
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} style={{
                ...styles.link,
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
              }}
                onMouseEnter={e => !active && (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => !active && (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div style={styles.right}>
        <span style={{ ...styles.roleBadge, color: roleStyle.color, background: roleStyle.bg }}>
          {user?.role?.toUpperCase()}
        </span>
        <span style={styles.userName}>{user?.name}</span>
        <button onClick={() => { logout(); navigate("/login"); }} style={styles.logoutBtn}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "rgba(10,10,15,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)",
    padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
    height: "56px", position: "sticky", top: 0, zIndex: 50,
    backdropFilter: "blur(12px)", fontFamily: "'DM Sans','Segoe UI',sans-serif",
  },
  left: { display: "flex", alignItems: "center", gap: "32px" },
  logo: { fontSize: "18px", fontWeight: "800", color: "#fff", textDecoration: "none", letterSpacing: "-0.5px" },
  links: { display: "flex", alignItems: "center", gap: "4px" },
  link: { fontSize: "13px", fontWeight: "500", padding: "6px 12px", borderRadius: "8px", textDecoration: "none", transition: "color 0.15s, background 0.15s" },
  right: { display: "flex", alignItems: "center", gap: "12px" },
  roleBadge: { fontSize: "10px", fontWeight: "800", padding: "4px 10px", borderRadius: "100px", letterSpacing: "0.08em" },
  userName: { fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: "500" },
  logoutBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 14px", color: "rgba(255,255,255,0.45)", fontSize: "13px", cursor: "pointer", transition: "color 0.15s" },
};
