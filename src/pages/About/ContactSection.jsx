import { useAdmin } from "../../context/AdminContext";

export default function ContactSection() {
  const { siteContact, socialLinks } = useAdmin();

  const contact = siteContact ?? {};
  const social  = socialLinks  ?? {};

  return (
    <section style={sectionStyle}>

      {/* ── LEFT: contact info ── */}
      <div>
        <p className="section-label">Find Us</p>
        <h2 style={headingStyle}>
          Visit <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Us</em>
        </h2>
        <div className="divider" />

        {/* Address */}
        {contact.address && (
          <div style={detailRowStyle}>
            <span style={iconStyle}>📍</span>
            <div style={detailTextStyle}>
              <h4 style={detailLabelStyle}>Address</h4>
              <p style={detailContentStyle}>
                {contact.address.split("\n").map((line, i) => (
                  <span key={i}>{line}{i < contact.address.split("\n").length - 1 ? <br /> : null}</span>
                ))}
              </p>
            </div>
          </div>
        )}

        {/* Hours */}
        <div style={detailRowStyle}>
          <span style={iconStyle}>🕐</span>
          <div style={detailTextStyle}>
            <h4 style={detailLabelStyle}>Opening Hours</h4>
            <div style={hoursGridStyle}>
              <div style={hourRowStyle}>
                <strong style={dayStyle}>Mon–Fri</strong>
                <span style={timeStyle}>{contact.weekdayHours || "11:00 AM – 11:00 PM"}</span>
              </div>
              <div style={hourRowStyle}>
                <strong style={dayStyle}>Sat–Sun</strong>
                <span style={timeStyle}>{contact.weekendHours || "10:00 AM – 12:00 AM"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phone */}
        {contact.phone && (
          <div style={detailRowStyle}>
            <span style={iconStyle}>📞</span>
            <div style={detailTextStyle}>
              <h4 style={detailLabelStyle}>Phone</h4>
              <p style={detailContentStyle}><a href={`tel:${contact.phone}`} style={{color:"var(--gold)"}}>{contact.phone}</a></p>
            </div>
          </div>
        )}

        {/* Reservation note */}
        {contact.reservationNote && (
          <div style={detailRowStyle}>
            <span style={iconStyle}>📋</span>
            <div style={detailTextStyle}>
              <h4 style={detailLabelStyle}>Reservations</h4>
              <p style={detailContentStyle}>{contact.reservationNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: social + quote ── */}
      <div>
        <p className="section-label">Stay Connected</p>
        <h2 style={headingStyle}>
          Follow Our <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Journey</em>
        </h2>
        <div className="divider" />
        <p style={socialSubStyle}>
          Follow us on social media for daily specials, behind-the-scenes content,
          and stories from our kitchen.
        </p>

        <div style={socialBtnsStyle}>
          {social.instagram && social.instagram !== "#" && (
            <a href={social.instagram} target="_blank" rel="noreferrer" className="btn-primary">📸 Instagram</a>
          )}
          {social.facebook && social.facebook !== "#" && (
            <a href={social.facebook} target="_blank" rel="noreferrer" className="btn-outline">📘 Facebook</a>
          )}
          {social.twitter && (
            <a href={social.twitter} target="_blank" rel="noreferrer" className="btn-outline">🐦 Twitter</a>
          )}
          {social.youtube && (
            <a href={social.youtube} target="_blank" rel="noreferrer" className="btn-outline">▶️ YouTube</a>
          )}
          {/* Fallback if none configured */}
          {!social.instagram && !social.facebook && !social.twitter && !social.youtube && (
            <>
              <a href="#" className="btn-primary">📸 Instagram</a>
              <a href="#" className="btn-outline">📘 Facebook</a>
            </>
          )}
        </div>

        {/* quote block */}
        <div style={quoteBlockStyle}>
          <p style={quoteTextStyle}>
            "The best cafes don't just serve food — they serve moments you carry with you forever."
          </p>
          <p style={quoteAuthorStyle}>— BITES &amp; MORE</p>
        </div>
      </div>
    </section>
  );
}

/* ── STYLES ── */
const sectionStyle   = { padding:"6rem 5%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", borderTop:"1px solid var(--border)" };
const headingStyle   = { fontFamily:"'Playfair Display', serif", fontSize:"2rem", fontWeight:700, color:"var(--cream)", marginBottom:"1.5rem", lineHeight:1.15 };
const detailRowStyle = { display:"flex", gap:"1rem", alignItems:"flex-start", marginBottom:"1.5rem" };
const iconStyle      = { fontSize:"1.2rem", marginTop:"0.1rem", flexShrink:0 };
const detailTextStyle = { flex:1 };
const detailLabelStyle = { fontSize:"0.78rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"0.3rem", fontWeight:600 };
const detailContentStyle = { fontSize:"0.9rem", color:"var(--muted)", lineHeight:1.6, margin:0 };
const hoursGridStyle = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem 2rem", marginTop:"0.5rem" };
const hourRowStyle   = { fontSize:"0.85rem", color:"var(--muted)", lineHeight:1.6 };
const dayStyle       = { color:"var(--cream)", fontWeight:500, display:"block" };
const timeStyle      = { display:"block" };
const socialSubStyle = { fontSize:"0.9rem", color:"var(--muted)", lineHeight:1.8, marginBottom:"2rem" };
const socialBtnsStyle = { display:"flex", gap:"1rem", flexWrap:"wrap" };
const quoteBlockStyle = { marginTop:"3rem", padding:"2rem", border:"1px solid var(--border)", borderRadius:"4px", background:"rgba(255,255,255,0.02)" };
const quoteTextStyle  = { fontFamily:"'Playfair Display', serif", fontSize:"1.1rem", fontStyle:"italic", color:"var(--cream)", lineHeight:1.6, margin:0 };
const quoteAuthorStyle = { fontSize:"0.78rem", color:"var(--gold)", marginTop:"1rem", letterSpacing:"0.1em", marginBottom:0 };
