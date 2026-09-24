'use client';

import { useEffect, useState, type RefObject } from 'react';

/** An entry becomes active once its top passes this fraction of the viewport height. */
const READING_LINE = 0.5;

/**
 * Index of the last timeline entry whose top has crossed the reading line.
 * Returns -1 while the timeline is still below it.
 */
export function useActiveEntry(listRef: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      const items = list.querySelectorAll<HTMLElement>('[data-entry]');
      let index = -1;
      items.forEach((item, i) => {
        if (item.getBoundingClientRect().top <= line) index = i;
      });
      setActive(index);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [listRef]);

  return active;
}
