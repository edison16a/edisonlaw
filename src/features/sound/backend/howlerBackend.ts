import type { Howl, SoundSpriteDefinitions } from 'howler';
import { MASTER_VOLUME } from '../config';
import { SPRITE_REGIONS, SPRITE_URL } from '../sprite';
import type { LoopName } from '../types';
import type { AudioBackend } from './types';

interface LoopState {
  id: number | null;
  /** Volume the loop is heading for. Zero means it pauses once the fade ends. */
  target: number;
}

const sprite: SoundSpriteDefinitions = Object.fromEntries(
  Object.entries(SPRITE_REGIONS).map(([name, { start, duration, loop }]) => [name, loop ? [start, duration, true] : [start, duration]]),
);

function loadSprite(HowlClass: typeof Howl) {
  return new Promise<Howl>((resolve, reject) => {
    const howl = new HowlClass({ src: [SPRITE_URL], format: ['mp3'], sprite, preload: true });
    howl.once('load', () => resolve(howl));
    howl.once('loaderror', (_, error) => reject(new Error(`Could not load the sound sprite: ${String(error)}`)));
  });
}

/**
 * Howler behind the AudioBackend interface. Creating it makes the AudioContext,
 * so only call it after a user gesture.
 */
export async function createHowlerBackend(): Promise<AudioBackend> {
  const { Howl, Howler } = await import('howler');
  const howl = await loadSprite(Howl);
  Howler.volume(MASTER_VOLUME);

  const loops = new Map<LoopName, LoopState>();
  const currentVolume = (id: number) => {
    const volume = howl.volume(id);
    return typeof volume === 'number' ? volume : 0;
  };

  // A loop that has faded to silence stops using the audio thread until it is wanted again.
  howl.on('fade', (id) => {
    for (const state of loops.values()) if (state.id === id && state.target === 0) howl.pause(id);
  });

  return {
    play(name, rate, volume) {
      const id = howl.play(name);
      howl.rate(rate, id);
      howl.volume(volume, id);
    },

    fadeLoop(name, volume, duration) {
      const state = loops.get(name) ?? { id: null, target: 0 };
      loops.set(name, state);
      if (state.target === volume) return;
      state.target = volume;

      if (volume > 0 && state.id === null) {
        state.id = howl.play(name);
        howl.volume(0, state.id);
      } else if (volume > 0 && state.id !== null && !howl.playing(state.id)) {
        howl.play(state.id);
      }
      // Starting from the live volume keeps a fade that reverses halfway smooth.
      if (state.id !== null) howl.fade(currentVolume(state.id), volume, duration, state.id);
    },
  };
}
