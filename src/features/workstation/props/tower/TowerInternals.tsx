'use client';

import { RoundedBox } from '@react-three/drei';
import { useRgbMaterial } from '../../lighting/useRgbMaterial';
import { BACK_INNER_Z, TOWER } from './towerSpec';

const PCB = '#15171c';
const HEATSINK = '#2a2d33';
const RAM_STICKS = 4;

/** What shows through the glass: board, AIO pump, RAM with light bars, GPU and PSU shroud. */
export function TowerInternals() {
  const pumpRing = useRgbMaterial({ intensity: 3 });
  const ramBars = useRgbMaterial({ hueOffset: 0.04, intensity: 2.6 });
  const gpuStrip = useRgbMaterial({ hueOffset: 0.08, intensity: 2.8 });
  const shroudStrip = useRgbMaterial({ hueOffset: 0.12, intensity: 1.8 });

  const boardZ = BACK_INNER_Z + 0.003;
  const gpu = { x: -0.045, y: 0.215, depth: 0.12, height: 0.048, length: 0.3 };
  const gpuZ = boardZ + gpu.depth / 2 + 0.004;

  return (
    <group>
      {/* Motherboard with a couple of heatsinks. */}
      <mesh position={[-0.06, 0.315, boardZ]}>
        <boxGeometry args={[0.27, 0.33, 0.004]} />
        <meshStandardMaterial color={PCB} roughness={0.6} metalness={0.2} />
      </mesh>
      <RoundedBox args={[0.05, 0.1, 0.022]} radius={0.004} position={[-0.165, 0.39, boardZ + 0.012]}>
        <meshStandardMaterial color={HEATSINK} roughness={0.4} metalness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.09, 0.03, 0.018]} radius={0.004} position={[-0.06, 0.455, boardZ + 0.01]}>
        <meshStandardMaterial color={HEATSINK} roughness={0.4} metalness={0.7} />
      </RoundedBox>

      {/* AIO pump head over the CPU. */}
      <group position={[-0.06, 0.365, boardZ + 0.016]} rotation-x={Math.PI / 2}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 0.026, 32]} />
          <meshStandardMaterial color="#0e0f12" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh material={pumpRing} position-y={0.0135} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.022, 0.0028, 8, 40]} />
        </mesh>
      </group>

      {/* RAM sticks with light bars on top. */}
      {Array.from({ length: RAM_STICKS }, (_, index) => {
        const x = 0.03 + index * 0.012;
        return (
          <group key={index} position={[x, 0.37, boardZ + 0.018]}>
            <mesh>
              <boxGeometry args={[0.006, 0.075, 0.03]} />
              <meshStandardMaterial color="#1c1d22" roughness={0.45} metalness={0.6} />
            </mesh>
            <mesh material={ramBars} position-y={0.041}>
              <boxGeometry args={[0.0062, 0.008, 0.03]} />
            </mesh>
          </group>
        );
      })}

      {/* Graphics card, glowing along the edge that faces the glass. */}
      <RoundedBox args={[gpu.length, gpu.height, gpu.depth]} radius={0.006} position={[gpu.x, gpu.y, gpuZ]}>
        <meshStandardMaterial color="#1b1d22" roughness={0.35} metalness={0.65} />
      </RoundedBox>
      <mesh material={gpuStrip} position={[gpu.x + 0.02, gpu.y + gpu.height / 2 - 0.009, gpuZ + gpu.depth / 2 + 0.0008]}>
        <boxGeometry args={[gpu.length * 0.72, 0.005, 0.0015]} />
      </mesh>

      {/* PSU shroud across the bottom, with a strip along its front edge. */}
      <mesh position={[0, (TOWER.foot + TOWER.shroudTop) / 2, 0]}>
        <boxGeometry args={[TOWER.length - TOWER.wall * 2, TOWER.shroudTop - TOWER.foot, TOWER.depth - TOWER.wall * 2]} />
        <meshStandardMaterial color="#121317" roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh material={shroudStrip} position={[0, TOWER.shroudTop - 0.004, TOWER.depth / 2 - TOWER.wall - 0.001]}>
        <boxGeometry args={[TOWER.length * 0.8, 0.004, 0.002]} />
      </mesh>
    </group>
  );
}
