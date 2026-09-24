'use client';

import { useEffect, useRef } from 'react';
import { sound } from '@/features/sound';

/** Soft tick when a new dot fills, and the desk ambience while the section is on screen. */
export function useExperienceSounds(active: number, inView: boolean) {
  const previous = useRef(active);

  useEffect(() => {
    if (active > previous.current) sound.play('dot');
    previous.current = active;
  }, [active]);

  useEffect(() => {
    sound.setLoop('desk', inView);
    return () => sound.setLoop('desk', false);
  }, [inView]);
}
