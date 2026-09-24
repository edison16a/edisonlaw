import { buildDogData, dogDataBuffers } from './dogData';

/** Builds the dog off the main thread, so sculpting it never stalls scrolling. */
const scope = self as unknown as {
  onmessage: (() => void) | null;
  postMessage(message: unknown, transfer: Transferable[]): void;
};

scope.onmessage = () => {
  const data = buildDogData();
  scope.postMessage(data, dogDataBuffers(data));
};
