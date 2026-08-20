import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Tween a number toward `value` — PRD 2.4 calls the visible recalculation of
 * cash figures the product's key moment, so scenario results count up/down
 * rather than snapping.
 *
 * Returns the target value immediately when the user prefers reduced motion,
 * so no tween runs at all (not merely a faster one).
 *
 * @param {number} value target value
 * @param {{ duration?: number, enabled?: boolean }} [options]
 * @returns {number} the current animated value
 */
export default function useCountUp(value, options = {}) {
  const { duration = 500, enabled = true } = options;
  const prefersReduced = useReducedMotion();
  const skip = prefersReduced || !enabled;

  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef(0);

  useEffect(() => {
    if (skip) {
      setDisplay(value);
      fromRef.current = value;
      return undefined;
    }

    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) return undefined;

    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic — decelerating, matching the --ease-out token's character.
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + delta * eased);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration, skip]);

  return skip ? value : display;
}
