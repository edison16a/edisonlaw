import { DataTexture, LinearMipmapLinearFilter, SRGBColorSpace, Texture, TextureLoader } from 'three';

/** One picture on the GPU, ready to wrap around a spiral card. */
export interface CardPicture {
  texture: Texture;
  /** Width over height, for cover fitting in the shader. */
  aspect: number;
  /** Image bitmaps are uploaded top row first, so the shader flips them back. */
  flipY: boolean;
  dispose: () => void;
}

/**
 * Widest a photo is kept on the GPU. The focused card is under 640 CSS pixels
 * wide, so this stays sharp at twice the pixel density and saves memory. The
 * photos in public/projects are exported at this width, so only a larger one
 * dropped in by hand is scaled here.
 */
const MAX_WIDTH = 1280;

/** grey-800, the quiet tile a card shows when its photo cannot load. */
const MISSING_GREY = [0x1f, 0x1f, 0x1f, 0xff];

function prepare(texture: Texture, anisotropy: number) {
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** Decodes off the main thread, then scales big photos down so a dozen never stall a frame. */
async function decodePhoto(src: string) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`${response.status} for ${src}`);
  const full = await createImageBitmap(await response.blob());
  if (full.width <= MAX_WIDTH) return full;
  const resizeHeight = Math.round((full.height * MAX_WIDTH) / full.width);
  const scaled = await createImageBitmap(full, { resizeWidth: MAX_WIDTH, resizeHeight, resizeQuality: 'high' });
  full.close();
  return scaled;
}

async function loadPhoto(src: string, anisotropy: number): Promise<CardPicture> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await decodePhoto(src);
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

/** One grey pixel stretched over the card, in the photo's 16:10 shape. */
function greyTile(): CardPicture {
  const texture = new DataTexture(new Uint8Array(MISSING_GREY), 1, 1);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return { texture, aspect: 1.6, flipY: false, dispose: () => texture.dispose() };
}

/** The photo at `src`, or a plain grey tile if it cannot load. */
export async function loadCardPicture(src: string, anisotropy: number): Promise<CardPicture> {
  try {
    return await loadPhoto(src, anisotropy);
  } catch (error) {
    console.error(`Could not load ${src}`, error);
    return greyTile();
  }
}
