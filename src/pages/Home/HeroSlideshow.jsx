import { useState, useEffect, useRef } from "react";
import { Link }         from "react-router-dom";
import { useAdmin }     from "../../context/AdminContext";
import useSlideshow     from "../../hooks/useSlideshow";
import useImageUpload   from "../../hooks/useImageUpload";
import quotes           from "../../data/quotes";
import styles           from "./HeroSlideshow.module.css";

export default function HeroSlideshow() {
  const { isAdmin, heroSlides, updateHeroSlide } = useAdmin();

  /* ── slideshow state ── */
  const { current, goTo } = useSlideshow(heroSlides.length, 4500);

  /* ── rotating quote ── */
  const [quoteIdx,     setQuoteIdx]     = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % quotes.length);
        setQuoteVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  /* ── admin: which slot to upload into ── */
  const [targetSlot, setTargetSlot] = useState(0);

  const { inputRef, trigger, handleChange } = useImageUpload((file) => {
    updateHeroSlide(targetSlot, file);
  });

  function openUpload(slot) {
    setTargetSlot(slot);
    /* use setTimeout so state settles before trigger fires */
    setTimeout(() => trigger(), 0);
  }

  return (
    <section className={styles.hero}>
      {/* ── decorative background layers ── */}
      <div className={styles.heroBg} />
      <div className={styles.heroGrain} />

      {/* ── slides ── */}
      <div className={styles.slideshow}>
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`${styles.slide} ${i === current ? styles.slideActive : ""}`}
          >
            {slide.img
              ? <img src={slide.img} alt={`Hero slide ${i + 1}`} className={styles.slideImg} />
              : <div className={styles.slidePlaceholder}>{slide.emoji}</div>
            }
          </div>
        ))}

        {/* ── admin upload controls (top-right) ── */}
        {isAdmin && (
          <div className={styles.adminControls}>
            <button
              className={styles.uploadBtn}
              onClick={() => openUpload(current)}
            >
              📷 Upload Slide
            </button>
            <div className={styles.slotDots}>
              {heroSlides.map((slide, i) => (
                <button
                  key={i}
                  className={`${styles.slotDot}
                    ${slide.img   ? styles.slotDotFilled  : ""}
                    ${i === current ? styles.slotDotActive : ""}`}
                  onClick={() => openUpload(i)}
                  title={`Slot ${i + 1}: ${slide.img ? "click to replace" : "click to upload"}`}
                >
                  {slide.img ? "✓" : i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── bottom nav dots (visible to everyone) ── */}
        <div className={styles.navDots}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`${styles.navDot} ${i === current ? styles.navDotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* ── hidden file input ── */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleChange}
        />
      </div>

      {/* ── hero text ── */}
      <div className={styles.content}>
        <p className={styles.eyebrow}>✦ Welcome to Agra's Finest ✦</p>
        <h1 className={styles.title}>
          Where Every<br /><em>Bite</em> Tells<br />a Story
        </h1>
        <p
          className={styles.quote}
          style={{ opacity: quoteVisible ? 1 : 0 }}
        >
          {quotes[quoteIdx]}
        </p>
        <div className={styles.cta}>
          <Link to="/menu"    className="btn-primary">Explore Menu</Link>
          <Link to="/gallery" className="btn-outline">View Gallery</Link>
        </div>
      </div>

      {/* ── scroll indicator ── */}
      <div className={styles.scrollHint}>
        <span>Scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
