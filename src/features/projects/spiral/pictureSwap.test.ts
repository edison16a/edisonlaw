import { describe, expect, it } from 'vitest';
import { createSwap, requestSwap, stepSwap } from './pictureSwap';

const run = (swap: ReturnType<typeof createSwap<string>>, seconds: number) => {
  let running = false;
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) running = stepSwap(swap, 1 / 60, 0.3);
  return running;
};

describe('pictureSwap', () => {
  it('takes the first picture at once', () => {
    const swap = createSwap<string>();
    requestSwap(swap, 'thumb');
    expect(swap).toEqual({ current: 'thumb', next: null, blend: 0 });
  });

  it('crossfades to a new picture and then rests on it', () => {
    const swap = createSwap<string>();
    requestSwap(swap, 'thumb');
    requestSwap(swap, 'shot');
    expect(run(swap, 0.1)).toBe(true);
    expect(swap.next).toBe('shot');
    expect(swap.blend).toBeGreaterThan(0.2);
    expect(run(swap, 0.3)).toBe(false);
    expect(swap).toEqual({ current: 'shot', next: null, blend: 0 });
  });

  it('ignores a request for the picture it is already heading to', () => {
    const swap = createSwap<string>();
    requestSwap(swap, 'thumb');
    requestSwap(swap, 'shot');
    run(swap, 0.1);
    const blend = swap.blend;
    requestSwap(swap, 'shot');
    expect(swap.blend).toBe(blend);
    expect(stepSwap(createSwap<string>(), 1 / 60, 0.3)).toBe(false);
  });

  it('reverses smoothly when it turns back mid fade', () => {
    const swap = createSwap<string>();
    requestSwap(swap, 'thumb');
    requestSwap(swap, 'shot');
    run(swap, 0.1);
    const shotShare = swap.blend;
    requestSwap(swap, 'thumb');
    expect(swap.current).toBe('shot');
    expect(swap.next).toBe('thumb');
    expect(1 - swap.blend).toBeCloseTo(shotShare, 9);
  });

  it('fades a third picture in over whichever shows more', () => {
    const swap = createSwap<string>();
    requestSwap(swap, 'thumb');
    requestSwap(swap, 'two');
    run(swap, 0.2);
    requestSwap(swap, 'three');
    expect(swap).toEqual({ current: 'two', next: 'three', blend: 0 });
  });
});
