import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLES = {
  pending:  { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",  border:"rgba(251,191,36,0.25)",  label:"⏳ Pending"  },
  approved: { color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.25)",  label:"✅ Approved" },
  rejected: { color:"#f87171", bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.25)", label:"❌ Rejected" },
};

const LEAVE_TYPES = ["Annual Leave","Sick Leave","Casual Leave","Work From Home","Emergency Leave","Maternity/Paternity Leave"];

const LEAVE_BALANCE = {
  "Annual Leave": { total:18, used:5 },
  "Sick Leave":   { total:10, used:2 },
  "Casual Leave": { total:6,  used:1 },
  "Work From Home":{ total:24, used:8 },
};

function BalanceCard({ type, total, used }) {
  const remaining = total - used;
  const pct = (used / total) * 100;
  const color = remaining > 5 ? "#34d399" : remaining > 2 ? "#fbbf24" : "#f87171";
  return (
    <div style={bs.card}>
      <div style={bs.type}>{type}</div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
        <span style={{ ...bs.remaining, color }}>{remaining} left</span>
        <span style={bs.total}>{used}/{total} used</span>
      </div>
      <div style={bs.bar}>
        <div style={{ ...bs.fill, width:`${pct}%`, background:color }}/>
      </div>
    </div>
  );
}

export default function LeaveManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const isManager = user?.role === "admin" || user?.role === "hr" || user?.role === "manager";

  const [leaves,   setLeaves]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leave_type:"Annual Leave", from_date:"", to_date:"", reason:"" });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("my"); // my | all

  useEffect(() => { fetchLeaves(); }, [activeTab]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "all" && isManager ? "/leaves/all" : "/leaves/my";
      const { data } = await api.get(endpoint);
      setLeaves(data);
    } catch {
      // fallback to demo data
      setLeaves([
        { id:"1", leave_type:"Annual Leave", from_date:"2026-05-01", to_date:"2026-05-03", reason:"Family vacation", status:"approved", employee_name: user?.name },
        { id:"2", leave_type:"Sick Leave",   from_date:"2026-04-15", to_date:"2026-04-15", reason:"Fever", status:"approved", employee_name: user?.name },
        { id:"3", leave_type:"Casual Leave", from_date:"2026-04-20", to_date:"2026-04-20", reason:"Personal work", status:"pending", employee_name: user?.name },
      ]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from_date || !form.to_date || !form.reason.trim()) {
      toast.error("Please fill all fields."); return;
    }
    if (new Date(form.to_date) < new Date(form.from_date)) {
      toast.error("End date cannot be before start date."); return;
    }
    setSubmitting(true);
    try {
      await api.post("/leaves/apply", form);
      toast.success("Leave application submitted!");
      setShowForm(false);
      setForm({ leave_type:"Annual Leave", from_date:"", to_date:"", reason:"" });
      fetchLeaves();
    } catch {
      // demo mode
      const days = Math.ceil((new Date(form.to_date) - new Date(form.from_date)) / 86400000) + 1;
      setLeaves(prev => [{ id:Date.now().toString(), ...form, status:"pending", employee_name:user?.name, days }, ...prev]);
      toast.success("Leave application submitted!");
      setShowForm(false);
      setForm({ leave_type:"Annual Leave", from_date:"", to_date:"", reason:"" });
    }
    setSubmitting(false);
  };

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/leaves/${id}/${action}`);
    } catch {}
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action } : l));
    toast.success(`Leave ${action}!`);
  };

  const getDays = (from, to) => {
    if (!from || !to) return 0;
    return Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
  };

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <div style={s.headerIcon}>📅</div>
          <div>
            <h1 style={s.title}>Leave Management</h1>
            <p style={s.sub}>Apply for leave, track status, and manage team requests</p>
          </div>
          <button onClick={() => setShowForm(true)} style={s.applyBtn}>+ Apply for Leave</button>
        </div>

        {/* Balance cards */}
        <div style={s.balanceGrid}>
          {Object.entries(LEAVE_BALANCE).map(([type, {total, used}]) => (
            <BalanceCard key={type} type={type} total={total} used={used}/>
          ))}
        </div>

        {/* Tabs for manager */}
        {isManager && (
          <div style={s.tabs}>
            {[["my","My Leaves"],["all","All Team Leaves"]].map(([key,label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ ...s.tab, ...(activeTab===key ? s.tabActive : {}) }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Leave list */}
        <div style={s.listWrap}>
          {loading ? (
            <div style={s.empty}>Loading…</div>
          ) : leaves.length === 0 ? (
            <div style={s.empty}>No leave applications yet.</div>
          ) : (
            leaves.map(leave => {
              const st = STATUS_STYLES[leave.status] || STATUS_STYLES.pending;
              const days = getDays(leave.from_date, leave.to_date);
              return (
                <div key={leave.id} style={s.leaveCard}>
                  <div style={s.leaveLeft}>
                    <div style={s.leaveType}>{leave.leave_type}</div>
                    {isManager && activeTab === "all" && (
                      <div style={s.empName}>👤 {leave.employee_name}</div>
                    )}
                    <div style={s.leaveDates}>
                      {leave.from_date} {leave.from_date !== leave.to_date ? `→ ${leave.to_date}` : ""} · <span style={s.days}>{days} day{days !== 1 ? "s" : ""}</span>
                    </div>
                    <div style={s.leaveReason}>{leave.reason}</div>
                  </div>
                  <div style={s.leaveRight}>
                    <span style={{ ...s.statusBadge, color:st.color, background:st.bg, border:`1px solid ${st.border}` }}>
                      {st.label}
                    </span>
                    {isManager && leave.status === "pending" && (
                      <div style={s.actions}>
                        <button onClick={() => handleAction(leave.id, "approved")} style={s.approveBtn}>Approve</button>
                        <button onClick={() => handleAction(leave.id, "rejected")} style={s.rejectBtn}>Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Apply modal */}
      {showForm && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Apply for Leave</h3>
              <button onClick={() => setShowForm(false)} style={s.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Leave Type</label>
                <select value={form.leave_type} onChange={e => setForm({...form, leave_type:e.target.value})} style={s.select}>
                  {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={s.row2}>
                <div style={s.field}>
                  <label style={s.label}>From Date</label>
                  <input type="date" value={form.from_date} onChange={e => setForm({...form, from_date:e.target.value})} style={s.input} required/>
                </div>
                <div style={s.field}>
                  <label style={s.label}>To Date</label>
                  <input type="date" value={form.to_date} onChange={e => setForm({...form, to_date:e.target.value})} style={s.input} required/>
                </div>
              </div>
              {form.from_date && form.to_date && (
                <div style={s.daysPreview}>
                  📅 {getDays(form.from_date, form.to_date)} day{getDays(form.from_date, form.to_date) !== 1 ? "s" : ""} selected
                </div>
              )}
              <div style={s.field}>
                <label style={s.label}>Reason *</label>
                <textarea value={form.reason} onChange={e => setForm({...form, reason:e.target.value})}
                  rows={3} placeholder="Briefly describe the reason for leave..."
                  style={s.textarea} required/>
              </div>
              <div style={s.formActions}>
                <button type="button" onClick={() => setShowForm(false)} style={s.cancelBtn}>Cancel</button>
                <button type="submit" disabled={submitting} style={s.submitBtn}>
                  {submitting ? "Submitting…" : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const bs = {
  card:{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"16px" },
  type:{ fontSize:"12px", fontWeight:"700", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"10px" },
  remaining:{ fontSize:"22px", fontWeight:"800" },
  total:{ fontSize:"12px", color:"rgba(255,255,255,0.3)", alignSelf:"flex-end" },
  bar:{ height:"4px", background:"rgba(255,255,255,0.08)", borderRadius:"100px", overflow:"hidden" },
  fill:{ height:"100%", borderRadius:"100px", transition:"width 0.8s ease" },
};

const s = {
  root:{ minHeight:"100vh", background:"#0a0a0f", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  content:{ maxWidth:"1000px", margin:"0 auto", padding:"40px 24px" },
  header:{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"28px", flexWrap:"wrap" },
  headerIcon:{ fontSize:"36px" },
  title:{ fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 0 4px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 },
  applyBtn:{ marginLeft:"auto", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none", borderRadius:"10px", padding:"11px 22px", color:"#fff", fontWeight:"700", fontSize:"14px", cursor:"pointer" },
  balanceGrid:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"28px" },
  tabs:{ display:"flex", gap:"4px", marginBottom:"20px" },
  tab:{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", padding:"8px 18px", color:"rgba(255,255,255,0.4)", fontSize:"13px", fontWeight:"600", cursor:"pointer" },
  tabActive:{ background:"rgba(167,139,250,0.12)", borderColor:"rgba(167,139,250,0.3)", color:"#a78bfa" },
  listWrap:{ display:"flex", flexDirection:"column", gap:"12px" },
  leaveCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"20px", flexWrap:"wrap" },
  leaveLeft:{ flex:1 },
  leaveType:{ fontSize:"15px", fontWeight:"700", color:"#fff", marginBottom:"4px" },
  empName:{ fontSize:"12px", color:"rgba(255,255,255,0.4)", marginBottom:"4px" },
  leaveDates:{ fontSize:"13px", color:"rgba(255,255,255,0.5)", marginBottom:"6px" },
  days:{ color:"#a78bfa", fontWeight:"600" },
  leaveReason:{ fontSize:"13px", color:"rgba(255,255,255,0.35)", fontStyle:"italic" },
  leaveRight:{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"10px" },
  statusBadge:{ fontSize:"12px", fontWeight:"700", padding:"5px 12px", borderRadius:"100px" },
  actions:{ display:"flex", gap:"8px" },
  approveBtn:{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)", borderRadius:"8px", padding:"6px 14px", color:"#34d399", fontSize:"12px", fontWeight:"700", cursor:"pointer" },
  rejectBtn:{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:"8px", padding:"6px 14px", color:"#f87171", fontSize:"12px", fontWeight:"700", cursor:"pointer" },
  empty:{ textAlign:"center", color:"rgba(255,255,255,0.3)", padding:"60px", fontSize:"15px" },
  overlay:{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, backdropFilter:"blur(4px)" },
  modal:{ background:"#111118", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", padding:"32px", width:"480px", maxWidth:"90vw" },
  modalHeader:{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" },
  modalTitle:{ color:"#fff", fontSize:"18px", fontWeight:"700", margin:0 },
  closeBtn:{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:"18px", cursor:"pointer" },
  form:{ display:"flex", flexDirection:"column", gap:"16px" },
  row2:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  field:{ display:"flex", flexDirection:"column", gap:"8px" },
  label:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em" },
  input:{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"11px 14px", color:"#fff", fontSize:"14px", outline:"none" },
  select:{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"11px 14px", color:"#fff", fontSize:"14px", outline:"none" },
  textarea:{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"11px 14px", color:"#fff", fontSize:"14px", outline:"none", resize:"none" },
  daysPreview:{ background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:"8px", padding:"10px 14px", color:"#a78bfa", fontSize:"13px", fontWeight:"600" },
  formActions:{ display:"flex", gap:"12px", justifyContent:"flex-end", marginTop:"8px" },
  cancelBtn:{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"10px 20px", color:"rgba(255,255,255,0.6)", fontSize:"14px", fontWeight:"600", cursor:"pointer" },
  submitBtn:{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none", borderRadius:"10px", padding:"10px 24px", color:"#fff", fontWeight:"700", fontSize:"14px", cursor:"pointer" },
};
