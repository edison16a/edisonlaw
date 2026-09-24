import { CanvasTexture, ImageBitmapLoader, LinearMipmapLinearFilter, SRGBColorSpace, Texture, TextureLoader } from 'three';
import type { Project } from '@/content/types';
import { getPaintedCover } from './coverCanvas';

/** One project's picture on the GPU, ready to wrap around a spiral card. */
export interface CardPicture {
  texture: Texture;
  /** Width over height, for cover fitting in the shader. */
  aspect: number;
  /** Image bitmaps are uploaded top row first, so the shader flips them back. */
  flipY: boolean;
  dispose: () => void;
}

interface LoadOptions {
  /** Lower paints sooner when the cover has to be painted. */
  priority: number;
  anisotropy: number;
}

function prepare(texture: Texture, anisotropy: number) {
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.needsUpdate = true;
  return texture;
}

async function loadPhoto(src: string, anisotropy: number): Promise<CardPicture> {
  // Image bitmaps decode off the main thread, so a dozen photos never stall a frame.
  if (typeof createImageBitmap === 'function') {
    const bitmap = await new ImageBitmapLoader().loadAsync(src);
    const texture = prepare(new Texture(bitmap), anisotropy);
    texture.flipY = false;
    return {
      texture,
      aspect: bitmap.width / bitmap.height,
      flipY: true,
      dispose: () => {
        texture.dispose();
        bitmap.close();
      },
    };
  }
  const texture = prepare(await new TextureLoader().loadAsync(src), anisotropy);
  const image = texture.image as HTMLImageElement;
  return { texture, aspect: image.width / image.height, flipY: false, dispose: () => texture.dispose() };
}

async function loadPainted(project: Project, { priority, anisotropy }: LoadOptions): Promise<CardPicture> {
  const cover = getPaintedCover(project, priority);
  await cover.ready;
  const texture = prepare(new CanvasTexture(cover.canvas), anisotropy);
  return { texture, aspect: cover.canvas.width / cover.canvas.height, flipY: false, dispose: () => texture.dispose() };
}

/** The project's photo when it has one, or its painted cover when it does not (or the photo fails). */
export async function loadCardPicture(project: Project, options: LoadOptions): Promise<CardPicture> {
  if (project.image) {
    try {
      return await loadPhoto(project.image, options.anisotropy);
    } catch (error) {
      console.error(`Could not load ${project.image}`, error);
    }
  }
  return loadPainted(project, options);
}
