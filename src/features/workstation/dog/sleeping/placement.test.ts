import { Box3, Matrix4, Ray, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CAMERA_FRAMINGS, createResolvedShot, resolveShot } from '../../camera/cameraPresets';
import { SEATED_PLACEMENT } from '../../character/placement';
import { CHAIR, DESK, PC_TOWER } from '../../layout';
import { faceLayout } from '../anatomy/face';
import { headForms, headFur } from '../anatomy/head';
import { PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { sleepingCoatField } from './coat';
import { HEAD_REST } from './dimensions';
import { headRestMatrix } from './headPose';
import { SLEEPING_PLACEMENT } from './placement';
import { applySleepPose, createSleepPose } from './pose';
import { createSleepingRig } from './rig';
import { TAIL_PATH } from './tail';

const field = sleepingCoatField();
const UP = new Vector3(0, 1, 0);
const origin = new Vector3(...SLEEPING_PLACEMENT.position);

/** A room point in dog space, and back. */
const toDog = (p: Vector3) => p.clone().sub(origin).applyAxisAngle(UP, -SLEEPING_PLACEMENT.rotationY);
const toRoom = (p: Vector3) => p.clone().applyAxisAngle(UP, SLEEPING_PLACEMENT.rotationY).add(origin);
const clearance = (room: Vector3) => {
  const p = toDog(room);
  return field.distance(p.x, p.y, p.z);
};

/**
 * Roughly where the chair's frame runs (see props/Chair.tsx): a tube bent up each side from the floor
 * under the seat's front edge, back along the floor, and up behind the backrest, in room space.
 */
function chairFrame(): Vector3[] {
  const [cx, , cz] = CHAIR.position;
  const points: Vector3[] = [];
  for (const x of [-0.19, 0.19]) {
    for (let z = -0.21; z <= 0.27; z += 0.02) points.push(new Vector3(cx + x, 0.011, cz + z));
    for (let t = 0; t <= 1; t += 0.05) points.push(new Vector3(cx + x, 0.011 + t * 0.4, cz - 0.21 + t * 0.06));
    for (let y = 0.011; y <= 0.9; y += 0.03) points.push(new Vector3(cx + x, y, cz + 0.27));
  }
  return points;
}

/** Points through a box, every `step` metres. */
function through(box: Box3, step: number): Vector3[] {
  const points: Vector3[] = [];
  for (let x = box.min.x; x <= box.max.x + 1e-9; x += step)
    for (let y = box.min.y; y <= box.max.y + 1e-9; y += step)
      for (let z = box.min.z; z <= box.max.z + 1e-9; z += step) points.push(new Vector3(x, y, z));
  return points;
}

const [seatX, seatY, seatZ] = SEATED_PLACEMENT.position;
const [towerX, , towerZ] = PC_TOWER.position;
/** What stands round the dog, as boxes in room space. */
const OBSTACLES = {
  seat: new Box3(new Vector3(-0.22, CHAIR.seatHeight - 0.035, 0.15), new Vector3(0.22, CHAIR.seatHeight, 0.57)),
  backrest: new Box3(new Vector3(-0.21, 0.72, 0.58), new Vector3(0.21, 1.06, 0.66)),
  // Edison's back, and his legs hanging from the seat with his feet off the floor.
  body: new Box3(new Vector3(seatX - 0.19, seatY, seatZ - 0.16), new Vector3(seatX + 0.19, seatY + 0.8, seatZ + 0.14)),
  legs: new Box3(new Vector3(seatX - 0.16, 0.12, seatZ - 0.3), new Vector3(seatX + 0.16, seatY + 0.1, seatZ + 0.02)),
  desk: new Box3(new Vector3(-DESK.width / 2, DESK.height - DESK.thickness, DESK.frontZ - DESK.depth), new Vector3(DESK.width / 2, DESK.height, DESK.frontZ)),
  tower: new Box3(new Vector3(towerX - 0.3, 0, towerZ - 0.2), new Vector3(towerX + 0.3, PC_TOWER.size[1], towerZ + 0.2)),
};

const deskLegs = [1, -1].flatMap((sx) =>
  [1, -1].map((sz) => new Vector3(sx * (DESK.width / 2 - 0.13), 0, DESK.center[2] + sz * (DESK.depth / 2 - 0.1))),
);

describe('the sleeping dog in the work scene', () => {
  it('lies on the rug at the right of the chair, the side the work camera sees', () => {
    expect(SLEEPING_PLACEMENT.position[1]).toBe(0);
    expect(origin.x).toBeGreaterThan(CHAIR.position[0] + 0.3);
    // The rug (see scene/Rug.tsx) runs from -2 to 1.3 across and from -0.15 to 2.25 deep.
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      for (let r = 0.1; r < 0.6; r += 0.01) {
        const p = new Vector3(Math.cos(a) * r, 0.02, Math.sin(a) * r);
        if (field.distance(p.x, p.y, p.z) > 0) continue;
        const room = toRoom(p);
        expect(room.x).toBeGreaterThan(-1.95);
        expect(room.x).toBeLessThan(1.25);
        expect(room.z).toBeGreaterThan(-0.12);
      }
    }
  });

  it('keeps clear of the chair, Edison, the desk legs and the tower', () => {
    for (const point of chairFrame()) expect(clearance(point)).toBeGreaterThan(0.04);
    for (const box of [OBSTACLES.seat, OBSTACLES.legs, OBSTACLES.tower]) for (const point of through(box, 0.02)) expect(clearance(point)).toBeGreaterThan(0.04);
    for (const leg of deskLegs) for (let y = 0; y < DESK.height; y += 0.02) expect(clearance(leg.clone().setY(y))).toBeGreaterThan(0.06);
  });

  it('lifts its head clear of them too when it looks up', () => {
    const rig = createSleepingRig();
    const pose = createSleepPose();
    const head = new Field([...headForms(), ...headFur()], PART_COUNT);
    for (const yaw of [-0.16, 0.04]) {
      pose.lift = 1;
      pose.look = { yaw, pitch: 0.2 };
      applySleepPose(rig, pose);
      rig.root.updateMatrixWorld(true);
      const roomToHead = new Matrix4().makeTranslation(-rig.headOrigin.x, -rig.headOrigin.y, -rig.headOrigin.z).multiply(rig.head.matrixWorld.clone().invert());
      const scale = rig.head.matrixWorld.getMaxScaleOnAxis();
      for (const point of [...chairFrame(), ...through(OBSTACLES.seat, 0.02), ...through(OBSTACLES.legs, 0.02)]) {
        const p = toDog(point).applyMatrix4(roomToHead);
        expect(head.distance(p.x, p.y, p.z) * scale).toBeGreaterThan(0.04);
      }
    }
  });

  /** The face and the curl, in room space: both eyes, the nose, the top of the flank and the tip of the tail. */
  function landmarks() {
    const headToDog = headRestMatrix();
    const face = faceLayout();
    const [tipX, tipY, tipZ] = TAIL_PATH[TAIL_PATH.length - 1];
    return [
      ...face.eyes.map((eye) => new Vector3(...eye.position)),
      new Vector3(...face.nose.position),
    ]
      .map((p) => p.applyMatrix4(headToDog))
      .concat([new Vector3(-0.06, 0.23, -0.1), new Vector3(tipX, tipY + 0.02, tipZ)])
      .map(toRoom);
  }

  it('turns its face to the work camera three quarters on', () => {
    const shot = resolveShot(CAMERA_FRAMINGS.work, 1.2, createResolvedShot());
    const facing = new Vector3(Math.sin(HEAD_REST.rest.yaw), 0, Math.cos(HEAD_REST.rest.yaw)).applyAxisAngle(UP, SLEEPING_PLACEMENT.rotationY);
    const toCamera = shot.position.clone().sub(landmarks()[2]).setY(0).normalize();
    const angle = facing.angleTo(toCamera);
    expect(angle).toBeGreaterThan(0.2);
    expect(angle).toBeLessThan(0.6);
  });

  it('is never hidden from the work camera by the chair, Edison, the desk or the tower', () => {
    const hit = new Vector3();
    for (const aspect of [0.86, 1.2, 1.4]) {
      const camera = resolveShot(CAMERA_FRAMINGS.work, aspect, createResolvedShot()).position;
      for (const point of landmarks()) {
        const ray = new Ray(camera, point.clone().sub(camera).normalize());
        const reach = camera.distanceTo(point);
        for (const [name, box] of Object.entries(OBSTACLES)) {
          const blocked = ray.intersectBox(box, hit) !== null && camera.distanceTo(hit) < reach;
          expect({ name, blocked }).toEqual({ name, blocked: false });
        }
      }
    }
  });
});
