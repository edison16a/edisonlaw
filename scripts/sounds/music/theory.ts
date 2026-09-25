/**
 * The time grid and harmony of the background music: a slow lo fi tune
 * centred on F at 76 beats a minute, 32 bars of 4/4 that loop back to the
 * start. The first half of each phrase is F Lydian, with a B natural, and
 * the second half F major, with a B flat.
 */

export const BPM = 76;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;
export const BARS = 32;
/** Length of one lap, in seconds. */
export const LAP = BAR * BARS;

/** How late the off beat eighths land, as a share of a beat. 0.5 is straight, 0.58 a light swing. */
const SWING = 0.58;

/** Seconds from the top of the lap to `beat` of `bar`, with the off beat eighths swung. */
export function timeOf(bar: number, beat: number) {
  const whole = Math.floor(beat);
  const part = beat - whole;
  const swung = Math.abs(part - 0.5) < 1e-9 ? SWING : part;
  return bar * BAR + (whole + swung) * BEAT;
}

export const midiToHz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export interface Chord {
  name: string;
  /** Bass note, between C2 and B2. */
  root: number;
  /** Rootless voicing for the keys, around middle C, led smoothly into the next chord. */
  voicing: number[];
  /** Close voicing for the pad, a little lower and wider. */
  pad: number[];
}

/**
 * The eight bar phrase every section plays: a slow walk down the scale from
 * the home chord, then round through the four chord and a suspended five
 * that leans back home, which is also what carries the loop point.
 */
export const PHRASE: Chord[] = [
  { name: 'Fmaj9', root: 41, voicing: [57, 60, 64, 67], pad: [53, 60, 64, 69] },
  { name: 'Em7', root: 40, voicing: [59, 62, 64, 67], pad: [52, 59, 62, 67] },
  { name: 'Dm9', root: 38, voicing: [53, 57, 60, 64], pad: [50, 57, 60, 65] },
  { name: 'Cmaj9', root: 36, voicing: [52, 55, 59, 62], pad: [48, 55, 59, 64] },
  { name: 'Bbmaj9', root: 46, voicing: [57, 60, 62, 65], pad: [50, 57, 62, 65] },
  { name: 'Am7', root: 45, voicing: [55, 57, 60, 64], pad: [52, 57, 60, 67] },
  { name: 'Gm9', root: 43, voicing: [53, 57, 58, 62], pad: [50, 55, 58, 65] },
  { name: 'C9sus4', root: 36, voicing: [58, 62, 65, 67], pad: [53, 58, 62, 67] },
];

export const chordAt = (bar: number) => PHRASE[bar % PHRASE.length];

/** F major, as pitch classes. The melody and the walking bass keep to it. */
export const F_MAJOR = [0, 2, 4, 5, 7, 9, 11].map((step) => (step + 5) % 12);
/** F Lydian, the same notes with a B natural, which the first half of the phrase borrows. */
export const F_LYDIAN = F_MAJOR.map((note) => (note === 10 ? 11 : note));

/** The scale note one step from `target`, on the side the line comes from, so the bass walks into it. */
export function approachNote(from: number, target: number) {
  const direction = from > target ? 1 : -1;
  let note = target + direction;
  while (!F_MAJOR.includes(((note % 12) + 12) % 12)) note += direction;
  return note;
}
