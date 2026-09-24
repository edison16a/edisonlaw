import { addEffect } from '@react-three/fiber';
import { LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace, Texture } from 'three';
import { getScreenCanvas, subscribeScreen, type ScreenSubscription } from './registry';
import type { ScreenId } from './types';
import { createUploadTicket, UploadQueue } from './uploadQueue';

const uploads = new UploadQueue();
let framesCounted = false;

/** The shared upload queue, stepped once per animation frame across every stage. */
function sharedUploads() {
  if (!framesCounted) {
    framesCounted = true;
    // Global effects run once per frame before any canvas renders, however many are on the page.
    addEffect(() => uploads.nextFrame());
  }
  return uploads;
}

/**
 * One consumer's view of a shared screen: its own texture over the shared canvas, uploaded to the
 * GPU only after a repaint and only when the shared upload queue gives it the frame's slot.
 */
export class ScreenBinding {
  readonly texture: Texture;
  private readonly ticket = createUploadTicket();
  private subscription: ScreenSubscription | null = null;

  constructor(
    private readonly id: ScreenId,
    anisotropy: number,
  ) {
    // The canvas is painted before it is returned, so a new id never shows a blank frame.
    // A plain texture rather than a CanvasTexture, so the first upload also waits its turn.
    const texture = new Texture(getScreenCanvas(id));
    texture.colorSpace = SRGBColorSpace;
    // Mipmaps plus anisotropy keep text readable on the side monitors, which sit at an angle.
    texture.generateMipmaps = true;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.anisotropy = anisotropy;
    this.texture = texture;
  }

  /** Starts listening. `onRepaint` runs after each repaint, to request a frame. */
  connect(animate: boolean, onRepaint: () => void) {
    this.disconnect();
    const onChange = () => {
      sharedUploads().request(this.ticket);
      onRepaint();
    };
    this.subscription = subscribeScreen(this.id, animate, onChange);
    // The shared canvas is rebuilt if it sat unused for a while. Follow it.
    this.texture.image = this.subscription.canvas;
    // A new texture, or one whose GPU copy was freed by disconnecting, needs the picture sent up.
    onChange();
  }

  setAnimate(animate: boolean) {
    this.subscription?.setAnimate(animate);
  }

  /**
   * Call every rendered frame, before the render. Flags the texture for upload once a repaint is
   * waiting and this screen holds the frame's upload slot. True while a repaint is still waiting.
   */
  update(): boolean {
    const queue = sharedUploads();
    if (!queue.isWaiting(this.ticket)) return false;
    if (!queue.take(this.ticket)) return true;
    this.texture.needsUpdate = true;
    return false;
  }

  /** Stops listening and frees the GPU copy. The binding can connect again later. */
  disconnect() {
    this.subscription?.unsubscribe();
    this.subscription = null;
    sharedUploads().cancel(this.ticket);
    this.texture.dispose();
  }
}
