import { buildDogData, type DogData, type DogPoseName } from './dogData';

/**
 * A promise that also says when it has settled, in the shape React's `use` reads: once fulfilled,
 * `use` returns the value straight away instead of suspending for a frame.
 */
type TrackedPromise<T> = Promise<T> & { status?: 'pending' | 'fulfilled' | 'rejected'; value?: T };

const pending = new Map<DogPoseName, TrackedPromise<DogData>>();

/**
 * The dog's meshes in a pose, sculpted once per page in a worker. Mounts share the same arrays and only
 * wrap them in fresh GPU buffers. Without workers (or if one fails) it builds on the main thread instead.
 */
export function loadDogData(pose: DogPoseName = 'sitting'): Promise<DogData> {
  let promise = pending.get(pose);
  if (!promise) {
    const tracked: TrackedPromise<DogData> = buildInWorker(pose).catch(() => buildOnMainThread(pose));
    tracked.status = 'pending';
    tracked.then(
      (value) => {
        tracked.status = 'fulfilled';
        tracked.value = value;
      },
      () => {
        tracked.status = 'rejected';
      },
    );
    pending.set(pose, tracked);
    promise = tracked;
  }
  return promise;
}

function buildInWorker(pose: DogPoseName) {
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
    worker.postMessage(pose);
  });
}

function buildOnMainThread(pose: DogPoseName) {
  return new Promise<DogData>((resolve) => setTimeout(() => resolve(buildDogData(pose)), 0));
}
