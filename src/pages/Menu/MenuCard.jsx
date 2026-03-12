import { useAdmin }        from "../../context/AdminContext";
import useImageUpload      from "../../hooks/useImageUpload";

export default function MenuCard({ item, onZoom }) {
  const { isAdmin, cardImages, cardImageUrl, updateCardImage, togglePopular, popularItemIds } = useAdmin();

  const isPopular = popularItemIds.has(item.id);
  const uploadedImg = item.imageUrl || cardImageUrl(item.id) || null;

  const { inputRef, trigger, handleChange } = useImageUpload((file) => {
    updateCardImage(item.id, file);
  });

  function handleCardClick(e) {
    // Ignore button/input clicks
    if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;
    // Admin clicking upload zone triggers upload
    if (isAdmin && e.currentTarget.dataset.zone === "true") {
      trigger();
      return;
    }
    onZoom(item);
  }

  function handleRemove(e) {
    e.stopPropagation();
    updateCardImage(item.id, null);
  }

  return (
    <div style={cardStyle}>
      {/* Popular toggle — admin only */}
      {isAdmin && (
        <button
          style={popularBtnStyle(isPopular)}
          onClick={(e) => { e.stopPropagation(); togglePopular(item.id); }}
          title="Toggle Popular"
        >
          {isPopular ? "⭐ Popular" : "☆ Popular"}
        </button>
      )}

      {/* Image / upload zone */}
      <div
        data-zone="true"
        style={uploadZoneStyle(isAdmin)}
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          if (isAdmin && uploadedImg) e.currentTarget.querySelector("[data-hover]").style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          if (isAdmin && uploadedImg) e.currentTarget.querySelector("[data-hover]")?.style && (e.currentTarget.querySelector("[data-hover]").style.opacity = "0");
        }}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Uploaded image */}
        {uploadedImg && (
          <img src={uploadedImg} alt={item.name} style={uploadedImgStyle} />
        )}

        {/* Placeholder */}
        <div style={placeholderStyle(!!uploadedImg)}>
          <span style={{ fontSize: "2.6rem" }}>{item.emoji}</span>
          {isAdmin && (
            <>
              <span style={hintStyle}>📷 Upload Photo</span>
              <span style={subHintStyle}>Click to add dish image</span>
            </>
          )}
          {!isAdmin && (
            <span style={{ fontSize: "0.65rem", color: "var(--muted)", opacity: 0.7 }}>
              No image yet
            </span>
          )}
        </div>

        {/* Gradient overlay */}
        <div style={overlayStyle} />

        {/* Hover change overlay (admin + has image) */}
        {isAdmin && uploadedImg && (
          <div data-hover style={hoverOverlayStyle}>
            <span style={{ fontSize: "1.4rem" }}>📷</span>
            Change Photo
          </div>
        )}

        {/* Remove button */}
        {isAdmin && uploadedImg && (
          <button style={removeBtnStyle} onClick={handleRemove}>
            ✕ Remove
          </button>
        )}

        {/* Badge + Veg indicator */}
        {item.badge && <span style={badgeStyle}>{item.badge}</span>}
        <span style={vegBadgeStyle(item.veg)}>●</span>
      </div>

      {/* Card body — clicking opens zoom */}
      <div style={bodyStyle} onClick={() => onZoom(item)}>
        <p style={nameStyle}>{item.name}</p>
        <p style={descStyle}>{item.desc}</p>
        <div style={footerStyle}>
          <span style={priceStyle}>{item.price}</span>
          <span style={{ fontSize: "0.72rem", color: "var(--muted)", letterSpacing: "0.05em" }}>
            {item.veg ? "🟢 Veg" : "🔴 Non-Veg"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── STYLES ── */
const cardStyle = {
  background:   "rgba(255,255,255,0.03)",
  border:       "1px solid var(--border)",
  borderRadius: "8px",
  overflow:     "hidden",
  transition:   "all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
  position:     "relative",
  cursor:       "pointer",
};

const popularBtnStyle = (active) => ({
  position:     "absolute",
  top:          "0.5rem",
  left:         "0.5rem",
  zIndex:       8,
  background:   active ? "rgba(201,144,58,0.2)" : "rgba(26,22,18,0.85)",
  border:       `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
  borderRadius: "4px",
  color:        active ? "var(--gold)" : "var(--muted)",
  fontSize:     "0.6rem",
  padding:      "0.25rem 0.5rem",
  cursor:       "pointer",
  transition:   "all 0.2s",
  letterSpacing:"0.06em",
  whiteSpace:   "nowrap",
  fontFamily:   "'DM Sans', sans-serif",
});

const uploadZoneStyle = (isAdmin) => ({
  width:       "100%",
  aspectRatio: "16/10",
  position:    "relative",
  overflow:    "hidden",
  background:  "linear-gradient(135deg, var(--espresso) 0%, #3d2415 100%)",
  cursor:      isAdmin ? "pointer" : "default",
});

const uploadedImgStyle = {
  position:   "absolute",
  inset:      0,
  width:      "100%",
  height:     "100%",
  objectFit:  "cover",
  zIndex:     2,
  opacity:    0.85,
  transition: "transform 0.6s, opacity 0.4s",
};

const placeholderStyle = (hasImg) => ({
  position:       "absolute",
  inset:          0,
  zIndex:         1,
  display:        "flex",
  flexDirection:  "column",
  alignItems:     "center",
  justifyContent: "center",
  gap:            "0.5rem",
  opacity:        hasImg ? 0 : 1,
  transition:     "opacity 0.3s",
  pointerEvents:  "none",
});

const hintStyle = {
  fontSize:      "0.72rem",
  color:         "var(--gold)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  opacity:       0.8,
};
const subHintStyle = {
  fontSize: "0.65rem",
  color:    "var(--muted)",
};

const overlayStyle = {
  position:   "absolute",
  inset:      0,
  zIndex:     3,
  background: "linear-gradient(to top, rgba(26,22,18,0.75) 0%, transparent 55%)",
  pointerEvents: "none",
};

const hoverOverlayStyle = {
  position:       "absolute",
  inset:          0,
  zIndex:         4,
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  background:     "rgba(26,22,18,0.55)",
  opacity:        0,
  transition:     "opacity 0.3s",
  pointerEvents:  "none",
  fontSize:       "0.75rem",
  color:          "var(--gold)",
  letterSpacing:  "0.1em",
  textTransform:  "uppercase",
  flexDirection:  "column",
  gap:            "0.4rem",
};

const removeBtnStyle = {
  position:     "absolute",
  top:          "0.6rem",
  left:         "0.6rem",
  zIndex:       10,
  background:   "rgba(168,76,47,0.92)",
  border:       "none",
  borderRadius: "4px",
  color:        "white",
  fontSize:     "0.65rem",
  fontWeight:   600,
  letterSpacing:"0.08em",
  padding:      "0.28rem 0.6rem",
  cursor:       "pointer",
  textTransform:"uppercase",
  display:      "flex",
  alignItems:   "center",
  gap:          "0.3rem",
  transition:   "background 0.2s",
  fontFamily:   "'DM Sans', sans-serif",
};

const badgeStyle = {
  position:     "absolute",
  top:          "0.8rem",
  left:         "0.8rem",
  padding:      "0.25rem 0.7rem",
  background:   "var(--rust)",
  color:        "white",
  fontSize:     "0.65rem",
  fontWeight:   600,
  letterSpacing:"0.1em",
  textTransform:"uppercase",
  borderRadius: "3px",
  zIndex:       5,
};

const vegBadgeStyle = (veg) => ({
  position:       "absolute",
  top:            "0.8rem",
  right:          "0.8rem",
  width:          "22px",
  height:         "22px",
  border:         `2px solid ${veg ? "#5a9e4b" : "#c0392b"}`,
  borderRadius:   "3px",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  fontSize:       "0.5rem",
  color:          veg ? "#5a9e4b" : "#c0392b",
  zIndex:         5,
  background:     "rgba(26,22,18,0.6)",
});

const bodyStyle = {
  padding: "1.2rem 1.4rem 1.4rem",
  cursor:  "pointer",
};
const nameStyle = {
  fontFamily:   "'Playfair Display', serif",
  fontSize:     "1rem",
  fontWeight:   700,
  color:        "var(--cream)",
  marginBottom: "0.3rem",
  lineHeight:   1.3,
};
const descStyle = {
  fontSize:     "0.78rem",
  color:        "var(--muted)",
  lineHeight:   1.5,
  marginBottom: "1rem",
};
const footerStyle = {
  display:        "flex",
  alignItems:     "center",
  justifyContent: "space-between",
  marginTop:      "0.8rem",
};
const priceStyle = {
  fontFamily: "'Playfair Display', serif",
  fontSize:   "1.1rem",
  fontWeight: 700,
  color:      "var(--gold)",
};
