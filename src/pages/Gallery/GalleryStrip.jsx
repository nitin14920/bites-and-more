export default function GalleryStrip({ items, onOpen }) {
  return (
    <div style={wrapStyle}>
      {items.map((item, i) => (
        <StripItem
          key={item.id ?? i}
          item={item}
          src={item.src}
          onOpen={() => onOpen(i)}
        />
      ))}
    </div>
  );
}

function StripItem({ item, src, onOpen }) {
  return (
    <div
      style={itemStyle}
      onClick={onOpen}
      onMouseEnter={(e) => {
        e.currentTarget.style.flexBasis = "300px";
        e.currentTarget.style.transform = "translateY(-4px)";
        const img = e.currentTarget.querySelector("img");
        if (img) img.style.filter = "brightness(1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.flexBasis = "200px";
        e.currentTarget.style.transform = "translateY(0)";
        const img = e.currentTarget.querySelector("img");
        if (img) img.style.filter = "brightness(0.7)";
      }}
    >
      {src ? (
        <img src={src} alt={item.label} style={imgStyle} />
      ) : (
        <div style={placeholderStyle(item.color)}>
          {item.emoji}
        </div>
      )}
    </div>
  );
}

/* ── styles ── */
const wrapStyle = {
  padding:        "2rem 5%",
  borderBottom:   "1px solid var(--border)",
  overflowX:      "auto",
  display:        "flex",
  gap:            "1rem",
  scrollbarWidth: "thin",
  scrollbarColor: "var(--gold) var(--charcoal)",
};

const itemStyle = {
  flex:         "0 0 200px",
  height:       "130px",
  borderRadius: "4px",
  overflow:     "hidden",
  position:     "relative",
  transition:   "transform 0.3s, flex-basis 0.4s",
  cursor:       "pointer",
  background:   "var(--espresso)",
};

const imgStyle = {
  width:      "100%",
  height:     "100%",
  objectFit:  "cover",
  filter:     "brightness(0.7)",
  transition: "filter 0.3s",
  display:    "block",
};

const placeholderStyle = (color) => ({
  width:          "100%",
  height:         "100%",
  background:     `linear-gradient(135deg, ${color}, ${color}aa)`,
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  fontSize:       "2.5rem",
});
