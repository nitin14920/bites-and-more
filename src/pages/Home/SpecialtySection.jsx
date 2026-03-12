import { Link } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import useReveal from "../../hooks/useReveal";
import useImageUpload from "../../hooks/useImageUpload";
import styles from "./SpecialtySection.module.css";

export default function SpecialtySection() {
  const { isAdmin, specialtyImage, updateSpecialtyImage } = useAdmin();

  useReveal();

  const { inputRef, trigger, handleChange } =
    useImageUpload(updateSpecialtyImage);

  return (
    <section className={styles.section}>
      {/* ── LEFT: image column ── */}
      <div className={`${styles.imgCol} reveal`}>
        <div
          className={`${styles.imgMain} ${isAdmin ? styles.imgMainAdmin : ""}`}
          onClick={() => isAdmin && trigger()}
          title={isAdmin ? "Click to upload image" : ""}
        >
          {/* uploaded photo */}
          {specialtyImage && (
            <img
              src={specialtyImage}
              alt="Chef's specialty"
              className={styles.photo}
            />
          )}

          {/* placeholder emoji */}
          <div
            className={styles.placeholder}
            style={{ opacity: specialtyImage ? 0 : 1 }}
          >
            🍽️
          </div>

          {/* admin hover overlay */}
          {isAdmin && (
            <div className={styles.uploadOverlay}>
              <span className={styles.overlayIcon}>📷</span>
              <span className={styles.overlayLabel}>
                {specialtyImage ? "Replace Image" : "Upload Image"}
              </span>
            </div>
          )}

          {/* hidden input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
          />
        </div>

        {/* rotating gold badge */}
        <div className={styles.badge}>
          <span className={styles.badgeStar}>★</span>
          <span className={styles.badgeText}>
            Chef's
            <br />
            Special
          </span>
        </div>
      </div>

      {/* ── RIGHT: text column ── */}
      <div className="reveal">
        <p className="section-label">Our Signature</p>
        <h2 className="section-title">
          More Than
          <br />
          Just a <em>Meal</em>
        </h2>
        <div className="divider" />
        <p className={styles.body}>
          Bites &amp; More was born from a simple dream — to create a space
          where food becomes an experience, where every visit feels like a
          celebration, and where flavors from across the globe come together
          under one roof.
        </p>
        <p className={styles.body} style={{ marginBottom: "2rem" }}>
          Our chefs bring decades of culinary expertise, blending traditional
          techniques with contemporary creativity to craft dishes that linger in
          your memory long after the last bite.
        </p>
        <Link to="/about" className="btn-primary">
          Our Story
        </Link>
      </div>
    </section>
  );
}
