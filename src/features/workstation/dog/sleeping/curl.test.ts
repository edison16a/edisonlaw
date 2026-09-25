import { describe, expect, it } from 'vitest';
import { headForms, headFur } from '../anatomy/head';
import { tailForms, tailFur } from '../anatomy/tail';
import { PART_COUNT } from '../dimensions';
import { meshPart } from '../geometry/partGeometry';
import { Field, transformShapes } from '../sdf/field';
import { sleepingCoatField } from './coat';
import { TORSO, onCurl } from './dimensions';
import { headRestMatrix } from './headPose';
import { britches, legForms } from './legs';
import { SLEEPING_TAIL, TAIL_PATH } from './tail';

const field = sleepingCoatField();

/** Height where a vertical line through a dog space point first meets the coat, marching `down` or up. */
function surfaceOnLine(x: number, z: number, down: boolean) {
  let y = down ? 1 : -0.2;
  for (let i = 0; i < 400; i++) {
    const d = field.distance(x, y, z);
    if (d < 1e-6) return y;
    y += down ? -d : d;
    if (y > 1) break;
  }
  return NaN;
}
const topAt = (x: number, z: number) => surfaceOnLine(x, z, true);
const bottomAt = (x: number, z: number) => surfaceOnLine(x, z, false);

const headToDog = headRestMatrix();
const head = meshPart(new Field([...transformShapes(headForms(), headToDog), ...transformShapes(headFur(), headToDog)], PART_COUNT), 0.004);
const headPoints = Array.from({ length: head.positions.length / 3 }, (_, i) => [head.positions[i * 3], head.positions[i * 3 + 1], head.positions[i * 3 + 2]]);

/** The rug's pile the dog sinks into a little. */
const ON_FLOOR = 0.03;

describe('the sleeping dog', () => {
  it('lies low in a round mound, its flank a little higher than its resting head', () => {
    const top = Math.max(
      ...TORSO.map(({ angle, radius }) => {
        const [x, , z] = onCurl(angle, radius, 0);
        return topAt(x, z);
      }),
    );
    expect(top).toBeGreaterThan(0.2);
    expect(top).toBeLessThan(0.3);
    const headTop = Math.max(...headPoints.map(([, y]) => y));
    expect(headTop).toBeLessThan(top);
  });

  it('curls up tight: the body round the middle with no hole in it', () => {
    expect(topAt(0, 0)).toBeGreaterThan(0.1);
    for (const { angle, radius } of TORSO) {
      const [x, , z] = onCurl(angle, radius, 0);
      expect(bottomAt(x, z)).toBeLessThan(ON_FLOOR);
      expect(Math.hypot(x, z)).toBeLessThan(0.2);
    }
  });

  it('rests its head on the floor', () => {
    const lowest = Math.min(...headPoints.map(([, y]) => y));
    expect(lowest).toBeGreaterThan(0.004);
    expect(lowest).toBeLessThan(0.02);
  });

  it('keeps its head clear of its tail and legs, so it lifts off cleanly', () => {
    const others = new Field([...legForms(), ...britches(), ...tailForms(SLEEPING_TAIL), ...tailFur(SLEEPING_TAIL)], PART_COUNT);
    for (const [x, y, z] of headPoints) expect(others.distance(x, y, z)).toBeGreaterThan(0.02);
  });

  it('wraps its tail round the front on the floor, past the head', () => {
    for (const [x, , z] of TAIL_PATH.slice(2)) {
      expect(bottomAt(x, z)).toBeLessThan(0.01);
      expect(topAt(x, z)).toBeLessThan(0.08);
    }
    // The tip comes round in front of the face, to the far side of the head's middle.
    const [tipX, , tipZ] = TAIL_PATH[TAIL_PATH.length - 1];
    const headMiddleX = headPoints.reduce((sum, [x]) => sum + x, 0) / headPoints.length;
    expect(tipX).toBeLessThan(headMiddleX);
    expect(tipZ).toBeGreaterThan(Math.max(...headPoints.map(([, , z]) => z)) - 0.05);
  });
});
