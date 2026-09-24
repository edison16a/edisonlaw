'use client';

import { useEffect, useRef } from 'react';

/**
 * Calls `onFrame` at most once per animation frame while the page scrolls or resizes, plus once on mount.
 * The latest callback is always used, so callers do not need to memoise it.
 */
export function useScrollFrame(onFrame: () => void) {
  const callback = useRef(onFrame);

  useEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      callback.current();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };

    run();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
}
