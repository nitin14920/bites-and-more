import { useAdmin } from "../context/AdminContext";
import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";

export default function AdminBanner() {
  const { isAdmin, logout, resetAll, expiresAt } = useAdmin();
  const [confirmReset, setConfirmReset] = useState(false);
  const [credOpen,     setCredOpen]     = useState(false);
  const [timeLeft,     setTimeLeft]     = useState("");

  /* Live countdown display */
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const ms = expiresAt - Date.now();
      if (ms <= 0) { setTimeLeft("Expiring…"); return; }
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setTimeLeft(h > 0
        ? `${h}h ${String(m).padStart(2,"0")}m`
        : `${m}m ${String(s).padStart(2,"0")}s`
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (!isAdmin) return null;

  return (
    <>
      <div style={bannerStyle}>
        <div style={dotStyle} />
        <span style={textStyle}>🛡️ Admin Mode Active — You can manage Menu, Gallery &amp; About page</span>
        {timeLeft && (
          <span style={timerStyle}>⏱ Session: {timeLeft}</span>
        )}
        <button style={btnStyle("danger-soft")} onClick={() => setConfirmReset(true)}>🗑 Reset Data</button>
        <button style={btnStyle("green")}  onClick={() => setCredOpen(true)}>🔐 Credentials</button>
        <button style={btnStyle("danger")} onClick={logout}>Logout</button>
      </div>

      {/* Reset confirmation */}
      {confirmReset && (
        <div style={backdropStyle} onClick={e => e.target === e.currentTarget && setConfirmReset(false)}>
          <div style={{...boxStyle, background:"#1a1510", borderRadius:"14px", padding:"2.5rem", border:"1px solid rgba(168,76,47,0.4)", textAlign:"center"}}>
            <div style={{fontSize:"2.5rem", marginBottom:"1rem"}}>⚠️</div>
            <p style={{fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"var(--cream)", marginBottom:"0.6rem"}}>Reset All Data?</p>
            <p style={{fontSize:"0.85rem", color:"var(--muted)", lineHeight:1.7, marginBottom:"2rem"}}>
              This will permanently remove all uploaded images, popular item selections,
              and custom settings. Admin credentials will also reset to defaults.
            </p>
            <div style={{display:"flex", gap:"1rem", justifyContent:"center"}}>
              <button onClick={() => setConfirmReset(false)} style={btnStyle("gold")}>Cancel</button>
              <button onClick={() => { resetAll(); setConfirmReset(false); }} style={{...btnStyle("danger"), background:"rgba(168,76,47,0.2)"}}>Yes, Reset Everything</button>
            </div>
          </div>
        </div>
      )}

      {/* Reuse AuthModal in change-credentials mode */}
      {credOpen && (
        <div style={backdropStyle} onClick={e => e.target === e.currentTarget && setCredOpen(false)}>
          <div style={boxStyle}>
            <ChangeCredentials onClose={() => setCredOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

/* ── mini credentials panel used from banner ── */
function ChangeCredentials({ onClose }) {
  // Inline import to avoid circular deps — just re-open the AuthModal
  // pointing straight to "change" view.
  const { updateUsername, updatePassword, updateSecurityQ, credentials } = useAdmin();
  const [tab, setTab]       = useState("username");
  const [newUser, setNewUser] = useState("");
  const [uErr, setUErr]     = useState("");
  const [curP, setCurP]     = useState("");
  const [p1, setP1]         = useState("");
  const [p2, setP2]         = useState("");
  const [pErr, setPErr]     = useState("");
  const [secQ, setSecQ]     = useState("pet");
  const [secA, setSecA]     = useState("");
  const [sErr, setSErr]     = useState("");
  const [toast, setToast]   = useState("");

  const QUESTIONS = {
    pet:"What was the name of your first pet?", school:"What primary school did you attend?",
    city:"What city were you born in?", mother:"What is your mother's maiden name?",
    street:"What street did you grow up on?", food:"What is your favourite food?",
  };

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(""),3000); }

  function saveUser() {
    if (!newUser.trim() || newUser.length < 4) return setUErr("Min 4 characters.");
    if (!/^[a-zA-Z0-9_]+$/.test(newUser)) return setUErr("Letters, numbers, underscores only.");
    updateUsername(newUser.trim()); setNewUser(""); setUErr(""); showToast(`✓ Username updated`);
  }
  function savePass() {
    if (curP !== credentials.password) return setPErr("Current password incorrect.");
    if (p1.length < 8) return setPErr("Min 8 characters.");
    if (p1 !== p2)     return setPErr("Passwords don't match.");
    updatePassword(p1); setCurP(""); setP1(""); setP2(""); setPErr(""); showToast("✓ Password updated");
  }
  function saveSecQ() {
    if (!secA.trim() || secA.length < 2) return setSErr("Answer too short.");
    updateSecurityQ(secQ, secA.toLowerCase()); setSecA(""); setSErr(""); showToast("✓ Security Q saved");
  }

  return (
    <div style={{ background:"#1a1510", borderRadius:"14px", overflow:"hidden", maxWidth:"440px", width:"100%", position:"relative" }}>
      <div style={{ padding:"1.8rem 2.5rem 1.2rem", borderBottom:"1px solid var(--border)", background:"linear-gradient(135deg,rgba(201,144,58,0.06),transparent)", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute",top:"1rem",right:"1rem",background:"none",border:"1px solid var(--border)",borderRadius:"50%",width:"30px",height:"30px",color:"var(--muted)",cursor:"pointer" }}>✕</button>
        <div style={{ fontSize:"1.8rem", marginBottom:"0.4rem" }}>⚙️</div>
        <p style={{ fontSize:"0.65rem",letterSpacing:"0.32em",textTransform:"uppercase",color:"var(--gold)",marginBottom:"0.3rem" }}>✦ Credential Management</p>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",fontWeight:700,color:"var(--cream)" }}>Change Credentials</h2>
      </div>
      <div style={{ padding:"1.6rem 2.5rem 2rem" }}>
        {/* tabs */}
        <div style={{ display:"flex",marginBottom:"1.4rem",background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:"8px",overflow:"hidden" }}>
          {["username","password","security"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:"0.6rem",background:tab===t?"rgba(201,144,58,0.12)":"none",border:"none",borderRight:"1px solid var(--border)",color:tab===t?"var(--gold)":"var(--muted)",fontFamily:"'DM Sans',sans-serif",fontSize:"0.7rem",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer" }}>
              {t==="security"?"Sec Q":t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        {tab==="username"&&<><Input label="Current" value={credentials.username} readOnly icon="👤"/><Input label="New Username" value={newUser} onChange={e=>{setNewUser(e.target.value);setUErr("");}} icon="✏️"/>{uErr&&<Err msg={uErr}/>}<Btn onClick={saveUser}>Update Username</Btn></>}
        {tab==="password"&&<><Input label="Current Password" value={curP} onChange={e=>{setCurP(e.target.value);setPErr("");}} type="password" icon="🔑"/><Input label="New Password" value={p1} onChange={e=>{setP1(e.target.value);setPErr("");}} type="password" icon="🔒"/><Input label="Confirm Password" value={p2} onChange={e=>{setP2(e.target.value);setPErr("");}} type="password" icon="🔒"/>{pErr&&<Err msg={pErr}/>}<Btn onClick={savePass}>Update Password</Btn></>}
        {tab==="security"&&<>
          <div style={{marginBottom:"1.2rem"}}>
            <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--muted)",marginBottom:"0.4rem"}}>Security Question</label>
            <select value={secQ} onChange={e=>setSecQ(e.target.value)} style={{width:"100%",padding:"0.7rem 1rem",background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",borderRadius:"7px",color:"var(--cream)",fontFamily:"'DM Sans',sans-serif",fontSize:"0.85rem",outline:"none"}}>
              {Object.entries(QUESTIONS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <Input label="Answer" value={secA} onChange={e=>{setSecA(e.target.value);setSErr("");}} icon="💬"/>
          {sErr&&<Err msg={sErr}/>}
          <Btn onClick={saveSecQ}>Save Security Question</Btn>
        </>}
        {toast&&<div style={{textAlign:"center",color:"var(--gold)",fontSize:"0.8rem",marginTop:"0.8rem"}}>{toast}</div>}
      </div>
    </div>
  );
}

function Input({label,value,onChange,type="text",icon,readOnly}) {
  return (
    <div style={{marginBottom:"1.1rem"}}>
      <label style={{display:"block",fontSize:"0.68rem",letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--muted)",marginBottom:"0.4rem"}}>{label}</label>
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        <span style={{position:"absolute",left:"0.9rem",fontSize:"0.85rem",opacity:0.6,pointerEvents:"none"}}>{icon}</span>
        <input type={type} value={value} onChange={onChange} readOnly={readOnly}
          style={{width:"100%",padding:"0.72rem 1rem 0.72rem 2.4rem",background:"rgba(255,255,255,0.04)",border:"1px solid var(--border)",borderRadius:"7px",color:"var(--cream)",fontFamily:"'DM Sans',sans-serif",fontSize:"0.88rem",outline:"none",opacity:readOnly?0.5:1}} />
      </div>
    </div>
  );
}
function Err({msg}) { return <div style={{padding:"0.6rem 1rem",background:"rgba(168,76,47,0.15)",border:"1px solid rgba(168,76,47,0.4)",borderRadius:"6px",color:"#e07a5f",fontSize:"0.78rem",marginBottom:"1rem"}}>⚠ {msg}</div>; }
function Btn({onClick,children}) { return <button onClick={onClick} style={{width:"100%",padding:"0.85rem",background:"linear-gradient(135deg,var(--gold),#b8802e)",color:"var(--charcoal)",border:"none",borderRadius:"7px",fontFamily:"'DM Sans',sans-serif",fontSize:"0.82rem",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer"}}>{children}</button>; }

/* styles */
const bannerStyle = {
  position:"sticky", top:"72px", zIndex:900,
  padding:"0.7rem 5%",
  background:"linear-gradient(90deg,rgba(201,144,58,0.12),rgba(201,144,58,0.06))",
  borderBottom:"1px solid rgba(201,144,58,0.3)",
  display:"flex", alignItems:"center", gap:"1rem",
  fontSize:"0.78rem", color:"var(--gold)",
  letterSpacing:"0.05em", flexWrap:"wrap",
};
const timerStyle = {
  fontSize:"0.7rem", color:"rgba(201,144,58,0.7)",
  fontVariantNumeric:"tabular-nums", letterSpacing:"0.05em",
  marginLeft:"auto",
};
const dotStyle = {
  width:"8px", height:"8px", borderRadius:"50%",
  background:"#5ac95a", boxShadow:"0 0 8px #5ac95a", flexShrink:0,
  animation:"pulse 2s infinite",
};
const textStyle = { flex:1, minWidth:0 };
const btnStyle = (variant) => ({
  padding:"0.35rem 0.9rem",
  background: variant==="green" ? "rgba(90,156,90,0.15)" : variant==="danger" || variant==="danger-soft" ? "rgba(168,76,47,0.15)" : "none",
  border:`1px solid ${variant==="green"?"rgba(90,200,90,0.4)":(variant==="danger"||variant==="danger-soft")?"rgba(168,76,47,0.4)":"rgba(201,144,58,0.4)"}`,
  borderRadius:"20px",
  color: variant==="green"?"#5ac95a":(variant==="danger"||variant==="danger-soft")?"#e07a5f":"var(--gold)",
  fontSize:"0.72rem", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase",
  cursor:"pointer", transition:"all 0.25s", fontFamily:"'DM Sans',sans-serif",
});
const backdropStyle = {
  position:"fixed",inset:0,zIndex:3000,
  background:"rgba(0,0,0,0.88)",backdropFilter:"blur(16px)",
  display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem",
};
const boxStyle = { width:"100%", maxWidth:"440px" };
