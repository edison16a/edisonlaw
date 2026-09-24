'use client';

import { useState, type RefObject } from 'react';
import { useScrollFrame } from '@/lib/hooks/useScrollFrame';

/** An entry becomes active once its top passes this fraction of the viewport height. */
const READING_LINE = 0.5;

/**
 * Index of the last timeline entry whose top has crossed the reading line.
 * Returns -1 while the timeline is still below it.
 */
export function useActiveEntry(listRef: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(-1);

  useScrollFrame(() => {
    const list = listRef.current;
    if (!list) return;
    const line = window.innerHeight * READING_LINE;
    let index = -1;
    list.querySelectorAll<HTMLElement>('[data-entry]').forEach((item, i) => {
      if (item.getBoundingClientRect().top <= line) index = i;
    });
    setActive(index);
  });

  return active;
}
