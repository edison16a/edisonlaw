'use client';

import { useEffect } from 'react';
import { REDUCED_MOTION_QUERY } from '@/lib/hooks/useReducedMotion';
import { soundLifecycle } from './engine';
import { loadSoundPreference } from './persistence';

/** Events that count as a user gesture, after which browsers let audio start. */
const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const;

/**
 * Page wide audio upkeep, mounted once through SoundToggle. It restores the saved choice,
 * lets audio start on the first gesture, and quiets the loops while the tab is hidden.
 */
export function useSoundLifecycle() {
  useEffect(() => {
    soundLifecycle.restore(loadSoundPreference(window.matchMedia(REDUCED_MOTION_QUERY).matches));

    const onVisibility = () => soundLifecycle.setVisible(document.visibilityState === 'visible');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);

    const stopListening = () => GESTURES.forEach((type) => window.removeEventListener(type, unlock, true));
    function unlock() {
      soundLifecycle.unlock();
      stopListening();
    }
    // A visitor who already clicked before this mounted has unlocked audio for the page.
    if (navigator.userActivation?.hasBeenActive) unlock();
    else GESTURES.forEach((type) => window.addEventListener(type, unlock, { capture: true, passive: true }));

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stopListening();
    };
  }, []);
}
