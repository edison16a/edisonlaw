'use client';

import { RoundedBox } from '@react-three/drei';
import { CatmullRomCurve3, MeshStandardMaterial, RingGeometry, TubeGeometry, Vector3, type Material } from 'three';
import type { Vec3 } from '../../layout';
import { useRgbMaterial } from '../../lighting/useRgbMaterial';
import { getMaterials } from '../../materials/materials';
import { useDisposable } from '../../useDisposable';
import { FAN_DEPTH, FAN_SIZE } from './fanGeometry';
import { BACK_INNER_Z, BOARD_FACE_Z, GLASS_INNER_X, GLASS_INNER_Z, INNER_BOTTOM, REAR_INNER_X, TOWER } from './towerSpec';

const BOARD = { x: -0.06, y: 0.318, width: 0.27, height: 0.3, thickness: 0.003 };
const PUMP = { x: -0.068, y: 0.372, radius: 0.03, depth: 0.028 };
const RAM = { x: 0.018, pitch: 0.0115, y: 0.372, length: 0.13, thickness: 0.007, height: 0.034, bar: 0.008, count: 4 };
const GPU = { length: 0.3, thickness: 0.05, height: 0.12, y: 0.216 };
const GPU_X = REAR_INNER_X + 0.012 + GPU.length / 2;
/** Radiator behind the front fans. */
const RADIATOR = { depth: 0.027, width: 0.122 };
const RADIATOR_BACK_X = GLASS_INNER_X - 0.002 - FAN_DEPTH - 0.0005 - RADIATOR.depth;
const FAN_STACK_TOP = TOWER.shroudTop + 0.004 + FAN_SIZE * 3 + 0.004;

/** AIO hoses from the pump to the top of the radiator. */
function hoseCurve(offset: number) {
  return new CatmullRomCurve3([
    new Vector3(PUMP.x + PUMP.radius - 0.004, PUMP.y + offset, BOARD_FACE_Z + 0.016),
    new Vector3(PUMP.x + PUMP.radius + 0.03, PUMP.y + offset + 0.012, BOARD_FACE_Z + 0.05),
    new Vector3(0.09, FAN_STACK_TOP - 0.05 + offset, 0.02),
    new Vector3(RADIATOR_BACK_X - 0.012, FAN_STACK_TOP - 0.028 + offset * 0.6, -0.03),
    new Vector3(RADIATOR_BACK_X + 0.002, FAN_STACK_TOP - 0.028 + offset * 0.6, -0.034),
  ]);
}

/** One lit edge or bar with softly rounded ends, placed by its centre and size. */
function LightBar({ position, size, material }: { position: Vec3; size: Vec3; material: Material }) {
  return <RoundedBox args={size} radius={Math.min(...size) * 0.45} smoothness={2} material={material} position={position} />;
}

/**
 * What shows through the glass: the motherboard with its armour, the AIO pump and hoses, four tall RGB
 * memory sticks, the graphics card with its backplate and light bar, the radiator and the PSU shroud.
 * Every part sits a hair clear of its neighbours, so no two faces share a plane.
 */
