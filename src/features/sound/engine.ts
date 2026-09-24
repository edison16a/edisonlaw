import type { LoopName, PlayOptions, SoundName } from './types';

/**
 * The single place every feature talks to for audio.
 * Call it from React handlers or from inside a render loop, it is cheap and never throws.
 *
 * This is the contract. The Howler backed implementation fills in the bodies.
 */
type Listener = () => void;

let enabled = false;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const sound = {
  /** Plays a one-shot. Does nothing while sound is off. */
  play(name: SoundName, options?: PlayOptions) {
    void name;
    void options;
  },

  /** Starts or fades out an ambient loop. Safe to call every render. */
  setLoop(name: LoopName, active: boolean) {
    void name;
    void active;
  },

  isEnabled() {
    return enabled;
  },

  setEnabled(next: boolean) {
    if (next === enabled) return;
    enabled = next;
    emit();
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
