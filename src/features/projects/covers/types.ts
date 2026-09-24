/** A seeded random source returning values in [0, 1). */
export type Random = () => number;

/**
 * What every painter receives. Painters always draw in design units,
 * a `w` by `h` (1024 by 640) cover, and paintCover scales that to the real canvas.
 */
export interface Scene {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  random: Random;
}

export type Painter = (scene: Scene) => void;
