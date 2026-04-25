import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

const ROLE_WELCOME = {
  admin:    { title: "Admin Dashboard",    sub: "Full system overview",          icon: "⚙️" },
  hr:       { title: "HR Dashboard",       sub: "Recruitment & screening hub",   icon: "👥" },
  manager:  { title: "Manager Dashboard",  sub: "Team management overview",      icon: "📊" },
  employee: { title: "Employee Dashboard", sub: "Your personal workspace",       icon: "👤" },
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color || "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function QuickAction({ icon, title, sub, onClick, color }) {
  return (
    <button onClick={onClick}
      className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-xl p-5 transition-all group">
      <div className={`text-2xl mb-3`}>{icon}</div>
      <p className={`font-semibold text-white group-hover:${color || "text-violet-400"} transition-colors`}>{title}</p>
      <p className="text-sm text-gray-500 mt-1">{sub}</p>
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats,   setStats]   = useState({ screenings: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  const welcome = ROLE_WELCOME[user?.role] || ROLE_WELCOME.employee;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === "admin" || user?.role === "hr") {
          const { data } = await api.get("/recruitment/results");
          setStats((s) => ({ ...s, screenings: data.length }));
        }
        if (user?.role === "admin") {
          const { data } = await api.get("/auth/users");
          setStats((s) => ({ ...s, users: data.length }));
        }
      } catch {}
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{welcome.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">{welcome.title}</h1>
              <p className="text-gray-500 text-sm">{welcome.sub}</p>
            </div>
          </div>
          <p className="text-gray-400 mt-3">
            Welcome back, <span className="text-violet-400 font-medium">{user?.name}</span> 👋
          </p>
        </div>

        {/* Stats — Admin & HR */}
        {(user?.role === "admin" || user?.role === "hr") && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            <StatCard label="Resumes Screened" value={loading ? "…" : stats.screenings} sub="AI-powered screening" color="text-violet-400"/>
            {user?.role === "admin" && (
              <StatCard label="Total Users" value={loading ? "…" : stats.users} sub="Across all roles" color="text-blue-400"/>
            )}
            <StatCard label="AI Features" value="2" sub="Resume + Chatbot" color="text-emerald-400"/>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {(user?.role === "admin" || user?.role === "hr") && (
              <QuickAction
                icon="📄" title="Screen a Resume"
                sub="Upload PDF → Get AI score, skills match & recommendation"
                onClick={() => navigate("/hr/resume")} color="text-violet-400"/>
            )}

            <QuickAction
              icon="💬" title="HR Chatbot"
              sub="Ask about leave policy, WFH rules, payroll & more"
              onClick={() => navigate("/hr/chat")} color="text-blue-400"/>

            {(user?.role === "admin" || user?.role === "hr") && (
              <QuickAction
                icon="📋" title="Past Screenings"
                sub="View all previously screened candidates & their scores"
                onClick={() => navigate("/hr/resume")} color="text-amber-400"/>
            )}

            {user?.role === "admin" && (
              <QuickAction
                icon="👥" title="Manage Users"
                sub="View all users and their roles in the system"
                onClick={() => navigate("/hr/resume")} color="text-emerald-400"/>
            )}
          </div>
        </div>

        {/* Info banner for manager/employee */}
        {(user?.role === "manager" || user?.role === "employee") && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
            <p className="text-blue-300 font-medium text-sm">💬 Need HR help?</p>
            <p className="text-gray-400 text-sm mt-1">
              Use the HR Chatbot to instantly get answers about leave policy, WFH rules, payroll dates, and more.
            </p>
            <button onClick={() => navigate("/hr/chat")}
              className="mt-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Open Chatbot →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
