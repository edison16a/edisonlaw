/**
 * The spiral canvas only draws while something moves. Input lives outside the
 * canvas, so it calls wakeSpiral and the scene, which registers itself here,
 * asks for a frame.
 */
let listener: (() => void) | null = null;

/** Registers the scene's frame request. Returns a function that removes it again. */
export function onSpiralWake(wake: () => void) {
  listener = wake;
  return () => {
    if (listener === wake) listener = null;
  };
}

export function wakeSpiral() {
  listener?.();
}
