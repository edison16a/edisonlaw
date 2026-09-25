import { earShapes } from '../anatomy/ear';
import { faceLayout, type FaceLayout } from '../anatomy/face';
import { noseShapes } from '../anatomy/nose';
import { PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { buildCoatData, type CoatData } from './coatGeometry';
import { meshPart, type PartData } from './partGeometry';

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

/** Sculpts and meshes the whole dog. Costly: about a million distance samples, so it runs in a worker. */
export function buildDogData(): DogData {
  return {
    coat: buildCoatData(),
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
