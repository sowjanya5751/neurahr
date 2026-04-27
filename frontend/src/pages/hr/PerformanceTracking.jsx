import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const QUARTERS = ["Q1 2026","Q4 2025","Q3 2025","Q2 2025"];

const PERF_DATA = [
  { quarter:"Q1 2026", score:4.2, rating:"Exceeds Expectations", goals:[
    { title:"Complete AI module integration", status:"done", pct:100 },
    { title:"Reduce API response time by 30%", status:"done", pct:100 },
    { title:"Mentor 2 junior developers", status:"progress", pct:75 },
    { title:"Complete AWS certification", status:"progress", pct:40 },
  ], feedback:"Strong performance this quarter. Delivered the AI module ahead of schedule and improved system performance significantly." },
  { quarter:"Q4 2025", score:3.8, rating:"Meets Expectations", goals:[
    { title:"Build authentication system", status:"done", pct:100 },
    { title:"Write unit tests for core modules", status:"done", pct:100 },
    { title:"Improve code documentation", status:"done", pct:85 },
    { title:"Lead sprint planning", status:"done", pct:100 },
  ], feedback:"Consistent performance. Met all core targets and showed improvement in documentation practices." },
  { quarter:"Q3 2025", score:3.5, rating:"Meets Expectations", goals:[
    { title:"Database optimization", status:"done", pct:100 },
    { title:"Client demo preparation", status:"done", pct:100 },
    { title:"Cross-team collaboration project", status:"done", pct:90 },
  ], feedback:"Solid quarter. Good collaboration with the client team." },
];

const RATING_COLORS = {
  "Exceeds Expectations": "#34d399",
  "Meets Expectations":   "#60a5fa",
  "Needs Improvement":    "#f87171",
  "Outstanding":          "#fbbf24",
};

function ScoreGauge({ score }) {
  const pct = (score / 5) * 100;
  const color = score >= 4 ? "#34d399" : score >= 3 ? "#60a5fa" : "#f87171";
  const r = 44, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position:"relative", width:"110px", height:"110px" }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#1a1a2e" strokeWidth="10"/>
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 55 55)" style={{ transition:"stroke-dasharray 1s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:"22px", fontWeight:"900", color:"#fff" }}>{score}</span>
        <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)" }}>/ 5.0</span>
      </div>
    </div>
  );
}

function GoalItem({ goal }) {
  const color = goal.status === "done" ? "#34d399" : "#fbbf24";
  return (
    <div style={gs.wrap}>
      <div style={gs.top}>
        <span style={{ ...gs.icon, color }}>{goal.status === "done" ? "✅" : "🔄"}</span>
        <span style={gs.title}>{goal.title}</span>
        <span style={{ ...gs.pct, color }}>{goal.pct}%</span>
      </div>
      <div style={gs.barBg}>
        <div style={{ ...gs.barFill, width:`${goal.pct}%`, background:color }}/>
      </div>
    </div>
  );
}

