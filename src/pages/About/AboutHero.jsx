import { Link }          from "react-router-dom";
import { useAdmin }       from "../../context/AdminContext";
import useImageUpload     from "../../hooks/useImageUpload";

export default function AboutHero() {
  const { isAdmin, aboutHeroImage, updateAboutHeroImage, aboutInfo } = useAdmin();

  const { inputRef, trigger, handleChange } = useImageUpload(updateAboutHeroImage);

  return (
    <section style={sectionStyle}>

      {/* ── LEFT: story text ── */}
      <div>
        <p className="section-label">Our Story</p>
        <h1 className="section-title">
          A Place Born<br />from <em>Passion</em>
        </h1>
        <div className="divider" />
        <div style={storyStyle}>
          {(aboutInfo?.storyParagraphs || []).map((para, i) => (
            <p key={i} style={paraStyle}>{para}</p>
          ))}
        </div>
        <Link to="/menu" className="btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
          Explore Our Menu
        </Link>
      </div>

      {/* ── RIGHT: image column ── */}
      <div style={imgWrapStyle}>

        {/* image box */}
        <div
          style={imgMainStyle(isAdmin)}
          onClick={() => isAdmin && trigger()}
          title={isAdmin ? "Click to upload photo" : ""}
          onMouseEnter={(e) => {
            if (isAdmin) e.currentTarget.querySelector("[data-overlay]").style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            if (isAdmin) e.currentTarget.querySelector("[data-overlay]")?.style &&
              (e.currentTarget.querySelector("[data-overlay]").style.opacity = "0");
          }}
        >
          {/* uploaded photo */}
          {aboutHeroImage && (
            <img src={aboutHeroImage} alt="About hero" style={imgStyle} />
          )}

          {/* emoji placeholder */}
          {!aboutHeroImage && (
            <span style={placeholderStyle}>🏮</span>
          )}

          {/* admin hover overlay */}
          {isAdmin && (
            <div data-overlay style={uploadOverlayStyle}>
              <span style={{ fontSize: "1.8rem" }}>📷</span>
              <span style={overlayLabelStyle}>
                {aboutHeroImage ? "Replace Photo" : "Upload Photo"}
              </span>
            </div>
          )}

          {/* hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
          />
        </div>

        {/* floating accent box */}
        <div style={accentBoxStyle}>
          <div style={accentNumStyle}>{aboutInfo?.yearsLabel ?? "8+"}</div>
          <div style={accentTextStyle}>{aboutInfo?.yearsDesc ?? "Years of culinary excellence in Agra"}</div>
        </div>
      </div>
    </section>
  );
}

/* ── STYLES ── */
const sectionStyle = {
  padding:      "5rem 5%",
  background:   "radial-gradient(ellipse at 30% center, rgba(201,144,58,0.07) 0%, transparent 60%)",
  display:      "grid",
  gridTemplateColumns: "1fr 1fr",
  gap:          "5rem",
  alignItems:   "center",
  borderBottom: "1px solid var(--border)",
};

const storyStyle = { marginBottom: "0.5rem" };

const paraStyle = {
  fontSize:     "1rem",
  color:        "var(--muted)",
  lineHeight:   1.9,
  marginBottom: "1.2rem",
};

const imgWrapStyle = { position: "relative" };

const imgMainStyle = (isAdmin) => ({
  width:          "100%",
  aspectRatio:    "4 / 5",
  background:     "linear-gradient(135deg, var(--espresso), rgba(168,76,47,0.3))",
  borderRadius:   "4px",
  overflow:       "hidden",
  position:       "relative",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  cursor:         isAdmin ? "pointer" : "default",
});

const imgStyle = {
  position:   "absolute",
  inset:      0,
  width:      "100%",
  height:     "100%",
  objectFit:  "cover",
};

const placeholderStyle = {
  fontSize:  "6rem",
  color:     "rgba(201,144,58,0.3)",
  position:  "relative",
  zIndex:    1,
};

const uploadOverlayStyle = {
  position:       "absolute",
  inset:          0,
  zIndex:         3,
  background:     "rgba(0,0,0,0.5)",
  display:        "flex",
  flexDirection:  "column",
  alignItems:     "center",
  justifyContent: "center",
  gap:            "0.4rem",
  opacity:        0,
  transition:     "opacity 0.3s",
  pointerEvents:  "none",
};

const overlayLabelStyle = {
  fontSize:      "0.7rem",
  color:         "var(--cream)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

const accentBoxStyle = {
  position:     "absolute",
  bottom:       "-2rem",
  left:         "-2rem",
  width:        "160px",
  padding:      "1.8rem",
  background:   "var(--espresso)",
  border:       "1px solid var(--border)",
  borderRadius: "4px",
};

const accentNumStyle = {
  fontFamily:   "'Playfair Display', serif",
  fontSize:     "2.5rem",
  fontWeight:   900,
  color:        "var(--gold)",
  lineHeight:   1,
  marginBottom: "0.4rem",
};

const accentTextStyle = {
  fontSize:   "0.8rem",
  color:      "var(--muted)",
  lineHeight: 1.4,
};
