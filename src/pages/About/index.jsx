import { useState }     from "react";
import { useAdmin }     from "../../context/AdminContext";
import AboutHero        from "./AboutHero";
import ValuesSection    from "./ValuesSection";
import TeamGrid         from "./TeamGrid";
import ContactSection   from "./ContactSection";
import AboutAdminPanel  from "./AboutAdminPanel";

export default function About() {
  const { isAdmin } = useAdmin();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      {isAdmin && (
        <div style={adminBarStyle}>
          <span style={adminHintStyle}>🛡️ Admin Mode — editing About page</span>
          <button style={manageBtnStyle} onClick={() => setShowPanel(true)}>
            ⚙️ Edit About Page Content
          </button>
        </div>
      )}
      <AboutHero />
      <ValuesSection />
      <TeamGrid />
      <ContactSection />
      {showPanel && <AboutAdminPanel onClose={() => setShowPanel(false)} />}
    </>
  );
}

const adminBarStyle  = { display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.8rem 5%",background:"rgba(201,144,58,0.07)",borderBottom:"1px solid var(--border)",flexWrap:"wrap",gap:"1rem" };
const adminHintStyle = { fontSize:"0.8rem",color:"var(--muted)",fontStyle:"italic" };
const manageBtnStyle = { padding:"0.55rem 1.5rem",background:"rgba(201,144,58,0.12)",border:"1px solid var(--gold)",borderRadius:"8px",color:"var(--gold)",fontSize:"0.8rem",fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" };
