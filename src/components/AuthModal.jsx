import { useState, useEffect, useRef } from "react";
import { useAdmin } from "../context/AdminContext";

const MAX_ATTEMPTS   = 5;
const LOCKOUT_SECS   = 60;

const SECURITY_QUESTIONS = {
  pet:    "What was the name of your first pet?",
  school: "What primary school did you attend?",
  city:   "What city were you born in?",
  mother: "What is your mother's maiden name?",
  street: "What street did you grow up on?",
  food:   "What is your favourite food?",
};

/* ── password strength ── */
function passStrength(p) {
  let s = 0;
  if (p.length >= 8)  s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^a-zA-Z0-9]/.test(p)) s++;
  const labels = ["Very weak","Weak","Fair","Strong","Very strong"];
  const colors = ["#e74c3c","#e67e22","#f1c40f","#2ecc71","#27ae60"];
  return { score: s, label: labels[Math.min(s,4)], color: colors[Math.min(s,4)] };
}

export default function AuthModal({ open, onClose }) {
  const { credentials, login, updateUsername, updatePassword, updateSecurityQ } = useAdmin();

  const [view,           setView]           = useState("login");   // login | forgot | change
  const [attempts,       setAttempts]       = useState(0);
  const [lockoutEnd,     setLockoutEnd]     = useState(0);
  const [countdown,      setCountdown]      = useState(0);
  const [forgotVerified, setForgotVerified] = useState(false);
  const [toast,          setToast]          = useState("");

  // login fields
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr,  setLoginErr]  = useState("");
  const [showPass,  setShowPass]  = useState(false);

  // forgot field
  const [secAnswer,    setSecAnswer]    = useState("");
  const [secAnswerErr, setSecAnswerErr] = useState("");

  // change tabs
  const [credTab, setCredTab] = useState("username");
  const [newUsername,  setNewUsername]  = useState("");
  const [usernameErr,  setUsernameErr]  = useState("");
  const [curPass,      setCurPass]      = useState("");
  const [newPass1,     setNewPass1]     = useState("");
  const [newPass2,     setNewPass2]     = useState("");
  const [passErr,      setPassErr]      = useState("");
  const [showCurPass,  setShowCurPass]  = useState(false);
  const [showNew1,     setShowNew1]     = useState(false);
  const [showNew2,     setShowNew2]     = useState(false);
  const [secQSelect,   setSecQSelect]   = useState("pet");
  const [newSecAns,    setNewSecAns]    = useState("");
  const [secQErr,      setSecQErr]      = useState("");

  const userRef = useRef(null);

  /* ── countdown ticker ── */
  useEffect(() => {
    if (lockoutEnd === 0) return;
    const t = setInterval(() => {
      const left = Math.ceil((lockoutEnd - Date.now()) / 1000);
      if (left <= 0) { setCountdown(0); setLockoutEnd(0); setAttempts(0); clearInterval(t); }
      else setCountdown(left);
    }, 250);
    return () => clearInterval(t);
  }, [lockoutEnd]);

  /* ── focus username on open ── */
  useEffect(() => {
    if (open) { setView("login"); resetLogin(); setTimeout(() => userRef.current?.focus(), 250); }
  }, [open]);

  /* ── toast auto-hide ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!open) return null;

  function resetLogin() {
    setLoginUser(""); setLoginPass(""); setLoginErr(""); setShowPass(false);
  }

  /* ── LOGIN ── */
  function doLogin() {
    if (lockoutEnd > Date.now()) return;
    setLoginErr("");
    const userOk = loginUser.trim() === credentials.username;
    const passOk = loginPass       === credentials.password;
    if (userOk && passOk) {
      login();
      setAttempts(0);
      onClose();
      setToast("🛡️ Admin access granted ✓");
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setLoginPass("");
      setLoginErr("Incorrect credentials. Please try again.");
      if (next >= MAX_ATTEMPTS) {
        setLockoutEnd(Date.now() + LOCKOUT_SECS * 1000);
        setCountdown(LOCKOUT_SECS);
      }
    }
  }

  /* ── SECURITY ANSWER ── */
  function checkSecAnswer() {
    if (secAnswer.trim().toLowerCase() === credentials.securityAnswer.toLowerCase()) {
      setForgotVerified(true);
      setLockoutEnd(0); setCountdown(0); setAttempts(0);
      setSecAnswer(""); setSecAnswerErr("");
      switchView("change");
      setToast("Identity verified ✓ — Update your credentials");
    } else {
      setSecAnswerErr("Incorrect answer. Please try again.");
      setSecAnswer("");
    }
  }

  /* ── CHANGE USERNAME ── */
  function saveUsername() {
    setUsernameErr("");
    if (!newUsername.trim())                         return setUsernameErr("Username cannot be empty.");
    if (newUsername.length < 4)                      return setUsernameErr("Minimum 4 characters required.");
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername))        return setUsernameErr("Only letters, numbers, underscores.");
    updateUsername(newUsername.trim());
    setNewUsername("");
    setToast(`✓ Username updated to "${newUsername.trim()}"`);
  }

  /* ── CHANGE PASSWORD ── */
  function savePassword() {
    setPassErr("");
    if (!forgotVerified && curPass !== credentials.password) return setPassErr("Current password is incorrect.");
    if (newPass1.length < 8)                                 return setPassErr("Minimum 8 characters required.");
    if (newPass1 !== newPass2)                               return setPassErr("Passwords do not match.");
    if (passStrength(newPass1).score < 2)                    return setPassErr("Password is too weak.");
    updatePassword(newPass1);
    setCurPass(""); setNewPass1(""); setNewPass2("");
    setForgotVerified(false);
    setToast("✓ Password updated successfully");
  }

  /* ── CHANGE SECURITY Q ── */
  function saveSecQ() {
    setSecQErr("");
    if (!newSecAns.trim() || newSecAns.length < 2) return setSecQErr("Answer is too short.");
    updateSecurityQ(secQSelect, newSecAns.trim().toLowerCase());
    setNewSecAns("");
    setToast("✓ Security question saved");
  }

  function switchView(v) {
    setView(v);
    if (v === "change") { setCredTab("username"); setNewUsername(""); }
    if (v === "forgot") { setSecAnswer(""); setSecAnswerErr(""); }
  }

  const isLocked = lockoutEnd > Date.now();
  const remaining = MAX_ATTEMPTS - attempts;
  const strength = passStrength(newPass1);

  return (
    <div style={backdropStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={boxStyle}>

        {/* ── VIEW: LOGIN ── */}
        {view === "login" && (
          <>
            <ModalHeader onClose={onClose} eyebrow="✦ Restricted Access" title="Admin Login" icon="🔐" />
            <div style={bodyStyle}>
              {loginErr && <Error msg={loginErr} />}
              {isLocked && (
                <div style={warnStyle}>
                  🔒 Account locked. Try again in <strong>{countdown}s</strong>.{" "}
                  <button style={linkBtnStyle} onClick={() => switchView("forgot")}>Forgot password?</button>
                </div>
              )}
              {!isLocked && attempts >= 3 && attempts < MAX_ATTEMPTS && (
                <div style={warnStyle}>⚠ {remaining} attempt{remaining !== 1 ? "s" : ""} remaining before lockout.</div>
              )}

              {/* Attempt dots */}
              {attempts > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"1rem" }}>
                  <div style={{ display:"flex", gap:"5px" }}>
                    {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
                      <div key={i} style={attemptDotStyle(i < attempts)} />
                    ))}
                  </div>
                  <span style={{ fontSize:"0.7rem", color:"var(--muted)" }}>
                    {remaining > 0 ? `${remaining} attempt${remaining!==1?"s":""} remaining` : "Account locked"}
                  </span>
                </div>
              )}

              <Field label="Username">
                <InputWrap icon="👤">
                  <input ref={userRef} style={inputStyle} type="text" placeholder="Enter admin username"
                    value={loginUser} onChange={e => { setLoginUser(e.target.value); setLoginErr(""); }}
                    onKeyDown={e => e.key === "Enter" && doLogin()}
                    disabled={isLocked} autoComplete="off" />
                </InputWrap>
              </Field>
              <Field label="Password">
                <InputWrap icon="🔑" toggle showPass={showPass} onToggle={() => setShowPass(v=>!v)}>
                  <input style={inputStyle} type={showPass ? "text" : "password"} placeholder="Enter password"
                    value={loginPass} onChange={e => { setLoginPass(e.target.value); setLoginErr(""); }}
                    onKeyDown={e => e.key === "Enter" && doLogin()}
                    disabled={isLocked} autoComplete="off" />
                </InputWrap>
              </Field>

              <button style={submitStyle} onClick={doLogin} disabled={isLocked}>Sign In as Admin</button>
              <div style={{ textAlign:"center", marginTop:"1rem" }}>
                <button style={linkBtnStyle} onClick={() => switchView("forgot")}>Forgot password?</button>
              </div>
            </div>
          </>
        )}

        {/* ── VIEW: FORGOT ── */}
        {view === "forgot" && (
          <>
            <ModalHeader onClose={onClose} eyebrow="✦ Identity Verification" title="Reset Access" icon="🔓" />
            <div style={bodyStyle}>
              <p style={{ fontSize:"0.82rem", color:"var(--muted)", lineHeight:1.7, marginBottom:"1.2rem" }}>
                Answer your security question to verify your identity.
              </p>
              <div style={secQBoxStyle}>{SECURITY_QUESTIONS[credentials.securityQuestion]}</div>
              {secAnswerErr && <Error msg={secAnswerErr} />}
              <Field label="Your Answer" style={{ marginTop:"1.2rem" }}>
                <InputWrap icon="💬">
                  <input style={inputStyle} type="text" placeholder="Type your answer…"
                    value={secAnswer} onChange={e => { setSecAnswer(e.target.value); setSecAnswerErr(""); }}
                    onKeyDown={e => e.key === "Enter" && checkSecAnswer()} autoComplete="off" />
                </InputWrap>
              </Field>
              <button style={submitStyle} onClick={checkSecAnswer}>Verify Identity</button>
              <div style={{ textAlign:"center", marginTop:"1rem" }}>
                <button style={linkBtnStyle} onClick={() => switchView("login")}>← Back to login</button>
              </div>
            </div>
          </>
        )}

        {/* ── VIEW: CHANGE CREDENTIALS ── */}
        {view === "change" && (
          <>
            <ModalHeader onClose={onClose} eyebrow="✦ Credential Management" title="Change Credentials" icon="⚙️" />
            <div style={bodyStyle}>
              {/* Tabs */}
              <div style={credTabsStyle}>
                {["username","password","security"].map(t => (
                  <button key={t} style={credTabStyle(credTab === t)} onClick={() => setCredTab(t)}>
                    {t === "security" ? "Security Q" : t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>

              {/* USERNAME */}
              {credTab === "username" && (
                <>
                  <Field label="Current Username">
                    <InputWrap icon="👤">
                      <input style={{...inputStyle, opacity:0.5}} value={credentials.username} readOnly />
                    </InputWrap>
                  </Field>
                  <Field label="New Username">
                    <InputWrap icon="✏️">
                      <input style={inputStyle} type="text" placeholder="Enter new username"
                        value={newUsername} onChange={e => { setNewUsername(e.target.value); setUsernameErr(""); }}
                        autoComplete="off" />
                    </InputWrap>
                  </Field>
                  {usernameErr && <Error msg={usernameErr} />}
                  <button style={submitStyle} onClick={saveUsername}>Update Username</button>
                </>
              )}

              {/* PASSWORD */}
              {credTab === "password" && (
                <>
                  {!forgotVerified && (
                    <Field label="Current Password">
                      <InputWrap icon="🔑" toggle showPass={showCurPass} onToggle={() => setShowCurPass(v=>!v)}>
                        <input style={inputStyle} type={showCurPass?"text":"password"} placeholder="Current password"
                          value={curPass} onChange={e => { setCurPass(e.target.value); setPassErr(""); }}
                          autoComplete="off" />
                      </InputWrap>
                    </Field>
                  )}
                  <Field label="New Password">
                    <InputWrap icon="🔒" toggle showPass={showNew1} onToggle={() => setShowNew1(v=>!v)}>
                      <input style={inputStyle} type={showNew1?"text":"password"} placeholder="At least 8 characters"
                        value={newPass1} onChange={e => { setNewPass1(e.target.value); setPassErr(""); }}
                        autoComplete="off" />
                    </InputWrap>
                  </Field>
                  {/* Strength bar */}
                  {newPass1 && (
                    <div style={{ marginTop:"-0.6rem", marginBottom:"0.8rem" }}>
                      <div style={{ height:"4px", background:"rgba(255,255,255,0.08)", borderRadius:"2px", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${(strength.score/5)*100}%`, background:strength.color, transition:"all 0.4s", borderRadius:"2px" }} />
                      </div>
                      <span style={{ fontSize:"0.65rem", color:strength.color, letterSpacing:"0.1em", textTransform:"uppercase" }}>{strength.label}</span>
                    </div>
                  )}
                  <Field label="Confirm New Password">
                    <InputWrap icon="🔒" toggle showPass={showNew2} onToggle={() => setShowNew2(v=>!v)}>
                      <input style={inputStyle} type={showNew2?"text":"password"} placeholder="Repeat new password"
                        value={newPass2} onChange={e => { setNewPass2(e.target.value); setPassErr(""); }}
                        autoComplete="off" />
                    </InputWrap>
                  </Field>
                  {passErr && <Error msg={passErr} />}
                  <button style={submitStyle} onClick={savePassword}>Update Password</button>
                </>
              )}

              {/* SECURITY Q */}
              {credTab === "security" && (
                <>
                  <Field label="Security Question">
                    <select style={selectStyle} value={secQSelect} onChange={e => setSecQSelect(e.target.value)}>
                      {Object.entries(SECURITY_QUESTIONS).map(([k,v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Answer">
                    <InputWrap icon="💬">
                      <input style={inputStyle} type="text" placeholder="Your answer (case-insensitive)"
                        value={newSecAns} onChange={e => { setNewSecAns(e.target.value); setSecQErr(""); }}
                        autoComplete="off" />
                    </InputWrap>
                  </Field>
                  {secQErr && <Error msg={secQErr} />}
                  <button style={submitStyle} onClick={saveSecQ}>Save Security Question</button>
                </>
              )}

              <div style={{ textAlign:"center", marginTop:"1rem" }}>
                <button style={linkBtnStyle} onClick={onClose}>Close</button>
              </div>
            </div>
          </>
        )}

        {/* Toast */}
        {toast && <div style={toastStyle}>{toast}</div>}
      </div>
    </div>
  );
}

/* ── SUB-COMPONENTS ── */
function ModalHeader({ onClose, eyebrow, title, icon }) {
  return (
    <div style={headerStyle}>
      <button onClick={onClose} style={closeStyle}>✕</button>
      <div style={{ fontSize:"2rem", marginBottom:"0.6rem" }}>{icon}</div>
      <p style={{ fontSize:"0.65rem", letterSpacing:"0.32em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"0.4rem" }}>{eyebrow}</p>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:700, color:"var(--cream)" }}>{title}</h2>
    </div>
  );
}

function Field({ label, children, style = {} }) {
  return (
    <div style={{ marginBottom:"1.2rem", ...style }}>
      <label style={{ display:"block", fontSize:"0.68rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--muted)", marginBottom:"0.45rem" }}>{label}</label>
      {children}
    </div>
  );
}

function InputWrap({ icon, toggle, showPass, onToggle, children }) {
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
      <span style={{ position:"absolute", left:"0.9rem", fontSize:"0.85rem", pointerEvents:"none", zIndex:1, opacity:0.6 }}>{icon}</span>
      {children}
      {toggle && (
        <button type="button" onClick={onToggle}
          style={{ position:"absolute", right:"0.75rem", background:"none", border:"none", cursor:"pointer", fontSize:"0.85rem", opacity:showPass?1:0.5, padding:"0.2rem" }}>
          {showPass ? "🙈" : "👁"}
        </button>
      )}
    </div>
  );
}

function Error({ msg }) {
  return (
    <div style={{ padding:"0.65rem 1rem", background:"rgba(168,76,47,0.15)", border:"1px solid rgba(168,76,47,0.4)", borderRadius:"6px", color:"#e07a5f", fontSize:"0.8rem", marginBottom:"1.1rem" }}>
      ⚠ {msg}
    </div>
  );
}

/* ── STYLES ── */
const backdropStyle = {
  position:"fixed", inset:0, zIndex:3000,
  background:"rgba(0,0,0,0.88)", backdropFilter:"blur(16px)",
  display:"flex", alignItems:"center", justifyContent:"center",
  padding:"2rem",
};
const boxStyle = {
  width:"100%", maxWidth:"440px",
  background:"#1a1510", border:"1px solid var(--border)", borderRadius:"14px",
  overflow:"hidden",
  boxShadow:"0 32px 80px rgba(0,0,0,0.6)",
  position:"relative",
};
const headerStyle = {
  padding:"2rem 2.5rem 1.4rem",
  borderBottom:"1px solid var(--border)",
  background:"linear-gradient(135deg,rgba(201,144,58,0.06),transparent)",
  position:"relative",
};
const closeStyle = {
  position:"absolute", top:"1.1rem", right:"1.1rem",
  background:"none", border:"1px solid var(--border)", borderRadius:"50%",
  width:"32px", height:"32px", color:"var(--muted)",
  fontSize:"0.9rem", cursor:"pointer",
  display:"flex", alignItems:"center", justifyContent:"center",
  transition:"all 0.2s",
};
const bodyStyle = { padding:"1.8rem 2.5rem 2.2rem" };
const inputStyle = {
  width:"100%", padding:"0.75rem 2.8rem 0.75rem 2.4rem",
  background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)",
  borderRadius:"7px", color:"var(--cream)",
  fontFamily:"'DM Sans',sans-serif", fontSize:"0.88rem", outline:"none",
};
const submitStyle = {
  width:"100%", padding:"0.9rem",
  background:"linear-gradient(135deg,var(--gold),#b8802e)",
  color:"var(--charcoal)", border:"none", borderRadius:"7px",
  fontFamily:"'DM Sans',sans-serif", fontSize:"0.83rem", fontWeight:700,
  letterSpacing:"0.13em", textTransform:"uppercase",
  cursor:"pointer", transition:"all 0.3s",
};
const linkBtnStyle = {
  background:"none", border:"none", color:"var(--muted)",
  fontSize:"0.78rem", cursor:"pointer", textDecoration:"underline",
  textUnderlineOffset:"3px", fontFamily:"'DM Sans',sans-serif",
};
const warnStyle = {
  padding:"0.65rem 1rem", background:"rgba(201,144,58,0.1)",
  border:"1px solid rgba(201,144,58,0.35)", borderRadius:"6px",
  color:"var(--gold)", fontSize:"0.78rem", marginBottom:"1rem", lineHeight:1.5,
};
const secQBoxStyle = {
  background:"rgba(201,144,58,0.07)", border:"1px solid rgba(201,144,58,0.25)",
  borderRadius:"8px", padding:"1rem 1.2rem", fontSize:"0.88rem",
  color:"var(--cream)", fontStyle:"italic", lineHeight:1.5,
};
const credTabsStyle = {
  display:"flex", marginBottom:"1.6rem",
  background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)", borderRadius:"8px", overflow:"hidden",
};
const credTabStyle = (active) => ({
  flex:1, padding:"0.6rem 0.5rem",
  background: active ? "rgba(201,144,58,0.12)" : "none",
  border:"none", borderRight:"1px solid var(--border)",
  color: active ? "var(--gold)" : "var(--muted)",
  fontFamily:"'DM Sans',sans-serif", fontSize:"0.72rem", fontWeight:600,
  letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer",
});
const selectStyle = {
  width:"100%", padding:"0.75rem 1rem",
  background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)",
  borderRadius:"6px", color:"var(--cream)",
  fontFamily:"'DM Sans',sans-serif", fontSize:"0.85rem", outline:"none",
};
const attemptDotStyle = (used) => ({
  width:"9px", height:"9px", borderRadius:"50%",
  background: used ? "var(--rust)" : "rgba(255,255,255,0.12)",
  border:`1px solid ${used?"var(--rust)":"rgba(255,255,255,0.15)"}`,
  boxShadow: used ? "0 0 5px rgba(168,76,47,0.5)" : "none",
  transition:"all 0.3s",
});
const toastStyle = {
  position:"absolute", bottom:"1rem", left:"50%", transform:"translateX(-50%)",
  background:"#1e1a15", border:"1px solid rgba(201,144,58,0.4)",
  color:"var(--gold)", padding:"0.6rem 1.4rem", borderRadius:"50px",
  fontSize:"0.8rem", letterSpacing:"0.08em", whiteSpace:"nowrap",
  pointerEvents:"none",
};
