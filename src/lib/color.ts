/** Colour helpers for brand marks shown on the black UI. */

type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  const number = parseInt(full, 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

export function rgbToHex([r, g, b]: Rgb) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/** WCAG relative luminance, 0 for black and 1 for white. */
export function relativeLuminance([r, g, b]: Rgb) {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const mixWithWhite = ([r, g, b]: Rgb, t: number): Rgb => [r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t];

/**
 * A version of `hex` that stays visible on black.
 * Grey or black brand colours become white, the way those brands show their marks on dark backgrounds.
 * Dark colours are mixed toward white until they reach `minLuminance`.
 */
export function visibleOnBlack(hex: string, minLuminance = 0.2) {
  const rgb = hexToRgb(hex);
  const spread = Math.max(...rgb) - Math.min(...rgb);
  if (spread < 16) return '#ffffff';
  if (relativeLuminance(rgb) >= minLuminance) return rgbToHex(rgb);

  let low = 0;
  let high = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    if (relativeLuminance(mixWithWhite(rgb, mid)) >= minLuminance) high = mid;
    else low = mid;
  }
  return rgbToHex(mixWithWhite(rgb, high));
}