export function TowerInternals() {
  const materials = getMaterials();
  const pumpRing = useRgbMaterial({ intensity: 3 });
  const ramBars = useRgbMaterial({ hueOffset: 0.04, intensity: 2.2, saturation: 0.85 });
  const gpuBar = useRgbMaterial({ hueOffset: 0.08, intensity: 2.6 });
  const shroudBar = useRgbMaterial({ hueOffset: 0.12, intensity: 1.6 });

  const parts = useDisposable(() => ({
    pcb: new MeshStandardMaterial({ color: '#16181d', roughness: 0.62, metalness: 0.2 }),
    armour: new MeshStandardMaterial({ color: '#2b2e35', roughness: 0.34, metalness: 0.75 }),
    backplate: new MeshStandardMaterial({ color: '#3a3d45', roughness: 0.3, metalness: 0.8 }),
    shroud: new MeshStandardMaterial({ color: '#121317', roughness: 0.45, metalness: 0.4 }),
    hose: new MeshStandardMaterial({ color: '#0d0d10', roughness: 0.7 }),
    hoses: [hoseCurve(0.011), hoseCurve(-0.011)].map((curve) => new TubeGeometry(curve, 48, 0.0052, 10)),
    pumpRing: new RingGeometry(PUMP.radius * 0.62, PUMP.radius * 0.76, 48),
  }));

  const pumpFront = BOARD_FACE_Z + PUMP.depth;
  const gpuZ0 = BOARD_FACE_Z + 0.004;
  const gpuFront = gpuZ0 + GPU.height;
  const shroudFront = GLASS_INNER_Z - 0.003;
  const shroudLength = RADIATOR_BACK_X - 0.004 - REAR_INNER_X;
  const radiatorHeight = FAN_STACK_TOP - TOWER.shroudTop - 0.006;

  return (
    <group>
      {/* Motherboard on short standoffs, with the I/O cover, VRM heatsink and M.2 armour. */}
      <RoundedBox
        args={[BOARD.width, BOARD.height, BOARD.thickness]}
        radius={0.001}
        smoothness={1}
        material={parts.pcb}
        position={[BOARD.x, BOARD.y, BOARD_FACE_Z - BOARD.thickness / 2]}
      />
      <RoundedBox args={[0.046, 0.12, 0.03]} radius={0.005} smoothness={3} material={parts.armour} position={[-0.168, 0.392, BOARD_FACE_Z + 0.015]} />
      <RoundedBox args={[0.1, 0.026, 0.02]} radius={0.004} smoothness={3} material={parts.armour} position={[-0.075, 0.44, BOARD_FACE_Z + 0.01]} />
      <RoundedBox args={[0.1, 0.024, 0.006]} radius={0.002} smoothness={2} material={parts.armour} position={[-0.07, 0.29, BOARD_FACE_Z + 0.003]} />

      {/* AIO pump head: dark glass face with a lit ring, and its hoses to the radiator. */}
      <group position={[PUMP.x, PUMP.y, BOARD_FACE_Z + PUMP.depth / 2]} rotation-x={Math.PI / 2}>
        <mesh material={parts.armour}>
          <cylinderGeometry args={[PUMP.radius, PUMP.radius, PUMP.depth, 40]} />
        </mesh>
      </group>
      <mesh material={materials.blackGlass} position={[PUMP.x, PUMP.y, pumpFront + 0.0003]}>
        <circleGeometry args={[PUMP.radius * 0.88, 40]} />
      </mesh>
      <mesh geometry={parts.pumpRing} material={pumpRing} position={[PUMP.x, PUMP.y, pumpFront + 0.0007]} />
      {parts.hoses.map((geometry, index) => (
        <mesh key={index} geometry={geometry} material={parts.hose} />
      ))}

      {/* Memory: the light bars run along the top edge of each stick, facing the glass. */}
      {Array.from({ length: RAM.count }, (_, index) => {
        const x = RAM.x + index * RAM.pitch;
        return (
          <group key={index}>
            <RoundedBox
              args={[RAM.thickness, RAM.length, RAM.height]}
              radius={0.0012}
              smoothness={2}
              material={parts.armour}
              position={[x, RAM.y, BOARD_FACE_Z + RAM.height / 2]}
            />
            <LightBar
              material={ramBars}
              position={[x, RAM.y, BOARD_FACE_Z + RAM.height + RAM.bar / 2 + 0.0003]}
              size={[RAM.thickness * 0.9, RAM.length - 0.004, RAM.bar]}
            />
          </group>
        );
      })}

      {/* Graphics card: shroud, backplate on top and a light bar on the edge facing the glass. */}
      <RoundedBox
        args={[GPU.length, GPU.thickness, GPU.height]}
        radius={0.006}
        smoothness={3}
        material={parts.shroud}
        position={[GPU_X, GPU.y, gpuZ0 + GPU.height / 2]}
      />
      <RoundedBox
        args={[GPU.length - 0.01, 0.003, GPU.height - 0.008]}
        radius={0.0012}
        smoothness={2}
        material={parts.backplate}
        position={[GPU_X, GPU.y + GPU.thickness / 2 + 0.0019, gpuZ0 + GPU.height / 2]}
      />
      <LightBar material={gpuBar} position={[GPU_X + 0.02, GPU.y + 0.006, gpuFront + 0.0022]} size={[GPU.length * 0.62, 0.007, 0.003]} />

      {/* Radiator behind the front fans, with its end tanks. */}
      <RoundedBox
        args={[RADIATOR.depth, radiatorHeight, RADIATOR.width]}
        radius={0.002}
        smoothness={2}
        material={parts.armour}
        position={[RADIATOR_BACK_X + RADIATOR.depth / 2, TOWER.shroudTop + 0.004 + radiatorHeight / 2, (BACK_INNER_Z + GLASS_INNER_Z) / 2]}
      />

      {/* PSU shroud over the bottom chamber, with a light bar along its front top edge. */}
      <RoundedBox
        args={[shroudLength, TOWER.shroudTop - INNER_BOTTOM - 0.001, shroudFront - BACK_INNER_Z - 0.001]}
        radius={0.004}
        smoothness={3}
        material={parts.shroud}
        position={[REAR_INNER_X + 0.0005 + shroudLength / 2, (TOWER.shroudTop + INNER_BOTTOM) / 2, (shroudFront + BACK_INNER_Z) / 2]}
      />
      <LightBar
        material={shroudBar}
        position={[REAR_INNER_X + shroudLength / 2, TOWER.shroudTop + 0.0022, shroudFront - 0.004]}
        size={[shroudLength - 0.04, 0.004, 0.004]}
      />
    </group>
  );
}
