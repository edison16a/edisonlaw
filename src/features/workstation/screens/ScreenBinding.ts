import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';
import { getScreenCanvas, subscribeScreen, type ScreenSubscription } from './registry';
import type { ScreenId } from './types';

/**
 * One consumer's view of a shared screen: its own CanvasTexture over the shared canvas,
 * flagged for upload whenever the canvas is repainted.
 */
export class ScreenBinding {
  readonly texture: CanvasTexture;
  private subscription: ScreenSubscription | null = null;

  constructor(
    private readonly id: ScreenId,
    anisotropy: number,
  ) {
    // The canvas is painted before it is returned, so a new id never shows a blank frame.
    const texture = new CanvasTexture(getScreenCanvas(id));
    texture.colorSpace = SRGBColorSpace;
    // Mipmaps plus anisotropy keep text readable on the side monitors, which sit at an angle.
    texture.generateMipmaps = true;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.anisotropy = anisotropy;
    this.texture = texture;
  }

  /** Starts listening. `onRepaint` runs after the texture is flagged, to request a frame. */
  connect(animate: boolean, onRepaint: () => void) {
    this.disconnect();
    const onChange = () => {
      this.texture.needsUpdate = true;
      onRepaint();
    };
    this.subscription = subscribeScreen(this.id, animate, onChange);
    // The shared canvas is rebuilt if it sat unused for a while. Follow it.
    if (this.texture.image !== this.subscription.canvas) {
      this.texture.image = this.subscription.canvas;
      onChange();
    }
  }

  setAnimate(animate: boolean) {
    this.subscription?.setAnimate(animate);
  }

  /** Stops listening and frees the GPU copy. The binding can connect again later. */
  disconnect() {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.texture.dispose();
  }
}
