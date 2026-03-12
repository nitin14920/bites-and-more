export default function MenuFilters({ search, onSearch, filter, onFilter, categories }) {
  const FILTERS = [
    { key: "all",     label: "All Items" },
    { key: "veg",     label: "🟢 Veg"   },
    { key: "non-veg", label: "🔴 Non-Veg" },
    ...(categories||[]).map((c) => ({ key: c.key, label: `${c.icon} ${c.label.split("—")[0].trim().split(" ").slice(0,2).join(" ")}` })),
  ];
  return (
    <div>
      {/* Search bar */}
      <div style={searchWrapStyle}>
        <div
          style={searchBarStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <span style={{ color: "var(--gold)", fontSize: "1rem" }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search dishes, drinks, ingredients…"
            style={inputStyle}
          />
          {search && (
            <button onClick={() => onSearch("")} style={clearBtnStyle}>✕</button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={filtersStyle}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilter(f.key)}
            style={filterBtnStyle(filter === f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── STYLES ── */
const searchWrapStyle = {
  padding:        "2rem 5% 0",
  background:     "radial-gradient(ellipse at center top, rgba(201,144,58,0.06) 0%, transparent 60%)",
  borderBottom:   "1px solid var(--border)",
  paddingBottom:  "2rem",
};
const searchBarStyle = {
  display:      "flex",
  alignItems:   "center",
  gap:          "1rem",
  maxWidth:     "520px",
  margin:       "0 auto",
  background:   "rgba(255,255,255,0.04)",
  border:       "1px solid var(--border)",
  borderRadius: "50px",
  padding:      "0.7rem 1.5rem",
  transition:   "border-color 0.3s",
};
const inputStyle = {
  flex:        1,
  background:  "none",
  border:      "none",
  outline:     "none",
  color:       "var(--cream)",
  fontFamily:  "'DM Sans', sans-serif",
  fontSize:    "0.9rem",
};
const clearBtnStyle = {
  background:  "none",
  border:      "none",
  color:       "var(--muted)",
  cursor:      "pointer",
  fontSize:    "0.8rem",
  padding:     "2px 4px",
  lineHeight:  1,
};
const filtersStyle = {
  display:         "flex",
  gap:             "0.8rem",
  flexWrap:        "wrap",
  justifyContent:  "center",
  padding:         "1.8rem 5%",
  borderBottom:    "1px solid var(--border)",
};
const filterBtnStyle = (active) => ({
  cursor:        "pointer",
  padding:       "0.55rem 1.4rem",
  background:    active ? "var(--gold)"    : "transparent",
  border:        `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
  borderRadius:  "50px",
  color:         active ? "var(--charcoal)" : "var(--muted)",
  fontSize:      "0.8rem",
  fontWeight:    active ? 600 : 500,
  letterSpacing: "0.08em",
  transition:    "all 0.3s",
  fontFamily:    "'DM Sans', sans-serif",
  whiteSpace:    "nowrap",
});
