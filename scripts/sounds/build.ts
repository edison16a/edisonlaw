import { master } from './master';
import { recipes } from './recipes';
import { layoutSprite, type SpriteLayout } from './sprite';

/** Renders and masters every recipe, then lays them out as one sprite. Fully deterministic. */
export function buildSprite(): SpriteLayout {
  return layoutSprite(recipes.map((recipe) => ({ recipe, audio: master(recipe) })));
}
