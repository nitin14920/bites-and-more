import { useAdmin }       from "../../context/AdminContext";
import menuCategories     from "../../data/menuCategories";

export default function PopularStrip({ onCardClick }) {
  const { isAdmin, popularItemIds, cardImages, cardImageUrl, menuItems, menuCategories: ctxCategories } = useAdmin();

  const popularItems = menuItems.filter((item) => popularItemIds.has(item.id));

  if (popularItems.length === 0 && !isAdmin) return null;

  return (
    <div style={sectionStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <p style={labelStyle}>⭐ Most Loved</p>
          <h2 style={titleStyle}>
            Popular <em style={{ color: "var(--gold)", fontStyle: "italic" }}>Picks</em>
          </h2>
        </div>
        {isAdmin && (
          <p style={adminHintStyle}>☆ Toggle popular on any card below</p>
        )}
      </div>

      {/* Strip */}
      {popularItems.length > 0 ? (
        <div style={stripStyle}>
          {popularItems.map((item) => {
            const cat = (ctxCategories || menuCategories).find((c) => c.key === item.category);
            const img = item.imageUrl || cardImageUrl(item.id);
            return (
              <div
                key={item.id}
                style={cardStyle}
                onClick={() => onCardClick(item)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.transform   = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform   = "translateY(0)";
                }}
              >
                <div style={starBadgeStyle}>⭐</div>
                <div style={imgAreaStyle}>
                  {img
                    ? <img src={img} alt={item.name} style={imgStyle} />
                    : <div style={placeholderStyle}>{item.emoji}</div>
                  }
                </div>
                <div style={cardBodyStyle}>
                  <div style={cardNameStyle}>{item.name}</div>
                  <div style={cardFootStyle}>
                    <span style={priceStyle}>{item.price}</span>
                    <span style={{ fontSize: "0.55rem", color: item.veg ? "#5a9e4b" : "#c0392b" }}>●</span>
                  </div>
                  {cat && (
                    <div style={catLabelStyle}>
                      {cat.icon} {cat.label.split("—")[0].trim()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={emptyStyle}>
          No popular items yet — toggle ☆ on any menu card below to mark it as popular.
        </p>
      )}

      <div style={dividerStyle} />
    </div>
  );
}

/* ── STYLES ── */
const sectionStyle    = { padding: "3rem 5% 0" };
const headerStyle     = { display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" };
const labelStyle      = { fontSize: "0.68rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.4rem" };
const titleStyle      = { fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 700, color: "var(--cream)", margin: 0 };
const adminHintStyle  = { fontSize: "0.72rem", color: "var(--muted)", fontStyle: "italic", marginBottom: "0.2rem" };
const stripStyle      = { display: "flex", gap: "1.2rem", overflowX: "auto", paddingBottom: "1.5rem", scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" };
const cardStyle       = { flexShrink: 0, width: "170px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", transition: "all 0.3s", position: "relative", cursor: "pointer" };
const starBadgeStyle  = { position: "absolute", top: "0.5rem", left: "0.5rem", zIndex: 2, fontSize: "0.9rem", background: "rgba(0,0,0,0.55)", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" };
const imgAreaStyle    = { width: "100%", aspectRatio: "1/1", overflow: "hidden", background: "rgba(201,144,58,0.06)", display: "flex", alignItems: "center", justifyContent: "center" };
const imgStyle        = { width: "100%", height: "100%", objectFit: "cover" };
const placeholderStyle = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem" };
const cardBodyStyle   = { padding: "0.7rem 0.8rem" };
const cardNameStyle   = { fontSize: "0.82rem", fontWeight: 600, color: "var(--cream)", marginBottom: "0.35rem", lineHeight: 1.3 };
const cardFootStyle   = { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" };
const priceStyle      = { fontSize: "0.82rem", color: "var(--gold)", fontWeight: 700 };
const catLabelStyle   = { fontSize: "0.62rem", color: "var(--muted)", letterSpacing: "0.05em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const emptyStyle      = { color: "var(--muted)", fontSize: "0.82rem", fontStyle: "italic", padding: "1rem 0" };
const dividerStyle    = { height: "1px", background: "var(--border)", marginTop: "2.5rem" };
