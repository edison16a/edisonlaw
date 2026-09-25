import { MUSIC_FADE_IN_MS, MUSIC_FADE_OUT_MS, MUSIC_HIDE_FADE_MS, MUSIC_VOLUME } from './config';
import type { MusicBackend } from './backend/types';

export interface MusicState {
  /** The visitor has sound on. */
  enabled: boolean;
  /** The tab is showing. */
  visible: boolean;
  /** The visitor has interacted, so an AudioContext may start. */
  unlocked: boolean;
}

/**
 * The background music's rules, apart from the player itself. The track loads
 * only once sound is on and audio may start, swells in slowly, fades out when
 * sound goes off, and pauses while the tab is hidden, picking up where it left
 * off. Pure apart from `load`, so it is unit tested.
 */
export function createMusic(load: () => Promise<MusicBackend>) {
  let backend: MusicBackend | null = null;
  let loading = false;
  let state: MusicState = { enabled: false, visible: true, unlocked: false };

  function apply() {
    if (!backend) return;
    if (state.enabled && state.visible) backend.fadeTo(MUSIC_VOLUME, MUSIC_FADE_IN_MS);
    else backend.fadeTo(0, state.enabled ? MUSIC_HIDE_FADE_MS : MUSIC_FADE_OUT_MS);
  }

  function ensureBackend() {
    if (backend || loading || !state.enabled || !state.unlocked) return;
    loading = true;
    load()
      .then((ready) => {
        backend = ready;
        apply();
      })
      .catch((error: unknown) => {
        // Music is a nicety: stay silent, and try again the next time sound turns on.
        if (process.env.NODE_ENV !== 'production') console.warn(error);
      })
      .finally(() => {
        loading = false;
      });
  }

  return {
    /** Brings the music in line with the page. Safe to call with the same state again. */
    sync(next: MusicState) {
      state = next;
      ensureBackend();
      apply();
    },
  };
}
