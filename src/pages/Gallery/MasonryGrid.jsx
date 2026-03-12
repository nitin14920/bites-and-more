import { useRef, useCallback }  from "react";
import { useAdmin }             from "../../context/AdminContext";
import useReveal                from "../../hooks/useReveal";

/* heights cycle to create masonry feel */
const HEIGHTS = [
  "220px","300px","180px","260px","200px","280px",
  "240px","190px","310px","170px","250px","290px",
];

export default function MasonryGrid({ items, onOpen, onAddItems, onRemove, onChangeImage }) {
  const { isAdmin } = useAdmin();
  const sectionRef = useReveal();

  /* ── multi-upload ref for add card ── */
  const addInputRef = useRef(null);

  const handleAdd = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    onAddItems(files);   // pass File objects — Gallery/index.jsx handles upload
    e.target.value = "";
  }, [onAddItems]);

  return (
    <div ref={sectionRef} className="masonry-grid">
      {/* ── Admin: Add Photo card ── */}
      {isAdmin && (
        <div
          style={addCardStyle}
          onClick={() => addInputRef.current?.click()}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor  = "var(--gold)";
            e.currentTarget.style.background   = "rgba(201,144,58,0.07)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor  = "var(--border)";
            e.currentTarget.style.background   = "rgba(255,255,255,0.02)";
          }}
        >
          <input
            ref={addInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleAdd}
          />
          <span style={{ fontSize: "2rem", color: "var(--gold)" }}>＋</span>
          <span style={addTextStyle}>Add Photo</span>
          <span style={addSubStyle}>Upload to gallery</span>
        </div>
      )}

      {/* ── Gallery items ── */}
      {items.map((item, i) => (
        <GalleryItem
          key={item.id ?? i}
          item={item}
          height={HEIGHTS[i % HEIGHTS.length]}
          index={i}
          isAdmin={isAdmin}
          onOpen={() => onOpen(i)}
          onRemove={(e) => { e.stopPropagation(); onRemove(i); }}
          onChangeImage={(src) => onChangeImage(i, src)}
        />
      ))}
    </div>
  );
}

/* ── single gallery tile ── */
function GalleryItem({ item, height, isAdmin, onOpen, onRemove, onChangeImage }) {
  const changeRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChangeImage(file);   // pass File — Gallery/index.jsx handles upload
    e.target.value = "";
  };

  return (
    <div
      className="reveal"
      style={itemWrapStyle(height)}
      onClick={onOpen}
      onMouseEnter={(e) => {
        const img = e.currentTarget.querySelector("[data-img]");
        if (img) { img.style.transform = "scale(1.04)"; img.style.filter = "brightness(1) saturate(1.1)"; }
        const overlay = e.currentTarget.querySelector("[data-overlay]");
        if (overlay) overlay.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        const img = e.currentTarget.querySelector("[data-img]");
        if (img) { img.style.transform = "scale(1)"; img.style.filter = "brightness(0.8) saturate(0.9)"; }
        const overlay = e.currentTarget.querySelector("[data-overlay]");
        if (overlay) overlay.style.opacity = "0";
      }}
    >
      {/* image or emoji placeholder */}
      {item.src ? (
        <img
          data-img
          src={item.src}
          alt={item.label}
          style={imgStyle}
        />
      ) : (
        <div data-img style={emojiPlaceholderStyle(item.color, height)}>
          {item.emoji}
        </div>
      )}

      {/* hover overlay with label */}
      <div data-overlay style={overlayStyle} onClick={onOpen}>
        <span style={labelStyle}>{item.label}</span>
      </div>

      {/* Admin: Remove button */}
      {isAdmin && (
        <button
          style={removeBtnStyle}
          onClick={onRemove}
          title="Remove photo"
        >
          ✕ Remove
        </button>
      )}

      {/* Admin: Change image button (only when image exists) */}
      {isAdmin && item.src && (
        <label
          style={changeBtnStyle}
          onClick={(e) => e.stopPropagation()}
          title="Change photo"
        >
          ✎ Change
          <input
            ref={changeRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
          />
        </label>
      )}
    </div>
  );
}

/* ── styles ── */
const addCardStyle = {
  breakInside:    "avoid",
  marginBottom:   "1.2rem",
  height:         "180px",
  border:         "2px dashed var(--border)",
  borderRadius:   "6px",
  background:     "rgba(255,255,255,0.02)",
  display:        "flex",
  flexDirection:  "column",
  alignItems:     "center",
  justifyContent: "center",
  gap:            "0.4rem",
  cursor:         "pointer",
  transition:     "all 0.3s",
};

const addTextStyle = {
  fontSize:      "0.75rem",
  color:         "var(--gold)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontWeight:    600,
};

const addSubStyle = {
  fontSize: "0.65rem",
  color:    "var(--muted)",
};

const itemWrapStyle = (height) => ({
  breakInside: "avoid",
  marginBottom:"1.2rem",
  position:    "relative",
  overflow:    "hidden",
  borderRadius:"6px",
  height:      height,
  cursor:      "pointer",
});

const imgStyle = {
  width:      "100%",
  height:     "100%",
  display:    "block",
  objectFit:  "cover",
  transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.4s",
  filter:     "brightness(0.8) saturate(0.9)",
};

const emojiPlaceholderStyle = (color, height) => ({
  width:          "100%",
  height:         height,
  background:     `linear-gradient(135deg, ${color}, ${color}88)`,
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  fontSize:       "3.5rem",
  transition:     "filter 0.4s",
});

const overlayStyle = {
  position:       "absolute",
  inset:          0,
  background:     "linear-gradient(to top, rgba(26,22,18,0.85) 0%, transparent 50%)",
  opacity:        0,
  transition:     "opacity 0.4s",
  display:        "flex",
  alignItems:     "flex-end",
  padding:        "1.5rem",
};

const labelStyle = {
  fontFamily: "'Playfair Display', serif",
  fontSize:   "0.95rem",
  fontStyle:  "italic",
  color:      "var(--cream)",
};

const removeBtnStyle = {
  position:     "absolute",
  top:          "0.6rem",
  left:         "0.6rem",
  zIndex:       10,
  background:   "rgba(168,76,47,0.9)",
  border:       "none",
  borderRadius: "4px",
  color:        "white",
  fontSize:     "0.65rem",
  fontWeight:   600,
  letterSpacing:"0.08em",
  padding:      "0.28rem 0.6rem",
  cursor:       "pointer",
  textTransform:"uppercase",
  display:      "block",
  transition:   "background 0.2s",
  fontFamily:   "'DM Sans', sans-serif",
};

const changeBtnStyle = {
  position:     "absolute",
  bottom:       "0.6rem",
  right:        "0.6rem",
  zIndex:       10,
  background:   "rgba(26,22,18,0.85)",
  border:       "1px solid var(--border)",
  borderRadius: "4px",
  color:        "var(--gold)",
  fontSize:     "0.62rem",
  fontWeight:   600,
  letterSpacing:"0.08em",
  padding:      "0.28rem 0.6rem",
  cursor:       "pointer",
  textTransform:"uppercase",
  fontFamily:   "'DM Sans', sans-serif",
};

/* ── responsive injected once at module load ── */
const _style = document.createElement("style");
_style.textContent = `
  .masonry-grid { columns: 3; column-gap: 1.2rem; padding: 3rem 5%; }
  @media (max-width: 900px) { .masonry-grid { columns: 2; } }
  @media (max-width: 600px) { .masonry-grid { columns: 1; } }
`;
if (!document.head.querySelector("[data-masonry-style]")) {
  _style.setAttribute("data-masonry-style", "1");
  document.head.appendChild(_style);
}
