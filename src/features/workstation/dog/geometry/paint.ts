import { Color } from 'three';
import { DOG_PALETTE } from '../materials';

const coatColors = DOG_PALETTE.coat.map((hex) => new Color(hex));

/** Coat colour for a tone, along the gradient from deep gold (0) to cream (1). */
export function toneColor(tone: number, out: Color) {
  const stops = DOG_PALETTE.coatStops;
  if (tone <= stops[0]) return out.copy(coatColors[0]);
  for (let i = 1; i < stops.length; i++) {
    if (tone <= stops[i]) return out.copy(coatColors[i - 1]).lerp(coatColors[i], (tone - stops[i - 1]) / (stops[i] - stops[i - 1]));
  }
  return out.copy(coatColors[coatColors.length - 1]);
}
