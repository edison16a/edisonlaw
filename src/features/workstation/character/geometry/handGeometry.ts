import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { clamp } from '@/lib/math';
import { HAND } from '../dimensions';
import { taperedCapsule } from './capsule';
import { loftGeometry, type LoftRing } from './loft';

/**
 * The palm as one smooth loft in the hand bone's space: a round wrist that sits inside the forearm's
 * rounded end, flattening into a soft, slightly squared palm and closing round past the knuckles.
 * Fingers point down -Y and the back of the hand faces +Z. Listed bottom to top.
 */
const PALM: LoftRing[] = [
  { y: -0.0636, x: 0.009, front: 0.0022, back: 0.0022 },
  { y: -0.0612, x: 0.0195, front: 0.0062, back: 0.0062 },
  { y: -0.0572, x: 0.0262, front: 0.0102, back: 0.0106 },
  { y: -0.0515, x: 0.0284, front: 0.0128, back: 0.0132 },
  { y: -0.042, x: 0.0291, front: 0.0134, back: 0.0146 },
  { y: -0.028, x: 0.0288, front: 0.0136, back: 0.0154 },
  { y: -0.015, x: 0.0272, front: 0.0146, back: 0.0158 },
  { y: -0.004, x: 0.0252, front: 0.0165, back: 0.0165 },
  { y: 0.006, x: 0.0212, front: 0.0158, back: 0.0158 },
  { y: 0.0125, x: 0.0105, front: 0.0082, back: 0.0082 },
  { y: 0.0142, x: 0.002, front: 0.0016, back: 0.0016 },
];

/** Fleshy pad at the base of the thumb, on the palm side. */
const THUMB_PAD = { y: -0.021, spreadY: 0.014, spreadX: 0.016, depth: 0.0048 } as const;

/**
 * Palm with a thumb pad on `thumbSide` (+1 is +X in hand space). The pad swells the palm face and the
 * thumb edge, so the thumb grows out of the hand instead of sticking to its side.
 */
export function palmGeometry(thumbSide: number) {
  const loft = loftGeometry(PALM, { radialSegments: 36, squareness: 2.5, capBottom: true, capTop: true });
  loft.deleteAttribute('uv');
  loft.deleteAttribute('normal');
  // Weld the loft's seam so the normals recomputed after sculpting stay smooth across it.
  const geometry = mergeVertices(loft, 1e-7);
  loft.dispose();
  const positions = geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const across = clamp((x * thumbSide + 0.004) / THUMB_PAD.spreadX);
    const along = Math.exp(-(((y - THUMB_PAD.y) / THUMB_PAD.spreadY) ** 2));
    const palmSide = clamp(-z / 0.015);
    const pad = THUMB_PAD.depth * along * across * (0.35 + 0.65 * palmSide);
    positions.setXYZ(i, x + thumbSide * pad * 0.45, y, z - pad * palmSide);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** The two segments of one finger, each rounded at its joints so bending never opens a gap. */
export function fingerGeometries(index: number) {
  const length = HAND.fingerLengths[index];
  const radius = HAND.fingerRadius * (index === 3 ? 0.92 : 1);
  const split = length * HAND.fingerSplit;
  return {
    base: taperedCapsule(radius, radius * 0.96, split, 14),
    tip: taperedCapsule(radius * 0.96, radius * 0.88, length - split, 14),
  };
}

/** A short, thick thumb that tapers to a soft round tip. */
export function thumbGeometry() {
  return taperedCapsule(HAND.fingerRadius * 1.14, HAND.fingerRadius * 0.98, HAND.thumbLength, 14);
}
