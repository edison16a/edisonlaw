'use client';

import { useEffect, useRef } from 'react';

/**
 * Tracks the pointer across the whole window as -1 to 1 on each axis, in a ref so
 * moving the mouse never re-renders. Stays at the centre while disabled.
 */
export function usePointerParallax(enabled: boolean) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const current = pointer.current;
    if (!enabled) {
      current.x = 0;
      current.y = 0;
      return;
    }
    const onMove = (event: PointerEvent) => {
      current.x = (event.clientX / window.innerWidth) * 2 - 1;
      current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);

  return pointer;
}
