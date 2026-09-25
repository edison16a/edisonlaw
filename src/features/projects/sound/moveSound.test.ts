import { describe, expect, it } from 'vitest';
import { createMoveSound, GESTURE_GAP, SOFTER, SOFTER_WITHIN } from './moveSound';

/**
 * Plays out moves at the given times, with something still moving every
 * frame through each of the `busy` spans, and returns the volume of every
 * sound they played.
 */
function volumesFor(moves: number[], busy: [number, number][] = []) {
  const played: number[] = [];
  const sound = createMoveSound((volume) => played.push(volume));
  const frames = busy.flatMap(([from, to]) => Array.from({ length: Math.floor((to - from) / 16) + 1 }, (_, frame) => from + frame * 16));
  const events = [...moves.map((time) => ({ time, move: true })), ...frames.map((time) => ({ time, move: false }))];
  // A move and a frame at the same moment: the frame comes first, as a scroll event does.
  events.sort((a, b) => a.time - b.time || Number(a.move) - Number(b.move));
  for (const { time, move } of events) {
    if (move) sound.move(time);
    else sound.hold(time);
  }
  return played;
}

describe('createMoveSound', () => {
  it('sounds once for each move a moment apart, at full volume', () => {
    expect(volumesFor([1000, 2000, 3000])).toEqual([1, 1, 1]);
  });

  it('sounds once for a quick wheel spin, not once per notch', () => {
    const spin = [0, 1, 2, 3, 4, 5].map((notch) => 5000 + notch * 40);
    expect(volumesFor(spin)).toEqual([1]);
  });

  it('sounds once while a held key turns the spiral a card every 200 ms', () => {
    expect(volumesFor(Array.from({ length: 10 }, (_, card) => 3000 + card * 200))).toEqual([1]);
  });

  it('plays quick deliberate steps softer', () => {
    const steps = [0, 1, 2, 3].map((step) => 1000 + step * (GESTURE_GAP + 20));
    expect(volumesFor(steps)).toEqual([1, SOFTER, SOFTER, SOFTER]);
    expect(volumesFor([1000, 1000 + SOFTER_WITHIN, 1000 + SOFTER_WITHIN * 2])).toEqual([1, 1, 1]);
  });

  it('waits for a spin to pause before it sounds again', () => {
    const spin = Array.from({ length: 30 }, (_, notch) => notch * 50);
    expect(volumesFor([...spin, 1450 + GESTURE_GAP])).toEqual([1, 1]);
  });

  it('sounds once as the phone strip glides across many projects and slows down at the end', () => {
    // The strip passes a project quickly at first, then ever more slowly as it eases to a stop.
    const passes = [100, 160, 220, 290, 380, 500, 680, 950];
    expect(volumesFor(passes)).toEqual([1, 1]);
    expect(volumesFor(passes, [[0, 1200]])).toEqual([1]);
  });

  it('sounds again for the next swipe once the strip has come to rest', () => {
    const spans: [number, number][] = [
      [0, 300],
      [2000, 2300],
    ];
    expect(volumesFor([150, 2150], spans)).toEqual([1, 1]);
  });

  it('pays no heed to scrolling before the strip reaches another project', () => {
    expect(volumesFor([1100], [[0, 1200]])).toEqual([1]);
  });
});
