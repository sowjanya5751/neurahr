import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const ROLE_COLORS = {
  admin:    "bg-violet-500/20 text-violet-300",
  hr:       "bg-blue-500/20 text-blue-300",
  manager:  "bg-amber-500/20 text-amber-300",
  employee: "bg-emerald-500/20 text-emerald-300",
};

const ROLE_LINKS = {
  admin:    [{ to: "/dashboard", label: "Dashboard" }, { to: "/hr/resume", label: "Resume Screener" }, { to: "/hr/chat", label: "HR Chatbot" }],
  hr:       [{ to: "/dashboard", label: "Dashboard" }, { to: "/hr/resume", label: "Resume Screener" }, { to: "/hr/chat", label: "HR Chatbot" }],
  manager:  [{ to: "/dashboard", label: "Dashboard" }, { to: "/hr/chat", label: "HR Chatbot" }],
  employee: [{ to: "/dashboard", label: "Dashboard" }, { to: "/hr/chat", label: "HR Chatbot" }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };
  const links = ROLE_LINKS[user?.role] || [];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="text-white font-bold text-lg tracking-tight">
          Neura<span className="text-violet-400">HR</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[user?.role]}`}>
          {user?.role?.toUpperCase()}
        </span>
        <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
        <button onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors">
          Logout
        </button>
      </div>
    </nav>
  );
}
