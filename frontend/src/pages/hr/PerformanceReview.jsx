import { useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const RATING_COLORS = {
  "Exceeds Expectations": { color:"#34d399", bg:"rgba(52,211,153,0.1)", border:"rgba(52,211,153,0.25)" },
  "Meets Expectations":   { color:"#60a5fa", bg:"rgba(96,165,250,0.1)", border:"rgba(96,165,250,0.25)" },
  "Needs Improvement":    { color:"#f87171", bg:"rgba(248,113,113,0.1)", border:"rgba(248,113,113,0.25)" },
  "Outstanding":          { color:"#fbbf24", bg:"rgba(251,191,36,0.1)", border:"rgba(251,191,36,0.25)" },
};

export default function PerformanceReview() {
  const toast = useToast();
  const [form, setForm] = useState({
    employee_name: "",
    role: "",
    period: "Q1 2026",
    notes: "",
  });
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!form.employee_name || !form.notes.trim()) {
      toast.error("Please fill in employee name and performance notes.");
      return;
    }
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post("/ai/performance-review", form);
      setResult(data.review);
      toast.success("Performance review generated!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Generation failed. Try again.");
    } finally { setLoading(false); }
  };

  const handlePrint = () => window.print();

  const ratingStyle = result ? RATING_COLORS[result.overall_rating] || RATING_COLORS["Meets Expectations"] : null;

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <div style={s.headerIcon}>📊</div>
          <div>
            <h1 style={s.title}>AI Performance Review</h1>
            <p style={s.sub}>Generate structured performance reviews from manager notes using AI</p>
          </div>
          <div style={s.aiBadge}>⚡ Powered by Groq LLaMA-3</div>
        </div>

        <div style={s.grid}>
          {/* Input */}
          <div style={s.card}>
            <div style={s.cardTitle}>Employee Details & Notes</div>

            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Employee Name *</label>
                <input value={form.employee_name}
                  onChange={e => setForm({...form, employee_name: e.target.value})}
                  placeholder="John Doe" style={s.input}
                  onFocus={e => e.target.style.borderColor = "#a78bfa"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}/>
              </div>
              <div style={s.field}>
                <label style={s.label}>Role / Position</label>
                <input value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}
                  placeholder="Senior Developer" style={s.input}
                  onFocus={e => e.target.style.borderColor = "#a78bfa"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}/>
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Review Period</label>
              <select value={form.period} onChange={e => setForm({...form, period: e.target.value})} style={s.select}>
                {["Q1 2026","Q2 2026","Q3 2026","Q4 2026","Annual 2025","Annual 2026"].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Manager's Notes & Observations *</label>
              <textarea value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                rows={10}
                placeholder={"Write what you observed about this employee...\n\nExample:\n- Delivered the payment module 2 weeks ahead of schedule\n- Helped 3 junior developers with code reviews\n- Missed 4 standups without notice\n- Great communication with clients\n- Needs to improve documentation habits"}
                style={s.textarea}
                onFocus={e => e.target.style.borderColor = "#a78bfa"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}/>
            </div>

            <button onClick={handleGenerate} disabled={loading}
              style={{ ...s.genBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? <><span style={s.spinner}/>Generating Review…</> : "🤖 Generate Performance Review"}
            </button>
          </div>

          {/* Output */}
          <div style={s.card} className="print-area">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
              <div style={s.cardTitle}>AI Generated Review</div>
              {result && (
                <button onClick={handlePrint} style={s.printBtn} className="no-print">🖨️ Export PDF</button>
              )}
            </div>

            {loading ? (
              <div style={s.loadingWrap}>
                <div style={s.pulse}/>
                <p style={s.loadingText}>Analyzing performance data…</p>
              </div>
            ) : result ? (
              <div style={s.resultWrap}>
                {/* Header */}
                <div style={s.reviewHeader}>
                  <div>
                    <div style={s.empName}>{form.employee_name}</div>
                    <div style={s.empRole}>{form.role} · {form.period}</div>
                  </div>
                  <div style={{ ...s.ratingBadge, background:ratingStyle.bg, border:`1px solid ${ratingStyle.border}`, color:ratingStyle.color }}>
                    {result.overall_rating}
                  </div>
                </div>

                {/* Score bar */}
                <div style={s.scoreWrap}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                    <span style={s.scoreLabel}>Performance Score</span>
                    <span style={{ color:ratingStyle.color, fontWeight:"800" }}>{result.score}/10</span>
                  </div>
                  <div style={s.scoreBar}>
                    <div style={{ ...s.scoreBarFill, width:`${result.score * 10}%`, background:ratingStyle.color, transition:"width 1s ease" }}/>
                  </div>
                </div>

                {/* Summary */}
                <div style={s.section}>
                  <div style={s.sectionTitle}>📋 Summary</div>
                  <p style={s.sectionText}>{result.summary}</p>
                </div>

                {/* Strengths */}
                <div style={s.section}>
                  <div style={s.sectionTitle}>💪 Strengths</div>
                  {result.strengths?.map((s2,i) => (
                    <div key={i} style={s.listItem}><span style={{ color:"#34d399" }}>✓</span> {s2}</div>
                  ))}
                </div>

                {/* Areas to improve */}
                <div style={s.section}>
                  <div style={s.sectionTitle}>🎯 Areas to Improve</div>
                  {result.improvements?.map((item,i) => (
                    <div key={i} style={s.listItem}><span style={{ color:"#fbbf24" }}>→</span> {item}</div>
                  ))}
                </div>

                {/* Goals */}
                <div style={s.section}>
                  <div style={s.sectionTitle}>🚀 Goals for Next Period</div>
                  {result.goals?.map((g,i) => (
                    <div key={i} style={s.listItem}><span style={{ color:"#a78bfa" }}>◆</span> {g}</div>
                  ))}
                </div>

                {/* Recommendation */}
                <div style={{ ...s.recBox, borderColor: ratingStyle.border, background: ratingStyle.bg }}>
                  <span style={{ color:ratingStyle.color, fontWeight:"700" }}>Manager Recommendation: </span>
                  <span style={{ color:"rgba(255,255,255,0.7)", fontSize:"13px" }}>{result.recommendation}</span>
                </div>
              </div>
            ) : (
              <div style={s.placeholder}>
                <div style={{ fontSize:"48px", opacity:0.2 }}>📊</div>
                <p style={s.placeholderText}>Fill in the details and click Generate to create an AI-powered performance review</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.95)}}
        @media print { nav,.no-print{display:none!important} body{background:#fff!important} }
      `}</style>
    </div>
  );
}

const s = {
  root:{ minHeight:"100vh", background:"#0a0a0f", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  content:{ maxWidth:"1200px", margin:"0 auto", padding:"40px 24px" },
  header:{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"32px", flexWrap:"wrap" },
  headerIcon:{ fontSize:"36px" },
  title:{ fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 0 4px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 },
  aiBadge:{ marginLeft:"auto", background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.25)", color:"#a78bfa", fontSize:"12px", fontWeight:"700", padding:"6px 14px", borderRadius:"100px" },
  grid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" },
  card:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", padding:"28px" },
  cardTitle:{ fontSize:"13px", fontWeight:"700", color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em" },
  row2:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  field:{ marginBottom:"18px" },
  label:{ display:"block", fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"8px" },
  input:{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"11px 14px", color:"#fff", fontSize:"14px", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" },
  select:{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"11px 14px", color:"#fff", fontSize:"14px", outline:"none" },
  textarea:{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"11px 14px", color:"#fff", fontSize:"13px", outline:"none", resize:"none", boxSizing:"border-box", transition:"border-color 0.2s", lineHeight:"1.7" },
  genBtn:{ width:"100%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none", borderRadius:"10px", padding:"13px", color:"#fff", fontWeight:"700", fontSize:"15px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"opacity 0.2s" },
  spinner:{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" },
  printBtn:{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"6px 14px", color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:"600", cursor:"pointer" },
  loadingWrap:{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"400px", gap:"20px" },
  pulse:{ width:"60px", height:"60px", borderRadius:"50%", background:"rgba(167,139,250,0.3)", animation:"pulse 1.5s ease infinite" },
  loadingText:{ color:"rgba(255,255,255,0.3)", fontSize:"14px" },
  resultWrap:{ display:"flex", flexDirection:"column", gap:"0px", maxHeight:"580px", overflowY:"auto" },
  reviewHeader:{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", paddingBottom:"16px", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  empName:{ fontSize:"18px", fontWeight:"800", color:"#fff", marginBottom:"4px" },
  empRole:{ fontSize:"13px", color:"rgba(255,255,255,0.4)" },
  ratingBadge:{ fontSize:"12px", fontWeight:"700", padding:"6px 14px", borderRadius:"100px" },
  scoreWrap:{ marginBottom:"20px" },
  scoreLabel:{ fontSize:"12px", color:"rgba(255,255,255,0.4)", fontWeight:"600" },
  scoreBar:{ height:"6px", background:"rgba(255,255,255,0.08)", borderRadius:"100px", overflow:"hidden" },
  scoreBarFill:{ height:"100%", borderRadius:"100px" },
  section:{ marginBottom:"16px" },
  sectionTitle:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" },
  sectionText:{ color:"rgba(255,255,255,0.7)", fontSize:"13px", lineHeight:"1.7", margin:0 },
  listItem:{ color:"rgba(255,255,255,0.7)", fontSize:"13px", lineHeight:"1.6", marginBottom:"6px", display:"flex", gap:"8px" },
  recBox:{ border:"1px solid", borderRadius:"10px", padding:"14px 16px", marginTop:"8px", fontSize:"13px" },
  placeholder:{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"400px", gap:"16px", textAlign:"center" },
  placeholderText:{ color:"rgba(255,255,255,0.2)", fontSize:"14px", maxWidth:"260px", lineHeight:"1.6" },
};
