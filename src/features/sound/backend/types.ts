import type { SoundName } from '../types';

/** What the engine needs from an audio library. It never sees Howler directly. */
export interface AudioBackend {
  /** Starts a one-shot at a playback rate (which also sets pitch) and a 0 to 1 volume. */
  play(name: SoundName, rate: number, volume: number): void;
}

/** The background music player. It holds one looping lap and never sees the effects. */
export interface MusicBackend {
  /** Fades the music toward `volume` over `duration` ms, resuming it if needed and pausing it once silent. */
  fadeTo(volume: number, duration: number): void;
}
