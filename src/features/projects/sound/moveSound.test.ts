import { describe, expect, it } from 'vitest';
import { createMoveSound, GESTURE_GAP, SOFTER, SOFTER_WITHIN } from './moveSound';

/**
 * Plays out moves at the given times, with something still moving every
 * frame through each of the `busy` spans and a new touch at each of the
 * `touches`, and returns the volume of every sound they played.
 */
function volumesFor(moves: number[], busy: [number, number][] = [], touches: number[] = []) {
  const played: number[] = [];
  const sound = createMoveSound((volume) => played.push(volume));
  const frames = busy.flatMap(([from, to]) => Array.from({ length: Math.floor((to - from) / 16) + 1 }, (_, frame) => from + frame * 16));
  // At the same moment a touch comes first, then a frame, as a scroll event does, then a move.
  const order = { touch: 0, frame: 1, move: 2 };
  const events = [
    ...touches.map((time) => ({ time, kind: 'touch' as const })),
    ...frames.map((time) => ({ time, kind: 'frame' as const })),
    ...moves.map((time) => ({ time, kind: 'move' as const })),
  ];
  events.sort((a, b) => a.time - b.time || order[a.kind] - order[b.kind]);
  for (const { time, kind } of events) {
    if (kind === 'touch') sound.endGlide();
    else if (kind === 'frame') sound.hold(time);
    else sound.move(time);
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

  it('sounds for each flick of the strip, however soon after the last glide it begins', () => {
    // Three flicks, each gliding for half a second and resting 150 ms before the next.
    const spans: [number, number][] = [
      [0, 500],
      [650, 1150],
      [1300, 1800],
    ];
    // Scrolling alone would hold the first gesture open across each short rest. The touch ends it.
    expect(volumesFor([150, 800, 1450], spans)).toEqual([1]);
    expect(volumesFor([150, 800, 1450], spans, [0, 650, 1300])).toEqual([1, 1, 1]);
    // A flick that catches the strip while it still glides.
    expect(volumesFor([150, 700], [[0, 1200]], [0, 600])).toEqual([1, SOFTER]);
  });

  it('still joins taps closer together than a gesture', () => {
    expect(volumesFor([150, 300], [[0, 600]], [0, 200])).toEqual([1]);
  });

  it('pays no heed to scrolling before the strip reaches another project', () => {
    expect(volumesFor([1100], [[0, 1200]])).toEqual([1]);
  });
});
