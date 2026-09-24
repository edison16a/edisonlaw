import type { WebGLRenderer } from 'three';
import { loadCardPicture, type CardPicture } from './cardPicture';

/**
 * Every picture the spiral has asked for, each loaded once and shared by all
 * the cards that show it: thumbnails for the strand, and the screenshots of
 * the project in focus. Arrivals reach the GPU one per frame, so a dozen
 * uploads never land in the same frame, and only then do cards get them.
 */
export interface PictureBank {
  /** Starts loading `src`, unless it is already on its way or here. */
  request: (src: string) => void;
  /** The picture at `src` once it is on the GPU. */
  ready: (src: string) => CardPicture | undefined;
  /** Puts the next picture that has arrived on the GPU. Returns true while more are waiting. */
  uploadNext: () => boolean;
  /** Frees every texture. Pictures still on their way are dropped as they land. */
  dispose: () => void;
}

interface Arrival {
  src: string;
  picture: CardPicture;
}

/** `onArrive` runs as each picture lands, so the canvas can wake and upload it. */
export function createPictureBank(gl: WebGLRenderer, onArrive: () => void): PictureBank {
  const anisotropy = gl.capabilities.getMaxAnisotropy();
  const asked = new Set<string>();
  const arrived: Arrival[] = [];
  const uploaded = new Map<string, CardPicture>();
  let disposed = false;

  return {
    request: (src) => {
      if (disposed || asked.has(src)) return;
      asked.add(src);
      void loadCardPicture(src, anisotropy).then((picture) => {
        if (disposed) {
          picture.dispose();
          return;
        }
        arrived.push({ src, picture });
        onArrive();
      });
    },

    ready: (src) => uploaded.get(src),

    uploadNext: () => {
      const next = arrived.shift();
      if (!next) return false;
      gl.initTexture(next.picture.texture);
      uploaded.set(next.src, next.picture);
      return arrived.length > 0;
    },

    dispose: () => {
      disposed = true;
      for (const { picture } of arrived) picture.dispose();
      for (const picture of uploaded.values()) picture.dispose();
      arrived.length = 0;
      uploaded.clear();
    },
  };
}
