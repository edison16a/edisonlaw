import { Color, DataTexture, Object3D, RGBAFormat, SRGBColorSpace, type InstancedMesh } from 'three';
import type { RgbClock } from '../../lighting/rgbClock';
import { writeRgb } from '../../lighting/rgbClock';
import { KEYS, LAYOUT_WIDTH_U } from './keyLayout';
import { createTypingModel } from './typingModel';

/** Hue change from the left edge of the board to the right edge. */
const WAVE_SPREAD = 0.45;
const BASE_GLOW = 0.5;
const FLASH_GLOW = 3.2;
/** How fast a struck key's flash fades, roughly 1 / seconds. */
const FLASH_FADE = 7;
const PLATE_TEXELS = 32;

export interface KeycapMetrics {
  unit: number;
  gap: number;
  /** Resting height of the keycap centres. */
  restY: number;
  pressDepth: number;
}

/**
 * Drives the keyboard every frame: the typing simulation, key flashes and travel,
 * the rolling RGB wave on the caps and the matching gradient on the plate.
 */
export class KeyboardAnimator {
  /** 32 x 1 gradient shown on the plate between the keys. */
  readonly plate: DataTexture;
  private readonly flashes = new Float32Array(KEYS.length);
  private readonly indexByLabel = new Map(KEYS.map((key, index) => [key.label, index]));
  private readonly typing = createTypingModel(7);
  private readonly dummy = new Object3D();
  private readonly color = new Color();

  constructor(private readonly metrics: KeycapMetrics) {
    this.plate = new DataTexture(new Uint8Array(PLATE_TEXELS * 4), PLATE_TEXELS, 1, RGBAFormat);
    this.plate.colorSpace = SRGBColorSpace;
    this.plate.needsUpdate = true;
  }

  /**
   * @param elapsed seconds since start, frozen at 0 when motion is reduced
   * @param typing whether Edison is typing right now
   */
  update(mesh: InstancedMesh, clock: RgbClock, delta: number, elapsed: number, typing: boolean) {
    if (typing) {
      this.typing.advance(Math.min(delta, 0.1), (label) => {
        const index = this.indexByLabel.get(label);
        if (index !== undefined) this.flashes[index] = 1;
      });
    }
    this.updateCaps(mesh, clock, delta, elapsed);
    this.updatePlate(clock);
  }

  private updateCaps(mesh: InstancedMesh, clock: RgbClock, delta: number, elapsed: number) {
    const { unit, gap, restY, pressDepth } = this.metrics;
    const { flashes, dummy, color } = this;
    const fade = Math.exp(-FLASH_FADE * delta);

    KEYS.forEach((key, index) => {
      const flash = flashes[index];
      flashes[index] = flash < 0.01 ? 0 : flash * fade;
      const across = key.x / LAYOUT_WIDTH_U;
      // A soft brightness band rolls across the board on top of the hue gradient.
      const wave = 0.72 + 0.28 * Math.sin((across * 1.4 - elapsed * 0.32) * Math.PI * 2);
      const glow = BASE_GLOW * wave * clock.boost + flash * FLASH_GLOW;
      writeRgb(color, clock.hue + across * WAVE_SPREAD, glow, 1 - flash * 0.55);
      mesh.setColorAt(index, color);

      dummy.position.set(key.x * unit, restY - pressDepth * Math.min(1, flash * 1.8), key.z * unit);
      dummy.scale.set((key.width * unit - gap) / (unit - gap), 1, (key.depth * unit - gap) / (unit - gap));
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  private updatePlate(clock: RgbClock) {
    const data = this.plate.image.data as Uint8Array;
    const { color } = this;
    for (let i = 0; i < PLATE_TEXELS; i++) {
      writeRgb(color, clock.hue + (i / (PLATE_TEXELS - 1) - 0.5) * WAVE_SPREAD, clock.boost);
      color.convertLinearToSRGB();
      data[i * 4] = Math.min(255, color.r * 255);
      data[i * 4 + 1] = Math.min(255, color.g * 255);
      data[i * 4 + 2] = Math.min(255, color.b * 255);
      data[i * 4 + 3] = 255;
    }
    this.plate.needsUpdate = true;
  }

  dispose() {
    this.plate.dispose();
  }
}
