import styles from "./Marquee.module.css";

const ITEMS = [
  "Authentic Chinese", "Italian Pizzas", "Thai Curries", "Artisan Coffee",
  "Refreshing Mocktails", "Handcrafted Shakes", "Fresh Pasta", "Signature Desserts",
];

/* duplicate the list so the CSS loop is seamless */
const DOUBLED = [...ITEMS, ...ITEMS];

export default function Marquee() {
  return (
    <div className={styles.marqueeSection}>
      <div className={styles.track}>
        {DOUBLED.map((item, i) => (
          <span key={i} className={styles.item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
