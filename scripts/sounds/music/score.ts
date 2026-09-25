import { createRandom, gaussian, vary, type Random } from '../dsp/random';
import { MELODY } from './melody';
import { BARS, BAR, BEAT, approachNote, chordAt, timeOf } from './theory';

export type Voice = 'keys' | 'lead' | 'bass' | 'kick' | 'brush' | 'shaker';

export interface Hit {
  voice: Voice;
  /** Seconds from the top of the lap. */
  at: number;
  /** Seconds the note is held. Drums ignore it. */
  duration: number;
  midi: number;
  velocity: number;
}

export interface PadChord {
  at: number;
  duration: number;
  notes: number[];
}

export interface Score {
  hits: Hit[];
  pads: PadChord[];
}

/**
 * Four sections of eight bars, one arc: keys and pad alone, then brushes and
 * a few melody notes, then the full tune with a walking bass, then an echo
 * that thins back out into the start of the lap.
 */
type Section = 'intro' | 'groove' | 'tune' | 'echo';
const sectionOf = (bar: number): Section => (['intro', 'groove', 'tune', 'echo'] as const)[Math.floor(bar / 8)];

/** [beat, length in beats, velocity] for each chord the keys play in a bar. */
const COMPING: Record<Section, [number, number, number][][]> = {
  intro: [[[0, 3.6, 0.5]]],
  groove: [[[0, 1.4, 0.55], [2.5, 1.3, 0.4]]],
  tune: [
    [[0, 1, 0.5], [1.5, 0.9, 0.35], [3, 0.9, 0.38]],
    [[0, 1.4, 0.5], [2.5, 1.4, 0.38]],
  ],
  echo: [[[0, 1.4, 0.5], [2.5, 1.3, 0.38]]],
};

/** Human timing: a few milliseconds early or late, never the same twice. */
const loose = (random: Random, spread = 0.006) => gaussian(random, spread);

function keys(bar: number, random: Random, hits: Hit[]) {
  const section = sectionOf(bar);
  // The last bars of the lap go back to long, soft chords, so the loop point sounds like the start of a verse.
  const patterns = bar >= 28 ? COMPING.intro : COMPING[section];
  const fade = bar >= 28 ? 1 - (bar - 28) * 0.08 : 1;
  for (const [beat, beats, velocity] of patterns[bar % patterns.length]) {
    chordAt(bar).voicing.forEach((midi, i) => {
      // A slight roll from the bottom note up, as a hand plays a chord.
      const at = timeOf(bar, beat) + i * 0.011 + loose(random);
      hits.push({ voice: 'keys', at, duration: beats * BEAT, midi, velocity: vary(random, velocity * fade, 0.08) });
    });
  }
}

function bass(bar: number, random: Random, hits: Hit[]) {
  const section = sectionOf(bar);
  const { root } = chordAt(bar);
  const next = chordAt(bar + 1).root;
  const note = (beat: number, beats: number, midi: number, velocity: number) =>
    hits.push({ voice: 'bass', at: timeOf(bar, beat) + loose(random, 0.004), duration: beats * BEAT, midi, velocity: vary(random, velocity, 0.05) });

  if (section === 'intro' || bar >= 28) return note(0, 3.7, root, bar < 4 ? 0.55 : 0.65);
  note(0, section === 'tune' ? 1.4 : 1.9, root, 0.8);
  if (section === 'tune') note(1.5, 0.4, root, 0.5);
  note(2.5, 0.9, root + 7, 0.6);
  if (section === 'tune' && bar % 2 === 1) note(3.5, 0.4, approachNote(root + 7, next), 0.5);
}

/** Drum level for a bar, or 0 for none: silent through the intro but for a shaker that leads into the groove. */
function drumLevel(bar: number) {
  if (bar < 6) return 0;
  if (bar < 8) return 0.35 + (bar - 6) * 0.15;
  if (bar < 16) return 0.85;
  if (bar < 28) return 1;
  return 0.75 - (bar - 28) * 0.12;
}

function drums(bar: number, random: Random, hits: Hit[]) {
  const level = drumLevel(bar);
  if (level === 0) return;
  const hit = (voice: Voice, beat: number, velocity: number) =>
    hits.push({ voice, at: timeOf(bar, beat) + loose(random, 0.005), duration: 0, midi: 0, velocity: vary(random, velocity * level, 0.1) });

  for (let beat = 0; beat < 4; beat += 0.5) hit('shaker', beat, beat % 1 === 0 ? 0.5 : 0.8);
  if (bar < 8) return;
  hit('brush', 1, 0.8);
  hit('brush', 3, 0.85);
  if (bar >= 28) return;
  hit('kick', 0, 0.9);
  hit('kick', 2.5, 0.6);
  if (sectionOf(bar) === 'tune' && bar % 4 === 3) hit('brush', 3.5, 0.3);
}

/** Every note of one lap, fully determined by the seed. */
export function writeScore(seed = 76): Score {
  const random = createRandom(seed);
  const hits: Hit[] = [];
  const pads: PadChord[] = [];
  for (let bar = 0; bar < BARS; bar++) {
    pads.push({ at: bar * BAR, duration: BAR, notes: chordAt(bar).pad });
    keys(bar, random, hits);
    bass(bar, random, hits);
    drums(bar, random, hits);
  }
  for (const [bar, beat, midi, beats, velocity] of MELODY) {
    hits.push({ voice: 'lead', at: timeOf(bar, beat) + loose(random), duration: beats * BEAT * 0.95, midi, velocity });
  }
  return { hits, pads };
}
