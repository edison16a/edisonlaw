import { describe, expect, it } from 'vitest';
import { ROW, rowSpace } from './rowSize';

describe('rowSpace', () => {
  it('adds the gap to the height of a picture an eighth of the card wide', () => {
    expect(rowSpace(640, 900)).toBeCloseTo(900 * ROW.gapShare + (640 * ROW.thumbShare) / ROW.aspect, 6);
  });

  it('keeps the gap and the pictures within their sizes', () => {
    expect(rowSpace(200, 400)).toBeCloseTo(ROW.gapMin + ROW.thumbMin / ROW.aspect, 6);
    expect(rowSpace(2000, 2000)).toBeCloseTo(ROW.gapMax + ROW.thumbMax / ROW.aspect, 6);
  });
});
