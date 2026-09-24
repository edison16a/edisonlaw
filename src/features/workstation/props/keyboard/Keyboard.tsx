'use client';

import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { InstancedMesh } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { KEYBOARD } from '../../layout';
import { useRgbClock } from '../../lighting/RgbClockProvider';
import { getMaterials } from '../../materials/materials';
import { createKeycapMaterial } from './keycapMaterial';
import { KeyboardAnimator } from './KeyboardAnimator';
import { KEYS, LAYOUT_WIDTH_U } from './keyLayout';

const BORDER = 0.012;
/** Size of one key unit in metres. */
const UNIT = (KEYBOARD.width - BORDER * 2) / LAYOUT_WIDTH_U;
const GAP = 0.0028;
const CAP_HEIGHT = 0.0075;
const CASE_HEIGHT = 0.009;
const CASE_TOP = KEYBOARD.position[1] - CAP_HEIGHT + 0.0015;

interface KeyboardProps {
  /** Keys flash at a human typing cadence. */
  typing: boolean;
  animate: boolean;
}

/** Backlit mechanical keyboard: instanced keycaps with an RGB wave and flashes where Edison types. */
export function Keyboard({ typing, animate }: KeyboardProps) {
  const materials = getMaterials();
  const clock = useRgbClock();
  const caps = useRef<InstancedMesh>(null);

  const [parts] = useState(() => ({
    geometry: new RoundedBoxGeometry(UNIT - GAP, CAP_HEIGHT, UNIT - GAP, 2, 0.0017),
    material: createKeycapMaterial(CAP_HEIGHT),
    animator: new KeyboardAnimator({
      unit: UNIT,
      gap: GAP,
      restY: CASE_TOP + CAP_HEIGHT / 2 - 0.0015,
      pressDepth: 0.0022,
    }),
  }));
  useEffect(
    () => () => {
      parts.geometry.dispose();
      parts.material.dispose();
      parts.animator.dispose();
    },
    [parts],
  );

  useFrame(({ clock: time }, delta) => {
    if (!caps.current) return;
    clock.sample(time.elapsedTime);
    parts.animator.update(caps.current, clock, delta, animate ? time.elapsedTime : 0, typing && animate);
  });

  const [x, , z] = KEYBOARD.position;

  return (
    <group position={[x, 0, z]}>
      <RoundedBox
        args={[KEYBOARD.width, CASE_HEIGHT, KEYBOARD.depth]}
        radius={0.004}
        smoothness={3}
        material={materials.darkPlastic}
        position-y={CASE_TOP - CASE_HEIGHT / 2}
      />
      <mesh position-y={CASE_TOP + 0.0004} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[KEYBOARD.width - BORDER * 1.4, KEYBOARD.depth - BORDER * 1.4]} />
        <meshBasicMaterial map={parts.animator.plate} color={[0.9, 0.9, 0.9]} toneMapped={false} />
      </mesh>
      <instancedMesh ref={caps} args={[parts.geometry, parts.material, KEYS.length]} frustumCulled={false} />
    </group>
  );
}
