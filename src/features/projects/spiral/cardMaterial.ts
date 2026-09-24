import { Color, DoubleSide, ShaderMaterial, Vector2, type IUniform, type Texture } from 'three';
import { CARD_HEIGHT, CARD_WIDTH, SPIRAL } from './geometry';
import { cardFragmentShader } from './shaders/cardFragment';
import { cardVertexShader } from './shaders/cardVertex';

/** Every uniform a spiral card reads. The scene writes them once per frame. */
export interface CardUniforms {
  [name: string]: IUniform;
  uMap: IUniform<Texture | null>;
  uSize: IUniform<Vector2>;
  /** Width over height of the picture, for cover fitting. */
  uImageAspect: IUniform<number>;
  /** 1 for image bitmaps, which arrive top row first. */
  uFlipY: IUniform<number>;
  uCornerRadius: IUniform<number>;
  /** 1 over the bend radius. 0 is flat. */
  uCurvature: IUniform<number>;
  /** Sideways bow of the middle of the card, in world units. */
  uBow: IUniform<number>;
  uSweep: IUniform<number>;
  /** 0 is sharp, 1 is the widest blur. */
  uBlur: IUniform<number>;
  /** Signed motion streak along the strand, in texture widths. */
  uStreak: IUniform<number>;
  uBrightness: IUniform<number>;
  uOpacity: IUniform<number>;
  /** 0 to 1 while the pointer rests on the card. */
  uHover: IUniform<number>;
  /** Drawing buffer size in pixels, for the fade at the stage edges. */
  uViewport: IUniform<Vector2>;
  /** Colour far cards sink toward, in linear space. */
  uFog: IUniform<Color>;
}

export type CardMaterial = ShaderMaterial & { uniforms: CardUniforms };

/** Shared by every card, so a resize updates them all at once. */
export const cardViewport = new Vector2(1, 1);

/** The stage background, which far cards fade toward. */
const FOG = new Color('#0b0b0b');

export function createCardMaterial(): CardMaterial {
  const uniforms: CardUniforms = {
    uMap: { value: null },
    uSize: { value: new Vector2(CARD_WIDTH, CARD_HEIGHT) },
    uImageAspect: { value: CARD_WIDTH / CARD_HEIGHT },
    uFlipY: { value: 0 },
    uCornerRadius: { value: 0.07 },
    uCurvature: { value: 1 / SPIRAL.radius },
    uBow: { value: 0 },
    uSweep: { value: SPIRAL.sweep },
    uBlur: { value: 0 },
    uStreak: { value: 0 },
    uBrightness: { value: 1 },
    uOpacity: { value: 0 },
    uHover: { value: 0 },
    uViewport: { value: cardViewport },
    uFog: { value: FOG },
  };
  return new ShaderMaterial({
    uniforms,
    vertexShader: cardVertexShader,
    fragmentShader: cardFragmentShader,
    transparent: true,
    side: DoubleSide,
  }) as CardMaterial;
}
