import { describe, expect, it } from 'vitest';
import { sampleOf } from './wheelSample';

describe('sampleOf', () => {
  it('reads deltaMode before the deltas, so Firefox keeps reporting lines', () => {
    const reads: string[] = [];
    const read = (name: string, value: number) => () => {
      reads.push(name);
      return value;
    };
    const event = {} as Pick<WheelEvent, 'deltaMode' | 'deltaX' | 'deltaY' | 'timeStamp'>;
    Object.defineProperties(event, {
      deltaMode: { get: read('deltaMode', 1) },
      deltaX: { get: read('deltaX', 0) },
      deltaY: { get: read('deltaY', 3) },
      timeStamp: { get: read('timeStamp', 250) },
    });
    expect(sampleOf(event)).toEqual({ dx: 0, dy: 3, mode: 1, time: 250 });
    expect(reads[0]).toBe('deltaMode');
  });
});
