import { useEffect, useCallback } from "react";

/**
 * Lightbox
 * @param {object}   item      — gallery item { label, emoji, color, src? }
 * @param {number}   index     — current index (for prev/next)
 * @param {number}   total     — total items count
 * @param {function} onClose   — close handler
 * @param {function} onPrev    — go to previous
 * @param {function} onNext    — go to next
 */
export default function Lightbox({ item, index, total, onClose, onPrev, onNext }) {
  /* keyboard navigation */
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!item) return null;

  /* build SVG placeholder when no real image */
  const placeholderSrc = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
      <rect width='800' height='500' fill='${item.color}'/>
      <text x='400' y='210' font-size='130' text-anchor='middle' dominant-baseline='middle'>${item.emoji}</text>
      <text x='400' y='390' font-size='28' fill='#c9903a' text-anchor='middle' font-family='Georgia,serif' font-style='italic'>${item.label}</text>
    </svg>`
  )}`;

  return (
    <>
      {/* backdrop */}
      <div style={backdropStyle} onClick={onClose} />

      {/* container */}
      <div style={containerStyle}>

        {/* close */}
        <button style={closeBtnStyle} onClick={onClose} aria-label="Close">✕</button>

        {/* prev */}
        {total > 1 && (
          <button style={navBtnStyle("left")} onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous">
            ‹
          </button>
        )}

        {/* image */}
        <div style={imgWrapStyle} onClick={(e) => e.stopPropagation()}>
          <img
            key={item.id ?? index}          /* remount on change → fresh animation */
            src={item.src ?? placeholderSrc}
            alt={item.label}
            style={imgStyle}
          />
          {/* label bar */}
          <div style={labelBarStyle}>
            <span style={labelStyle}>{item.label}</span>
            <span style={counterStyle}>{index + 1} / {total}</span>
          </div>
        </div>

        {/* next */}
        {total > 1 && (
          <button style={navBtnStyle("right")} onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next">
            ›
          </button>
        )}
      </div>
    </>
  );
}

/* ── styles ── */
const backdropStyle = {
  position:       "fixed",
  inset:          0,
  zIndex:         2000,
  background:     "rgba(0,0,0,0.95)",
  backdropFilter: "blur(8px)",
  cursor:         "pointer",
};

const containerStyle = {
  position:       "fixed",
  inset:          0,
  zIndex:         2001,
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  padding:        "2rem",
  gap:            "1.5rem",
  pointerEvents:  "none",   /* clicks fall through to backdrop by default */
};

const imgWrapStyle = {
  position:     "relative",
  maxWidth:     "90vw",
  maxHeight:    "85vh",
  pointerEvents:"all",
  borderRadius: "6px",
  overflow:     "hidden",
  boxShadow:    "0 32px 80px rgba(0,0,0,0.7)",
  animation:    "scaleIn 0.3s ease",
};

const imgStyle = {
  display:   "block",
  maxWidth:  "90vw",
  maxHeight: "82vh",
  objectFit: "contain",
};

const labelBarStyle = {
  position:       "absolute",
  bottom:         0,
  left:           0,
  right:          0,
  padding:        "1rem 1.5rem",
  background:     "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
  display:        "flex",
  justifyContent: "space-between",
  alignItems:     "flex-end",
};

const labelStyle = {
  fontFamily: "'Playfair Display', serif",
  fontSize:   "1rem",
  fontStyle:  "italic",
  color:      "var(--cream)",
};

const counterStyle = {
  fontSize:      "0.72rem",
  letterSpacing: "0.15em",
  color:         "var(--muted)",
};

const closeBtnStyle = {
  position:       "fixed",
  top:            "1.5rem",
  right:          "1.5rem",
  zIndex:         2002,
  background:     "rgba(255,255,255,0.06)",
  border:         "1px solid var(--border)",
  borderRadius:   "50%",
  width:          "44px",
  height:         "44px",
  color:          "var(--cream)",
  fontSize:       "1.1rem",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  cursor:         "pointer",
  transition:     "all 0.25s",
  pointerEvents:  "all",
};

const navBtnStyle = (side) => ({
  pointerEvents:  "all",
  background:     "rgba(255,255,255,0.06)",
  border:         "1px solid var(--border)",
  borderRadius:   "50%",
  width:          "52px",
  height:         "52px",
  color:          "var(--cream)",
  fontSize:       "1.8rem",
  lineHeight:     1,
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  cursor:         "pointer",
  transition:     "all 0.25s",
  flexShrink:     0,
  paddingBottom:  side === "left" ? "2px" : "2px",
});
