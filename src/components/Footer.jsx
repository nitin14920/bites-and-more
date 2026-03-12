import { NavLink } from "react-router-dom";

const FOOTER_LINKS = [
  { to: "/",        label: "Home"    },
  { to: "/menu",    label: "Menu"    },
  { to: "/gallery", label: "Gallery" },
  { to: "/about",   label: "About"   },
];

const SOCIALS = [
  { href: "#", label: "Instagram", icon: "📸" },
  { href: "#", label: "Facebook",  icon: "📘" },
  { href: "#", label: "Twitter",   icon: "🐦" },
];

export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={innerStyle}>
        <div style={brandStyle}>
          <p style={logoStyle}>Bites <em style={{color:"var(--cream)",fontStyle:"italic",fontWeight:400}}>&amp; More</em></p>
          <p style={taglineStyle}>A Cafe Lounge Experience</p>
        </div>
        <nav style={navStyle}>
          {FOOTER_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to==="/"} style={linkStyle}>{label}</NavLink>
          ))}
        </nav>
        <div style={socialsStyle}>
          {SOCIALS.map(({ href, label, icon }) => (
            <a key={label} href={href} style={socialIconStyle} aria-label={label}>{icon}</a>
          ))}
        </div>
      </div>
      <div style={bottomStyle}>
        <p style={copyrightStyle}>© {new Date().getFullYear()} Bites &amp; More Cafe Lounge. All rights reserved.</p>
      </div>
    </footer>
  );
}

const footerStyle     = { background:"rgba(0,0,0,0.4)", borderTop:"1px solid var(--border)", padding:"3rem 5% 1.5rem" };
const innerStyle      = { display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"2rem", marginBottom:"2rem" };
const brandStyle      = { display:"flex", flexDirection:"column", gap:"0.3rem" };
const logoStyle       = { fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:700, color:"var(--gold)", margin:0 };
const taglineStyle    = { fontSize:"0.72rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--muted)" };
const navStyle        = { display:"flex", gap:"2rem", flexWrap:"wrap" };
const linkStyle       = { fontSize:"0.8rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", textDecoration:"none", transition:"color 0.3s" };
const socialsStyle    = { display:"flex", gap:"1rem" };
const socialIconStyle = { width:"36px", height:"36px", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(201,144,58,0.08)", border:"1px solid var(--border)", borderRadius:"50%", fontSize:"0.9rem", textDecoration:"none", transition:"all 0.3s" };
const bottomStyle     = { borderTop:"1px solid var(--border)", paddingTop:"1.5rem", textAlign:"center" };
const copyrightStyle  = { fontSize:"0.72rem", letterSpacing:"0.1em", color:"var(--muted)" };
