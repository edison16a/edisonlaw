import { buildDogData, type DogData } from './dogData';

let pending: Promise<DogData> | null = null;

/**
 * The dog's meshes, sculpted once per page in a worker. Mounts share the same arrays and only wrap them
 * in fresh GPU buffers. Without workers (or if one fails) it builds on the main thread instead.
 */
export function loadDogData(): Promise<DogData> {
  pending ??= buildInWorker().catch(buildOnMainThread);
  return pending;
}

function buildInWorker() {
  return new Promise<DogData>((resolve, reject) => {
    if (typeof Worker === 'undefined') {
      reject(new Error('Web workers are not available.'));
      return;
    }
    const worker = new Worker(new URL('./dogData.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<DogData>) => {
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || 'The dog worker failed.'));
    };
    worker.postMessage(null);
  });
}

function buildOnMainThread() {
  return new Promise<DogData>((resolve) => setTimeout(() => resolve(buildDogData()), 0));
}
