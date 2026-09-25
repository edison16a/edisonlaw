import type { Howl } from 'howler';
import { MASTER_VOLUME } from '../config';
import { MUSIC_LOOP, MUSIC_URL } from '../musicTrack';
import type { MusicBackend } from './types';

function loadMusic(HowlClass: typeof Howl) {
  return new Promise<Howl>((resolve, reject) => {
    const howl = new HowlClass({
      src: [MUSIC_URL],
      format: ['mp3'],
      // The file carries a little of the lap on each side. Looping just the lap keeps the seam clean.
      sprite: { lap: [MUSIC_LOOP.start, MUSIC_LOOP.duration, true] },
      preload: true,
    });
    howl.once('load', () => resolve(howl));
    howl.once('loaderror', (_, error) => reject(new Error(`Could not load the music: ${String(error)}`)));
  });
}

/**
 * Howler behind the MusicBackend interface, with a Howl of its own so the long
 * track never sits in the effects sprite. Only create it after a user gesture.
 */
export async function createMusicBackend(): Promise<MusicBackend> {
  const { Howl, Howler } = await import('howler');
  const howl = await loadMusic(Howl);
  Howler.volume(MASTER_VOLUME);

  let id: number | null = null;
  /** Volume the music is heading for. Zero means it pauses once the fade ends. */
  let target = 0;
  const currentVolume = (sound: number) => {
    const volume = howl.volume(sound);
    return typeof volume === 'number' ? volume : 0;
  };

  // Faded to silence, the music pauses, so it costs nothing and resumes where it stopped.
  howl.on('fade', (sound) => {
    if (sound === id && target === 0) howl.pause(sound);
  });

  return {
    fadeTo(volume, duration) {
      if (volume === target) return;
      target = volume;
      if (volume > 0 && id === null) {
        id = howl.play('lap');
        howl.volume(0, id);
      } else if (volume > 0 && id !== null && !howl.playing(id)) {
        howl.play(id);
      }
      // Starting from the live volume keeps a fade that reverses halfway smooth.
      if (id !== null) howl.fade(currentVolume(id), volume, duration, id);
    },
  };
}
