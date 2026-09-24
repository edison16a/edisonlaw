'use client';

import { useSyncExternalStore } from 'react';
import { sound } from './engine';

/** Current on or off state of the site audio, re-rendering when it changes. */
export function useSoundEnabled() {
  return useSyncExternalStore(sound.subscribe, sound.isEnabled, () => false);
}
