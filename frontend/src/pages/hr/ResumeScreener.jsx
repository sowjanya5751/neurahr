import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const REC = {
  Hire:     { bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.3)",  text:"#34d399", dot:"#10b981" },
  Consider: { bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.3)",  text:"#fbbf24", dot:"#f59e0b" },
  Reject:   { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   text:"#f87171", dot:"#ef4444" },
};

function ScoreRing({ score }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 52, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position:"relative", width:"128px", height:"128px", flexShrink:0 }}>
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#1a1a2e" strokeWidth="12"/>
        <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 64 64)" style={{ transition:"stroke-dasharray 1.2s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:"28px", fontWeight:"900", color:"#fff", lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginTop:"2px" }}>/ 100</span>
      </div>
    </div>
  );
}

function Chip({ label, type }) {
  const matched = type === "matched";
  return (
    <span style={{ fontSize:"12px", fontWeight:"600", padding:"4px 12px", borderRadius:"100px",
      background: matched ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
      border: `1px solid ${matched ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
      color: matched ? "#34d399" : "#f87171" }}>
      {label}
    </span>
  );
}

export default function ResumeScreener() {
  const toast   = useToast();
  const [file,     setFile]     = useState(null);
  const [jd,       setJd]       = useState("");
  const [result,   setResult]   = useState(null);
  const [past,     setPast]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchPast(); }, []);

  const fetchPast = async () => {
    try { const { data } = await api.get("/recruitment/results"); setPast(data); } catch {}
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") { setFile(f); setError(""); }
    else setError("Only PDF files are supported.");
  };

  const handleScreen = async () => {
    if (!file || !jd.trim()) { setError("Please upload a PDF and enter a job description."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("job_description", jd);
      const { data } = await api.post("/recruitment/screen", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(data.result);
      fetchPast();
      toast.success("Resume screened successfully!");
    } catch (err) {
      const msg = err.response?.data?.detail || "Screening failed. Try again.";
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handlePrint = () => { window.print(); toast.info("Opening print dialog…"); };
  const rec = result ? REC[result.recommendation] || REC.Consider : null;

  return (
    <div style={s.root}>
      <Navbar />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @media print{nav,.no-print{display:none!important}}`}</style>

      <div style={s.content}>
        <div style={s.header}>
          <h1 style={s.title}>🔍 AI Resume Screener</h1>
          <p style={s.sub}>Upload PDF + job description → instant AI evaluation</p>
        </div>

        {/* Upload + JD grid */}
        <div style={s.grid}>
          {/* Drop zone */}
          <div style={s.card}>
            <div style={s.cardLabel}>1. Upload Resume (PDF)</div>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              style={{ ...s.dropzone,
                borderColor: dragging ? "#a78bfa" : file ? "#10b981" : "rgba(255,255,255,0.15)",
                background:  dragging ? "rgba(167,139,250,0.05)" : file ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)",
              }}>
              <input ref={fileRef} type="file" accept=".pdf" style={{ display:"none" }}
                onChange={e => { setFile(e.target.files[0]); setError(""); }}/>
              {file ? (
                <>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>📄</div>
                  <div style={{ color:"#34d399", fontWeight:"700", fontSize:"14px", marginBottom:"4px" }}>{file.name}</div>
                  <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"12px" }}>{(file.size/1024).toFixed(1)} KB · Click to change</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>📁</div>
                  <div style={{ color:"rgba(255,255,255,0.6)", fontWeight:"600", fontSize:"14px", marginBottom:"4px" }}>Drop PDF here or click to browse</div>
                  <div style={{ color:"rgba(255,255,255,0.25)", fontSize:"12px" }}>Only PDF files supported</div>
                </>
              )}
            </div>
          </div>

          {/* JD */}
          <div style={s.card}>
            <div style={s.cardLabel}>2. Job Description</div>
            <textarea value={jd} onChange={e => setJd(e.target.value)} rows={10}
              placeholder={"Paste the job description here...\n\nExample:\nWe are looking for a React developer with 2+ years experience in FastAPI, Python, and PostgreSQL..."}
              style={s.textarea}
              onFocus={e => e.target.style.borderColor = "#a78bfa"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}/>
          </div>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        <button onClick={handleScreen} disabled={loading || !file || !jd.trim()}
          style={{ ...s.screenBtn, opacity:(loading || !file || !jd.trim()) ? 0.45 : 1 }}>
          {loading ? <><span style={s.spinner}/> Analysing with AI…</> : "🔍 Screen Resume with AI"}
        </button>

        {/* Result */}
        {result && rec && (
          <div style={s.resultCard}>
            <div style={s.resultHeader}>
              <ScoreRing score={result.match_score || 0}/>
              <div style={{ flex:1 }}>
                <h2 style={s.candidateName}>{result.candidate_name || "Candidate"}</h2>
                <p style={s.expSummary}>{result.experience_summary}</p>
                <div style={{ ...s.recBadge, background:rec.bg, border:`1px solid ${rec.border}`, color:rec.text }}>
                  <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:rec.dot, display:"inline-block" }}/>
                  {result.recommendation}
                </div>
              </div>
              <button onClick={handlePrint} className="no-print" style={s.printBtn}>🖨️ Download Report</button>
            </div>

            <div style={s.skillsRow}>
              <div>
                <div style={s.skillsLabel}>✅ Skills Matched</div>
                <div style={s.chipWrap}>
                  {result.skills_matched?.map((sk,i) => <Chip key={i} label={sk} type="matched"/>)}
                  {!result.skills_matched?.length && <span style={s.noSkill}>None detected</span>}
                </div>
              </div>
              <div>
                <div style={s.skillsLabel}>❌ Skills Missing</div>
                <div style={s.chipWrap}>
                  {result.skills_missing?.map((sk,i) => <Chip key={i} label={sk} type="missing"/>)}
                  {!result.skills_missing?.length && <span style={{ color:"#34d399", fontSize:"13px" }}>No major gaps!</span>}
                </div>
              </div>
            </div>

            <div style={s.swotRow}>
              <div style={s.strengthBox}>
                <div style={s.swotTitle}>💪 Strengths</div>
                {result.strengths?.map((st,i) => (
                  <div key={i} style={s.swotItem}><span style={{ color:"#34d399" }}>•</span> {st}</div>
                ))}
              </div>
              <div style={s.weakBox}>
                <div style={s.swotTitle}>⚠️ Weaknesses</div>
                {result.weaknesses?.map((w,i) => (
                  <div key={i} style={s.swotItem}><span style={{ color:"#f87171" }}>•</span> {w}</div>
                ))}
              </div>
            </div>

            <div style={s.questionsBox}>
              <div style={s.questionsTitle}>💡 Suggested Interview Questions</div>
              {result.interview_questions?.map((q,i) => (
                <div key={i} style={s.question}>
                  <span style={s.qNum}>Q{i+1}</span>
                  <span style={s.qText}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past screenings */}
        {past.length > 0 && (
          <div style={s.pastWrap}>
            <div style={s.pastTitle}>Past Screenings ({past.length})</div>
            {past.map(p => {
              const c = REC[p.recommendation] || REC.Consider;
              return (
                <div key={p.id} style={s.pastRow}>
                  <div>
                    <div style={s.pastName}>{p.candidate_name || "Unknown"}</div>
                    <div style={s.pastDate}>{new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <span style={s.pastScore}>{p.match_score}/100</span>
                    <span style={{ fontSize:"11px", fontWeight:"700", padding:"4px 12px", borderRadius:"100px", color:c.text, background:c.bg, border:`1px solid ${c.border}` }}>
                      {p.recommendation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root:{ minHeight:"100vh", background:"#0a0a0f", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  content:{ maxWidth:"1100px", margin:"0 auto", padding:"40px 24px" },
  header:{ marginBottom:"32px" },
  title:{ fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 0 6px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 },
  grid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"20px" },
  card:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"24px" },
  cardLabel:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"16px" },
  dropzone:{ border:"2px dashed", borderRadius:"12px", padding:"40px 20px", textAlign:"center", cursor:"pointer", transition:"all 0.2s" },
  textarea:{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", padding:"14px", color:"#fff", fontSize:"13px", outline:"none", resize:"none", boxSizing:"border-box", transition:"border-color 0.2s", lineHeight:"1.6", fontFamily:"inherit" },
  errorBox:{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171", borderRadius:"12px", padding:"12px 16px", fontSize:"13px", marginBottom:"16px" },
  screenBtn:{ width:"100%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none", borderRadius:"12px", padding:"16px", color:"#fff", fontWeight:"700", fontSize:"16px", cursor:"pointer", marginBottom:"32px", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", transition:"opacity 0.2s" },
  spinner:{ width:"18px", height:"18px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" },
  resultCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"20px", padding:"32px", marginBottom:"32px", animation:"fadeUp 0.5s ease" },
  resultHeader:{ display:"flex", alignItems:"center", gap:"24px", marginBottom:"28px", flexWrap:"wrap" },
  candidateName:{ fontSize:"22px", fontWeight:"800", color:"#fff", margin:"0 0 6px" },
  expSummary:{ color:"rgba(255,255,255,0.45)", fontSize:"14px", margin:"0 0 12px", lineHeight:"1.5" },
  recBadge:{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"6px 16px", borderRadius:"100px", fontSize:"13px", fontWeight:"700" },
  printBtn:{ marginLeft:"auto", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"10px 18px", color:"rgba(255,255,255,0.7)", fontSize:"13px", fontWeight:"600", cursor:"pointer" },
  skillsRow:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"20px" },
  skillsLabel:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"12px" },
  chipWrap:{ display:"flex", flexWrap:"wrap", gap:"8px" },
  noSkill:{ color:"rgba(255,255,255,0.25)", fontSize:"13px" },
  swotRow:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"20px" },
  strengthBox:{ background:"rgba(16,185,129,0.05)", border:"1px solid rgba(16,185,129,0.15)", borderRadius:"14px", padding:"18px" },
  weakBox:{ background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:"14px", padding:"18px" },
  swotTitle:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"12px" },
  swotItem:{ fontSize:"13px", color:"rgba(255,255,255,0.7)", marginBottom:"8px", lineHeight:"1.5", display:"flex", gap:"8px" },
  questionsBox:{ background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.15)", borderRadius:"14px", padding:"20px" },
  questionsTitle:{ fontSize:"11px", fontWeight:"700", color:"#a78bfa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"16px" },
  question:{ display:"flex", gap:"14px", marginBottom:"12px", alignItems:"flex-start" },
  qNum:{ color:"#a78bfa", fontWeight:"800", fontSize:"13px", minWidth:"24px" },
  qText:{ color:"rgba(255,255,255,0.75)", fontSize:"13px", lineHeight:"1.6" },
  pastWrap:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", padding:"24px" },
  pastTitle:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" },
  pastRow:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", flexWrap:"wrap", gap:"8px" },
  pastName:{ color:"#fff", fontWeight:"600", fontSize:"14px", marginBottom:"2px" },
  pastDate:{ color:"rgba(255,255,255,0.3)", fontSize:"12px" },
  pastScore:{ color:"#fff", fontWeight:"700", fontSize:"14px" },
};
