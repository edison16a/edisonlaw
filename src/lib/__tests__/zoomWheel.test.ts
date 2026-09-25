import { describe, expect, it } from 'vitest';
import { isZoomWheel } from '../zoomWheel';

describe('isZoomWheel', () => {
  it('is true with ctrl or Cmd held, as for a pinch or a zoom', () => {
    expect(isZoomWheel({ ctrlKey: true, metaKey: false })).toBe(true);
    expect(isZoomWheel({ ctrlKey: false, metaKey: true })).toBe(true);
  });

  it('is false for a plain wheel', () => {
    expect(isZoomWheel({ ctrlKey: false, metaKey: false })).toBe(false);
  });
});