export default function PerformanceTracking() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeQ, setActiveQ] = useState(0);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [goals, setGoals] = useState(PERF_DATA[0].goals);

  const current = PERF_DATA[activeQ] || PERF_DATA[0];
  const ratingColor = RATING_COLORS[current.rating] || "#60a5fa";

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(prev => [...prev, { title:newGoal, status:"progress", pct:0 }]);
    setNewGoal("");
    setShowAddGoal(false);
    toast.success("Goal added!");
  };

  const avgScore = (PERF_DATA.reduce((s,d) => s + d.score, 0) / PERF_DATA.length).toFixed(1);

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <div style={s.headerIcon}>📈</div>
          <div>
            <h1 style={s.title}>Performance Tracking</h1>
            <p style={s.sub}>Track goals, ratings and growth over time</p>
          </div>
        </div>

        {/* Overall stats */}
        <div style={s.overallGrid}>
          <div style={s.overallCard}>
            <ScoreGauge score={parseFloat(avgScore)} />
            <div>
              <div style={s.overallLabel}>Average Score</div>
              <div style={s.overallValue}>{avgScore} / 5.0</div>
              <div style={s.overallSub}>Across {PERF_DATA.length} quarters</div>
            </div>
          </div>
          {[
            { label:"Best Quarter", value:"Q1 2026", color:"#34d399" },
            { label:"Goals Completed", value:"11/13", color:"#a78bfa" },
            { label:"Next Review", value:"October 2026", color:"#fbbf24" },
          ].map(item => (
            <div key={item.label} style={s.miniCard}>
              <div style={s.miniLabel}>{item.label}</div>
              <div style={{ ...s.miniValue, color:item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Quarter selector */}
        <div style={s.quarterTabs}>
          {PERF_DATA.map((d,i) => (
            <button key={i} onClick={() => setActiveQ(i)}
              style={{ ...s.qTab, ...(activeQ===i ? s.qTabActive : {}) }}>
              {d.quarter}
            </button>
          ))}
        </div>

        {/* Current quarter detail */}
        <div style={s.detailGrid}>
          <div style={s.detailLeft}>
            <div style={s.detailHeader}>
              <ScoreGauge score={current.score} />
              <div>
                <div style={s.detailQuarter}>{current.quarter}</div>
                <div style={{ ...s.detailRating, color:ratingColor }}>{current.rating}</div>
                <div style={s.detailFeedback}>{current.feedback}</div>
              </div>
            </div>
          </div>

          <div style={s.detailRight}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
              <div style={s.goalsTitle}>Goals & Targets</div>
              {activeQ === 0 && (
                <button onClick={() => setShowAddGoal(true)} style={s.addGoalBtn}>+ Add Goal</button>
              )}
            </div>
            {(activeQ === 0 ? goals : current.goals).map((g,i) => (
              <GoalItem key={i} goal={g}/>
            ))}

            {showAddGoal && (
              <div style={s.addGoalForm}>
                <input value={newGoal} onChange={e => setNewGoal(e.target.value)}
                  placeholder="Enter new goal..." style={s.goalInput}
                  onKeyDown={e => e.key==="Enter" && handleAddGoal()}/>
                <div style={{ display:"flex", gap:"8px", marginTop:"10px" }}>
                  <button onClick={handleAddGoal} style={s.addBtn}>Add</button>
                  <button onClick={() => setShowAddGoal(false)} style={s.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Score trend */}
        <div style={s.trendCard}>
          <div style={s.trendTitle}>Performance Trend</div>
          <div style={s.trendBars}>
            {[...PERF_DATA].reverse().map((d,i) => {
              const h = (d.score / 5) * 120;
              const color = RATING_COLORS[d.rating] || "#60a5fa";
              return (
                <div key={i} style={s.trendBar}>
                  <div style={{ ...s.trendFill, height:`${h}px`, background:color }}/>
                  <div style={s.trendScore}>{d.score}</div>
                  <div style={s.trendQ}>{d.quarter}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const gs = {
  wrap:{ marginBottom:"14px" },
  top:{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" },
  icon:{ fontSize:"14px" },
  title:{ fontSize:"13px", color:"rgba(255,255,255,0.7)", flex:1 },
  pct:{ fontSize:"12px", fontWeight:"700" },
  barBg:{ height:"4px", background:"rgba(255,255,255,0.08)", borderRadius:"100px", overflow:"hidden" },
  barFill:{ height:"100%", borderRadius:"100px", transition:"width 0.8s ease" },
};

const s = {
  root:{ minHeight:"100vh", background:"#0a0a0f", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  content:{ maxWidth:"1100px", margin:"0 auto", padding:"40px 24px" },
  header:{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"28px" },
  headerIcon:{ fontSize:"36px" },
  title:{ fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 0 4px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 },
  overallGrid:{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"16px", marginBottom:"24px" },
  overallCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"24px", display:"flex", alignItems:"center", gap:"20px" },
  overallLabel:{ fontSize:"11px", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"4px" },
  overallValue:{ fontSize:"22px", fontWeight:"800", color:"#fff", marginBottom:"4px" },
  overallSub:{ fontSize:"12px", color:"rgba(255,255,255,0.3)" },
  miniCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"24px", display:"flex", flexDirection:"column", justifyContent:"center" },
  miniLabel:{ fontSize:"11px", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"8px" },
  miniValue:{ fontSize:"20px", fontWeight:"800" },
  quarterTabs:{ display:"flex", gap:"8px", marginBottom:"20px" },
  qTab:{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", padding:"8px 16px", color:"rgba(255,255,255,0.4)", fontSize:"13px", fontWeight:"600", cursor:"pointer" },
  qTabActive:{ background:"rgba(167,139,250,0.12)", borderColor:"rgba(167,139,250,0.3)", color:"#a78bfa" },
  detailGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"24px" },
  detailLeft:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"28px" },
  detailHeader:{ display:"flex", alignItems:"flex-start", gap:"20px" },
  detailQuarter:{ fontSize:"18px", fontWeight:"800", color:"#fff", marginBottom:"6px" },
  detailRating:{ fontSize:"14px", fontWeight:"700", marginBottom:"12px" },
  detailFeedback:{ fontSize:"13px", color:"rgba(255,255,255,0.5)", lineHeight:"1.7" },
  detailRight:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"28px" },
  goalsTitle:{ fontSize:"13px", fontWeight:"700", color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.06em" },
  addGoalBtn:{ background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.25)", borderRadius:"8px", padding:"6px 14px", color:"#a78bfa", fontSize:"12px", fontWeight:"700", cursor:"pointer" },
  addGoalForm:{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"16px", marginTop:"12px" },
  goalInput:{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"10px 14px", color:"#fff", fontSize:"14px", outline:"none", boxSizing:"border-box" },
  addBtn:{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none", borderRadius:"8px", padding:"8px 20px", color:"#fff", fontWeight:"700", fontSize:"13px", cursor:"pointer" },
  cancelBtn:{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"8px 16px", color:"rgba(255,255,255,0.5)", fontSize:"13px", cursor:"pointer" },
  trendCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"28px" },
  trendTitle:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"24px" },
  trendBars:{ display:"flex", alignItems:"flex-end", gap:"24px", height:"160px" },
  trendBar:{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", flex:1 },
  trendFill:{ width:"100%", borderRadius:"6px 6px 0 0", transition:"height 1s ease" },
  trendScore:{ fontSize:"14px", fontWeight:"800", color:"#fff" },
  trendQ:{ fontSize:"11px", color:"rgba(255,255,255,0.3)", textAlign:"center" },
};
