import { BufferGeometry, Float32BufferAttribute } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { hairlineAt, hairOffsetAt, hairToneAt, undercutLineAt, undercutOffsetAt } from './hairShape';
import { headRadius } from './headShape';

const DEG = Math.PI / 180;

/** Depth the rolled edge tucks under the skin, so the hairline never shows a gap. */
const TUCK = 0.003;

interface Shell {
  /** Edge crown angle for each turn angle, degrees. */
  hairline: (phiDeg: number) => number;
  /** Height above the skull at a point, before the edge rolls in. */
  offset: (thetaDeg: number, phiDeg: number, x: number, y: number, z: number) => number;
  /** Vertex tint, `edge` runs 0 at the crown to 1 at the hairline. */
  tone: (thetaDeg: number, phiDeg: number, edge: number) => number;
}

/** Rolls the edge of the shell down into the skin with a round lip, so the hairline reads soft and thick. */
function edgeAt(t: number, thetaMax: number, thickness: number) {
  const lipAngle = (thickness + TUCK) / 0.19;
  const start = 1 - lipAngle / (thetaMax * DEG);
  if (t <= start) return thickness;
  const u = (t - start) / (1 - start);
  return (thickness + TUCK) * Math.sqrt(Math.max(0, 1 - u * u)) - TUCK;
}

/** Packs rings more densely near the hairline where the rolled edge needs them. */
const ringParam = (u: number) => 1 - (1 - u) ** 1.7;

/** A hair shell over the skull from the crown down to its hairline, centred on the head centre. */
function shellGeometry({ hairline, offset, tone }: Shell, turnSegments: number, rings: number) {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= turnSegments; i++) {
    const phiDeg = -180 + (360 * i) / turnSegments;
    const phi = phiDeg * DEG;
    const thetaMax = hairline(phiDeg);
    for (let j = 0; j <= rings; j++) {
      const t = ringParam(j / rings);
      const thetaDeg = t * thetaMax;
      const theta = thetaDeg * DEG;
      const dx = Math.sin(theta) * Math.sin(phi);
      const dy = Math.cos(theta);
      const dz = Math.sin(theta) * Math.cos(phi);
      const skull = headRadius(dx, dy, dz);
      const radius = skull + edgeAt(t, thetaMax, offset(thetaDeg, phiDeg, dx * skull, dy * skull, dz * skull));
      positions.push(dx * radius, dy * radius, dz * radius);
      const shade = tone(thetaDeg, phiDeg, t);
      colors.push(shade, shade, shade);
    }
  }

  for (let i = 0; i < turnSegments; i++) {
    for (let j = 0; j < rings; j++) {
      const a = i * (rings + 1) + j;
      const b = a + 1;
      const c = a + (rings + 1);
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const raw = new BufferGeometry();
  raw.setAttribute('position', new Float32BufferAttribute(positions, 3));
  raw.setAttribute('color', new Float32BufferAttribute(colors, 3));
  raw.setIndex(indices);
  const geometry = mergeVertices(raw, 1e-5);
  raw.dispose();
  geometry.computeVertexNormals();
  return geometry;
}

/** The long top layer: centre part, bangs, clumps and strand tips around the back. */
export function hairCapGeometry() {
  return shellGeometry({ hairline: hairlineAt, offset: hairOffsetAt, tone: hairToneAt }, 224, 56);
}

/** The short undercut hugging the back and sides of the skull down to the nape. */
export function undercutGeometry() {
  return shellGeometry({ hairline: undercutLineAt, offset: undercutOffsetAt, tone: () => 1 }, 128, 32);
}
