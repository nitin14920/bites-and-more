import useReveal  from "../../hooks/useReveal";
import { useAdmin } from "../../context/AdminContext";

export default function ValuesSection() {
  const sectionRef = useReveal();
  const { aboutInfo } = useAdmin();
  const VALUES = aboutInfo?.values ?? [];

  return (
    <section ref={sectionRef} style={sectionStyle}>
      <p className="section-label reveal">What We Stand For</p>
      <h2 className="section-title reveal">
        Our <em>Values</em>
      </h2>

      <div style={gridStyle}>
        {VALUES.map((v, i) => (
          <div
            key={v.title}
            className="reveal"
            style={{ ...valueItemStyle, transitionDelay: `${i * 0.12}s` }}
          >
            <h3 style={valueTitleStyle}>{v.title}</h3>
            <p  style={valueDescStyle}>{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── STYLES ── */
const sectionStyle = {
  padding:     "6rem 5%",
  background:  "rgba(255,255,255,0.01)",
  borderTop:   "1px solid var(--border)",
};

const gridStyle = {
  display:             "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap:                 "3rem",
  marginTop:           "3.5rem",
};

const valueItemStyle = {
  paddingLeft:  "1.5rem",
  borderLeft:   "2px solid var(--gold)",
};

const valueTitleStyle = {
  fontFamily:   "'Playfair Display', serif",
  fontSize:     "1.15rem",
  fontWeight:   700,
  color:        "var(--cream)",
  marginBottom: "0.7rem",
};

const valueDescStyle = {
  fontSize:   "0.88rem",
  color:      "var(--muted)",
  lineHeight: 1.7,
};
