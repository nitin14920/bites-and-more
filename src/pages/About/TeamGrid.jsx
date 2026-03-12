import { useRef }       from "react";
import { useAdmin }     from "../../context/AdminContext";
import useReveal        from "../../hooks/useReveal";

export default function TeamGrid() {
  const { isAdmin, teamMembers, teamAvatars, teamAvatarUrl, updateTeamAvatar } = useAdmin();
  const sectionRef = useReveal();

  return (
    <section ref={sectionRef} style={sectionStyle}>
      <p className="section-label reveal">The People Behind the Magic</p>
      <h2 className="section-title reveal">
        Meet Our <em>Team</em>
      </h2>

      <div style={gridStyle}>
        {teamMembers.map((member, i) => (
          <TeamCard
            key={member.id}
            member={member}
            index={i}
            avatar={member.avatarUrl || teamAvatarUrl(member.id) || null}
            isAdmin={isAdmin}
            onUpload={(file) => updateTeamAvatar(member.id, file)}
          />
        ))}
      </div>
    </section>
  );
}

/* ── individual team card ── */
function TeamCard({ member, index, avatar, isAdmin, onUpload }) {
  const inputRef = useRef(null);

  /* initials fallback */
  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(file);       // pass File — AdminContext handles upload to server
    e.target.value = "";
  }

  return (
    <article
      className="reveal"
      style={{ ...cardStyle, transitionDelay: `${index * 0.1}s` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(201,144,58,0.4)";
        e.currentTarget.style.transform   = "translateY(-6px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform   = "translateY(0)";
      }}
    >
      {/* Avatar */}
      <div
        style={avatarWrapStyle(isAdmin)}
        onClick={() => isAdmin && inputRef.current?.click()}
        onMouseEnter={(e) => {
          if (isAdmin) e.currentTarget.querySelector("[data-av-overlay]").style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          if (isAdmin) e.currentTarget.querySelector("[data-av-overlay]")?.style &&
            (e.currentTarget.querySelector("[data-av-overlay]").style.opacity = "0");
        }}
      >
        {/* uploaded avatar */}
        {avatar && (
          <img src={avatar} alt={member.name} style={avatarImgStyle} />
        )}

        {/* initials fallback */}
        {!avatar && (
          <span style={initialsStyle}>{initials}</span>
        )}

        {/* admin hover overlay */}
        {isAdmin && (
          <div data-av-overlay style={avatarOverlayStyle}>
            📷
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

      {/* Info */}
      <h3 style={nameStyle}>{member.name}</h3>
      <p  style={roleStyle}>{member.role}</p>
      <p  style={bioStyle}>{member.bio}</p>
    </article>
  );
}

/* ── STYLES ── */
const sectionStyle = {
  padding:   "6rem 5%",
  borderTop: "1px solid var(--border)",
};

const gridStyle = {
  display:             "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap:                 "2rem",
  marginTop:           "3.5rem",
};

const cardStyle = {
  textAlign:    "center",
  padding:      "2.5rem 1.5rem",
  border:       "1px solid var(--border)",
  borderRadius: "4px",
  transition:   "all 0.3s",
  position:     "relative",
  overflow:     "hidden",
  background:   "rgba(255,255,255,0.01)",
};

const avatarWrapStyle = (isAdmin) => ({
  width:          "80px",
  height:         "80px",
  borderRadius:   "50%",
  margin:         "0 auto 1.2rem",
  background:     "linear-gradient(135deg, var(--gold), var(--rust))",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  position:       "relative",
  overflow:       "hidden",
  cursor:         isAdmin ? "pointer" : "default",
  transition:     "all 0.3s",
});

const avatarImgStyle = {
  position:   "absolute",
  inset:      0,
  width:      "100%",
  height:     "100%",
  objectFit:  "cover",
  borderRadius:"50%",
};

const initialsStyle = {
  fontFamily: "'Playfair Display', serif",
  fontSize:   "1.6rem",
  fontWeight: 700,
  color:      "white",
  position:   "relative",
  zIndex:     1,
};

const avatarOverlayStyle = {
  position:       "absolute",
  inset:          0,
  borderRadius:   "50%",
  background:     "rgba(0,0,0,0.55)",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  opacity:        0,
  transition:     "opacity 0.3s",
  fontSize:       "1.2rem",
  zIndex:         2,
  pointerEvents:  "none",
};

const nameStyle = {
  fontFamily:   "'Playfair Display', serif",
  fontSize:     "1rem",
  fontWeight:   700,
  color:        "var(--cream)",
  marginBottom: "0.3rem",
};

const roleStyle = {
  fontSize:      "0.78rem",
  color:         "var(--gold)",
  letterSpacing: "0.08em",
  marginBottom:  "0.8rem",
};

const bioStyle = {
  fontSize:   "0.82rem",
  color:      "var(--muted)",
  lineHeight: 1.6,
};
