import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";

const REC_COLORS = {
  Hire:      { bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400", dot: "bg-emerald-400" },
  Consider:  { bg: "bg-amber-500/15",   border: "border-amber-500/40",   text: "text-amber-400",   dot: "bg-amber-400"   },
  Reject:    { bg: "bg-red-500/15",     border: "border-red-500/40",     text: "text-red-400",     dot: "bg-red-400"     },
};

function ScoreRing({ score }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 44, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#1f2937" strokeWidth="10"/>
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 56 56)" style={{ transition: "stroke-dasharray 1s ease" }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

function SkillChip({ label, type }) {
  const styles = type === "matched"
    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
    : "bg-red-500/15 text-red-400 border border-red-500/30";
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles}`}>{label}</span>;
}

export default function ResumeScreener() {
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
    try {
      const { data } = await api.get("/recruitment/results");
      setPast(data);
    } catch {}
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
    else setError("Only PDF files are supported.");
  };

  const handleScreen = async () => {
    if (!file || !jd.trim()) { setError("Please upload a PDF resume and enter a job description."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("job_description", jd);
      const { data } = await api.post("/recruitment/screen", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data.result);
      fetchPast();
    } catch (err) {
      setError(err.response?.data?.detail || "Screening failed. Try again.");
    } finally { setLoading(false); }
  };

  const rec = result ? REC_COLORS[result.recommendation] || REC_COLORS.Consider : null;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">AI Resume Screener</h1>
          <p className="text-gray-500 text-sm mt-1">Upload a PDF resume + job description → instant AI evaluation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upload */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">1. Upload Resume (PDF)</h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${dragging ? "border-violet-400 bg-violet-500/10" : file ? "border-emerald-500/50 bg-emerald-500/5" : "border-gray-700 hover:border-gray-600"}`}>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                onChange={(e) => { setFile(e.target.files[0]); setError(""); }}/>
              {file ? (
                <>
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-emerald-400 font-medium text-sm">{file.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{(file.size/1024).toFixed(1)} KB — Click to change</p>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-gray-400 text-sm font-medium">Drop PDF here or click to browse</p>
                  <p className="text-gray-600 text-xs mt-1">Only PDF files supported</p>
                </>
              )}
            </div>
          </div>

          {/* JD */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">2. Job Description</h2>
            <textarea value={jd} onChange={(e) => setJd(e.target.value)}
              rows={8} placeholder="Paste the job description here...&#10;&#10;Example:&#10;We are looking for a React developer with 2+ years experience in FastAPI, Python, and PostgreSQL..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none transition-colors"/>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        <button onClick={handleScreen} disabled={loading || !file || !jd.trim()}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors mb-10 flex items-center justify-center gap-2">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Analysing resume with AI…</>
          ) : "🔍 Screen Resume with AI"}
        </button>

        {/* Result */}
        {result && rec && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-10 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8">
              <ScoreRing score={result.match_score || 0}/>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{result.candidate_name || "Candidate"}</h2>
                <p className="text-gray-400 text-sm mt-1">{result.experience_summary}</p>
                <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full border text-sm font-semibold ${rec.bg} ${rec.border} ${rec.text}`}>
                  <span className={`w-2 h-2 rounded-full ${rec.dot}`}/>
                  {result.recommendation}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Skills Matched</p>
                <div className="flex flex-wrap gap-2">
                  {result.skills_matched?.map((s,i) => <SkillChip key={i} label={s} type="matched"/>)}
                  {!result.skills_matched?.length && <p className="text-gray-600 text-sm">None detected</p>}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Skills Missing</p>
                <div className="flex flex-wrap gap-2">
                  {result.skills_missing?.map((s,i) => <SkillChip key={i} label={s} type="missing"/>)}
                  {!result.skills_missing?.length && <p className="text-emerald-400 text-sm">No major gaps</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-3">✓ Strengths</p>
                {result.strengths?.map((s,i) => (
                  <div key={i} className="flex gap-2 mb-2"><span className="text-emerald-400 mt-0.5 text-xs">•</span><p className="text-sm text-gray-300">{s}</p></div>
                ))}
              </div>
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-3">⚠ Weaknesses</p>
                {result.weaknesses?.map((w,i) => (
                  <div key={i} className="flex gap-2 mb-2"><span className="text-red-400 mt-0.5 text-xs">•</span><p className="text-sm text-gray-300">{w}</p></div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-5">
              <p className="text-xs text-violet-400 font-semibold uppercase tracking-wide mb-3">💡 Suggested Interview Questions</p>
              {result.interview_questions?.map((q,i) => (
                <div key={i} className="flex gap-3 mb-3 last:mb-0">
                  <span className="text-violet-400 font-bold text-sm min-w-[20px]">Q{i+1}</span>
                  <p className="text-sm text-gray-300">{q}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past screenings */}
        {past.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Past Screenings ({past.length})</h2>
            <div className="space-y-2">
              {past.map((p) => {
                const c = REC_COLORS[p.recommendation] || REC_COLORS.Consider;
                return (
                  <div key={p.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{p.candidate_name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">{p.match_score}/100</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.bg} ${c.border} ${c.text}`}>
                        {p.recommendation}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
