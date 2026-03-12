import { useEffect } from "react";

/**
 * useReveal
 * Observes every element with className "reveal" inside the current page
 * and adds "visible" when it enters the viewport.
 *
 * Usage: call once at the top of any section component that uses .reveal elements.
 */
export default function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
