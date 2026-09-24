import { Color, DataTexture, Object3D, RGBAFormat, SRGBColorSpace, type InstancedMesh } from 'three';
import type { RgbClock } from '../../lighting/rgbClock';
import { FLASH_BLUE, writeKeyboardBlue } from './keyboardBlue';
import { KEYS, LAYOUT_WIDTH_U } from './keyLayout';
import { createTypingModel } from './typingModel';

const BASE_GLOW = 0.55;
const FLASH_GLOW = 3;
/** The pool of light under each key, relative to the glow at the foot of its cap. */
const HALO_GAIN = 1.5;
/** How fast a struck key's flash fades, roughly 1 / seconds. */
const FLASH_FADE = 7;
/** Brightness of the plate between the keys, a dim wash under the halos. */
const PLATE_GLOW = 0.2;
const PLATE_TEXELS = 64;

export interface KeycapMetrics {
  unit: number;
  /** Resting height of the keycap centres above the plate. */
  restY: number;
  pressDepth: number;
}

/**
 * Drives the keyboard every frame: the typing simulation, key flashes and travel, and the shimmering
 * navy to sky blue gradient on the caps and on the plate between them. The shared RGB clock only
 * lends its pulse, so a new timeline entry still brightens the board.
 */
export class KeyboardAnimator {
  /** Gradient shown on the plate between the keys, one texel row across the board. */
  readonly plate: DataTexture;
  private readonly flashes = new Float32Array(KEYS.length);
  private readonly indexByLabel = new Map(KEYS.map((key, index) => [key.label, index]));
  private readonly typing = createTypingModel(7);
  private readonly dummy = new Object3D();
  private readonly color = new Color();
  private readonly haloColor = new Color();

  constructor(private readonly metrics: KeycapMetrics) {
    this.plate = new DataTexture(new Uint8Array(PLATE_TEXELS * 4), PLATE_TEXELS, 1, RGBAFormat);
    this.plate.colorSpace = SRGBColorSpace;
    this.plate.needsUpdate = true;
  }

  /**
   * @param elapsed seconds since start, frozen at 0 when motion is reduced
   * @param typing whether Edison is typing right now
   */
  update(caps: InstancedMesh, halos: InstancedMesh, clock: RgbClock, delta: number, elapsed: number, typing: boolean) {
    if (typing) {
      this.typing.advance(Math.min(delta, 0.1), (label) => {
        const index = this.indexByLabel.get(label);
        if (index !== undefined) this.flashes[index] = 1;
      });
    }
    this.updateCaps(caps, halos, clock, delta, elapsed);
    this.updatePlate(clock, elapsed);
  }

  /** Lays the halos flat on the plate under their keys. They never move, so this runs once. */
  placeHalos(halos: InstancedMesh) {
    const { dummy } = this;
    KEYS.forEach((key, index) => {
      dummy.position.set(key.x * this.metrics.unit, 0, key.z * this.metrics.unit);
      dummy.updateMatrix();
      halos.setMatrixAt(index, dummy.matrix);
    });
    halos.instanceMatrix.needsUpdate = true;
  }

  private updateCaps(caps: InstancedMesh, halos: InstancedMesh, clock: RgbClock, delta: number, elapsed: number) {
    const { unit, restY, pressDepth } = this.metrics;
    const { flashes, dummy, color, haloColor } = this;
    const fade = Math.exp(-FLASH_FADE * delta);

    KEYS.forEach((key, index) => {
      const flash = flashes[index];
      flashes[index] = flash < 0.01 ? 0 : flash * fade;
      writeKeyboardBlue(color, key.x / LAYOUT_WIDTH_U + 0.5, elapsed, BASE_GLOW * clock.boost);
      if (flash > 0) color.lerp(FLASH_BLUE, flash).multiplyScalar(1 + flash * (FLASH_GLOW - 1));
      caps.setColorAt(index, color);
      halos.setColorAt(index, haloColor.copy(color).multiplyScalar(HALO_GAIN));

      dummy.position.set(key.x * unit, restY - pressDepth * Math.min(1, flash * 1.8), key.z * unit);
      dummy.updateMatrix();
      caps.setMatrixAt(index, dummy.matrix);
    });
    caps.instanceMatrix.needsUpdate = true;
    if (caps.instanceColor) caps.instanceColor.needsUpdate = true;
    if (halos.instanceColor) halos.instanceColor.needsUpdate = true;
  }

  private updatePlate(clock: RgbClock, elapsed: number) {
    const data = this.plate.image.data as Uint8Array;
    const { color } = this;
    for (let i = 0; i < PLATE_TEXELS; i++) {
      writeKeyboardBlue(color, i / (PLATE_TEXELS - 1), elapsed, PLATE_GLOW * clock.boost);
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
