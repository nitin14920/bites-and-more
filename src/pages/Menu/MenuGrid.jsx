import MenuCard from "./MenuCard";

export default function MenuGrid({ items, categories, onZoom }) {
  const hasResults = items.length > 0;

  return (
    <div>
      {!hasResults && (
        <div style={noResultsStyle}>
          <span style={{ fontSize: "3rem" }}>🔍</span>
          <h3 style={noResultsTitleStyle}>No dishes found</h3>
          <p style={noResultsSubStyle}>Try a different search term or filter</p>
        </div>
      )}

      {categories.map((cat) => {
        const catItems = items.filter((item) => item.category === cat.key);
        if (catItems.length === 0) return null;

        return (
          <div key={cat.key} style={categoryStyle}>
            {/* Category header */}
            <div style={catHeaderStyle}>
              <span style={{ fontSize: "1.6rem" }}>{cat.icon}</span>
              <h2 style={catTitleStyle}>{cat.label}</h2>
              <span style={countStyle}>
                {catItems.length} item{catItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Cards grid */}
            <div style={gridStyle}>
              {catItems.map((item) => (
                <MenuCard key={item.id} item={item} onZoom={onZoom} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── STYLES ── */
const categoryStyle = {
  padding:      "3rem 5%",
  borderBottom: "1px solid var(--border)",
};
const catHeaderStyle = {
  display:       "flex",
  alignItems:    "center",
  gap:           "1.5rem",
  marginBottom:  "2.5rem",
  flexWrap:      "wrap",
};
const catTitleStyle = {
  fontFamily: "'Playfair Display', serif",
  fontSize:   "1.8rem",
  fontWeight: 700,
  color:      "var(--gold)",
  flex:       1,
};
const countStyle = {
  fontSize:      "0.75rem",
  color:         "var(--muted)",
  letterSpacing: "0.1em",
  marginLeft:    "auto",
};
const gridStyle = {
  display:             "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
  gap:                 "1.5rem",
};
const noResultsStyle = {
  padding:        "6rem 5%",
  textAlign:      "center",
  display:        "flex",
  flexDirection:  "column",
  alignItems:     "center",
  gap:            "1rem",
};
const noResultsTitleStyle = {
  fontFamily: "'Playfair Display', serif",
  fontSize:   "1.5rem",
  color:      "var(--cream)",
};
const noResultsSubStyle = {
  fontSize: "0.9rem",
  color:    "var(--muted)",
};
