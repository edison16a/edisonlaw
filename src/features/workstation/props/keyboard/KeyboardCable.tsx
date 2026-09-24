'use client';

import { CatmullRomCurve3, MeshStandardMaterial, TubeGeometry, Vector3 } from 'three';
import { DESK, DESK_MAT, KEYBOARD } from '../../layout';
import { useDisposable } from '../../useDisposable';

const RADIUS = 0.0024;

/**
 * The keyboard's braided cable, in room space: out of the back of the case, down onto the mat, across the
 * desk through the gap between the left and centre monitor stands, and over the back edge of the desk.
 */
function cablePath() {
  const [x, , z] = KEYBOARD.position;
  const back = z - KEYBOARD.depth / 2;
  const onMat = DESK_MAT.center[1] + RADIUS;
  const onDesk = DESK.height + RADIUS;
  const deskBack = DESK.center[2] - DESK.depth / 2;
  return new CatmullRomCurve3([
    new Vector3(x - 0.14, DESK_MAT.center[1] + KEYBOARD.backHeight * 0.55, back + 0.004),
    new Vector3(x - 0.145, DESK_MAT.center[1] + KEYBOARD.backHeight * 0.4, back - 0.012),
    new Vector3(x - 0.16, onMat, back - 0.04),
    new Vector3(x - 0.2, onMat, DESK_MAT.center[2] - DESK_MAT.depth / 2 + 0.01),
    new Vector3(x - 0.24, onDesk, -0.36),
    new Vector3(x - 0.32, onDesk, -0.56),
    new Vector3(x - 0.35, onDesk, deskBack + 0.03),
    new Vector3(x - 0.355, DESK.height - 0.004, deskBack - RADIUS - 0.004),
    new Vector3(x - 0.355, DESK.height - 0.2, deskBack - RADIUS - 0.012),
  ]);
}

/** Dark braided cable from the keyboard to the back of the desk. */
export function KeyboardCable() {
  const parts = useDisposable(() => ({
    geometry: new TubeGeometry(cablePath(), 120, RADIUS, 8),
    material: new MeshStandardMaterial({ color: '#1b1b20', roughness: 0.7 }),
  }));
  return <mesh geometry={parts.geometry} material={parts.material} />;
}
