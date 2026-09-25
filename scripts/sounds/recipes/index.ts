import { blip } from './blip';
import { desk } from './desk';
import { dot } from './dot';
import { focus } from './focus';
import { hover } from './hover';
import { move } from './move';
import { room } from './room';
import { swish } from './swish';
import { tab } from './tab';
import { tick } from './tick';
import { toggle } from './toggle';
import type { Recipe } from './types';

/** Every sound in sprite order: the short one-shots first, then the long loops. */
export const recipes: Recipe[] = [move, tick, hover, tab, toggle, dot, blip, focus, swish, desk, room];
