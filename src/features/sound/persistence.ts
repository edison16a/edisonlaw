import { readStorage, writeStorage } from '@/lib/storage';
import { DEFAULT_ENABLED, STORAGE_KEY } from './config';

/**
 * The visitor's saved choice always wins. Without one, sound stays at the default,
 * which is off, and reduced motion keeps it off even if the default ever changes.
 */
export function resolveEnabled(stored: string | null, prefersReducedMotion: boolean, fallback = DEFAULT_ENABLED) {
  if (stored === 'on') return true;
  if (stored === 'off') return false;
  return fallback && !prefersReducedMotion;
}

export function loadSoundPreference(prefersReducedMotion: boolean) {
  return resolveEnabled(readStorage(STORAGE_KEY), prefersReducedMotion);
}

export function saveSoundPreference(enabled: boolean) {
  writeStorage(STORAGE_KEY, enabled ? 'on' : 'off');
}
