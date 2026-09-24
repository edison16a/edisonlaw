/**
 * The scan geometry and the tissue it shows: a thyroid lobe with a hypoechoic nodule, the
 * carotid artery beside it and the trachea's shadow.
 * Organs sit in flat coordinates: x across the image in units of the fan radius, d down from
 * the probe face from 0 to 1. Skin and muscle layers follow the curved probe face instead.
 */

export const SECTOR = {
  /** Apex of the fan in the zoomed view (see draw/view). */
  apexX: 256,
  apexY: 46,
  /** Half angle of the fan, radians. */
  halfAngle: 0.68,
  near: 17,
  far: 388,
} as const;

export interface Ellipse {
  x: number;
  d: number;
  rx: number;
  rd: number;
}

export const NODULE: Ellipse = { x: 0.06, d: 0.52, rx: 0.13, rd: 0.12 };
export const CAROTID: Ellipse = { x: -0.3, d: 0.42, rx: 0.075, rd: 0.07 };
const GLAND: Ellipse = { x: 0.04, d: 0.5, rx: 0.34, rd: 0.24 };
const TRACHEA: Ellipse = { x: 0.43, d: 0.36, rx: 0.1, rd: 0.07 };

/** Distance from the centre in ellipse units, 1 on the boundary. */
const ellipseDistance = (e: Ellipse, x: number, d: number) => Math.hypot((x - e.x) / e.rx, (d - e.d) / e.rd);

/** Brightness of the layers under the skin, by distance from the probe face. */
function layers(radial: number, x: number) {
  if (radial < 0.025) return 0.9;
  if (radial < 0.08) return 0.32;
  if (radial < 0.095) return 0.75;
  if (radial < 0.2) return 0.42 + 0.1 * Math.sin(radial * 150 + x * 9);
  if (radial < 0.215) return 0.7;
  return 0.34;
}

/**
 * Mean echo brightness, 0 to 1, before speckle.
 * `x` and `d` are flat coordinates, `radial` is the distance from the probe face.
 */
export function echo(x: number, d: number, radial: number) {
  let value = layers(radial, x);

  const gland = ellipseDistance(GLAND, x, d);
  if (gland < 1) value = 0.6 + 0.05 * Math.sin(x * 60) * Math.cos(d * 45);
  else if (gland < 1.06) value = 0.82;

  const nodule = ellipseDistance(NODULE, x, d);
  if (nodule < 0.9) value = 0.2 + 0.07 * Math.sin(x * 90 + d * 40);
  else if (nodule < 1.05) value = 0.92;
  // Fluid passes sound easily, so tissue under the nodule reads brighter.
  if (d > NODULE.d + NODULE.rd && Math.abs(x - NODULE.x) < NODULE.rx * 0.8) value *= 1.3;

  const carotid = ellipseDistance(CAROTID, x, d);
  if (carotid < 0.88) value = 0.03;
  else if (carotid < 1.12) value = 0.95;

  // The trachea reflects almost everything and leaves a dark shadow under it.
  const trachea = ellipseDistance(TRACHEA, x, d);
  if (trachea < 1 && d < TRACHEA.d) value = 0.95;
  else if (d > TRACHEA.d && Math.abs(x - TRACHEA.x) < TRACHEA.rx * 0.9) value = 0.07;

  return value * (1 - 0.45 * radial);
}
