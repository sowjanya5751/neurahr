import { useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const EXAMPLE_QUERIES = [
  "Show all HR employees",
  "Find candidates with score above 80",
  "Who was recommended for hire?",
  "List all admin users",
  "Find rejected candidates",
  "Show employees with manager role",
];

function ResultCard({ item, type }) {
  const navigate = useNavigate();
  if (type === "employee") {
    const roleColors = { admin:"#a78bfa", hr:"#60a5fa", manager:"#fbbf24", employee:"#34d399" };
    const color = roleColors[item.role] || "#34d399";
    const initials = item.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
    return (
      <div style={rs.card} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(167,139,250,0.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}>
        <div style={{ ...rs.avatar, background:`linear-gradient(135deg,${color},${color}88)` }}>{initials}</div>
        <div style={rs.info}>
          <div style={rs.name}>{item.name}</div>
          <div style={rs.email}>{item.email}</div>
        </div>
        <span style={{ ...rs.badge, color, background:`${color}18` }}>{item.role?.toUpperCase()}</span>
      </div>
    );
  }
  if (type === "screening") {
    const recColors = { Hire:"#34d399", Consider:"#fbbf24", Reject:"#f87171" };
    const color = recColors[item.recommendation] || "#60a5fa";
    return (
      <div style={rs.card} onClick={() => navigate("/hr/resume")}
        onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(167,139,250,0.3)"}
        onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}>
        <div style={{ ...rs.avatar, background:"rgba(167,139,250,0.15)", fontSize:"20px" }}>📄</div>
        <div style={rs.info}>
          <div style={rs.name}>{item.candidate_name || "Unknown Candidate"}</div>
          <div style={rs.email}>{new Date(item.created_at).toLocaleDateString("en-IN")}</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px" }}>
          <span style={rs.score}>{item.match_score}/100</span>
          <span style={{ ...rs.badge, color, background:`${color}18` }}>{item.recommendation}</span>
        </div>
      </div>
    );
  }
  return null;
}

function SkeletonCard() {
  return (
    <div style={{ ...rs.card, pointerEvents:"none" }}>
      <div style={{ ...rs.avatar, background:"rgba(255,255,255,0.06)" }}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"8px" }}>
        <div className="skeleton" style={{ height:"16px", width:"60%", borderRadius:"6px" }}/>
        <div className="skeleton" style={{ height:"12px", width:"40%", borderRadius:"6px" }}/>
      </div>
    </div>
  );
}

