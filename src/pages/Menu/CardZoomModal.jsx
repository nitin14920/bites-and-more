import { useEffect } from "react";
import { useAdmin }  from "../../context/AdminContext";
import menuCategories from "../../data/menuCategories";

export default function CardZoomModal({ item, onClose }) {
  const { cardImages } = useAdmin();

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!item) return null;

  const cat = menuCategories.find((c) => c.key === item.category);
  const img = cardImages[item.id];

  return (
    <>
      {/* Backdrop */}
      <div style={backdropStyle} onClick={onClose} />

      {/* Panel */}
      <div style={panelStyle}>

        {/* ── LEFT: image ── */}
        <div style={imgColStyle}>
          {img
            ? <img src={img} alt={item.name} style={imgStyle} />
            : <div style={placeholderStyle}>{item.emoji}</div>
          }
          <div style={imgOverlayStyle} />

          {/* Badge */}
          {item.badge && <span style={badgeStyle}>{item.badge}</span>}

          {/* Veg indicator */}
          <span style={vegStyle(item.veg)}>●</span>

          {/* Emoji watermark */}
          <span style={emojiWatermarkStyle}>{item.emoji}</span>
        </div>

        {/* ── RIGHT: details ── */}
        <div style={bodyStyle}>
          {/* Close */}
          <button style={closeStyle} onClick={onClose}>✕</button>

          {/* Category */}
          <p style={categoryStyle}>
            {cat ? `${cat.icon} ${cat.label}` : item.category}
          </p>

          {/* Name */}
          <h2 style={nameStyle}>{item.name}</h2>

          {/* Gold divider */}
          <div style={dividerStyle} />

          {/* Description */}
          <p style={descStyle}>{item.desc}</p>

          {/* Price row */}
          <div style={priceRowStyle}>
            <span style={priceStyle}>{item.price}</span>
            <span style={tagStyle}>
              {item.veg ? "🟢 Vegetarian" : "🔴 Non-Vegetarian"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── STYLES ── */
const backdropStyle = {
  position:        "fixed",
  inset:           0,
  zIndex:          4000,
  background:      "rgba(5,3,2,0.88)",
  backdropFilter:  "blur(18px)",
  cursor:          "pointer",
};

const panelStyle = {
  position:     "fixed",
  top:          "50%",
  left:         "50%",
  transform:    "translate(-50%,-50%)",
  width:        "min(92vw, 860px)",
  background:   "#18130e",
  border:       "1px solid rgba(201,144,58,0.25)",
  borderRadius: "16px",
  overflow:     "hidden",
  zIndex:       4001,
  display:      "grid",
  gridTemplateColumns: "1fr 1fr",
  animation:    "modalIn 0.45s cubic-bezier(0.34,1.3,0.64,1)",
};

const imgColStyle = {
  aspectRatio: "1/1",
  position:    "relative",
  overflow:    "hidden",
  background:  "#0d0905",
};

const imgStyle = {
  width:      "100%",
  height:     "100%",
  objectFit:  "cover",
  filter:     "brightness(0.85)",
  animation:  "scaleIn 0.6s ease forwards",
};

const placeholderStyle = {
  width:          "100%",
  height:         "100%",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  fontSize:       "6rem",
};

const imgOverlayStyle = {
  position:   "absolute",
  inset:      0,
  background: "linear-gradient(to right, transparent 60%, #18130e 100%), linear-gradient(to top, rgba(24,19,14,0.6) 0%, transparent 50%)",
  pointerEvents: "none",
};

const badgeStyle = {
  position:     "absolute",
  top:          "1.2rem",
  left:         "1.2rem",
  padding:      "0.3rem 0.9rem",
  background:   "var(--rust)",
  color:        "white",
  fontSize:     "0.68rem",
  fontWeight:   700,
  letterSpacing:"0.1em",
  textTransform:"uppercase",
  borderRadius: "4px",
};

const vegStyle = (veg) => ({
  position:       "absolute",
  top:            "1.2rem",
  right:          "1.2rem",
  width:          "26px",
  height:         "26px",
  border:         `2.5px solid ${veg ? "#5a9e4b" : "#c0392b"}`,
  borderRadius:   "4px",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  fontSize:       "0.55rem",
  color:          veg ? "#5a9e4b" : "#c0392b",
  background:     "rgba(24,19,14,0.7)",
});

const emojiWatermarkStyle = {
  position:     "absolute",
  right:        "-1rem",
  bottom:       "-1rem",
  fontSize:     "8rem",
  opacity:      0.04,
  pointerEvents:"none",
  lineHeight:   1,
};

const bodyStyle = {
  padding:        "2.8rem 2.5rem 2.2rem",
  display:        "flex",
  flexDirection:  "column",
  justifyContent: "center",
  position:       "relative",
};

const closeStyle = {
  position:       "absolute",
  top:            "1.2rem",
  right:          "1.2rem",
  background:     "rgba(255,255,255,0.05)",
  border:         "1px solid var(--border)",
  borderRadius:   "50%",
  width:          "34px",
  height:         "34px",
  color:          "var(--muted)",
  fontSize:       "0.9rem",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  cursor:         "pointer",
  transition:     "all 0.25s",
};

const categoryStyle = {
  fontSize:      "0.68rem",
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  color:         "var(--gold)",
  marginBottom:  "0.6rem",
};

const nameStyle = {
  fontFamily:   "'Playfair Display', serif",
  fontSize:     "clamp(1.4rem,3vw,2rem)",
  fontWeight:   900,
  color:        "var(--cream)",
  lineHeight:   1.15,
  marginBottom: "0.8rem",
};

const dividerStyle = {
  width:        "40px",
  height:       "2px",
  background:   "linear-gradient(90deg, var(--gold), transparent)",
  marginBottom: "1.2rem",
};

const descStyle = {
  fontSize:     "0.9rem",
  color:        "var(--muted)",
  lineHeight:   1.8,
  marginBottom: "1.8rem",
};

const priceRowStyle = {
  display:    "flex",
  alignItems: "center",
  gap:        "1.2rem",
  flexWrap:   "wrap",
};

const priceStyle = {
  fontFamily: "'Playfair Display', serif",
  fontSize:   "2rem",
  fontWeight: 900,
  color:      "var(--gold)",
};

const tagStyle = {
  padding:      "0.3rem 0.8rem",
  background:   "rgba(255,255,255,0.05)",
  border:       "1px solid var(--border)",
  borderRadius: "20px",
  fontSize:     "0.72rem",
  color:        "var(--muted)",
};
