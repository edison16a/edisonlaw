'use client';

import { Environment, Lightformer } from '@react-three/drei';

/**
 * A tiny procedural environment, rendered once, so metal, glass and glossy plastic
 * have something dim to reflect. Nothing is fetched from the network.
 */
export function SceneEnvironment() {
  return (
    <Environment frames={1} resolution={64} environmentIntensity={0.32}>
      {/* Soft cool fill from the room side, like light from a doorway. */}
      <Lightformer form="rect" intensity={0.5} color="#8ea2d8" position={[0, 1.6, 5]} scale={[7, 2.5, 1]} />
      {/* The monitor wall, a bright band that glossy tops reflect. */}
      <Lightformer form="rect" intensity={1.6} color="#b7c6ff" position={[0, 1.1, -3]} scale={[3.5, 0.6, 1]} />
      {/* Moon side. */}
      <Lightformer form="rect" intensity={0.8} color="#7f93cc" position={[-5, 2.4, 0]} rotation-y={Math.PI / 2} scale={[2, 2.4, 1]} />
      {/* Colour accents for reflections on glass and metal. */}
      <Lightformer form="circle" intensity={1.2} color="#b04dff" position={[4, 0.6, -1]} scale={1.2} />
      <Lightformer form="circle" intensity={0.9} color="#2fd1ff" position={[-3, 0.4, 3]} scale={1} />
    </Environment>
  );
}
