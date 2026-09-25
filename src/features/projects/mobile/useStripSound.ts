'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { holdMove, soundMove } from '../sound/moveSound';

/**
 * The phone strip's move sound: once as the strip reaches another project,
 * and not again until it comes to rest, however many projects a long glide
 * passes and however slowly it passes the last of them.
 */
export function useStripSound(strip: RefObject<HTMLElement | null>, active: number) {
  const previous = useRef(active);

  useEffect(() => {
    if (previous.current !== active) soundMove();
    previous.current = active;
  }, [active]);

  useEffect(() => {
    const node = strip.current;
    if (!node) return;
    node.addEventListener('scroll', holdMove, { passive: true });
    return () => node.removeEventListener('scroll', holdMove);
  }, [strip]);
}