export default function AISearch() {
  const toast = useToast();
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const inputRef = useRef();

  const handleSearch = async (q) => {
    const searchQuery = q || query.trim();
    if (!searchQuery) return;
    setQuery(searchQuery);
    setLoading(true);
    setResults(null);
    setAiAnswer("");

    try {
      // Fetch all data in parallel
      const [empRes, screenRes] = await Promise.allSettled([
        api.get("/auth/users"),
        api.get("/recruitment/results"),
      ]);

      const employees = empRes.status === "fulfilled" ? empRes.value.data : [];
      const screenings = screenRes.status === "fulfilled" ? screenRes.value.data : [];

      // AI-powered filtering using natural language
      const { data } = await api.post("/ai/smart-search", {
        query: searchQuery,
        employees,
        screenings,
      });

      setResults(data.results);
      setAiAnswer(data.answer);
    } catch (err) {
      // Fallback: client-side search
      const empRes = await api.get("/auth/users").catch(() => ({ data: [] }));
      const scrRes = await api.get("/recruitment/results").catch(() => ({ data: [] }));

      const q2 = searchQuery.toLowerCase();
      const filteredEmp = empRes.data.filter(e =>
        e.name?.toLowerCase().includes(q2) ||
        e.email?.toLowerCase().includes(q2) ||
        e.role?.toLowerCase().includes(q2)
      );
      const filteredScr = scrRes.data.filter(s =>
        s.candidate_name?.toLowerCase().includes(q2) ||
        s.recommendation?.toLowerCase().includes(q2)
      );

      setResults({ employees: filteredEmp, screenings: filteredScr });
      setAiAnswer(`Found ${filteredEmp.length} employees and ${filteredScr.length} screening results matching "${searchQuery}".`);
      toast.info("Using basic search — AI search unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results ? (results.employees?.length || 0) + (results.screenings?.length || 0) : 0;

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <div style={s.headerIcon}>🔍</div>
          <div>
            <h1 style={s.title}>AI Smart Search</h1>
            <p style={s.sub}>Search employees and screening results using natural language</p>
          </div>
          <div style={s.aiBadge}>⚡ Powered by Groq LLaMA-3</div>
        </div>

        {/* Search bar */}
        <div style={s.searchWrap}>
          <div style={s.searchBar}>
            <span style={s.searchIcon}>🔍</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Try: 'Find all HR employees' or 'Show candidates with score above 70'"
              style={s.searchInput}
              autoFocus
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults(null); setAiAnswer(""); }} style={s.clearBtn}>✕</button>
            )}
            <button onClick={() => handleSearch()} disabled={loading || !query.trim()} style={s.searchBtn}>
              {loading ? <span style={s.spinner}/> : "Search"}
            </button>
          </div>
        </div>

        {/* Example queries */}
        {!results && !loading && (
          <div style={s.examples}>
            <div style={s.examplesTitle}>Try these examples:</div>
            <div style={s.examplesGrid}>
              {EXAMPLE_QUERIES.map((q, i) => (
                <button key={i} onClick={() => handleSearch(q)} style={s.exampleBtn}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#a78bfa"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
                  <span style={s.exampleIcon}>💬</span> {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={s.resultsWrap}>
            <div style={s.aiAnswerSkeleton}>
              <div className="skeleton" style={{ height:"16px", width:"80%", borderRadius:"8px", marginBottom:"8px" }}/>
              <div className="skeleton" style={{ height:"16px", width:"60%", borderRadius:"8px" }}/>
            </div>
            {[1,2,3].map(i => <SkeletonCard key={i}/>)}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div style={s.resultsWrap}>
            {/* AI Answer */}
            {aiAnswer && (
              <div style={s.aiAnswer}>
                <span style={s.aiAnswerIcon}>🤖</span>
                <div>
                  <div style={s.aiAnswerLabel}>AI Answer</div>
                  <div style={s.aiAnswerText}>{aiAnswer}</div>
                </div>
              </div>
            )}

            {/* Count */}
            <div style={s.resultCount}>
              {totalResults === 0
                ? `No results found for "${query}"`
                : `${totalResults} result${totalResults !== 1 ? "s" : ""} for "${query}"`
              }
            </div>

            {/* Employees */}
            {results.employees?.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionTitle}>👥 Employees ({results.employees.length})</div>
                {results.employees.map((emp, i) => (
                  <ResultCard key={i} item={emp} type="employee"/>
                ))}
              </div>
            )}

            {/* Screenings */}
            {results.screenings?.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionTitle}>📄 Screening Results ({results.screenings.length})</div>
                {results.screenings.map((scr, i) => (
                  <ResultCard key={i} item={scr} type="screening"/>
                ))}
              </div>
            )}

            {totalResults === 0 && (
              <div style={s.empty}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>🔍</div>
                <div style={s.emptyTitle}>No results found</div>
                <div style={s.emptySub}>Try different keywords or use the examples above</div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}} .skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%);background-size:400px 100%;animation:shimmer 1.4s ease infinite;border-radius:8px}`}</style>
    </div>
  );
}

const rs = {
  card:{ display:"flex", alignItems:"center", gap:"14px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"16px 20px", marginBottom:"10px", cursor:"pointer", transition:"border-color 0.2s" },
  avatar:{ width:"42px", height:"42px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"800", color:"#fff", flexShrink:0 },
  info:{ flex:1 },
  name:{ fontSize:"14px", fontWeight:"700", color:"#fff", marginBottom:"2px" },
  email:{ fontSize:"12px", color:"rgba(255,255,255,0.4)" },
  badge:{ fontSize:"10px", fontWeight:"800", padding:"3px 10px", borderRadius:"100px", letterSpacing:"0.06em", whiteSpace:"nowrap" },
  score:{ fontSize:"14px", fontWeight:"800", color:"#fff" },
};

const s = {
  root:{ minHeight:"100vh", background:"#0a0a0f", fontFamily:"'DM Sans','Segoe UI',sans-serif" },
  content:{ maxWidth:"800px", margin:"0 auto", padding:"40px 24px" },
  header:{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"32px", flexWrap:"wrap" },
  headerIcon:{ fontSize:"36px" },
  title:{ fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 0 4px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 },
  aiBadge:{ marginLeft:"auto", background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.25)", color:"#a78bfa", fontSize:"12px", fontWeight:"700", padding:"6px 14px", borderRadius:"100px" },
  searchWrap:{ marginBottom:"28px" },
  searchBar:{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"14px", padding:"8px 16px", transition:"border-color 0.2s" },
  searchIcon:{ fontSize:"18px", flexShrink:0 },
  searchInput:{ flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:"15px", padding:"6px 0" },
  clearBtn:{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:"16px", cursor:"pointer", flexShrink:0 },
  searchBtn:{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none", borderRadius:"10px", padding:"10px 20px", color:"#fff", fontWeight:"700", fontSize:"14px", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", gap:"8px" },
  spinner:{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" },
  examples:{ marginBottom:"24px" },
  examplesTitle:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"12px" },
  examplesGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" },
  exampleBtn:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"12px 16px", color:"rgba(255,255,255,0.6)", fontSize:"13px", cursor:"pointer", textAlign:"left", transition:"border-color 0.2s", display:"flex", alignItems:"center", gap:"8px" },
  exampleIcon:{ fontSize:"14px" },
  resultsWrap:{ },
  aiAnswer:{ display:"flex", gap:"14px", background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.15)", borderRadius:"12px", padding:"16px 20px", marginBottom:"20px" },
  aiAnswerSkeleton:{ background:"rgba(167,139,250,0.04)", border:"1px solid rgba(167,139,250,0.1)", borderRadius:"12px", padding:"20px", marginBottom:"20px" },
  aiAnswerIcon:{ fontSize:"24px", flexShrink:0 },
  aiAnswerLabel:{ fontSize:"10px", fontWeight:"700", color:"#a78bfa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" },
  aiAnswerText:{ fontSize:"14px", color:"rgba(255,255,255,0.7)", lineHeight:"1.6" },
  resultCount:{ fontSize:"13px", color:"rgba(255,255,255,0.35)", marginBottom:"20px", fontWeight:"600" },
  section:{ marginBottom:"24px" },
  sectionTitle:{ fontSize:"12px", fontWeight:"700", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"12px" },
  empty:{ textAlign:"center", padding:"60px 20px" },
  emptyTitle:{ fontSize:"18px", fontWeight:"700", color:"rgba(255,255,255,0.4)", marginBottom:"8px" },
  emptySub:{ fontSize:"14px", color:"rgba(255,255,255,0.2)" },
};
