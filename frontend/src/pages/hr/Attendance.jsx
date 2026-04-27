import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function generateMonthData() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const records = [];
  for (let d = 1; d <= Math.min(today.getDate(), daysInMonth); d++) {
    const date = new Date(year, month, d);
    const day = date.getDay();
    if (day === 0 || day === 6) { records.push({ date: d, day: DAYS[day], status: "weekend", in: "-", out: "-" }); continue; }
    const rand = Math.random();
    if (rand > 0.9) { records.push({ date: d, day: DAYS[day], status: "absent", in: "-", out: "-" }); continue; }
    if (rand > 0.8) { records.push({ date: d, day: DAYS[day], status: "late", in: "09:45 AM", out: "06:12 PM" }); continue; }
    records.push({ date: d, day: DAYS[day], status: "present", in: `0${Math.floor(Math.random()*2)+8}:${Math.random()>0.5?"00":"30"} AM`, out: "06:00 PM" });
  }
  return records;
}

const STATUS_STYLE = {
  present: { color:"#34d399", bg:"rgba(52,211,153,0.1)",  label:"Present" },
  absent:  { color:"#f87171", bg:"rgba(248,113,113,0.1)", label:"Absent"  },
  late:    { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",  label:"Late"    },
  weekend: { color:"rgba(255,255,255,0.2)", bg:"rgba(255,255,255,0.03)", label:"Weekend" },
};

export default function Attendance() {
  const { user } = useAuth();
  const toast = useToast();
  const [records]    = useState(generateMonthData);
  const [clockedIn,  setClockedIn]  = useState(false);
  const [clockTime,  setClockTime]  = useState(null);
  const [liveTime,   setLiveTime]   = useState(new Date());
  const [todayHours, setTodayHours] = useState("0h 0m");

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
      if (clockedIn && clockTime) {
        const diff = Math.floor((Date.now() - clockTime) / 1000);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        setTodayHours(`${h}h ${m}m`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [clockedIn, clockTime]);

  const handleClock = () => {
    if (!clockedIn) {
      setClockedIn(true);
      setClockTime(Date.now());
      toast.success("Clocked in successfully!");
    } else {
      setClockedIn(false);
      toast.success("Clocked out. Have a great day!");
    }
  };

  const present  = records.filter(r => r.status === "present").length;
  const absent   = records.filter(r => r.status === "absent").length;
  const late     = records.filter(r => r.status === "late").length;
  const workdays = records.filter(r => r.status !== "weekend").length;
  const pct      = workdays ? Math.round(((present + late) / workdays) * 100) : 0;

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <div style={s.headerIcon}>⏰</div>
          <div>
            <h1 style={s.title}>Attendance Tracker</h1>
            <p style={s.sub}>Track your daily attendance and monthly summary</p>
          </div>
          <div style={s.liveClock}>
            {liveTime.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
          </div>
        </div>

        {/* Clock in/out */}
        <div style={s.clockCard}>
          <div style={s.clockLeft}>
            <div style={s.clockDate}>
              {liveTime.toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
            </div>
            <div style={s.clockStatus}>
              Status: <span style={{ color: clockedIn ? "#34d399" : "rgba(255,255,255,0.3)", fontWeight:"700" }}>
                {clockedIn ? "● Clocked In" : "○ Not Clocked In"}
              </span>
            </div>
            {clockedIn && <div style={s.clockHours}>Today: <span style={{ color:"#a78bfa", fontWeight:"700" }}>{todayHours}</span></div>}
          </div>
          <button onClick={handleClock}
            style={{ ...s.clockBtn, background: clockedIn ? "linear-gradient(135deg,#dc2626,#f87171)" : "linear-gradient(135deg,#059669,#34d399)" }}>
            {clockedIn ? "🔴 Clock Out" : "🟢 Clock In"}
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label:"Present", value:present, color:"#34d399", icon:"✅" },
            { label:"Absent",  value:absent,  color:"#f87171", icon:"❌" },
            { label:"Late",    value:late,    color:"#fbbf24", icon:"⏰" },
            { label:"Attendance %", value:`${pct}%`, color:"#a78bfa", icon:"📊" },
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={s.statIcon}>{st.icon}</div>
              <div style={{ ...s.statNum, color:st.color }}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Monthly calendar table */}
        <div style={s.tableWrap}>
          <div style={s.tableTitle}>{MONTHS[new Date().getMonth()]} {new Date().getFullYear()} — Attendance Log</div>
          <table style={s.table}>
            <thead>
              <tr>{["Date","Day","Status","Clock In","Clock Out"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {records.map(r => {
                const st = STATUS_STYLE[r.status];
                return (
                  <tr key={r.date} style={s.tr}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <td style={s.td}><span style={s.dateNum}>{r.date}</span></td>
                    <td style={s.td}><span style={s.dayName}>{r.day}</span></td>
                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, color:st.color, background:st.bg }}>{st.label}</span>
                    </td>
                    <td style={s.td}><span style={s.timeText}>{r.in}</span></td>
                    <td style={s.td}><span style={s.timeText}>{r.out}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s = {
  root:{ minHeight:"100vh", background:"#0a0a0f", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  content:{ maxWidth:"1000px", margin:"0 auto", padding:"40px 24px" },
  header:{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"28px", flexWrap:"wrap" },
  headerIcon:{ fontSize:"36px" },
  title:{ fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 0 4px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 },
  liveClock:{ marginLeft:"auto", fontSize:"24px", fontWeight:"800", color:"#a78bfa", fontVariantNumeric:"tabular-nums", letterSpacing:"1px" },
  clockCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"28px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"20px" },
  clockLeft:{ display:"flex", flexDirection:"column", gap:"8px" },
  clockDate:{ fontSize:"15px", fontWeight:"600", color:"#fff" },
  clockStatus:{ fontSize:"13px", color:"rgba(255,255,255,0.4)" },
  clockHours:{ fontSize:"13px", color:"rgba(255,255,255,0.4)" },
  clockBtn:{ border:"none", borderRadius:"12px", padding:"14px 32px", color:"#fff", fontWeight:"800", fontSize:"16px", cursor:"pointer", transition:"opacity 0.2s" },
  statsGrid:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"24px" },
  statCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px", padding:"20px", textAlign:"center" },
  statIcon:{ fontSize:"24px", marginBottom:"8px" },
  statNum:{ fontSize:"28px", fontWeight:"900", lineHeight:1, marginBottom:"4px" },
  statLabel:{ fontSize:"12px", color:"rgba(255,255,255,0.4)", fontWeight:"600" },
  tableWrap:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", overflow:"hidden" },
  tableTitle:{ fontSize:"13px", fontWeight:"700", color:"rgba(255,255,255,0.4)", padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)", textTransform:"uppercase", letterSpacing:"0.06em" },
  table:{ width:"100%", borderCollapse:"collapse" },
  th:{ padding:"12px 20px", textAlign:"left", fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.08em" },
  tr:{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" },
  td:{ padding:"14px 20px" },
  dateNum:{ fontSize:"14px", fontWeight:"700", color:"#fff" },
  dayName:{ fontSize:"13px", color:"rgba(255,255,255,0.5)" },
  statusBadge:{ fontSize:"11px", fontWeight:"700", padding:"4px 10px", borderRadius:"100px" },
  timeText:{ fontSize:"13px", color:"rgba(255,255,255,0.5)", fontVariantNumeric:"tabular-nums" },
};
