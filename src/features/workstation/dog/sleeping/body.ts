import { Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { cone, ellipsoid, flatLock } from '../anatomy/sculpt';
import { PART, TONE } from '../dimensions';
import type { Shape } from '../sdf/field';
import { curlFrame, onCurl, TORSO } from './dimensions';

/**
 * The curled torso in dog space: the rib cage, loin and pelvis bent round in one sweep with the back on
 * the outside, a darker saddle along the spine, the upper shoulder blade, a cream belly on the inside and
 * a soft cream bib at the front of the chest.
 */

const body = (tone: number, blend: number) => ({ tone, blend, part: PART.body });

/** A point `dorsal` out from the middle of the torso toward its back and `left` toward its upper flank. */
function offCurl(angle: number, radius: number, height: number, dorsal: number, left = 0): Vec3 {
  const frame = curlFrame(angle);
  return new Vector3(...onCurl(angle, radius, height)).addScaledVector(frame.dorsal, dorsal).addScaledVector(frame.left, left).toArray();
}

function torso(): Shape[] {
  return TORSO.map(({ angle, radius, height, radii, tone }, index) => {
    const { dorsal, forward } = curlFrame(angle);
    return ellipsoid(onCurl(angle, radius, height), radii, body(tone, index === 0 ? 0 : 0.06), dorsal.toArray(), forward.toArray());
  });
}

/** Angles round the curl the saddle runs through, from the croup to the withers. */
const SADDLE = [-20, 20, 60, 100, 140, 180, 200];

function saddle(): Shape[] {
  const points = SADDLE.map((angle) => offCurl(angle, 0.122, 0.11, 0.064));
  return points.slice(1).map((point, i) => cone(points[i], point, 0.056, 0.056, body(TONE.saddle, 0.05)));
}

function underside(): Shape[] {
  return [
    // Belly, tucked in on the inside of the curl.
    ...[40, 80].map((angle) => {
      const { dorsal, forward } = curlFrame(angle);
      return ellipsoid(offCurl(angle, 0.16, 0.09, -0.05), [0.07, 0.06, 0.09], body(TONE.light + 0.1, 0.05), dorsal.toArray(), forward.toArray());
    }),
    // Brisket, the deep lower line of the chest.
    ellipsoid(offCurl(170, 0.155, 0.095, -0.06), [0.07, 0.05, 0.08], body(TONE.light, 0.05), curlFrame(170).dorsal.toArray(), curlFrame(170).forward.toArray()),
  ];
}

/** The upper shoulder blade, a soft rise on the flank just behind the neck. */
function shoulder(): Shape[] {
  const { dorsal, forward } = curlFrame(180);
  return [ellipsoid(offCurl(180, 0.15, 0.1, 0.02, 0.05), [0.04, 0.085, 0.06], body(TONE.coat, 0.05), dorsal.toArray(), forward.toArray())];
}

/** Big forms of the torso. */
export function torsoForms(): Shape[] {
  return [...torso(), ...saddle(), ...underside(), ...shoulder()];
}

/**
 * The cream bib at the front of the chest, below the throat: a soft pad with broad locks lying down it
 * toward the belly, every one ending on the bib.
 */
export function bib(): Shape[] {
  const { dorsal, forward, left } = curlFrame(200);
  const center = offCurl(196, 0.13, 0.09, -0.04);
  const locks = [-0.03, 0, 0.03].flatMap((across) => {
    const at = (along: number, out: number) =>
      new Vector3(...center).addScaledVector(left, across).addScaledVector(forward, along).addScaledVector(dorsal, out).toArray();
    return flatLock({
      path: [at(0.04, 0.03), at(0.05, -0.02), at(0.035, -0.07)],
      width: 0.028,
      flatness: 0.46,
      facing: forward.clone().addScaledVector(left, across * 6).toArray(),
      tones: [TONE.light + 0.14, TONE.cream + 0.04],
      blend: 0.034,
      part: PART.body,
      segments: 6,
    });
  });
  return [ellipsoid(center, [0.064, 0.08, 0.045], { tone: TONE.cream - 0.06, blend: 0.045, part: PART.body }, dorsal.toArray(), forward.toArray()), ...locks];
}
