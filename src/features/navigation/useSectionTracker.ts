'use client';

import { useEffect } from 'react';
import { sections } from '@/content/site';
import { useNavStore } from './useNavStore';

/** The section whose top has passed this fraction of the viewport counts as active. */
const ACTIVATION_LINE = 0.45;

/** Keeps the nav store in sync with whichever section is in view. */
export function useSectionTracker() {
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const { lockedUntil, setActive } = useNavStore.getState();
      if (performance.now() < lockedUntil) return;
      const line = window.innerHeight * ACTIVATION_LINE;
      let current: (typeof sections)[number]['id'] = sections[0].id;
      for (const section of sections) {
        const node = document.getElementById(section.id);
        if (node && node.getBoundingClientRect().top <= line) current = section.id;
      }
      setActive(current);
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
  }, []);
}
