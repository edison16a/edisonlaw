import { Vector3 } from 'three';
import { headForms, headFur } from '../anatomy/head';
import { neckForms, neckFur, type NeckSpec } from '../anatomy/neck';
import { tailForms } from '../anatomy/tail';
import { PART_COUNT } from '../dimensions';
import { Field, transformShapes } from '../sdf/field';
import { bib, torsoForms } from './body';
import { curlFrame, onCurl } from './dimensions';
import { headRestMatrix } from './headPose';
import { britches, legForms } from './legs';
import { SLEEPING_TAIL, sleepingTailFur } from './tail';

const withers = new Vector3(...onCurl(196, 0.15, 0.1)).addScaledVector(curlFrame(196).dorsal, 0.045);
const throat = new Vector3(...onCurl(206, 0.14, 0.09)).addScaledVector(curlFrame(206).dorsal, -0.04);

/**
 * Where the neck leaves the body: from the withers at the front of the back, and the chest below them.
 * Lying down, the collar of long locks would stand up off the flank, so only the shorter mane grows.
 */
export const SLEEPING_NECK: NeckSpec = {
  base: withers.toArray(),
  throatBase: throat.toArray(),
  arch: curlFrame(220).dorsal.multiplyScalar(0.012).toArray(),
  left: curlFrame(210).left.toArray(),
  collar: [],
};

/**
 * The sleeping dog's whole coat as one sculpture: big forms first, then fur details after them so broad
 * blends never soften them.
 */
export function sleepingCoatField() {
  const headToDog = headRestMatrix();
  return new Field(
    [
      ...torsoForms(),
      ...legForms(),
      ...neckForms(headToDog, SLEEPING_NECK),
      ...transformShapes(headForms(), headToDog),
      ...tailForms(SLEEPING_TAIL),
      ...bib(),
      ...britches(),
      ...neckFur(headToDog, SLEEPING_NECK),
      ...transformShapes(headFur(), headToDog),
      ...sleepingTailFur(),
    ],
    PART_COUNT,
  );
}
