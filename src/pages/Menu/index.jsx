import { useState, useMemo } from "react";
import { useAdmin }          from "../../context/AdminContext";
import PopularStrip          from "./PopularStrip";
import MenuFilters           from "./MenuFilters";
import MenuGrid              from "./MenuGrid";
import CardZoomModal         from "./CardZoomModal";
import MenuAdminPanel        from "./MenuAdminPanel";

export default function Menu() {
  const { isAdmin, menuCategories, menuItems } = useAdmin();

  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");
  const [zoomItem,  setZoomItem]  = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    return menuItems.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        filter === "veg"     ? item.veg === true  :
        filter === "non-veg" ? item.veg === false :
        item.tags?.includes(filter) || item.category === filter;

      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.desc||"").toLowerCase().includes(q) ||
        (item.tags||[]).some((t) => t.includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [search, filter, menuItems]);

  return (
    <>
      {/* ── Page Header ── */}
      <div style={pageHeaderStyle}>
        <p style={eyebrowStyle}>✦ Our Menu ✦</p>
        <h1 style={pageTitleStyle}>
          A World of <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Flavours</em>
        </h1>
        <div style={headerDividerStyle} />
        <p style={pageSubStyle}>
          From the streets of Shanghai to the hills of Thailand — crafted fresh, served with love.
        </p>

        {/* Admin: manage menu button */}
        {isAdmin && (
          <button style={manageBtnStyle} onClick={() => setShowPanel(true)}>
            ⚙️ Manage Categories &amp; Items
          </button>
        )}
      </div>

      <PopularStrip onCardClick={setZoomItem} />

      <MenuFilters
        search={search}   onSearch={setSearch}
        filter={filter}   onFilter={setFilter}
        categories={menuCategories}
      />

      <MenuGrid items={filteredItems} categories={menuCategories} onZoom={setZoomItem} />

      {zoomItem && <CardZoomModal item={zoomItem} onClose={() => setZoomItem(null)} />}

      {showPanel && <MenuAdminPanel onClose={() => setShowPanel(false)} />}
    </>
  );
}

/* ── styles ── */
const pageHeaderStyle    = { padding:"5rem 5% 3.5rem", textAlign:"center", background:"radial-gradient(ellipse at center top, rgba(201,144,58,0.08) 0%, transparent 60%)", borderBottom:"1px solid var(--border)" };
const eyebrowStyle       = { fontSize:"0.72rem", letterSpacing:"0.32em", textTransform:"uppercase", color:"var(--gold)", marginBottom:"1rem" };
const pageTitleStyle     = { fontFamily:"'Playfair Display', serif", fontSize:"clamp(2.5rem, 6vw, 4rem)", fontWeight:900, color:"var(--cream)", lineHeight:1.1, marginBottom:"1.5rem" };
const headerDividerStyle = { width:"60px", height:"1px", background:"linear-gradient(90deg, transparent, var(--gold), transparent)", margin:"0 auto 1.5rem" };
const pageSubStyle       = { fontSize:"1rem", color:"var(--muted)", lineHeight:1.8, maxWidth:"520px", margin:"0 auto" };
const manageBtnStyle     = { marginTop:"2rem", padding:"0.7rem 2rem", background:"rgba(201,144,58,0.12)", border:"1px solid var(--gold)", borderRadius:"8px", color:"var(--gold)", fontSize:"0.82rem", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em" };
