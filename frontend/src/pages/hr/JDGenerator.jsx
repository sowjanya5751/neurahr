import { useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const TEMPLATES = [
  "Frontend Developer", "Backend Engineer", "Data Scientist",
  "HR Manager", "Product Manager", "DevOps Engineer",
  "AI/ML Engineer", "UI/UX Designer", "Full Stack Developer"
];

export default function JDGenerator() {
  const toast = useToast();
  const [jobTitle,    setJobTitle]    = useState("");
  const [experience,  setExperience]  = useState("2-4 years");
  const [skills,      setSkills]      = useState("");
  const [generated,   setGenerated]   = useState("");
  const [loading,     setLoading]     = useState(false);
  const [copied,      setCopied]      = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle.trim()) { toast.error("Please enter a job title."); return; }
    setLoading(true); setGenerated("");
    try {
      const { data } = await api.post("/ai/generate-jd", {
        job_title: jobTitle,
        experience,
        skills: skills || "to be determined based on role",
      });
      setGenerated(data.job_description);
      toast.success("Job description generated!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Generation failed. Try again.");
    } finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <div style={s.headerIcon}>✍️</div>
          <div>
            <h1 style={s.title}>AI Job Description Generator</h1>
            <p style={s.sub}>Generate professional job descriptions in seconds using AI</p>
          </div>
          <div style={s.aiBadge}>⚡ Powered by Groq LLaMA-3</div>
        </div>

        <div style={s.grid}>
          {/* Left — Input */}
          <div style={s.card}>
            <div style={s.cardTitle}>Job Details</div>

            <div style={s.field}>
              <label style={s.label}>Job Title *</label>
              <input
                value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Senior React Developer"
                style={s.input}
                onFocus={e => e.target.style.borderColor = "#a78bfa"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Quick Templates</label>
              <div style={s.templates}>
                {TEMPLATES.map(t => (
                  <button key={t} onClick={() => setJobTitle(t)}
                    style={{ ...s.templateBtn, ...(jobTitle === t ? s.templateActive : {}) }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Experience Level</label>
              <select value={experience} onChange={e => setExperience(e.target.value)} style={s.select}>
                <option>0-1 years (Fresher)</option>
                <option>1-2 years (Junior)</option>
                <option>2-4 years (Mid-level)</option>
                <option>4-7 years (Senior)</option>
                <option>7+ years (Lead/Principal)</option>
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Key Skills (optional)</label>
              <textarea
                value={skills} onChange={e => setSkills(e.target.value)}
                placeholder="React, Node.js, PostgreSQL, AWS..."
                rows={3} style={s.textarea}
                onFocus={e => e.target.style.borderColor = "#a78bfa"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            <button onClick={handleGenerate} disabled={loading} style={{ ...s.genBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? <><span style={s.spinner}/>Generating…</> : "🤖 Generate with AI"}
            </button>
          </div>

          {/* Right — Output */}
          <div style={s.card}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
              <div style={s.cardTitle}>Generated Job Description</div>
              {generated && (
                <button onClick={handleCopy} style={s.copyBtn}>
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              )}
            </div>

            {loading ? (
              <div style={s.loadingWrap}>
                <div style={s.loadingDots}>
                  {[0,1,2].map(i => <div key={i} style={{ ...s.dot, animationDelay:`${i*0.2}s` }}/>)}
                </div>
                <p style={s.loadingText}>AI is crafting your job description…</p>
              </div>
            ) : generated ? (
              <div style={s.output}>
                <pre style={s.pre}>{generated}</pre>
              </div>
            ) : (
              <div style={s.placeholder}>
                <div style={s.placeholderIcon}>📝</div>
                <p style={s.placeholderText}>Fill in the details and click Generate to create a professional job description using AI</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}

const s = {
  root:{ minHeight:"100vh", background:"#0a0a0f", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  content:{ maxWidth:"1100px", margin:"0 auto", padding:"40px 24px" },
  header:{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"32px", flexWrap:"wrap" },
  headerIcon:{ fontSize:"36px" },
  title:{ fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 0 4px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 },
  aiBadge:{ marginLeft:"auto", background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.25)", color:"#a78bfa", fontSize:"12px", fontWeight:"700", padding:"6px 14px", borderRadius:"100px" },
  grid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" },
  card:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", padding:"28px" },
  cardTitle:{ fontSize:"13px", fontWeight:"700", color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"20px" },
  field:{ marginBottom:"20px" },
  label:{ display:"block", fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"8px" },
  input:{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"11px 14px", color:"#fff", fontSize:"14px", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" },
  select:{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"11px 14px", color:"#fff", fontSize:"14px", outline:"none" },
  textarea:{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"11px 14px", color:"#fff", fontSize:"14px", outline:"none", resize:"none", boxSizing:"border-box", transition:"border-color 0.2s" },
  templates:{ display:"flex", flexWrap:"wrap", gap:"8px" },
  templateBtn:{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", padding:"6px 12px", color:"rgba(255,255,255,0.5)", fontSize:"12px", cursor:"pointer", transition:"all 0.15s" },
  templateActive:{ background:"rgba(167,139,250,0.12)", borderColor:"rgba(167,139,250,0.4)", color:"#a78bfa" },
  genBtn:{ width:"100%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none", borderRadius:"10px", padding:"13px", color:"#fff", fontWeight:"700", fontSize:"15px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"opacity 0.2s" },
  spinner:{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" },
  copyBtn:{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", padding:"6px 14px", color:"rgba(255,255,255,0.6)", fontSize:"13px", fontWeight:"600", cursor:"pointer" },
  output:{ maxHeight:"480px", overflowY:"auto" },
  pre:{ color:"rgba(255,255,255,0.8)", fontSize:"13px", lineHeight:"1.8", whiteSpace:"pre-wrap", margin:0, fontFamily:"inherit" },
  loadingWrap:{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"300px", gap:"16px" },
  loadingDots:{ display:"flex", gap:"8px" },
  dot:{ width:"10px", height:"10px", borderRadius:"50%", background:"#a78bfa", animation:"bounce 0.6s ease infinite" },
  loadingText:{ color:"rgba(255,255,255,0.3)", fontSize:"14px" },
  placeholder:{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"300px", gap:"16px", textAlign:"center" },
  placeholderIcon:{ fontSize:"48px", opacity:0.3 },
  placeholderText:{ color:"rgba(255,255,255,0.2)", fontSize:"14px", maxWidth:"260px", lineHeight:"1.6" },
};
