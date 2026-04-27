import { useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ROLE_COLORS = {
  admin:    { color:"#a78bfa", bg:"rgba(167,139,250,0.12)" },
  hr:       { color:"#60a5fa", bg:"rgba(96,165,250,0.12)"  },
  manager:  { color:"#fbbf24", bg:"rgba(251,191,36,0.12)"  },
  employee: { color:"#34d399", bg:"rgba(52,211,153,0.12)"  },
};

const HR_POLICIES = [
  { icon:"🏖️", label:"Annual Leave",    value:"18 days/year" },
  { icon:"🤒", label:"Sick Leave",      value:"10 days/year" },
  { icon:"☀️", label:"Casual Leave",    value:"6 days/year"  },
  { icon:"🏠", label:"WFH Policy",      value:"2 days/week"  },
  { icon:"💰", label:"Payroll",         value:"Last working day" },
  { icon:"🏥", label:"Medical",         value:"Employee + family" },
  { icon:"⏱️", label:"Notice Period",   value:"2 months"     },
  { icon:"🎯", label:"Performance Review", value:"April & October" },
];

function Avatar({ name, size = 80 }) {
  const initials = name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) || "?";
  const colors = ["#7c3aed","#2563eb","#059669","#d97706","#0891b2"];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg, ${color}, ${color}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.35, fontWeight:"800", color:"#fff", flexShrink:0, boxShadow:`0 0 0 4px ${color}20` }}>
      {initials}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.employee;

  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { label:"Leave Balance", value:"12", sub:"days remaining", color:"#34d399" },
    { label:"Days Present", value:"89", sub:"this quarter",    color:"#60a5fa" },
    { label:"Tasks Done",   value:"47", sub:"this month",      color:"#a78bfa" },
    { label:"Performance",  value:"4.2", sub:"out of 5.0",     color:"#fbbf24" },
  ];

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.content}>

        {/* Profile hero */}
        <div style={s.hero}>
          <div style={s.heroLeft}>
            <Avatar name={user?.name} size={80}/>
            <div>
              <h1 style={s.name}>{user?.name}</h1>
              <div style={s.metaRow}>
                <span style={{ ...s.roleBadge, color:roleStyle.color, background:roleStyle.bg }}>
                  {user?.role?.toUpperCase()}
                </span>
                <span style={s.email}>{user?.email}</span>
              </div>
              <div style={s.metaRow2}>
                <span style={s.metaItem}>🏢 NeuraHR</span>
                <span style={s.metaItem}>📍 Bangalore, India</span>
                <span style={s.metaItem}>📅 Joined 2024</span>
              </div>
            </div>
          </div>
          <div style={s.heroRight}>
            <div style={s.activeStatus}>
              <span style={s.activeDot}/>
              Active Employee
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {stats.map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{ ...s.statNum, color:st.color }}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
              <div style={s.statSub}>{st.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {[["overview","Overview"],["policies","HR Policies"],["contact","Contact & Info"]].map(([key,label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ ...s.tab, ...(activeTab===key ? s.tabActive : {}) }}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div style={s.tabContent}>
            <div style={s.infoGrid}>
              <div style={s.infoCard}>
                <div style={s.infoTitle}>Personal Information</div>
                {[
                  ["Full Name", user?.name],
                  ["Email",     user?.email],
                  ["Role",      user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)],
                  ["Department","AI & Technology"],
                  ["Employee ID","EMP-" + (user?.id?.slice(0,6) || "000001").toUpperCase()],
                  ["Status",    "Active"],
                ].map(([label, value]) => (
                  <div key={label} style={s.infoRow}>
                    <span style={s.infoLabel}>{label}</span>
                    <span style={s.infoValue}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={s.infoCard}>
                <div style={s.infoTitle}>Work Information</div>
                {[
                  ["Job Title",    user?.role === "admin" ? "System Administrator" : user?.role === "hr" ? "HR Recruiter" : user?.role === "manager" ? "Team Manager" : "Software Engineer"],
                  ["Department",   "Engineering"],
                  ["Work Mode",    "Hybrid"],
                  ["Working Hours","9 AM – 6 PM"],
                  ["Work Location","Bangalore, India"],
                  ["Probation",    "Completed"],
                ].map(([label, value]) => (
                  <div key={label} style={s.infoRow}>
                    <span style={s.infoLabel}>{label}</span>
                    <span style={s.infoValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HR Policies tab */}
        {activeTab === "policies" && (
          <div style={s.tabContent}>
            <div style={s.policiesGrid}>
              {HR_POLICIES.map(p => (
                <div key={p.label} style={s.policyCard}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(167,139,250,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                  <div style={s.policyIcon}>{p.icon}</div>
                  <div style={s.policyLabel}>{p.label}</div>
                  <div style={s.policyValue}>{p.value}</div>
                </div>
              ))}
            </div>
            <div style={s.policyNote}>
              💬 Have questions about policies? Use the <strong style={{ color:"#a78bfa" }}>HR Chatbot</strong> for instant answers.
            </div>
          </div>
        )}

        {/* Contact tab */}
        {activeTab === "contact" && (
          <div style={s.tabContent}>
            <div style={s.infoGrid}>
              <div style={s.infoCard}>
                <div style={s.infoTitle}>Contact Information</div>
                {[
                  ["Work Email",   user?.email],
                  ["Phone",        "+91 98765 43210"],
                  ["Emergency",    "+91 98765 43211"],
                  ["Address",      "Bangalore, Karnataka, India"],
                ].map(([label, value]) => (
                  <div key={label} style={s.infoRow}>
                    <span style={s.infoLabel}>{label}</span>
                    <span style={s.infoValue}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={s.infoCard}>
                <div style={s.infoTitle}>HR Contact</div>
                {[
                  ["HR Email",    "hr@neurahr.com"],
                  ["HR Phone",   "+91 80 1234 5678"],
                  ["Grievance",  "hr@neurahr.com"],
                  ["IT Support", "it@neurahr.com"],
                ].map(([label, value]) => (
                  <div key={label} style={s.infoRow}>
                    <span style={s.infoLabel}>{label}</span>
                    <span style={s.infoValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root:{ minHeight:"100vh", background:"#0a0a0f", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  content:{ maxWidth:"1000px", margin:"0 auto", padding:"40px 24px" },
  hero:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"20px", padding:"32px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px", flexWrap:"wrap", gap:"20px" },
  heroLeft:{ display:"flex", alignItems:"center", gap:"24px", flexWrap:"wrap" },
  name:{ fontSize:"24px", fontWeight:"800", color:"#fff", margin:"0 0 8px" },
  metaRow:{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px", flexWrap:"wrap" },
  roleBadge:{ fontSize:"11px", fontWeight:"800", padding:"4px 12px", borderRadius:"100px", letterSpacing:"0.06em" },
  email:{ color:"rgba(255,255,255,0.4)", fontSize:"14px" },
  metaRow2:{ display:"flex", gap:"16px", flexWrap:"wrap" },
  metaItem:{ color:"rgba(255,255,255,0.35)", fontSize:"13px" },
  heroRight:{ },
  activeStatus:{ display:"flex", alignItems:"center", gap:"8px", color:"#34d399", fontSize:"13px", fontWeight:"600", background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:"100px", padding:"8px 16px" },
  activeDot:{ width:"8px", height:"8px", borderRadius:"50%", background:"#34d399", boxShadow:"0 0 6px #34d399" },
  statsGrid:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"24px" },
  statCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"20px", textAlign:"center" },
  statNum:{ fontSize:"28px", fontWeight:"900", lineHeight:1, marginBottom:"6px" },
  statLabel:{ fontSize:"13px", fontWeight:"600", color:"rgba(255,255,255,0.6)", marginBottom:"2px" },
  statSub:{ fontSize:"11px", color:"rgba(255,255,255,0.25)" },
  tabs:{ display:"flex", gap:"4px", marginBottom:"20px" },
  tab:{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", padding:"8px 18px", color:"rgba(255,255,255,0.4)", fontSize:"13px", fontWeight:"600", cursor:"pointer", transition:"all 0.15s" },
  tabActive:{ background:"rgba(167,139,250,0.12)", borderColor:"rgba(167,139,250,0.3)", color:"#a78bfa" },
  tabContent:{ },
  infoGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" },
  infoCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", padding:"24px" },
  infoTitle:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"20px" },
  infoRow:{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"12px", marginBottom:"12px", borderBottom:"1px solid rgba(255,255,255,0.04)" },
  infoLabel:{ fontSize:"13px", color:"rgba(255,255,255,0.35)" },
  infoValue:{ fontSize:"13px", color:"#fff", fontWeight:"600", textAlign:"right" },
  policiesGrid:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"20px" },
  policyCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"20px", textAlign:"center", cursor:"default", transition:"border-color 0.2s" },
  policyIcon:{ fontSize:"28px", marginBottom:"10px" },
  policyLabel:{ fontSize:"12px", color:"rgba(255,255,255,0.4)", marginBottom:"6px", fontWeight:"600" },
  policyValue:{ fontSize:"14px", color:"#fff", fontWeight:"700" },
  policyNote:{ background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.15)", borderRadius:"12px", padding:"16px", color:"rgba(255,255,255,0.5)", fontSize:"14px" },
};
