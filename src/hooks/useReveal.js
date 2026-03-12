import { useEffect, useRef } from "react";

/**
 * useReveal — safe scroll reveal.
 *
 * .reveal elements are VISIBLE by default (opacity:1 in CSS).
 * This hook opts them into animation by adding .will-animate,
 * then adds .visible when they enter the viewport.
 *
 * If JS fails or the observer never fires, content stays visible.
 */
export default function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const elements = Array.from(root.querySelectorAll(".reveal"));
    if (!elements.length) return;

    // Opt every element into the hidden state
    elements.forEach((el) => el.classList.add("will-animate"));

    // Immediately reveal anything already in the viewport
    const toWatch = [];
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60 && rect.bottom > 0) {
        el.classList.add("visible");
      } else {
        toWatch.push(el);
      }
    });

    if (!toWatch.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root:      null,
        threshold: 0,
        rootMargin: "0px 0px 60px 0px",
      }
    );

    toWatch.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}
