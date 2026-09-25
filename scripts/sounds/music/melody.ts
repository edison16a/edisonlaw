/**
 * The tune the keys play over the chords, written by hand. Each note is
 * [bar, beat, midi note, length in beats, velocity]. It stays in F major
 * pentatonic, with the odd passing B flat, and leaves plenty of space.
 */
export type MelodyNote = [bar: number, beat: number, midi: number, beats: number, velocity: number];

const A4 = 69;
const Bb4 = 70;
const C5 = 72;
const D5 = 74;
const E5 = 76;
const F5 = 77;
const G5 = 79;
const A5 = 81;

export const MELODY: MelodyNote[] = [
  // Second section: a few long notes, answering the chords.
  [12, 0.5, D5, 1.5, 0.5],
  [12, 2, F5, 2, 0.45],
  [13, 0, E5, 3.5, 0.45],
  [14, 0.5, D5, 1, 0.5],
  [14, 1.5, F5, 0.5, 0.4],
  [14, 2, A5, 2, 0.5],
  [15, 0, G5, 3, 0.45],

  // Third section: the full tune.
  [16, 0.5, A5, 0.5, 0.55],
  [16, 1, C5 + 12, 1, 0.6],
  [16, 2.5, G5, 1.5, 0.5],
  [17, 0.5, G5, 1, 0.5],
  [17, 1.5, E5, 0.5, 0.45],
  [17, 2, D5, 2, 0.5],
  [18, 0, F5, 1, 0.55],
  [18, 1, E5, 0.5, 0.45],
  [18, 1.5, D5, 0.5, 0.45],
  [18, 2, A5, 2, 0.55],
  [19, 0.5, G5, 1.5, 0.5],
  [19, 2, E5, 2, 0.45],
  [20, 0, D5 + 12, 1.5, 0.55],
  [20, 1.5, C5 + 12, 0.5, 0.5],
  [20, 2, A5, 2, 0.5],
  [21, 0.5, G5, 1, 0.5],
  [21, 1.5, E5, 0.5, 0.45],
  [21, 2, C5, 2, 0.45],
  [22, 0, A5, 1, 0.5],
  [22, 1, Bb4 + 12, 0.5, 0.45],
  [22, 1.5, A5, 0.5, 0.45],
  [22, 2, F5, 2, 0.5],
  [23, 0, G5, 1, 0.5],
  [23, 1, F5, 1, 0.45],
  [23, 2, D5, 1, 0.45],
  [23, 3, C5, 1, 0.4],

  // Last section: an echo of the opening phrase, then the melody rests.
  [24, 0.5, C5 + 12, 1, 0.45],
  [24, 1.5, A5, 2.5, 0.45],
  [25, 1, G5, 3, 0.4],
  [26, 0.5, F5, 1, 0.4],
  [26, 1.5, E5, 0.5, 0.35],
  [26, 2, D5, 2, 0.4],
  [27, 0, E5, 3.5, 0.35],
  [29, 1, A4, 2, 0.3],
  [30, 0.5, C5, 3, 0.28],
];
