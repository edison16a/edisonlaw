'use client';

import { CatmullRomCurve3, Color, Float32BufferAttribute, SphereGeometry, CircleGeometry, TubeGeometry, Vector3, type Group } from 'three';
import { useDisposable } from '../../useDisposable';
import { mergeParts } from '../../character/geometry/merge';
import { EYE_RADII } from '../anatomy/face';
import { TONE } from '../dimensions';
import { toneColor } from '../geometry/paint';
import { DOG_PALETTE } from '../materials';
import { useDogMaterials } from '../MaterialsContext';

/**
 * An upper lid over each eye, in eye space (+Z out of the face, +Y up): the top half of a shell a little
 * larger than the eye, closed across its cut, which turns about the eye's X axis to come down over it.
 * Shut, its lower edge is a soft curve just below the middle of the eye, drawn by a dark lash line, so a
 * sleeping eye reads as a gentle closed crescent under a rounded lid.
 */

/** Half sizes of the lid shell: a little wider than the eye, and further out so it stands proud of it. */
export const LID_RADII = [EYE_RADII[0] * 1.12, EYE_RADII[1] * 1.12, EYE_RADII[2] * 1.16] as const;
/** Radius of the lash line along the lid's edge. */
const LASH = 0.0017;
/** Coat tone of the lid: between the gold of the skull and the lighter cheeks, as the face is round the eyes. */
const LID_TONE = TONE.coat + 0.14;
/** How much of the edge's half ring the lash line covers, either side of the middle, in radians. */
const LASH_SPAN = 1.25;

/** Fur tone of the lid, the same as the face round the eyes, darkening only right at its edge. */
function paint(geometry: SphereGeometry | CircleGeometry) {
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const fur = toneColor(LID_TONE, new Color());
  const pigment = new Color(DOG_PALETTE.pigment);
  const color = new Color();
  for (let i = 0; i < position.count; i++) {
    // Height above the cut, 0 at the edge and 1 at the top of the lid.
    const height = Math.max(0, position.getY(i) / LID_RADII[1]);
    color.copy(fur).lerp(pigment, 0.6 * (1 - Math.min(1, height / 0.18)));
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geometry;
}

function lidGeometry() {
  const [rx, ry, rz] = LID_RADII;
  const dome = new SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(rx, ry, rz);
  // Close the cut with a flat face, turned to look down.
  const cut = new CircleGeometry(1, 28).rotateX(Math.PI / 2).scale(rx, 1, rz);
  return mergeParts([paint(dome), paint(cut)]);
}

function lashGeometry() {
  const [rx, , rz] = LID_RADII;
  const points = Array.from({ length: 17 }, (_, i) => {
    const a = Math.PI / 2 + LASH_SPAN * (i / 8 - 1);
    return new Vector3(rx * Math.cos(a), 0, rz * Math.sin(a));
  });
  return new TubeGeometry(new CatmullRomCurve3(points), 48, LASH, 8, false);
}

/** One lid on its lid group, which the pose turns about X between open and shut (see sleeping/pose.ts). */
export function Lid({ group }: { group: Group }) {
  const materials = useDogMaterials();
  const parts = useDisposable(() => ({ lid: lidGeometry(), lash: lashGeometry() }));
  return (
    <primitive object={group}>
      <mesh geometry={parts.lid} material={materials.ear} />
      <mesh geometry={parts.lash} material={materials.lips} />
    </primitive>
  );
}
