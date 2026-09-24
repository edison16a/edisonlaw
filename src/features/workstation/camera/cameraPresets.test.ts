import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { STANDING_PLACEMENT } from '../character/placement';
import { DESK, DOG_PAT_POINT, MONITOR, MONITORS, type Vec3 } from '../layout';
import type { StageVariant } from '../types';
import { CAMERA_FRAMINGS, createResolvedShot, resolveShot } from './cameraPresets';

const VARIANTS: StageVariant[] = ['work', 'about'];
/** Panel aspects the stage meets: tall tablets, desktop half panels, the square still and wide screens. */
const ASPECTS = [0.6, 0.7, 0.86, 0.94, 1, 1.2, 1.4, 1.6];
/** The stage's soft mask, as fractions of the panel: fully visible between these edges. */
const SAFE = { left: 0.09, right: 0.94, top: 0.06, bottom: 0.9 };
/** Edison stands about this tall. */
const STANDING_HEIGHT = 1.45;

const halfWidth = (fov: number, aspect: number) => Math.tan((fov * Math.PI) / 360) * aspect;

function cameraFor(variant: StageVariant, aspect: number) {
  const shot = resolveShot(CAMERA_FRAMINGS[variant], aspect, createResolvedShot());
  const camera = new PerspectiveCamera(shot.fov, aspect, 0.1, 30);
  camera.position.copy(shot.position);
  camera.lookAt(shot.target);
  camera.updateMatrixWorld();
  return camera;
}

/** Where a room point lands on the panel, as fractions from the top left corner. */
function onPanel(camera: PerspectiveCamera, point: Vec3) {
  const ndc = new Vector3(...point).project(camera);
  return { x: (ndc.x + 1) / 2, y: (1 - ndc.y) / 2 };
}

describe('resolveShot', () => {
  it.each(VARIANTS)('returns the tuned shots at their own aspects for %s', (variant) => {
    const framing = CAMERA_FRAMINGS[variant];
    const [portraitAspect, landscapeAspect] = framing.aspects;
    const portrait = resolveShot(framing, portraitAspect, createResolvedShot());
    expect(portrait.position.toArray()).toEqual(framing.portrait.position);
    expect(portrait.fov).toBeCloseTo(framing.portrait.fov);
    const landscape = resolveShot(framing, landscapeAspect, createResolvedShot());
    expect(landscape.target.toArray()).toEqual(framing.landscape.target);
    expect(landscape.fov).toBeCloseTo(framing.landscape.fov);
  });

  it.each(VARIANTS)('keeps the portrait width on taller panels for %s', (variant) => {
    const framing = CAMERA_FRAMINGS[variant];
    const [portraitAspect] = framing.aspects;
    const tall = resolveShot(framing, portraitAspect * 0.8, createResolvedShot());
    expect(halfWidth(tall.fov, portraitAspect * 0.8)).toBeCloseTo(halfWidth(framing.portrait.fov, portraitAspect));
  });
});

describe('about framing', () => {
  const [x, , z] = STANDING_PLACEMENT.position;
  const subjects: [string, Vec3][] = [
    ["Edison's head", [x, STANDING_HEIGHT, z]],
    ["Edison's feet", [x, 0, z]],
    ["the dog's head", DOG_PAT_POINT],
    ["the dog's hind feet", [DOG_PAT_POINT[0], 0, 1.2]],
    ['the left end of the desk', [-DESK.width / 2, DESK.height, DESK.center[2] - DESK.depth / 2]],
    ['the right end of the desk', [DESK.width / 2, DESK.height, DESK.frontZ]],
    ...MONITORS.map(({ slot, position }): [string, Vec3] => [`the ${slot} monitor`, [position[0], MONITOR.centerY, position[2]]]),
  ];

  it.each(ASPECTS)('keeps Edison, the dog, the desk and the monitors inside the soft edges at %s', (aspect) => {
    const camera = cameraFor('about', aspect);
    for (const [name, point] of subjects) {
      const { x: px, y: py } = onPanel(camera, point);
      expect({ name, inside: px > SAFE.left && px < SAFE.right && py > SAFE.top && py < SAFE.bottom }).toEqual({ name, inside: true });
    }
  });
});
