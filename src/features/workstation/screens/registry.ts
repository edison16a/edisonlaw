import { loadScreenFonts } from './fonts';
import { painters } from './painters';
import { screenResolution, type ScreenResolution } from './resolution';
import { scheduleTask } from './scheduler';
import type { ScreenId, ScreenPainter } from './types';

/**
 * Shared screens, one canvas and painter per id, counted by subscriber.
 * Every hook paints into the same canvas, so two stages showing Claude Code cost one repaint.
 */

/** How long an unused screen is kept, so a timeline flicking back and forth reuses it. */
const DISPOSE_DELAY = 4000;

interface Subscriber {
  animate: boolean;
  onChange: () => void;
}

interface Screen {
  id: ScreenId;
  resolution: ScreenResolution;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  painter: ScreenPainter;
  subscribers: Set<Subscriber>;
  /** Seconds into the painter's loop. */
  time: number;
  /** Key of the picture currently on the canvas. */
  key: string;
  stopTicking: (() => void) | null;
  disposeTimer: ReturnType<typeof setTimeout> | null;
}

export interface ScreenSubscription {
  /** The shared canvas, in case the screen was rebuilt since the caller last looked. */
  canvas: HTMLCanvasElement;
  setAnimate(animate: boolean): void;
  unsubscribe(): void;
}

const screens = new Map<ScreenId, Screen>();
let fontsHooked = false;

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function draw(screen: Screen, force: boolean) {
  const key = screen.painter.frameKey(screen.time);
  if (!force && key === screen.key) return;
  screen.key = key;
  const { ctx, resolution } = screen;
  ctx.save();
  // Painters lay out in screen units, and the transform draws them at the canvas resolution.
  ctx.setTransform(resolution.scale, 0, 0, resolution.scale, 0, 0);
  screen.painter.paint(ctx, screen.time);
  ctx.restore();
  screen.subscribers.forEach((subscriber) => subscriber.onChange());
}

function dispose(screen: Screen) {
  screen.stopTicking?.();
  screens.delete(screen.id);
  screen.painter.dispose?.();
  // Release the backing store now rather than whenever the canvas is collected.
  screen.canvas.width = 0;
  screen.canvas.height = 0;
}

function scheduleDispose(screen: Screen) {
  if (screen.disposeTimer) return;
  screen.disposeTimer = setTimeout(() => {
    screen.disposeTimer = null;
    if (screen.subscribers.size === 0) dispose(screen);
  }, DISPOSE_DELAY);
}

/** Starts or stops the loop to match the subscribers. */
function refresh(screen: Screen) {
  const animated = [...screen.subscribers].some((subscriber) => subscriber.animate);
  if (animated && !screen.stopTicking) {
    screen.stopTicking = scheduleTask((delta) => {
      screen.time += delta;
      draw(screen, false);
    });
  } else if (!animated && screen.stopTicking) {
    screen.stopTicking();
    screen.stopTicking = null;
    // Settle on the still frame, so a paused screen always shows a complete picture
    // and the loop picks up from there when it resumes.
    screen.time = screen.painter.stillTime;
    draw(screen, false);
  }
}

/** Repaints every screen, one per animation frame, so a font swap never paints them all in one go. */
function repaintAll() {
  const pending = [...screens.values()];
  const next = () => {
    const screen = pending.shift();
    if (!screen) return;
    // Skip screens disposed while waiting their turn.
    if (screens.get(screen.id) === screen) draw(screen, true);
    requestAnimationFrame(next);
  };
  next();
}

function hookFonts() {
  if (fontsHooked) return;
  fontsHooked = true;
  void loadScreenFonts().then(repaintAll);
}

function ensureScreen(id: ScreenId): Screen {
  const existing = screens.get(id);
  if (existing) return existing;

  const resolution = screenResolution(window.devicePixelRatio || 1);
  const canvas = createCanvas(resolution.width, resolution.height);
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D is not available for the monitor screens.');

  const painter = painters[id]();
  const screen: Screen = {
    id,
    resolution,
    canvas,
    ctx,
    painter,
    subscribers: new Set(),
    time: painter.stillTime,
    key: '',
    stopTicking: null,
    disposeTimer: null,
  };
  screens.set(id, screen);
  // Paint right away so a texture made from this canvas is never blank.
  draw(screen, true);
  // A render can be thrown away before it subscribes. Clean up if nobody ever does.
  scheduleDispose(screen);
  hookFonts();
  return screen;
}

/** The painted canvas for `id`, created on first use. Subscribe to keep it alive. */
export function getScreenCanvas(id: ScreenId): HTMLCanvasElement {
  return ensureScreen(id).canvas;
}

/**
 * Registers interest in `id`. `onChange` runs after every repaint of the shared canvas.
 * While any subscriber animates, the screen repaints on the shared clock.
 */
export function subscribeScreen(id: ScreenId, animate: boolean, onChange: () => void): ScreenSubscription {
  const screen = ensureScreen(id);
  if (screen.disposeTimer) {
    clearTimeout(screen.disposeTimer);
    screen.disposeTimer = null;
  }
  const subscriber: Subscriber = { animate, onChange };
  screen.subscribers.add(subscriber);
  refresh(screen);

  return {
    canvas: screen.canvas,
    setAnimate(value) {
      if (subscriber.animate === value) return;
      subscriber.animate = value;
      refresh(screen);
    },
    unsubscribe() {
      if (!screen.subscribers.delete(subscriber)) return;
      refresh(screen);
      if (screen.subscribers.size === 0) scheduleDispose(screen);
    },
  };
}
