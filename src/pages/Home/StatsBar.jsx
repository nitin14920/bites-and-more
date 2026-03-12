import useReveal from "../../hooks/useReveal";
import styles     from "./StatsBar.module.css";

const STATS = [
  { num: "150+", label: "Menu Items"    },
  { num: "8+",   label: "Years of Service" },
  { num: "10K+", label: "Happy Guests"  },
  { num: "4.8★", label: "Average Rating" },
];

export default function StatsBar() {
  useReveal();

  return (
    <div className={styles.statsSection}>
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className={`${styles.cell} reveal`}
          style={{ transitionDelay: `${i * 0.12}s` }}
        >
          <div className={styles.num}>{s.num}</div>
          <div className={styles.label}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
