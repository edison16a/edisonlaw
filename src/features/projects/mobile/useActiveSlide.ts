'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Distance from one slide to the next in a horizontal strip, in pixels. */
export function slideStride(strip: HTMLElement) {
  const first = strip.children[0] as HTMLElement | undefined;
  const second = strip.children[1] as HTMLElement | undefined;
  if (!first) return 1;
  return Math.max(1, second ? second.offsetLeft - first.offsetLeft : first.offsetWidth);
}

/** Index of the slide nearest the centre of a horizontal scroll snap strip. */
export function useActiveSlide(strip: RefObject<HTMLElement | null>, count: number) {
  const [active, setActive] = useState(0);

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
