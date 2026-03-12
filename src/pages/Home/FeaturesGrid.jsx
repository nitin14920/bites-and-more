import { useRef }        from "react";
import { useAdmin }      from "../../context/AdminContext";
import useReveal         from "../../hooks/useReveal";
import styles            from "./FeaturesGrid.module.css";

const FEATURES = [
  {
    icon:  "🌏",
    title: "Global Cuisines",
    desc:  "An eclectic menu spanning Chinese, Thai, Italian, Continental and more — authentically crafted with imported ingredients.",
  },
  {
    icon:  "☕",
    title: "Artisan Beverages",
    desc:  "From single-origin espressos to hand-blended mocktails and health smoothies — every sip is an experience.",
  },
  {
    icon:  "🌿",
    title: "Fresh Ingredients",
    desc:  "We source locally and seasonally, ensuring every plate bursts with the freshest flavors nature has to offer.",
  },
  {
    icon:  "🎨",
    title: "Aesthetic Ambiance",
    desc:  "A space designed for conversations, celebrations, and quiet moments alike — warm, inviting, and unforgettable.",
  },
];

export default function FeaturesGrid() {
  const { isAdmin, featureImages, featureImageUrl, updateFeatureImage } = useAdmin();
  const sectionRef = useReveal();

  return (
    <section ref={sectionRef} className={styles.section}>
      <p className={`section-label reveal ${styles.label}`}>Why Choose Us</p>

      <h2 className={`section-title reveal ${styles.title}`}>
        Crafted with <em>Passion</em>,<br />Served with Love
      </h2>

      <p className={`section-sub reveal ${styles.sub}`}>
        From the streets of Shanghai to the cafes of Milan — every dish at Bites &amp; More
        is a culinary journey designed to delight your senses.
      </p>

      <div className="divider reveal" />

      <div className={styles.grid}>
        {FEATURES.map((f, i) => (
          <FeatureCard
            key={f.title}
            feature={f}
            index={i}
            image={featureImageUrl(i) ?? null}
            isAdmin={isAdmin}
            onUpload={(file) => updateFeatureImage(i, file)}
          />
        ))}
      </div>
    </section>
  );
}

/* ── individual feature card ── */
function FeatureCard({ feature, index, image, isAdmin, onUpload }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(file);       // pass File — AdminContext handles upload to server
    e.target.value = "";
  }

  return (
    <article
      className={`${styles.card} ${image ? styles.cardHasImage : ""} reveal`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      {/* ── background image (when uploaded) ── */}
      {image && (
        <img src={image} alt={feature.title} className={styles.bgImage} />
      )}

      {/* ── dark scrim over image ── */}
      {image && <div className={styles.scrim} />}

      {/* ── admin upload overlay (hover) ── */}
      {isAdmin && (
        <div
          className={styles.uploadOverlay}
          onClick={() => inputRef.current?.click()}
          title="Click to upload image"
        >
          <span className={styles.uploadIcon}>📷</span>
          <span className={styles.uploadLabel}>
            {image ? "Replace Image" : "Upload Image"}
          </span>
        </div>
      )}

      {/* ── hidden file input ── */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {/* ── card content ── */}
      <div className={styles.cardBody}>
        {/* show emoji only when no image uploaded */}
        {!image && (
          <div className={styles.cardIcon}>{feature.icon}</div>
        )}
        <h3 className={styles.cardTitle}>{feature.title}</h3>
        <p  className={styles.cardDesc}>{feature.desc}</p>
      </div>
    </article>
  );
}
