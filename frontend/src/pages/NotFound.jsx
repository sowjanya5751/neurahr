import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={styles.root}>
      <div style={styles.code}>404</div>
      <div style={styles.title}>Page not found</div>
      <div style={styles.sub}>The page you're looking for doesn't exist or you don't have access.</div>
      <button onClick={() => navigate("/dashboard")} style={styles.btn}>← Back to Dashboard</button>
    </div>
  );
}

const styles = {
  root:{ minHeight:"100vh", background:"#0a0a0f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", textAlign:"center", padding:"24px" },
  code:{ fontSize:"120px", fontWeight:"900", color:"rgba(167,139,250,0.15)", lineHeight:1, marginBottom:"-20px" },
  title:{ fontSize:"28px", fontWeight:"800", color:"#fff", marginBottom:"12px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"15px", maxWidth:"360px", lineHeight:"1.6", marginBottom:"32px" },
  btn:{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", border:"none", borderRadius:"12px", padding:"13px 28px", color:"#fff", fontWeight:"700", fontSize:"15px", cursor:"pointer" },
};