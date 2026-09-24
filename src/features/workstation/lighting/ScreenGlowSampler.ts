import { Color, type Texture } from 'three';

/**
 * How often the screen is sampled, in seconds. Reading pixels back can stall the GPU briefly,
 * so this stays slow; the light eases toward each new sample anyway.
 */
const SAMPLE_EVERY = 1.5;
const SAMPLE_SIZE = 6;
/** Dark editor themes still throw a cool glow, so the tint leans toward this. */
const SCREEN_WHITE = new Color('#c8d4ff');

type Drawable = HTMLCanvasElement | HTMLImageElement | ImageBitmap | OffscreenCanvas;

function isDrawable(image: unknown): image is Drawable {
  return (
    image instanceof HTMLCanvasElement ||
    image instanceof HTMLImageElement ||
    (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) ||
    (typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas)
  );
}

/**
 * Averages what a screen texture shows a couple of times per second, so each monitor's
 * area light takes on the tint and brightness of its picture.
 */
export class ScreenGlowSampler {
  /** Linear colour of the light the screen throws. */
  readonly color = SCREEN_WHITE.clone();
  /** 0 to 1 average brightness of the picture. */
  luminance = 0.1;

  private readonly context: CanvasRenderingContext2D | null;
  private readonly average = new Color();
  private since: number;

  /** @param phase 0 to 1, offsets this sampler so several screens never read back in the same frame. */
  constructor(phase = 0) {
    this.since = SAMPLE_EVERY * (1 - phase);
    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    this.context = canvas.getContext('2d', { willReadFrequently: true });
  }

  tick(texture: Texture, delta: number) {
    this.since += delta;
    if (this.since < SAMPLE_EVERY || !this.context) return;
    this.since = 0;
    const image: unknown = texture.image;
    if (!isDrawable(image) || image.width === 0) return;

    this.context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = this.context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    const scale = 1 / ((data.length / 4) * 255);
    const average = this.average.setRGB(r * scale, g * scale, b * scale);
    this.luminance = 0.2126 * average.r + 0.7152 * average.g + 0.0722 * average.b;
    // Keep the hue of the picture at full brightness, then lean toward screen white.
    const peak = Math.max(average.r, average.g, average.b, 1e-3);
    this.color.setRGB(average.r / peak, average.g / peak, average.b / peak).lerp(SCREEN_WHITE, 0.55);
  }
}
