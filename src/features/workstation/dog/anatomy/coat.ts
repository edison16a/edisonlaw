import { PART_COUNT } from '../dimensions';
import { Field, transformShapes } from '../sdf/field';
import { bodyForms, bodyFur } from './body';
import { headForms, headFur } from './head';
import { headRestMatrix } from './headPose';
import { neckForms, neckFur } from './neck';
import { tailForms, tailFur } from './tail';

/**
 * The whole coat as one sculpture: big forms first, then fur details after them so broad blends never
 * soften them.
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
      ...neckFur(headToDog),
      ...transformShapes(headFur(), headToDog),
      ...tailFur(),
    ],
    PART_COUNT,
  );
}
