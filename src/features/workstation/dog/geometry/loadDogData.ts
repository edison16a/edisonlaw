import { buildDogData, type DogData } from './dogData';

/**
 * A promise that also says when it has settled, in the shape React's `use` reads: once fulfilled,
 * `use` returns the value straight away instead of suspending for a frame.
 */
type TrackedPromise<T> = Promise<T> & { status?: 'pending' | 'fulfilled' | 'rejected'; value?: T };

let pending: TrackedPromise<DogData> | null = null;

/**
 * The dog's meshes, sculpted once per page in a worker. Mounts share the same arrays and only wrap them
 * in fresh GPU buffers. Without workers (or if one fails) it builds on the main thread instead.
 */
export function loadDogData(): Promise<DogData> {
  if (!pending) {
    const promise: TrackedPromise<DogData> = buildInWorker().catch(buildOnMainThread);
    promise.status = 'pending';
    promise.then(
      (value) => {
        promise.status = 'fulfilled';
        promise.value = value;
      },
      () => {
        promise.status = 'rejected';
      },
    );
    pending = promise;
  }
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
