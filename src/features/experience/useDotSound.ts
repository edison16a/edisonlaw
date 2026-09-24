'use client';

import { useEffect, useRef } from 'react';
import { sound } from '@/features/sound';

/** Soft tick each time the reading line reaches a new timeline dot. */
export function useDotSound(active: number) {
  const previous = useRef(active);

  useEffect(() => {
    if (active > previous.current) sound.play('dot');
    previous.current = active;
  }, [active]);
}
