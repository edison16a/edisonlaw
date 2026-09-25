import { describe, expect, it } from 'vitest';
import { MUSIC_PAD } from '../../config';
import { toSamples } from '../../dsp/signal';
import { MUSIC_DELAY, layoutMusic } from '../layout';
import { MELODY } from '../melody';
import { writeScore } from '../score';
import { BPM, F_LYDIAN, F_MAJOR, LAP, PHRASE, approachNote, chordAt, timeOf } from '../theory';

describe('the background music score', () => {
  it('is slow and long enough not to repeat audibly', () => {
    expect(BPM).toBeGreaterThanOrEqual(70);
    expect(BPM).toBeLessThanOrEqual(85);
    expect(LAP).toBeGreaterThanOrEqual(60);
    expect(LAP).toBeLessThanOrEqual(120);
  });

  it('keeps every note inside one lap, give or take a humanised few milliseconds', () => {
    const { hits, pads } = writeScore();
    for (const { at } of [...hits, ...pads]) {
      expect(at).toBeGreaterThan(-0.05);
      expect(at).toBeLessThan(LAP);
    }
  });

  it('keeps the melody in F major', () => {
    for (const [, , midi] of MELODY) expect(F_MAJOR).toContain(midi % 12);
  });

  it('builds every chord from F Lydian or F major, never a mix of the two', () => {
    for (const { name, voicing, pad, root } of PHRASE) {
      const notes = [...voicing, ...pad, root].map((midi) => midi % 12);
      const fits = [F_LYDIAN, F_MAJOR].some((scale) => notes.every((note) => scale.includes(note)));
      expect(fits, name).toBe(true);
    }
  });

  it('ends the lap on the chord that leads home to the first one', () => {
    expect(chordAt(31).name).toBe('C9sus4');
    expect(chordAt(32).name).toBe(chordAt(0).name);
  });

  it('is the same every build', () => {
    expect(writeScore()).toEqual(writeScore());
  });

  it('swings the off beats a little late and leaves the beats on the grid', () => {
    expect(timeOf(1, 2)).toBeCloseTo(LAP / 32 + (2 * 60) / BPM);
    expect(timeOf(0, 0.5)).toBeGreaterThan(0.5 * (60 / BPM));
  });

  it('walks the bass into the next root by a scale step', () => {
    expect(approachNote(48, 45)).toBe(46);
    expect(approachNote(40, 43)).toBe(41);
  });
});

describe('layoutMusic', () => {
  it('wraps the lap with a copy of its own ends and points the loop at the lap itself', () => {
    const lap = Float32Array.from({ length: toSamples(0.5) }, (_, i) => Math.sin(i / 5));
    const { file, start, region } = layoutMusic([lap, lap]);
    const pad = toSamples(MUSIC_PAD);
    expect(file[0].length).toBe(lap.length + 2 * pad);
    expect(start).toBe(pad);
    expect(Array.from(file[0].subarray(pad, pad + 10))).toEqual(Array.from(lap.subarray(0, 10)));
    expect(file[0][0]).toBe(lap[lap.length - pad]);
    expect(region.duration).toBeCloseTo(500);
    expect(region.start).toBeCloseTo(((pad + MUSIC_DELAY) / 44100) * 1000);
  });
});
