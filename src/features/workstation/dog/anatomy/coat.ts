import { PART_COUNT } from '../dimensions';
import { Field, transformShapes } from '../sdf/field';
import { bodyForms, bodyFur } from './body';
import { headForms, headFur, mouthCarves } from './head';
import { headRestMatrix } from './headPose';
import { neckForms, neckFur } from './neck';
import { tailForms, tailFur } from './tail';

/**
 * The whole coat as one sculpture: big forms first, fur details after them so broad blends never
 * soften them, and the mouth carved out last.
 */
export function coatField() {
  const headToDog = headRestMatrix();
  return new Field(
    [
      ...bodyForms(),
      ...neckForms(headToDog),
      ...transformShapes(headForms(), headToDog),
      ...tailForms(),
      ...bodyFur(),
      ...neckFur(),
      ...transformShapes(headFur(), headToDog),
      ...tailFur(),
      ...transformShapes(mouthCarves(), headToDog),
    ],
    PART_COUNT,
  );
}
