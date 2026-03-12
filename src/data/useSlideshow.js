import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useSlideshow
 * Manages auto-advance + manual navigation for any slideshow.
 *
 * @param {number} count      - total number of slides
 * @param {number} interval   - ms between auto-advances (default 4500)
 * @returns {{ current, goTo, next, prev }}
 */
export default function useSlideshow(count, interval = 4500) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % count);
    }, interval);
  }, [count, interval]);

  /* start on mount, restart on count/interval change */
  useEffect(() => {
    start();
    return () => clearInterval(timerRef.current);
  }, [start]);

  const goTo = useCallback(
    (idx) => {
      setCurrent(idx);
      start(); // reset timer on manual navigation
    },
    [start]
  );

  const next = useCallback(() => goTo((current + 1) % count), [goTo, current, count]);
  const prev = useCallback(() => goTo((current - 1 + count) % count), [goTo, current, count]);

  return { current, goTo, next, prev };
}
