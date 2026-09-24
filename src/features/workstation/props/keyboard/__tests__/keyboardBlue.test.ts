import { Color } from 'three';
import { describe, expect, it } from 'vitest';
import { writeKeyboardBlue } from '../keyboardBlue';

const hsl = { h: 0, s: 0, l: 0 };

describe('writeKeyboardBlue', () => {
  it('stays blue across the whole board at every moment', () => {
    const color = new Color();
    for (let step = 0; step <= 40; step++) {
      for (let time = 0; time < 120; time += 3.7) {
        writeKeyboardBlue(color, step / 40, time, 1);
        color.getHSL(hsl);
        expect(hsl.h).toBeGreaterThan(0.53);
        expect(hsl.h).toBeLessThan(0.66);
        expect(color.b).toBeGreaterThanOrEqual(Math.max(color.r, color.g));
      }
    }
  });

  it('runs from dark on the left to light on the right', () => {
    const left = writeKeyboardBlue(new Color(), 0, 0, 1).getHSL({ h: 0, s: 0, l: 0 });
    const right = writeKeyboardBlue(new Color(), 1, 0, 1).getHSL({ h: 0, s: 0, l: 0 });
    expect(right.l).toBeGreaterThan(left.l);
  });
});
