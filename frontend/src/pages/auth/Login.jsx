import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const DEMO_CREDS = [
  { role: "Admin",    email: "admin@neurahr.com",    password: "Admin123",  color: "text-violet-400" },
  { role: "HR",       email: "hr@neurahr.com",        password: "Hr123456",  color: "text-blue-400"   },
  { role: "Manager",  email: "manager@neurahr.com",   password: "Mgr12345",  color: "text-amber-400"  },
  { role: "Employee", email: "employee@neurahr.com",  password: "Emp12345",  color: "text-emerald-400"},
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Neura<span className="text-violet-400">HR</span></h1>
          <p className="text-gray-500 text-sm mt-2">AI-Powered HR Management System</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1.5 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="you@neurahr.com" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Password</label>
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full mt-1.5 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDS.map((c) => (
                <button key={c.role} onClick={() => fillDemo(c)}
                  className="text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg px-3 py-2 transition-colors">
                  <p className={`text-xs font-semibold ${c.color}`}>{c.role}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{c.email}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">Click any role to auto-fill credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
}
