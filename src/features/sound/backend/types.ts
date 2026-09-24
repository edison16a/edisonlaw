import type { LoopName, SoundName } from '../types';

/** What the engine needs from an audio library. It never sees Howler directly. */
export interface AudioBackend {
  /** Starts a one-shot at a playback rate (which also sets pitch) and a 0 to 1 volume. */
  play(name: SoundName, rate: number, volume: number): void;
  /** Fades a loop toward `volume` over `duration` ms, resuming it if needed and pausing it once silent. */
  fadeLoop(name: LoopName, volume: number, duration: number): void;
}
