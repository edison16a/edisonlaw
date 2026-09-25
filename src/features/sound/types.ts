/** One-shot sounds. Every one is under half a second. */
export type SoundName =
  /** Soft felt tap as the focus moves to another project, the one sound of the Projects section. */
  | 'move'
  /** Soft click when the nav underline slides to a new tab. */
  | 'tab'
  /** Very quiet tick on hovering a navbar tab. */
  | 'hover'
  /** Soft tick when a timeline dot fills. */
  | 'dot'
  /** Short confirm blip for copying the email. */
  | 'blip'
  /** Toggle between spiral and list, or sound on. */
  | 'toggle';

export interface PlayOptions {
  /** Playback rate, which also shifts pitch. 1 is natural. */
  rate?: number;
  /** 0 to 1, multiplied with the sound's own level. */
  volume?: number;
}
