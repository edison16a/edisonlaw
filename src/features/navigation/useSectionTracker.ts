'use client';

import { sections } from '@/content/site';
import { useScrollFrame } from '@/lib/hooks/useScrollFrame';
import { useNavStore } from './useNavStore';

/** The section whose top has passed this fraction of the viewport counts as active. */
const ACTIVATION_LINE = 0.45;

/** Keeps the nav store in sync with whichever section is in view. */
export function useSectionTracker() {
  useScrollFrame(() => {
    const { lockedUntil, setActive } = useNavStore.getState();
    if (performance.now() < lockedUntil) return;
    const line = window.innerHeight * ACTIVATION_LINE;
    let current: (typeof sections)[number]['id'] = sections[0].id;
    for (const section of sections) {
      const node = document.getElementById(section.id);
      if (node && node.getBoundingClientRect().top <= line) current = section.id;
    }
    setActive(current);
  });
}
