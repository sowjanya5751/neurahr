import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const BASE_SALARY = 83333; // 10 LPA / 12

function generatePayslips() {
  const slips = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const basic = BASE_SALARY * 0.5;
    const hra = BASE_SALARY * 0.2;
    const allowances = BASE_SALARY * 0.2;
    const special = BASE_SALARY * 0.1;
    const gross = basic + hra + allowances + special;
    const pf = basic * 0.12;
    const tax = gross * 0.1;
    const net = Math.round(gross - pf - tax);
    slips.push({
      month: MONTHS[d.getMonth()],
      year: d.getFullYear(),
      basic: Math.round(basic),
      hra: Math.round(hra),
      allowances: Math.round(allowances),
      special: Math.round(special),
      gross: Math.round(gross),
      pf: Math.round(pf),
      tax: Math.round(tax),
      net,
      status: i === 0 ? "pending" : "paid",
      paid_on: i === 0 ? "Processing" : `${new Date(d.getFullYear(), d.getMonth()+1, 0).toLocaleDateString("en-IN")}`,
    });
  }
  return slips;
}

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function Payroll() {
  const { user } = useAuth();
  const toast = useToast();
  const [slips]    = useState(generatePayslips);
  const [selected, setSelected] = useState(null);
  const isAdmin = user?.role === "admin" || user?.role === "hr";

  const handleDownload = (slip) => {
    toast.info(`Downloading ${slip.month} ${slip.year} payslip…`);
    const content = `
PAYSLIP — ${slip.month} ${slip.year}
=====================================
Employee: ${user?.name}
Role: ${user?.role?.toUpperCase()}
Company: NeuraHR

EARNINGS
--------
Basic Salary:     ${fmt(slip.basic)}
HRA:              ${fmt(slip.hra)}
Allowances:       ${fmt(slip.allowances)}
Special Pay:      ${fmt(slip.special)}
GROSS SALARY:     ${fmt(slip.gross)}

DEDUCTIONS
----------
Provident Fund:   ${fmt(slip.pf)}
Income Tax:       ${fmt(slip.tax)}
TOTAL DEDUCTIONS: ${fmt(slip.pf + slip.tax)}

NET SALARY:       ${fmt(slip.net)}
=====================================
Paid On: ${slip.paid_on}
    `.trim();
    const blob = new Blob([content], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Payslip_${slip.month}_${slip.year}.txt`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Payslip downloaded!");
  };

  return (
    <div style={s.root}>
      <Navbar />
      <div style={s.content}>
        <div style={s.header}>
          <div style={s.headerIcon}>💰</div>
          <div>
            <h1 style={s.title}>Payroll Management</h1>
            <p style={s.sub}>View salary details, payslips and compensation breakdown</p>
          </div>
          <div style={s.ctcBadge}>CTC: ₹10,00,000 / year</div>
        </div>

        {/* Salary breakdown */}
        <div style={s.breakdownCard}>
          <div style={s.breakdownTitle}>Monthly Salary Breakdown</div>
          <div style={s.breakdownGrid}>
            {[
              { label:"Basic Salary",  value:fmt(Math.round(BASE_SALARY*0.5)), color:"#a78bfa", pct:50 },
              { label:"HRA",           value:fmt(Math.round(BASE_SALARY*0.2)), color:"#60a5fa", pct:20 },
              { label:"Allowances",    value:fmt(Math.round(BASE_SALARY*0.2)), color:"#34d399", pct:20 },
              { label:"Special Pay",   value:fmt(Math.round(BASE_SALARY*0.1)), color:"#fbbf24", pct:10 },
            ].map(item => (
              <div key={item.label} style={s.breakdownItem}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                  <span style={s.breakdownLabel}>{item.label}</span>
                  <span style={{ ...s.breakdownValue, color:item.color }}>{item.value}</span>
                </div>
                <div style={s.barBg}>
                  <div style={{ ...s.barFill, width:`${item.pct}%`, background:item.color }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={s.netRow}>
            <div style={s.netItem}>
              <span style={s.netLabel}>Gross Salary</span>
              <span style={{ ...s.netValue, color:"#fff" }}>{fmt(BASE_SALARY)}</span>
            </div>
            <div style={s.netDivider}>−</div>
            <div style={s.netItem}>
              <span style={s.netLabel}>Deductions (PF + Tax)</span>
              <span style={{ ...s.netValue, color:"#f87171" }}>{fmt(Math.round(BASE_SALARY*0.22))}</span>
            </div>
            <div style={s.netDivider}>=</div>
            <div style={s.netItem}>
              <span style={s.netLabel}>Net Take Home</span>
              <span style={{ ...s.netValue, color:"#34d399", fontSize:"22px" }}>{fmt(Math.round(BASE_SALARY*0.78))}</span>
            </div>
          </div>
        </div>

        {/* Payslip list */}
        <div style={s.slipList}>
          <div style={s.slipListTitle}>Payslip History</div>
          {slips.map((slip, i) => (
            <div key={i} style={s.slipRow} onClick={() => setSelected(selected?.month === slip.month ? null : slip)}
              onMouseEnter={e => e.currentTarget.style.borderColor="rgba(167,139,250,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}>
              <div style={s.slipLeft}>
                <div style={s.slipMonth}>{slip.month} {slip.year}</div>
                <div style={s.slipDate}>Paid: {slip.paid_on}</div>
              </div>
              <div style={s.slipRight}>
                <span style={s.slipNet}>{fmt(slip.net)}</span>
                <span style={{ ...s.slipStatus, color: slip.status==="paid"?"#34d399":"#fbbf24", background: slip.status==="paid"?"rgba(52,211,153,0.1)":"rgba(251,191,36,0.1)" }}>
                  {slip.status === "paid" ? "✅ Paid" : "⏳ Processing"}
                </span>
                <button onClick={e => { e.stopPropagation(); handleDownload(slip); }} style={s.dlBtn}>⬇ Download</button>
              </div>
            </div>
          ))}
        </div>

        {/* Expanded slip */}
        {selected && (
          <div style={s.expandedSlip}>
            <div style={s.expandedTitle}>Detailed Payslip — {selected.month} {selected.year}</div>
            <div style={s.expandedGrid}>
              <div>
                <div style={s.expandedSection}>EARNINGS</div>
                {[["Basic Salary", selected.basic],["HRA",selected.hra],["Allowances",selected.allowances],["Special Pay",selected.special]].map(([l,v])=>(
                  <div key={l} style={s.expandedRow}><span style={s.expandedLabel}>{l}</span><span style={{ color:"#34d399", fontWeight:"700" }}>{fmt(v)}</span></div>
                ))}
                <div style={{ ...s.expandedRow, borderTop:"1px solid rgba(255,255,255,0.1)", marginTop:"8px", paddingTop:"8px" }}>
                  <span style={{ color:"#fff", fontWeight:"700" }}>GROSS</span>
                  <span style={{ color:"#fff", fontWeight:"900", fontSize:"16px" }}>{fmt(selected.gross)}</span>
                </div>
              </div>
              <div>
                <div style={s.expandedSection}>DEDUCTIONS</div>
                {[["Provident Fund", selected.pf],["Income Tax",selected.tax]].map(([l,v])=>(
                  <div key={l} style={s.expandedRow}><span style={s.expandedLabel}>{l}</span><span style={{ color:"#f87171", fontWeight:"700" }}>{fmt(v)}</span></div>
                ))}
                <div style={{ ...s.expandedRow, borderTop:"1px solid rgba(255,255,255,0.1)", marginTop:"8px", paddingTop:"8px" }}>
                  <span style={{ color:"#fff", fontWeight:"700" }}>NET SALARY</span>
                  <span style={{ color:"#34d399", fontWeight:"900", fontSize:"20px" }}>{fmt(selected.net)}</span>
                </div>
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
  header:{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"28px", flexWrap:"wrap" },
  headerIcon:{ fontSize:"36px" },
  title:{ fontSize:"26px", fontWeight:"800", color:"#fff", margin:"0 0 4px" },
  sub:{ color:"rgba(255,255,255,0.4)", fontSize:"14px", margin:0 },
  ctcBadge:{ marginLeft:"auto", background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.25)", color:"#34d399", fontSize:"13px", fontWeight:"700", padding:"8px 16px", borderRadius:"100px" },
  breakdownCard:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"28px", marginBottom:"24px" },
  breakdownTitle:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"20px" },
  breakdownGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"24px" },
  breakdownItem:{ },
  breakdownLabel:{ fontSize:"13px", color:"rgba(255,255,255,0.5)" },
  breakdownValue:{ fontSize:"14px", fontWeight:"700" },
  barBg:{ height:"4px", background:"rgba(255,255,255,0.08)", borderRadius:"100px", overflow:"hidden" },
  barFill:{ height:"100%", borderRadius:"100px" },
  netRow:{ display:"flex", alignItems:"center", justifyContent:"space-around", background:"rgba(255,255,255,0.03)", borderRadius:"12px", padding:"20px", flexWrap:"wrap", gap:"12px" },
  netItem:{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" },
  netLabel:{ fontSize:"11px", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.06em" },
  netValue:{ fontSize:"18px", fontWeight:"800" },
  netDivider:{ fontSize:"24px", color:"rgba(255,255,255,0.2)", fontWeight:"300" },
  slipList:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"16px", overflow:"hidden", marginBottom:"20px" },
  slipListTitle:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em", padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  slipRow:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", transition:"border-color 0.2s", border:"1px solid transparent", flexWrap:"wrap", gap:"12px" },
  slipLeft:{ },
  slipMonth:{ fontSize:"15px", fontWeight:"700", color:"#fff", marginBottom:"2px" },
  slipDate:{ fontSize:"12px", color:"rgba(255,255,255,0.35)" },
  slipRight:{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" },
  slipNet:{ fontSize:"16px", fontWeight:"800", color:"#fff" },
  slipStatus:{ fontSize:"11px", fontWeight:"700", padding:"4px 10px", borderRadius:"100px" },
  dlBtn:{ background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.25)", borderRadius:"8px", padding:"6px 14px", color:"#a78bfa", fontSize:"12px", fontWeight:"700", cursor:"pointer" },
  expandedSlip:{ background:"rgba(167,139,250,0.05)", border:"1px solid rgba(167,139,250,0.15)", borderRadius:"16px", padding:"28px" },
  expandedTitle:{ fontSize:"13px", fontWeight:"700", color:"#a78bfa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"20px" },
  expandedGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"32px" },
  expandedSection:{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"12px" },
  expandedRow:{ display:"flex", justifyContent:"space-between", marginBottom:"10px" },
  expandedLabel:{ fontSize:"13px", color:"rgba(255,255,255,0.5)" },
};
