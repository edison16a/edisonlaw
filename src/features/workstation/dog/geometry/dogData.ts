import { earShapes } from '../anatomy/ear';
import { faceLayout, type FaceLayout } from '../anatomy/face';
import { noseShapes } from '../anatomy/nose';
import { PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { buildSleepingCoat } from '../sleeping/skin';
import type { CoatData } from './coatGeometry';
import { meshPart, type PartData } from './partGeometry';
import { buildCoatData } from './sittingCoat';

/** The poses the dog is sculpted in: sitting by Edison in the about scene, and asleep by his chair at work. */
export type DogPoseName = 'sitting' | 'sleeping';

/** Every mesh of the dog as plain arrays, with where the face parts sit. Safe to post from a worker. */
export interface DogData {
  coat: CoatData;
  /** The left ear; the right one is its mirror image. */
  ear: PartData;
  nose: PartData;
  face: FaceLayout;
}

/** Grid cells for the small parts: finer than the coat because they are small and seen up close. */
const CELLS = { ear: 0.003, nose: 0.0012 } as const;

/** Each pose's coat, sculpted and meshed; the head, and so the ears, nose and face, is the same in every pose. */
const COATS: Record<DogPoseName, () => CoatData> = { sitting: () => buildCoatData(), sleeping: () => buildSleepingCoat() };

/** Sculpts and meshes the whole dog in a pose. Costly: about a million distance samples, so it runs in a worker. */
export function buildDogData(pose: DogPoseName = 'sitting'): DogData {
  return {
    coat: COATS[pose](),
    ear: meshPart(new Field(earShapes(), PART_COUNT), CELLS.ear, true),
    nose: meshPart(new Field(noseShapes(), PART_COUNT), CELLS.nose),
    face: faceLayout(),
  };
}

/** The typed array buffers inside the data, to hand over to the page without copying. */
export function dogDataBuffers(data: DogData): ArrayBuffer[] {
  const parts: object[] = [data.coat, data.ear, data.nose];
  return parts.flatMap((part) =>
    Object.values(part).flatMap((value) => (ArrayBuffer.isView(value) && value.buffer instanceof ArrayBuffer ? [value.buffer] : [])),
  );
}
