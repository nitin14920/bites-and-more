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
  const timerRef  = useRef(null);
  const countRef  = useRef(count);   // keep latest count without re-creating start()

  useEffect(() => { countRef.current = count; }, [count]);

  const start = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % countRef.current);
    }, interval);
  }, [interval]); // only rebuilds if interval changes

  useEffect(() => {
    start();
    return () => clearInterval(timerRef.current);
  }, [start]);

  const goTo = useCallback((idx) => {
    setCurrent(idx);
    start();
  }, [start]);

  // next/prev use functional setter — no stale current closure
  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % countRef.current);
    start();
  }, [start]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + countRef.current) % countRef.current);
    start();
  }, [start]);

  return { current, goTo, next, prev };
}
