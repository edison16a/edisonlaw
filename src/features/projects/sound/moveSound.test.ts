import { describe, expect, it } from 'vitest';
import { createMoveSound, GESTURE_GAP, SOFTER, SOFTER_WITHIN } from './moveSound';

/** Feeds moves at the given times and returns the volume of every sound they played. */
function volumesFor(times: number[]) {
  const played: number[] = [];
  const move = createMoveSound((volume) => played.push(volume));
  times.forEach((time) => move(time));
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

  it('sounds once as the phone strip scrolls past a few projects on its way to one', () => {
    expect(volumesFor([0, 70, 130, 200, 260, 330, 390].map((time) => 8000 + time))).toEqual([1]);
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
});
