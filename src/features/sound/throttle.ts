/**
 * Per key rate limiter. A key is allowed again once its interval has passed since it
 * was last allowed. Cheap enough to call every frame.
 */
export function createThrottle<Key extends string>(intervalOf: (key: Key) => number) {
  const last = new Map<Key, number>();
  return (key: Key, now: number) => {
    const previous = last.get(key);
    if (previous !== undefined && now - previous < intervalOf(key)) return false;
    last.set(key, now);
    return true;
  };
}
