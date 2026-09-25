import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { SEATED_PLACEMENT, STANDING_PLACEMENT } from '../character/placement';
import { TAIL_PATH } from '../dog/anatomy/tail';
import { PAWS } from '../dog/dimensions';
import { DOG_PLACEMENT } from '../dog/placement';
import { CHAIR, DESK, DOG_PAT_POINT, MONITOR, MONITORS, PC_TOWER, type Vec3 } from '../layout';
import type { StageVariant } from '../types';
import { CAMERA_FRAMINGS, createResolvedShot, resolveShot } from './cameraPresets';

const VARIANTS: StageVariant[] = ['work', 'about'];
/** Panel aspects the stage meets: tall tablets, desktop half panels, the square still and wide screens. */
const ASPECTS = [0.6, 0.7, 0.86, 0.94, 1, 1.2, 1.4, 1.6];
/** The stage's soft mask, as fractions of the panel: fully visible between these edges. */
const SAFE = { left: 0.09, right: 0.94, top: 0.06, bottom: 0.9 };
/** Edison stands about this tall, and seated the top of his head is about this far above the seat. */
const STANDING_HEIGHT = 1.45;
const SEATED_HEAD = 0.8;

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

/** The desk with all three monitors, which both scenes show whole. */
const DESK_AND_MONITORS: [string, Vec3][] = [
  ['the left end of the desk', [-DESK.width / 2, DESK.height, DESK.center[2] - DESK.depth / 2]],
  ['the right end of the desk', [DESK.width / 2, DESK.height, DESK.frontZ]],
  ...MONITORS.map(({ slot, position }): [string, Vec3] => [`the ${slot} monitor`, [position[0], MONITOR.centerY, position[2]]]),
];

/** A point on the sitting dog, from its own space into the room. */
const onDog = (x: number, y: number, z: number): Vec3 =>
  new Vector3(x, y, z).applyAxisAngle(new Vector3(0, 1, 0), DOG_PLACEMENT.rotationY).add(new Vector3(...DOG_PLACEMENT.position)).toArray();
const [tailX, , tailZ] = TAIL_PATH[TAIL_PATH.length - 1];

/**
 * The sitting dog's footprint: its head under Edison's hand, its nose, its forepaws, the back of its
 * seat, and its plume spread on the floor round its left haunch.
 */
const DOG: [string, Vec3][] = [
  ["the dog's head", DOG_PAT_POINT],
  ["the dog's nose", onDog(0.08, 0.66, 0.36)],
  ...[1, -1].map((side): [string, Vec3] => [`the dog's forepaw on its ${side > 0 ? 'left' : 'right'}`, onDog(PAWS.front[0] * side, 0, PAWS.front[1] + 0.04)]),
  ["the back of the dog's seat", onDog(0, 0, -0.3)],
  ["the dog's plume", onDog(tailX + 0.1, 0, tailZ)],
];

const [standX, , standZ] = STANDING_PLACEMENT.position;
const [seatX, seatY, seatZ] = SEATED_PLACEMENT.position;
const [towerX, , towerZ] = PC_TOWER.position;
const SUBJECTS: Record<StageVariant, [string, Vec3][]> = {
  work: [
    ["Edison's head", [seatX, seatY + SEATED_HEAD, seatZ]],
    ['the chair base', CHAIR.position],
    ['the top of the tower', [towerX, PC_TOWER.size[1], towerZ]],
    ['the foot of the tower', [towerX, 0, towerZ]],
    ...DESK_AND_MONITORS,
  ],
  about: [
    ["Edison's head", [standX, STANDING_HEIGHT, standZ]],
    ["Edison's feet", [standX, 0, standZ]],
    ...DOG,
    ...DESK_AND_MONITORS,
  ],
};

describe.each(VARIANTS)('%s framing', (variant) => {
  it.each(ASPECTS)('keeps its subjects inside the soft edges at %s', (aspect) => {
    const camera = cameraFor(variant, aspect);
    for (const [name, point] of SUBJECTS[variant]) {
      const { x, y } = onPanel(camera, point);
      expect({ name, inside: x > SAFE.left && x < SAFE.right && y > SAFE.top && y < SAFE.bottom }).toEqual({ name, inside: true });
    }
  });
});
