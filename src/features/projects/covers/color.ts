/** Tiny hex colour helpers, enough for shading flat illustration. */

type Rgb = [number, number, number];

function parseHex(hex: string): Rgb {
  const digits = hex.replace('#', '');
  const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join('') : digits;
  const value = parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const toHex = (rgb: Rgb) => `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;

/** `hex` with an alpha channel, as an rgba() string. */
export function rgba(hex: string, alpha: number) {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Linear blend from `a` to `b`, returned as hex. */
export function mix(a: string, b: string, t: number) {
  const from = parseHex(a);
  const to = parseHex(b);
  return toHex([0, 1, 2].map((i) => from[i] + (to[i] - from[i]) * t) as Rgb);
}

export const lighten = (hex: string, amount: number) => mix(hex, '#ffffff', amount);

export const darken = (hex: string, amount: number) => mix(hex, '#000000', amount);
