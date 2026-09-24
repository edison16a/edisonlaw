'use client';

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

/** Distance from one slide to the next in a horizontal strip, in pixels. */
export function slideStride(strip: HTMLElement) {
  const first = strip.children[0] as HTMLElement | undefined;
  const second = strip.children[1] as HTMLElement | undefined;
  if (!first) return 1;
  return Math.max(1, second ? second.offsetLeft - first.offsetLeft : first.offsetWidth);
}

/**
 * Index of the slide nearest the centre of a horizontal scroll snap strip.
 * The strip opens on slide `start`, placed before the first paint.
 */
export function useActiveSlide(strip: RefObject<HTMLElement | null>, count: number, start = 0) {
  // Only where it opens counts. After that the visitor moves the strip.
  const [opening] = useState(start);
  const [active, setActive] = useState(opening);

  useLayoutEffect(() => {
    const node = strip.current;
    if (node && opening > 0) node.scrollTo({ left: opening * slideStride(node), behavior: 'instant' });
  }, [strip, opening]);

  useEffect(() => {
    const node = strip.current;
    if (!node) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const index = Math.round(node.scrollLeft / slideStride(node));
      setActive(Math.min(count - 1, Math.max(0, index)));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    node.addEventListener('scroll', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener('scroll', schedule);
    };
  }, [strip, count]);

  return active;
}
