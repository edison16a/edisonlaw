import { clamp } from '@/lib/math';
import type { AudioBackend } from './backend/types';
import { MAX_VOICES, SOUNDS, TOGGLE_FEEDBACK_MS } from './config';
import { jitterRate } from './jitter';
import { saveSoundPreference } from './persistence';
import { SPRITE_REGIONS } from './sprite';
import { createThrottle } from './throttle';
import type { PlayOptions, SoundName } from './types';
import { createVoiceLimiter } from './voices';

type Listener = () => void;

let enabled = false;
let visible = true;
/** True once the visitor has interacted, so an AudioContext is allowed to start. */
let unlocked = false;
let backend: AudioBackend | null = null;
let loading = false;
/** A "sound on" click still plays if the sprite arrives before this time. */
let toggleFeedbackUntil = 0;

const listeners = new Set<Listener>();
const throttle = createThrottle((name: SoundName) => SOUNDS[name].throttle);
const voices = createVoiceLimiter(MAX_VOICES, (name: SoundName) => SOUNDS[name].voices);

function emit() {
  listeners.forEach((listener) => listener());
}

/** Loads Howler and the sprite on first need. Its own chunk, so the page never pays for it up front. */
function ensureBackend() {
  if (backend || loading || !unlocked || !enabled) return;
  loading = true;
  import('./backend/howlerBackend')
    .then(({ createHowlerBackend }) => createHowlerBackend())
    .then((ready) => {
      backend = ready;
      if (performance.now() < toggleFeedbackUntil) sound.play('toggle');
    })
    .catch((error: unknown) => {
      // Sound is a nicety: stay silent, and try again on the next switch on.
      if (process.env.NODE_ENV !== 'production') console.warn(error);
    })
    .finally(() => {
      loading = false;
    });
}

/**
 * The single place every feature talks to for audio.
 * Call it from React handlers or from inside a render loop, it is cheap and never throws.
 */
export const sound = {
  /** Plays a one-shot. Does nothing while sound is off, the tab is hidden, or the sprite is still loading. */
  play(name: SoundName, options?: PlayOptions) {
    if (!enabled || !backend || !visible) return;
    const now = performance.now();
    if (!throttle(name, now)) return;
    const rate = jitterRate(options?.rate ?? 1, SOUNDS[name].jitter);
    if (!voices.tryStart(name, now, SPRITE_REGIONS[name].duration / rate)) return;
    try {
      backend.play(name, rate, clamp(SOUNDS[name].volume * (options?.volume ?? 1)));
    } catch {
      // A failed one-shot is not worth breaking a frame for.
    }
  },

  isEnabled() {
    return enabled;
  },

  /** Switches sound on or off from a click, remembers the choice, and confirms it with a soft click. */
  setEnabled(next: boolean) {
    if (next === enabled) return;
    // Switching off gets a lower, quieter click on the way out.
    if (!next) sound.play('toggle', { rate: 0.85, volume: 0.7 });
    enabled = next;
    saveSoundPreference(next);
    if (next) {
      unlocked = true;
      toggleFeedbackUntil = performance.now() + TOGGLE_FEEDBACK_MS;
      if (backend) sound.play('toggle');
      else ensureBackend();
    }
    emit();
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Page lifecycle hooks, used only by useSoundLifecycle. */
export const soundLifecycle = {
  /** Applies the saved choice on load, without saving it again or clicking. */
  restore(value: boolean) {
    if (value === enabled) return;
    enabled = value;
    ensureBackend();
    emit();
  },

  /** The visitor has interacted, so audio may start. */
  unlock() {
    unlocked = true;
    ensureBackend();
  },

  setVisible(value: boolean) {
    if (value === visible) return;
    visible = value;
  },
};
