'use client';

import { useEffect } from 'react';
import { sound } from '@/features/sound';
import { useSpiralStore } from '../state/spiralStore';

/** A low thump when a new card locks into focus and a faint swish as its panel opens. */
export function useSpiralSounds() {
  useEffect(
    () =>
      useSpiralStore.subscribe((state, previous) => {
        if (state.settled !== null && state.settled !== previous.settled) sound.play('focus');
        if (state.panel !== null && state.panel !== previous.panel) sound.play('swish');
      }),
    [],
  );
}
