import type { Howl, SoundSpriteDefinitions } from 'howler';
import { MASTER_VOLUME } from '../config';
import { SPRITE_REGIONS, SPRITE_URL } from '../sprite';
import type { AudioBackend } from './types';

const sprite: SoundSpriteDefinitions = Object.fromEntries(
  Object.entries(SPRITE_REGIONS).map(([name, { start, duration }]) => [name, [start, duration]]),
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

  return {
    play(name, rate, volume) {
      const id = howl.play(name);
      howl.rate(rate, id);
      howl.volume(volume, id);
    },
  };
}
