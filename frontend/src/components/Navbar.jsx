import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

const ROLE_LINKS = {
  admin: [
    { to:"/dashboard",       label:"Dashboard"    },
    { to:"/hr/resume",       label:"AI Screener"  },
    { to:"/hr/jd-generator", label:"JD Gen"       },
    { to:"/hr/performance",  label:"Reviews"      },
    { to:"/hr/search",       label:"🔍 AI Search" },
    { to:"/hr/leaves",       label:"Leaves"       },
    { to:"/hr/employees",    label:"Employees"    },
    { to:"/attendance",      label:"Attendance"   },
    { to:"/payroll",         label:"Payroll"      },
    { to:"/hr/voice",        label:"🎤 Voice"     },
  ],
  hr: [
    { to:"/dashboard",       label:"Dashboard"    },
    { to:"/hr/resume",       label:"AI Screener"  },
    { to:"/hr/jd-generator", label:"JD Gen"       },
    { to:"/hr/performance",  label:"Reviews"      },
    { to:"/hr/search",       label:"🔍 AI Search" },
    { to:"/hr/leaves",       label:"Leaves"       },
    { to:"/attendance",      label:"Attendance"   },
    { to:"/hr/voice",        label:"🎤 Voice"     },
  ],
  manager: [
    { to:"/dashboard",      label:"Dashboard"   },
    { to:"/hr/performance", label:"Reviews"     },
    { to:"/hr/leaves",      label:"Leaves"      },
    { to:"/attendance",     label:"Attendance"  },
    { to:"/payroll",        label:"Payroll"     },
    { to:"/performance",    label:"My Progress" },
    { to:"/hr/voice",       label:"🎤 Voice"    },
  ],
  employee: [
    { to:"/dashboard",   label:"Dashboard"   },
    { to:"/hr/leaves",   label:"Leaves"      },
    { to:"/attendance",  label:"Attendance"  },
    { to:"/payroll",     label:"Payroll"     },
    { to:"/performance", label:"Performance" },
    { to:"/hr/chat",     label:"Chatbot"     },
    { to:"/hr/voice",    label:"🎤 Voice"    },
  ],
};

const ROLE_COLORS = {
  admin:    { color:"#a78bfa", bg:"rgba(167,139,250,0.12)" },
  hr:       { color:"#60a5fa", bg:"rgba(96,165,250,0.12)"  },
  manager:  { color:"#fbbf24", bg:"rgba(251,191,36,0.12)"  },
  employee: { color:"#34d399", bg:"rgba(52,211,153,0.12)"  },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const links     = ROLE_LINKS[user?.role] || [];
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.employee;

  return (
    <nav style={st.nav}>
      <div style={st.left}>
        <Link to="/dashboard" style={st.logo}>
          Neura<span style={{ color:"#a78bfa" }}>HR</span>
        </Link>
        <div style={st.links}>
          {links.map(l => {
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to}
                style={{ ...st.link, color:active?"#fff":"rgba(255,255,255,0.45)", background:active?"rgba(255,255,255,0.08)":"transparent" }}
                onMouseEnter={e => !active && (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => !active && (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div style={st.right}>
        <span style={{ ...st.roleBadge, color:roleStyle.color, background:roleStyle.bg }}>
          {user?.role?.toUpperCase()}
        </span>
        <Link to="/profile" style={st.profileBtn}>{user?.name?.split(" ")[0]}</Link>
        <button onClick={() => { logout(); navigate("/login"); }} style={st.logoutBtn}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const st = {
  nav:{ background:"rgba(10,10,15,0.95)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", height:"52px", position:"sticky", top:0, zIndex:50, backdropFilter:"blur(12px)", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  left:{ display:"flex", alignItems:"center", gap:"12px", flex:1, overflow:"hidden" },
  logo:{ fontSize:"16px", fontWeight:"800", color:"#fff", textDecoration:"none", flexShrink:0 },
  links:{ display:"flex", alignItems:"center", gap:"1px", overflowX:"auto", msOverflowStyle:"none", scrollbarWidth:"none" },
  link:{ fontSize:"12px", fontWeight:"500", padding:"5px 8px", borderRadius:"6px", textDecoration:"none", transition:"color 0.15s, background 0.15s", whiteSpace:"nowrap" },
  right:{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 },
  roleBadge:{ fontSize:"10px", fontWeight:"800", padding:"3px 8px", borderRadius:"100px", letterSpacing:"0.06em" },
  profileBtn:{ fontSize:"12px", color:"rgba(255,255,255,0.7)", fontWeight:"600", textDecoration:"none", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"7px", padding:"5px 10px" },
  logoutBtn:{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"7px", padding:"5px 12px", color:"rgba(255,255,255,0.45)", fontSize:"12px", cursor:"pointer", transition:"color 0.15s" },
};
