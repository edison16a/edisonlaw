/**
 * The file open in the editor: the spiral card component. On a loop the caret opens a new line
 * after INSERT_AFTER and types TYPED_LINE into it, with IntelliSense popping up on the way.
 */

export const FILE_PATH = ['src', 'features', 'projects', 'spiral', 'SpiralCard.tsx'];

export const SOURCE = [
  "'use client';",
  '',
  "import { useFrame } from '@react-three/fiber';",
  "import { useMemo, useRef } from 'react';",
  "import { MathUtils, type Mesh, type ShaderMaterial } from 'three';",
  "import type { Project } from '@/content/types';",
  "import { damp } from '@/lib/math';",
  "import { cardFragment, cardVertex } from './shaders';",
  "import { useCoverTexture } from './useCoverTexture';",
  '',
  'interface SpiralCardProps {',
  '  project: Project;',
  '  /** Position along the spiral, 0 is the focused slot. */',
  '  offset: number;',
  '  focused: boolean;',
  '}',
  '',
  '/** One project card on the spiral. It leans toward the camera as it takes focus. */',
  'export function SpiralCard({ project, offset, focused }: SpiralCardProps) {',
  '  const mesh = useRef<Mesh>(null);',
  '  const cover = useCoverTexture(project);',
  '  const uniforms = useMemo(() => ({ uCover: { value: cover }, uFocus: { value: 0 } }), [cover]);',
  '',
  '  useFrame((_, delta) => {',
  '    const card = mesh.current;',
  '    if (!card) return;',
  '    const material = card.material as ShaderMaterial;',
  '    const focus = material.uniforms.uFocus;',
  '    focus.value = damp(focus.value, focused ? 1 : 0, 6, delta);',
  '    card.rotation.y = MathUtils.lerp(0.9, 0, focus.value) * Math.sign(offset);',
  '  });',
  '',
  '  return (',
  '    <mesh ref={mesh} position-z={offset * -0.4}>',
  '      <planeGeometry args={[1.6, 1]} />',
  '      <shaderMaterial vertexShader={cardVertex} fragmentShader={cardFragment} uniforms={uniforms} transparent />',
  '    </mesh>',
  '  );',
  '}',
];

/** Index of the line the new line is opened under. */
export const INSERT_AFTER = 29;
export const INDENT = '    ';
export const TYPED_LINE = 'card.scale.setScalar(1 + focus.value * 0.12);';

/** Where IntelliSense opens: after this prefix, filtered by what follows it. */
export const SUGGEST_AT = 'card.scale.';
export const SUGGESTIONS = ['setScalar', 'set', 'setFromMatrixScale', 'setComponent', 'setLength', 'setX', 'setY', 'setZ'];

/** First line shown at the top of the editor. */
export const SCROLL_TOP = 17;
