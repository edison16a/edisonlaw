import { describe, expect, it } from 'vitest';
import { hexToRgb, relativeLuminance, rgbToHex, visibleOnBlack } from '../color';

describe('hex conversion', () => {
  it('round trips six and three digit colours', () => {
    expect(rgbToHex(hexToRgb('#3178c6'))).toBe('#3178c6');
    expect(hexToRgb('fff')).toEqual([255, 255, 255]);
  });
});

describe('visibleOnBlack', () => {
  it('turns black and grey brands white', () => {
    expect(visibleOnBlack('000000')).toBe('#ffffff');
    expect(visibleOnBlack('#333333')).toBe('#ffffff');
  });

  it('leaves bright colours alone', () => {
    expect(visibleOnBlack('F7DF1E')).toBe('#f7df1e');
  });

  it('lifts dark colours to the minimum luminance and keeps their hue', () => {
    const lifted = hexToRgb(visibleOnBlack('150458'));
    expect(relativeLuminance(lifted)).toBeGreaterThanOrEqual(0.2);
    expect(lifted[2]).toBeGreaterThan(lifted[0]);
  });
});
