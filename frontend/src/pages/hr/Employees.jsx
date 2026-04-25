import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

const ROLE_STYLES = {
  admin:    { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  hr:       { color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  manager:  { color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  employee: { color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
};

function RoleBadge({ role }) {
  const s = ROLE_STYLES[role] || ROLE_STYLES.employee;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {role}
    </span>
  );
}

function Avatar({ name }) {
  const initials = name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const colors = ["#7c3aed","#2563eb","#059669","#d97706","#dc2626","#0891b2"];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ name: "", email: "", password: "", role: "employee" });
  const [formErr,   setFormErr]   = useState("");
  const [formLoad,  setFormLoad]  = useState(false);
  const [success,   setSuccess]   = useState("");

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get("/auth/users");
      setEmployees(data);
      setFiltered(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(employees.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q)
    ));
  }, [search, employees]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormErr(""); setFormLoad(true);
    try {
      await api.post("/auth/register", form);
      setSuccess("Employee added successfully!");
      setShowModal(false);
      setForm({ name: "", email: "", password: "", role: "employee" });
      fetchEmployees();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setFormErr(err.response?.data?.detail || "Failed to add employee.");
    } finally { setFormLoad(false); }
  };

  return (
    <div style={styles.root}>
      <Navbar />
      <div style={styles.content}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👥 Employees</h1>
            <p style={styles.sub}>Manage all team members and their roles</p>
          </div>
          <button onClick={() => setShowModal(true)} style={styles.addBtn}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            + Add Employee
          </button>
        </div>

        {success && (
          <div style={styles.successBox}>✅ {success}</div>
        )}

        {/* Search + count */}
        <div style={styles.toolbar}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or role…"
            style={styles.search}
            onFocus={e => e.target.style.borderColor = "#a78bfa"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
          <span style={styles.count}>{filtered.length} member{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div style={styles.tableWrap}>
          {loading ? (
            <div style={styles.empty}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>No employees found.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Employee", "Email", "Role", "Status"].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <tr key={emp.id} style={{ ...styles.tr, animationDelay: `${i * 0.04}s` }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Avatar name={emp.name} />
                        <span style={styles.empName}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}><span style={styles.empEmail}>{emp.email}</span></td>
                    <td style={styles.td}><RoleBadge role={emp.role} /></td>
                    <td style={styles.td}>
                      <span style={styles.activeDot}>● Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add New Employee</h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            {formErr && <div style={styles.formErr}>{formErr}</div>}

            <form onSubmit={handleAdd} style={styles.form}>
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "John Doe" },
                { label: "Email", key: "email", type: "email", placeholder: "john@neurahr.com" },
                { label: "Password", key: "password", type: "password", placeholder: "Min 6 characters" },
              ].map(f => (
                <div key={f.key} style={styles.formField}>
                  <label style={styles.formLabel}>{f.label}</label>
                  <input
                    type={f.type} required value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder} style={styles.formInput}
                    onFocus={e => e.target.style.borderColor = "#a78bfa"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>
              ))}
              <div style={styles.formField}>
                <label style={styles.formLabel}>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={styles.formSelect}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={formLoad} style={styles.submitBtn}>
                  {formLoad ? "Adding…" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        tbody tr { animation: fadeUp 0.3s ease both; }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  content: { maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "26px", fontWeight: "800", color: "#fff", margin: "0 0 4px" },
  sub: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 },
  addBtn: { background: "linear-gradient(135deg,#7c3aed,#a78bfa)", border: "none", borderRadius: "10px", padding: "11px 22px", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer", transition: "opacity 0.2s" },
  successBox: { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", marginBottom: "20px" },
  toolbar: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  search: { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 16px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s" },
  count: { color: "rgba(255,255,255,0.3)", fontSize: "13px", whiteSpace: "nowrap" },
  tableWrap: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s", cursor: "default" },
  td: { padding: "16px 20px" },
  empName: { color: "#fff", fontWeight: "600", fontSize: "14px" },
  empEmail: { color: "rgba(255,255,255,0.4)", fontSize: "13px" },
  activeDot: { color: "#34d399", fontSize: "12px", fontWeight: "600" },
  empty: { padding: "60px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "15px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" },
  modal: { background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "32px", width: "440px", maxWidth: "90vw" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  modalTitle: { color: "#fff", fontSize: "18px", fontWeight: "700", margin: 0 },
  closeBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "18px", cursor: "pointer" },
  formErr: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", marginBottom: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  formField: { display: "flex", flexDirection: "column", gap: "8px" },
  formLabel: { fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" },
  formInput: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s" },
  formSelect: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "11px 14px", color: "#fff", fontSize: "14px", outline: "none" },
  formActions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" },
  cancelBtn: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 20px", color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  submitBtn: { background: "linear-gradient(135deg,#7c3aed,#a78bfa)", border: "none", borderRadius: "10px", padding: "10px 24px", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer" },
};
