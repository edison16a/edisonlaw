import { blip } from './blip';
import { desk } from './desk';
import { dot } from './dot';
import { hover } from './hover';
import { move } from './move';
import { room } from './room';
import { tab } from './tab';
import { toggle } from './toggle';
import type { Recipe } from './types';

/**
 * Every sound in sprite order: the one-shots, then the long loops. Where a
 * sound falls against the MP3 frames changes how cleanly it codes, and this
 * order keeps every one-shot at least 36 dB above its coding noise, as
 * scripts/sounds/check.ts measures it.
 */
export const recipes: Recipe[] = [toggle, dot, blip, move, hover, tab, desk, room];
