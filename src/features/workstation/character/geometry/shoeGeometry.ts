import { Color, type BufferGeometry } from 'three';
import { PALETTE } from '../materials';
import { taperedCapsule } from './capsule';
import { loftGeometry, type LoftRing } from './loft';
import { mergeParts, paintSolid } from './merge';

/**
 * A clean chunky sneaker in the foot bone's space: the ankle joint is the origin, toes point +Z
 * and the sole touches y = -ankleHeight. White upper with a padded collar, laces over the instep,
 * a pale sole with a thin dark stripe and a dark heel tab, coloured per vertex so it is one mesh.
 */

/** Upper sections from the sole up to the padded collar, then down into the opening. Heights above the floor. */
const UPPER: LoftRing[] = [
  { y: 0.014, x: 0.041, front: 0.086, back: 0.058, z: 0.032 },
  { y: 0.026, x: 0.0428, front: 0.0874, back: 0.0592, z: 0.032 },
  { y: 0.038, x: 0.0428, front: 0.0858, back: 0.0594, z: 0.0318 },
  { y: 0.05, x: 0.0414, front: 0.0792, back: 0.0578, z: 0.0302 },
  { y: 0.06, x: 0.0392, front: 0.0668, back: 0.0556, z: 0.0276 },
  { y: 0.069, x: 0.0366, front: 0.0528, back: 0.0526, z: 0.0246 },
  { y: 0.077, x: 0.0342, front: 0.0404, back: 0.0484, z: 0.0206 },
  { y: 0.084, x: 0.0326, front: 0.0316, back: 0.0452, z: 0.0164 },
  { y: 0.0895, x: 0.0322, front: 0.0296, back: 0.0446, z: 0.0146 },
  { y: 0.0925, x: 0.0294, front: 0.0266, back: 0.0416, z: 0.0142 },
  { y: 0.0905, x: 0.0262, front: 0.0232, back: 0.0384, z: 0.0142 },
];
/** Rings from this index on are the collar's rolled lip and the opening, shaded darker. */
const LIP_START = 9;
const RADIAL_SEGMENTS = 48;

const SOLE: LoftRing[] = [
  { y: 0, x: 0.042, front: 0.088, back: 0.058, z: 0.032 },
  { y: 0.0022, x: 0.0456, front: 0.0916, back: 0.0616, z: 0.032 },
  { y: 0.0138, x: 0.046, front: 0.092, back: 0.062, z: 0.032 },
  { y: 0.018, x: 0.0436, front: 0.0894, back: 0.0594, z: 0.032 },
];

const STRIPE: LoftRing[] = [
  { y: 0.018, x: 0.0438, front: 0.0896, back: 0.0598, z: 0.032 },
  { y: 0.0232, x: 0.0439, front: 0.0898, back: 0.0599, z: 0.032 },
];

/** Laces as heights on the instep, from the toe up. */
const LACES = [0.055, 0.0635, 0.0715] as const;
const LACE = { halfLength: 0.0135, radius: 0.003, flatten: 0.62, sink: 0.0003 } as const;
/** A dark patch on the heel counter, low enough to show under the trouser hem. */
const HEEL_TAB = { radius: 0.0078, length: 0.016, flatten: 0.4, top: 0.066 } as const;

const COLORS = {
  upper: new Color(PALETTE.shoe),
  lip: new Color(PALETTE.shoe).lerp(new Color(PALETTE.shoeAccent), 0.35),
  sole: new Color(PALETTE.sole),
  accent: new Color(PALETTE.shoeAccent),
  lace: new Color(PALETTE.shoe).lerp(new Color(PALETTE.sole), 0.3),
};

interface Section {
  /** Z of the surface on the centre line. */
  z: number;
  halfWidth: number;
  /** Depth of the section from its centre toward the surface. */
  depth: number;
}

/** The upper's front or back surface on the centre line at height `y` above the floor. */
function sectionAt(y: number, side: 'front' | 'back'): Section {
  const sign = side === 'front' ? 1 : -1;
  const at = (ring: LoftRing) => ({ z: (ring.z ?? 0) + sign * ring[side], halfWidth: ring.x, depth: ring[side] });
  for (let i = 1; i < LIP_START; i++) {
    const a = at(UPPER[i - 1]);
    const b = at(UPPER[i]);
    if (y <= UPPER[i].y) {
      const t = (y - UPPER[i - 1].y) / (UPPER[i].y - UPPER[i - 1].y);
      return { z: a.z + (b.z - a.z) * t, halfWidth: a.halfWidth + (b.halfWidth - a.halfWidth) * t, depth: a.depth + (b.depth - a.depth) * t };
    }
  }
  return at(UPPER[LIP_START - 1]);
}

/** Angle of the surface against the vertical at height `y`, positive where it leans forward going down. */
function slopeAt(y: number, side: 'front' | 'back') {
  return Math.atan2(sectionAt(y, side).z - sectionAt(y - 0.002, side).z, 0.002);
}

/** The upper, with the collar lip and the opening painted a shade darker. */
function upperGeometry(floor: number) {
  const geometry = loftGeometry(
    UPPER.map((ring) => ({ ...ring, y: floor + ring.y })),
    { radialSegments: RADIAL_SEGMENTS, capTop: true },
  );
  paintSolid(geometry, COLORS.upper);
  const colors = geometry.getAttribute('color');
  for (let i = LIP_START * (RADIAL_SEGMENTS + 1); i < colors.count; i++) colors.setXYZ(i, COLORS.lip.r, COLORS.lip.g, COLORS.lip.b);
  return geometry;
}

/** One flat lace lying across the instep, bent to follow the rounded top of the shoe. */
function laceGeometry(floor: number, height: number) {
  const section = sectionAt(height, 'front');
  const lace = taperedCapsule(LACE.radius, LACE.radius, LACE.halfLength * 2, 10, 4)
    .translate(0, LACE.halfLength, 0)
    .scale(1, 1, LACE.flatten)
    .rotateZ(Math.PI / 2)
    .rotateX(slopeAt(height, 'front'));
  const positions = lace.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const across = Math.min(0.999, Math.abs(positions.getX(i)) / section.halfWidth);
    positions.setZ(i, positions.getZ(i) - section.depth * (1 - Math.sqrt(1 - across * across)));
  }
  lace.translate(0, floor + height, section.z - LACE.sink);
  lace.computeVertexNormals();
  return paintSolid(lace, COLORS.lace);
}

/** A small dark tab on the back of the heel. */
function heelTabGeometry(floor: number) {
  const { radius, length, flatten, top } = HEEL_TAB;
  const middle = top - length / 2;
  const tab = taperedCapsule(radius, radius, length, 12, 4)
    .translate(0, length / 2, 0)
    .scale(1, 1, flatten)
    .rotateX(slopeAt(middle, 'back'))
    .translate(0, floor + middle, sectionAt(middle, 'back').z + radius * flatten * 0.4);
  return paintSolid(tab, COLORS.accent);
}

export function shoeGeometry(ankleHeight: number): BufferGeometry {
  const floor = -ankleHeight;
  const shift = (rings: LoftRing[]) => rings.map((ring) => ({ ...ring, y: floor + ring.y }));
  return mergeParts([
    upperGeometry(floor),
    paintSolid(loftGeometry(shift(SOLE), { radialSegments: RADIAL_SEGMENTS, capBottom: true }), COLORS.sole),
    paintSolid(loftGeometry(shift(STRIPE), { radialSegments: RADIAL_SEGMENTS }), COLORS.accent),
    ...LACES.map((height) => laceGeometry(floor, height)),
    heelTabGeometry(floor),
  ]);
}
