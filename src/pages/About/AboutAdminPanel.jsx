import { useState, useRef } from "react";
import { useAdmin }         from "../../context/AdminContext";
import { uploadImage, deleteImage } from "../../api/imageApi";

const uid = () => `member-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;

export default function AboutAdminPanel({ onClose }) {
  const {
    aboutInfo,    updateAboutInfo,
    teamMembers,  addTeamMember,  updateTeamMember, deleteTeamMember,
    siteContact,  updateSiteContact,
    socialLinks,  updateSocialLinks,
  } = useAdmin();

  const [tab, setTab] = useState("story"); // story | values | team | contact | social
  const [error, setBusy_error] = useState(""); // reusing as error
  const [busy, setBusy] = useState(false);

  /* ─── story paragraphs ─── */
  const [paras, setParas] = useState([...aboutInfo.storyParagraphs]);
  const [yearsLabel, setYearsLabel] = useState(aboutInfo.yearsLabel);
  const [yearsDesc,  setYearsDesc]  = useState(aboutInfo.yearsDesc);

  function saveStory() {
    updateAboutInfo({
      storyParagraphs: paras.filter(p=>p.trim()),
      yearsLabel: yearsLabel.trim(),
      yearsDesc: yearsDesc.trim(),
    });
    setBusy_error("✅ Story saved!");
    setTimeout(() => setBusy_error(""), 2000);
  }

  /* ─── values ─── */
  const [values, setValues] = useState([...aboutInfo.values]);

  function saveValues() {
    updateAboutInfo({ values: values.filter(v=>v.title.trim()) });
    setBusy_error("✅ Values saved!");
    setTimeout(() => setBusy_error(""), 2000);
  }

  /* ─── team ─── */
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ name:"", role:"", bio:"", avatarUrl:"" });
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const avatarInputRef = useRef(null);

  function openAddMember() {
    setMemberForm({ name:"", role:"", bio:"", avatarUrl:"" });
    setPreviewUrl(""); setEditingMember(null); setShowMemberForm(true);
  }
  function openEditMember(m) {
    setMemberForm({ name:m.name, role:m.role, bio:m.bio, avatarUrl:m.avatarUrl||"" });
    setPreviewUrl(m.avatarUrl||""); setEditingMember(m.id); setShowMemberForm(true);
  }
  async function handleAvatarSelect(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setBusy(true); setBusy_error("");
    try {
      const url = await uploadImage(file, "team");
      setMemberForm(f=>({...f, avatarUrl: url}));
    } catch(err) { setBusy_error("⚠ " + err.message); }
    finally { setBusy(false); e.target.value=""; }
  }
  function saveMember() {
    if (!memberForm.name.trim()) return setBusy_error("⚠ Name is required");
    const data = { name: memberForm.name, role: memberForm.role, bio: memberForm.bio,
                   avatarUrl: memberForm.avatarUrl || "", avatarPublicId: memberForm.avatarPublicId || "" };
    if (editingMember) {
      updateTeamMember(editingMember, data);
    } else {
      addTeamMember({ id: uid(), ...data });
    }
    setShowMemberForm(false); setBusy_error(""); setPreviewUrl("");
  }
  function confirmDeleteMember(m) {
    if (!window.confirm(`Remove "${m.name}" from the team?`)) return;
    deleteTeamMember(m.id);
  }

  /* ─── contact ─── */
  const [contact, setContact] = useState({...siteContact});
  function saveContact() {
    updateSiteContact(contact);
    setBusy_error("✅ Contact info saved!");
    setTimeout(() => setBusy_error(""), 2000);
  }

  /* ─── social ─── */
  const [social, setSocial] = useState({...socialLinks});
  function saveSocial() {
    updateSocialLinks(social);
    setBusy_error("✅ Social links saved!");
    setTimeout(() => setBusy_error(""), 2000);
  }

  const TABS = [
    { key:"story",   label:"📖 Story"   },
    { key:"values",  label:"🌿 Values"  },
    { key:"team",    label:"👥 Team"    },
    { key:"contact", label:"📍 Contact" },
    { key:"social",  label:"🔗 Social"  },
  ];

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={panelStyle} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={panelHeaderStyle}>
          <h2 style={panelTitleStyle}>🏮 About Page Manager</h2>
          <button style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={tabsStyle}>
          {TABS.map(t => (
            <button key={t.key} style={tabBtnStyle(tab===t.key)} onClick={()=>{setTab(t.key);setBusy_error("");}}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <p style={msgStyle(error)}>{error}</p>}

        {/* ══ STORY ══ */}
        {tab === "story" && (
          <div style={tabBodyStyle}>
            <SectionTitle>Story Text</SectionTitle>
            <p style={hintStyle}>Edit each paragraph of your story. Add or remove paragraphs as needed.</p>
            {paras.map((p, i) => (
              <div key={i} style={paraRowStyle}>
                <span style={paraNumStyle}>{i+1}</span>
                <textarea style={{...inputStyle, flex:1, minHeight:"80px", resize:"vertical"}}
                  value={p} onChange={e => setParas(prev => prev.map((v,j)=>j===i?e.target.value:v))} />
                <button style={iconBtnStyle} onClick={() => setParas(prev=>prev.filter((_,j)=>j!==i))} title="Remove">🗑</button>
              </div>
            ))}
            <button style={addRowBtnStyle} onClick={() => setParas(p=>[...p,""])}>＋ Add Paragraph</button>

            <div style={divStyle} />
            <SectionTitle>Accent Box</SectionTitle>
            <p style={hintStyle}>The floating stats box shown on the story image.</p>
            <div style={fieldRowStyle}>
              <Field label="Years / Number"><input style={inputStyle} value={yearsLabel} onChange={e=>setYearsLabel(e.target.value)} placeholder="8+" /></Field>
              <Field label="Description"><input style={inputStyle} value={yearsDesc} onChange={e=>setYearsDesc(e.target.value)} placeholder="Years of culinary excellence in Agra" /></Field>
            </div>
            <SaveBar onSave={saveStory} />
          </div>
        )}

        {/* ══ VALUES ══ */}
        {tab === "values" && (
          <div style={tabBodyStyle}>
            <SectionTitle>Our Values</SectionTitle>
            <p style={hintStyle}>Edit, add, or remove the value cards shown on the About page.</p>
            {values.map((v, i) => (
              <div key={i} style={formCardStyle}>
                <div style={fieldRowStyle}>
                  <Field label="Title" flex={1}><input style={inputStyle} value={v.title} onChange={e=>setValues(prev=>prev.map((x,j)=>j===i?{...x,title:e.target.value}:x))} /></Field>
                  <button style={{...iconBtnStyle,alignSelf:"flex-end",marginBottom:"0"}} onClick={()=>setValues(prev=>prev.filter((_,j)=>j!==i))}>🗑</button>
                </div>
                <Field label="Description">
                  <textarea style={{...inputStyle,minHeight:"70px",resize:"vertical"}} value={v.desc}
                    onChange={e=>setValues(prev=>prev.map((x,j)=>j===i?{...x,desc:e.target.value}:x))} />
                </Field>
              </div>
            ))}
            <button style={addRowBtnStyle} onClick={()=>setValues(v=>[...v,{title:"",desc:""}])}>＋ Add Value</button>
            <SaveBar onSave={saveValues} />
          </div>
        )}

        {/* ══ TEAM ══ */}
        {tab === "team" && (
          <div style={tabBodyStyle}>
            <div style={sectionHeaderStyle}>
              <SectionTitle>Team Members</SectionTitle>
              <button style={addBtnStyle} onClick={openAddMember}>＋ Add Member</button>
            </div>

            {showMemberForm && (
              <div style={formCardStyle}>
                <h4 style={formTitleStyle}>{editingMember ? "Edit Member" : "New Member"}</h4>
                <div style={fieldRowStyle}>
                  <Field label="Name *"><input style={inputStyle} value={memberForm.name} onChange={e=>setMemberForm(f=>({...f,name:e.target.value}))} /></Field>
                  <Field label="Role"><input style={inputStyle} value={memberForm.role} onChange={e=>setMemberForm(f=>({...f,role:e.target.value}))} placeholder="e.g. Head Chef" /></Field>
                </div>
                <Field label="Bio">
                  <textarea style={{...inputStyle,minHeight:"72px",resize:"vertical"}} value={memberForm.bio}
                    onChange={e=>setMemberForm(f=>({...f,bio:e.target.value}))} />
                </Field>
                <div style={imgUploadRowStyle}>
                  {(previewUrl||memberForm.avatarUrl) && (
                    <img src={previewUrl||memberForm.avatarUrl} alt="avatar"
                      style={{width:"64px",height:"64px",objectFit:"cover",borderRadius:"50%",border:"2px solid var(--border)"}} />
                  )}
                  <div>
                    <label style={labelStyle}>Profile Photo</label>
                    <button style={uploadImgBtnStyle} disabled={busy} onClick={()=>avatarInputRef.current?.click()}>
                      {busy?"⏳ Uploading…": memberForm.avatarUrl?"📷 Replace Photo":"📷 Upload Photo"}
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarSelect} />
                  </div>
                </div>
                <div style={formActionsStyle}>
                  <button style={cancelBtnStyle} onClick={()=>{setShowMemberForm(false);setBusy_error("");}}>Cancel</button>
                  <button style={saveBtnStyle} onClick={saveMember} disabled={busy}>{editingMember?"Save Changes":"Add Member"}</button>
                </div>
              </div>
            )}

            <div style={listStyle}>
              {teamMembers.map(m => (
                <div key={m.id} style={listItemStyle}>
                  <div style={avatarThumbStyle}>
                    {m.avatarUrl
                      ? <img src={m.avatarUrl} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}} />
                      : <span style={{fontSize:"1.4rem"}}>👤</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={itemNameStyle}>{m.name}</div>
                    <div style={itemMetaStyle}>{m.role}</div>
                  </div>
                  <div style={actionBtnsStyle}>
                    <button style={editBtnStyle} onClick={()=>openEditMember(m)}>Edit</button>
                    <button style={deleteBtnStyle} onClick={()=>confirmDeleteMember(m)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ CONTACT ══ */}
        {tab === "contact" && (
          <div style={tabBodyStyle}>
            <SectionTitle>Contact &amp; Hours</SectionTitle>
            <Field label="Address">
              <textarea style={{...inputStyle,minHeight:"64px",resize:"vertical"}} value={contact.address}
                onChange={e=>setContact(c=>({...c,address:e.target.value}))} placeholder="Full address" />
            </Field>
            <Field label="Phone / Reservation Number">
              <input style={inputStyle} value={contact.phone||""} onChange={e=>setContact(c=>({...c,phone:e.target.value}))} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Reservation Note">
              <input style={inputStyle} value={contact.reservationNote||""} onChange={e=>setContact(c=>({...c,reservationNote:e.target.value}))} />
            </Field>
            <div style={fieldRowStyle}>
              <Field label="Weekday Hours (Mon–Fri)"><input style={inputStyle} value={contact.weekdayHours} onChange={e=>setContact(c=>({...c,weekdayHours:e.target.value}))} /></Field>
              <Field label="Weekend Hours (Sat–Sun)"><input style={inputStyle} value={contact.weekendHours} onChange={e=>setContact(c=>({...c,weekendHours:e.target.value}))} /></Field>
            </div>
            <SaveBar onSave={saveContact} />
          </div>
        )}

        {/* ══ SOCIAL ══ */}
        {tab === "social" && (
          <div style={tabBodyStyle}>
            <SectionTitle>Social Media Links</SectionTitle>
            <p style={hintStyle}>Enter full URLs. Leave blank to hide the button.</p>
            {[
              { key:"instagram", label:"📸 Instagram", placeholder:"https://instagram.com/yourpage" },
              { key:"facebook",  label:"📘 Facebook",  placeholder:"https://facebook.com/yourpage"  },
              { key:"twitter",   label:"🐦 Twitter / X",placeholder:"https://twitter.com/yourhandle" },
              { key:"youtube",   label:"▶️ YouTube",    placeholder:"https://youtube.com/@yourchannel"},
            ].map(({key,label,placeholder}) => (
              <Field key={key} label={label}>
                <input style={inputStyle} value={social[key]||""} placeholder={placeholder}
                  onChange={e=>setSocial(s=>({...s,[key]:e.target.value}))} />
              </Field>
            ))}
            <SaveBar onSave={saveSocial} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── tiny sub-components ── */
function SectionTitle({ children }) {
  return <h4 style={{fontSize:"0.82rem",color:"var(--gold)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"0.8rem"}}>{children}</h4>;
}
function Field({ label, children, flex }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"0.3rem",flex:flex||1,marginBottom:"0.8rem"}}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}
function SaveBar({ onSave }) {
  return (
    <div style={{display:"flex",justifyContent:"flex-end",marginTop:"1.2rem",paddingTop:"1rem",borderTop:"1px solid var(--border)"}}>
      <button style={saveBtnStyle} onClick={onSave}>💾 Save Changes</button>
    </div>
  );
}

/* ── styles ── */
const backdropStyle    = { position:"fixed",inset:0,zIndex:3000,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" };
const panelStyle       = { background:"#1a1510",border:"1px solid var(--border)",borderRadius:"14px",width:"100%",maxWidth:"780px",maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden" };
const panelHeaderStyle = { display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.5rem 1.8rem",borderBottom:"1px solid var(--border)",flexShrink:0 };
const panelTitleStyle  = { fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:"var(--cream)",margin:0 };
const closeBtnStyle    = { background:"none",border:"none",color:"var(--muted)",fontSize:"1.1rem",cursor:"pointer",padding:"4px 8px" };
const tabsStyle        = { display:"flex",borderBottom:"1px solid var(--border)",flexShrink:0,overflowX:"auto" };
const tabBtnStyle      = a => ({ flex:"0 0 auto",padding:"0.9rem 1.2rem",background:a?"rgba(201,144,58,0.1)":"none",border:"none",borderBottom:a?"2px solid var(--gold)":"2px solid transparent",color:a?"var(--gold)":"var(--muted)",fontSize:"0.8rem",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap" });
const tabBodyStyle     = { padding:"1.5rem 1.8rem",overflowY:"auto",flex:1 };
const msgStyle         = msg => ({ fontSize:"0.8rem",padding:"0.5rem 1.8rem",margin:0,color:msg.startsWith("✅")?"#5a9e4b":"#e07a5f",background:msg.startsWith("✅")?"rgba(90,158,75,0.08)":"rgba(168,76,47,0.08)" });
const hintStyle        = { fontSize:"0.8rem",color:"var(--muted)",marginBottom:"1.2rem",lineHeight:1.6 };
const divStyle         = { height:"1px",background:"var(--border)",margin:"1.5rem 0" };
const paraRowStyle     = { display:"flex",gap:"0.8rem",alignItems:"flex-start",marginBottom:"0.8rem" };
const paraNumStyle     = { width:"24px",height:"24px",borderRadius:"50%",background:"rgba(201,144,58,0.15)",color:"var(--gold)",fontSize:"0.72rem",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"8px" };
const addRowBtnStyle   = { padding:"0.45rem 1rem",background:"none",border:"1px dashed var(--border)",borderRadius:"6px",color:"var(--muted)",fontSize:"0.78rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:"0.5rem" };
const fieldRowStyle    = { display:"flex",gap:"0.8rem",flexWrap:"wrap" };
const labelStyle       = { fontSize:"0.7rem",color:"var(--muted)",letterSpacing:"0.08em",textTransform:"uppercase" };
const inputStyle       = { background:"rgba(255,255,255,0.06)",border:"1px solid var(--border)",borderRadius:"6px",padding:"0.55rem 0.9rem",color:"var(--cream)",fontSize:"0.85rem",fontFamily:"'DM Sans',sans-serif",outline:"none",width:"100%",boxSizing:"border-box" };
const formCardStyle    = { background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:"10px",padding:"1.4rem",marginBottom:"1.2rem" };
const formTitleStyle   = { fontSize:"0.82rem",color:"var(--gold)",fontWeight:700,marginBottom:"1rem",letterSpacing:"0.08em",textTransform:"uppercase" };
const formActionsStyle = { display:"flex",gap:"0.8rem",justifyContent:"flex-end",marginTop:"1rem" };
const cancelBtnStyle   = { padding:"0.55rem 1.4rem",background:"none",border:"1px solid var(--border)",borderRadius:"6px",color:"var(--muted)",fontSize:"0.8rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const saveBtnStyle     = { padding:"0.55rem 1.4rem",background:"rgba(201,144,58,0.85)",border:"none",borderRadius:"6px",color:"#1a1612",fontSize:"0.8rem",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const sectionHeaderStyle = { display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.2rem" };
const addBtnStyle      = { padding:"0.5rem 1.2rem",background:"rgba(201,144,58,0.15)",border:"1px solid var(--gold)",borderRadius:"6px",color:"var(--gold)",fontSize:"0.78rem",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const listStyle        = { display:"flex",flexDirection:"column",gap:"0.6rem" };
const listItemStyle    = { display:"flex",alignItems:"center",gap:"1rem",padding:"0.8rem 1rem",background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:"8px" };
const itemNameStyle    = { fontSize:"0.88rem",color:"var(--cream)",fontWeight:600,marginBottom:"0.2rem" };
const itemMetaStyle    = { fontSize:"0.72rem",color:"var(--muted)" };
const actionBtnsStyle  = { display:"flex",gap:"0.5rem",flexShrink:0 };
const editBtnStyle     = { padding:"0.3rem 0.8rem",background:"none",border:"1px solid var(--border)",borderRadius:"4px",color:"var(--muted)",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const deleteBtnStyle   = { padding:"0.3rem 0.8rem",background:"none",border:"1px solid rgba(168,76,47,0.4)",borderRadius:"4px",color:"#c0392b",fontSize:"0.72rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const avatarThumbStyle = { width:"48px",height:"48px",borderRadius:"50%",border:"1px solid var(--border)",background:"rgba(201,144,58,0.06)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0 };
const imgUploadRowStyle = { display:"flex",alignItems:"center",gap:"1rem",marginBottom:"0.8rem",padding:"0.8rem",background:"rgba(255,255,255,0.02)",borderRadius:"6px",border:"1px solid var(--border)" };
const uploadImgBtnStyle = { padding:"0.45rem 1rem",background:"rgba(201,144,58,0.1)",border:"1px solid var(--gold)",borderRadius:"6px",color:"var(--gold)",fontSize:"0.75rem",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
const iconBtnStyle     = { background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:"1rem",padding:"4px 6px",flexShrink:0 };
