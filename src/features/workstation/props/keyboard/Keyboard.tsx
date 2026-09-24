'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import { InstancedBufferAttribute, MeshBasicMaterial, MeshStandardMaterial, type InstancedMesh } from 'three';
import { DESK_MAT, KEYBOARD } from '../../layout';
import { useRgbClock } from '../../lighting/RgbClockProvider';
import { useDisposable } from '../../useDisposable';
import { createKeyboardCaseGeometry, createKeycapGeometry, createKeyHaloGeometry, HALO_ALPHA_ATTRIBUTE } from './keyboardGeometry';
import { createKeycapMaterial, createKeyHaloMaterial, KEY_STRETCH_ATTRIBUTE } from './keycapMaterial';
import { KeyboardAnimator } from './KeyboardAnimator';
import { KeyboardCable } from './KeyboardCable';
import { KEYS, LAYOUT_DEPTH_U, LAYOUT_WIDTH_U } from './keyLayout';

const BORDER = 0.012;
/** Size of one key unit in metres. */
const UNIT = (KEYBOARD.width - BORDER * 2) / LAYOUT_WIDTH_U;
const GAP = 0.0028;
const CAP_RADIUS = 0.0024;
const CASE_BEVEL = 0.003;
const MAT_TOP = DESK_MAT.center[1];
/** Height of the sloped deck at the middle of the board, above the mat. */
const DECK_HEIGHT = (KEYBOARD.frontHeight + KEYBOARD.backHeight) / 2;
/** Typing angle of the wedge. */
const TILT = Math.atan2(KEYBOARD.backHeight - KEYBOARD.frontHeight, KEYBOARD.depth);
/** Keycaps float this far above the lit plate, so the light spills out under their edges. */
const CAP_LIFT = 0.0025;
/** The caps fill the rest of the height up to the key tops the seated hands aim for. */
const CAP_HEIGHT = KEYBOARD.position[1] - MAT_TOP - DECK_HEIGHT - CAP_LIFT;

/** Each half of a wide key moves out by half its extra width, in metres (see keycapMaterial). */
function createKeyStretch() {
  const stretch = new Float32Array(KEYS.length * 2);
  KEYS.forEach((key, index) => {
    stretch[index * 2] = ((key.width - 1) * UNIT) / 2;
    stretch[index * 2 + 1] = ((key.depth - 1) * UNIT) / 2;
  });
  return new InstancedBufferAttribute(stretch, 2);
}

interface KeyboardProps {
  /** Keys flash at a human typing cadence. */
  typing: boolean;
  animate: boolean;
}

/**
 * Mechanical keyboard on a low wedge of dark aluminium: tapered keycaps float over a lit plate and glow in
 * a shimmering gradient from navy on the left to sky blue on the right, and flash pale blue where Edison types.
 */
export function Keyboard({ typing, animate }: KeyboardProps) {
  const clock = useRgbClock();
  const caps = useRef<InstancedMesh>(null);
  const halos = useRef<InstancedMesh>(null);

  const parts = useDisposable(() => {
    const capGeometry = createKeycapGeometry({ size: UNIT - GAP, height: CAP_HEIGHT, taper: 0.0017, radius: CAP_RADIUS });
    capGeometry.setAttribute(KEY_STRETCH_ATTRIBUTE, createKeyStretch());
    const haloGeometry = createKeyHaloGeometry({ size: UNIT - GAP, radius: CAP_RADIUS, spread: GAP * 0.9 });
    haloGeometry.setAttribute(KEY_STRETCH_ATTRIBUTE, createKeyStretch());
    const animator = new KeyboardAnimator({ unit: UNIT, restY: CAP_LIFT + CAP_HEIGHT / 2, pressDepth: 0.0022 });
    return {
      caseGeometry: createKeyboardCaseGeometry({ ...KEYBOARD, bevel: CASE_BEVEL }),
      caseMaterial: new MeshStandardMaterial({ color: '#1b1c22', roughness: 0.36, metalness: 0.35 }),
      capGeometry,
      capMaterial: createKeycapMaterial(CAP_HEIGHT),
      haloGeometry,
      haloMaterial: createKeyHaloMaterial(HALO_ALPHA_ATTRIBUTE),
      plateMaterial: new MeshBasicMaterial({ map: animator.plate, toneMapped: false }),
      animator,
    };
  });

  useLayoutEffect(() => {
    if (halos.current) parts.animator.placeHalos(halos.current);
  }, [parts]);

  useFrame(({ clock: time }, delta) => {
    if (!caps.current || !halos.current) return;
    clock.sample(time.elapsedTime);
    parts.animator.update(caps.current, halos.current, clock, delta, animate ? time.elapsedTime : 0, typing && animate);
  });

  const [x, , z] = KEYBOARD.position;

  return (
    <>
      <KeyboardCable />
      <group position={[x, MAT_TOP, z]}>
        <mesh geometry={parts.caseGeometry} material={parts.caseMaterial} />
        <group position-y={DECK_HEIGHT} rotation-x={TILT}>
          <mesh material={parts.plateMaterial} position-y={0.0004} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[LAYOUT_WIDTH_U * UNIT + 0.004, LAYOUT_DEPTH_U * UNIT + 0.004]} />
          </mesh>
          <instancedMesh ref={caps} args={[parts.capGeometry, parts.capMaterial, KEYS.length]} frustumCulled={false} />
          <instancedMesh
            ref={halos}
            args={[parts.haloGeometry, parts.haloMaterial, KEYS.length]}
            position-y={0.0008}
            frustumCulled={false}
          />
        </group>
      </group>
    </>
  );
}
