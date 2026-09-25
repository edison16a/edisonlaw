import { buildDogData, dogDataBuffers, type DogPoseName } from './dogData';

/** Builds the dog off the main thread, so sculpting it never stalls scrolling. The message names the pose. */
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<DogPoseName>) => void) | null;
  postMessage(message: unknown, transfer: Transferable[]): void;
};

scope.onmessage = (event) => {
  const data = buildDogData(event.data);
  scope.postMessage(data, dogDataBuffers(data));
};
