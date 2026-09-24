import { clamp, smoothstep } from '@/lib/math';
import { mirrored, periodicSpline } from './spline';

/**
 * The haircut as functions over the skull: a two block cut with a middle part. A long top layer with
 * curtain bangs ends in soft strand tips around the back, over a short tapered undercut at the nape.
 * Angles in degrees: `theta` down from the crown, `phi` around from the face toward his left.
 * Offsets in metres above the skull.
 */

const DEG = Math.PI / 180;

/** Strand clumps around the head, shared by the edge tips, the ridges and the tint. */
const CLUMPS = 13;

/** 1 on a clump's centre line, falling to 0 between clumps. */
const clumpWave = (phiDeg: number) => (0.5 + 0.5 * Math.cos(phiDeg * DEG * CLUMPS + 0.4)) ** 2.4;

/** Clumps only show over the sides and back; the front is carried by the bang locks. */
const behind = (phiDeg: number) => smoothstep(0.05, 0.6, -Math.cos(phiDeg * DEG) + 0.45);

/** Base edge of the long top layer: part notch, bangs to the temples, sideburns, over the ears and round the back. */
const topLine = periodicSpline(
  mirrored([
    [0, 46],
    [6, 54],
    [13, 62],
    [22, 69],
    [32, 73],
    [44, 80],
    [56, 92],
    [66, 101],
    [74, 103],
    [83, 94],
    [92, 90],
    [102, 95],
    [116, 104],
    [135, 112],
    [158, 117],
    [180, 119],
  ]),
);

/** Uneven tip lengths so the back does not look like a row of scallops. */
const tipLength = (phiDeg: number) => 7.5 * (0.72 + 0.28 * Math.sin(phiDeg * DEG * 3 + 1.1)) * (0.8 + 0.2 * Math.cos(phiDeg * DEG * 7));

/** Where the long top layer ends, with rounded strand tips hanging down around the back. */
export const hairlineAt = (phiDeg: number) => topLine(phiDeg) + tipLength(phiDeg) * clumpWave(phiDeg) * behind(phiDeg);

/** Where the short undercut ends: tucked under the top layer at the front, tapering into the nape. */
export const undercutLineAt = periodicSpline(
  mirrored([
    [0, 40],
    [70, 60],
    [86, 84],
    [94, 94],
    [100, 118],
    [106, 134],
    [116, 144],
    [135, 150],
    [160, 153],
    [180, 154],
  ]),
);

/** The lowest hair edge in any direction, for shading the skin just below it. */
export const coveredLineAt = (phiDeg: number) => Math.max(hairlineAt(phiDeg), undercutLineAt(phiDeg));

/** How far the top layer stands off the skull: full on top, springy over the forehead, closer at the sides. */
function volumeAt(thetaDeg: number, phiDeg: number) {
  const phi = phiDeg * DEG;
  const side = Math.abs(Math.sin(phi));
  const back = Math.max(0, -Math.cos(phi));
  const front = Math.max(0, Math.cos(phi));
  // Full on top, then tapering so the ends lie close over the undercut instead of flaring out.
  const low = smoothstep(42, 118, thetaDeg);
  let volume = 1 - low * (0.55 * side ** 1.2 + 0.72 * back);
  // Curtains lift off the forehead.
  volume += 0.2 * front ** 3 * smoothstep(38, 66, thetaDeg);
  return 0.01 + 0.026 * clamp(volume, 0, 1.25);
}

/** The centre part: a groove from the forehead back to the crown, with the hair lifting either side of it. */
function partAt(x: number, y: number, z: number) {
  const along = smoothstep(-0.13, -0.06, z) * smoothstep(0.03, 0.09, y);
  if (along <= 0) return 0;
  const groove = -0.011 * Math.exp(-((x / 0.0068) ** 2));
  const lift = 0.0055 * Math.exp(-(((Math.abs(x) - 0.026) / 0.02) ** 2));
  return (groove + lift) * along;
}

/**
 * Soft clumps that follow the flow of the cut: over the top they run out sideways from the part,
 * over the back and sides they fall from the crown and line up with the strand tips.
 */
function clumpsAt(thetaDeg: number, phiDeg: number, x: number, z: number) {
  const fromPart = smoothstep(0.006, 0.03, Math.abs(x)) * (1 - smoothstep(55, 80, thetaDeg));
  const overTop = Math.cos(z * 150 + Math.abs(x) * 30) * fromPart * smoothstep(-0.07, 0.0, z);
  const down = (clumpWave(phiDeg) - 0.3) * smoothstep(20, 60, thetaDeg) * behind(phiDeg);
  return 0.0022 * overTop + 0.0065 * down;
}

/** Height of the top layer above the skull, before its edge rolls into the skin. */
export function hairOffsetAt(thetaDeg: number, phiDeg: number, x: number, y: number, z: number) {
  return Math.max(0.006, volumeAt(thetaDeg, phiDeg) + partAt(x, y, z) + clumpsAt(thetaDeg, phiDeg, x, z));
}

/** Height of the undercut: a thin close crop that thins further toward the nape. */
export const undercutOffsetAt = (thetaDeg: number) => 0.0045 - 0.0015 * smoothstep(110, 150, thetaDeg);

/**
 * Vertex tint of the top layer: a soft glossy band around the top, lighter strand ridges over the back,
 * and slightly deeper black toward the edge.
 */
export function hairToneAt(thetaDeg: number, phiDeg: number, edge: number) {
  const band = Math.exp(-(((thetaDeg - 36) / 12) ** 2));
  const strands = (clumpWave(phiDeg) - 0.4) * smoothstep(20, 70, thetaDeg) * behind(phiDeg);
  return 1 + 0.9 * band + 0.55 * strands - 0.3 * smoothstep(0.85, 1, edge);
}
