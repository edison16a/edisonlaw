/**
 * Steps shared by the Standoff recipes (shots/standoff*.mjs), which play the real games: the
 * big screen is one browser page, and each player is a phone page that joins by the room code,
 * as a phone does after scanning the QR code. Phones get fake motion sensors, so pointing and
 * swinging is done by setting angles, the way the repository's own browser tests do it
 * (tools/testing/fake-sensors.js in github.com/edison16a/standoff).
 *
 * Standoff's relay needs a WebSocket, so the recipes play a copy running on this machine:
 *
 *   git clone https://github.com/edison16a/standoff && cd standoff
 *   npm install && npm run build && PORT=3000 npm start
 *
 * STANDOFF_URL points somewhere else, like the live site at https://standoffgames.vercel.app.
 *
 * Headless Chromium draws WebGL on the CPU, so a game runs at a frame or two a second. The
 * phones get a browser of their own, so their pages do not slow the big screen down further.
 */
import { launchBrowser, openPage } from './browser.mjs';

export const SITE = (process.env.STANDOFF_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/** The big screen, in the dark theme the site opens in. */
export const VIEW = { width: 1440, height: 900, scale: 1, colorScheme: 'dark', local: /^http:\/\/(localhost|127\.)/.test(SITE) };

export const NAMES = ['Edison', 'Alex', 'Maya', 'Leo'];

/**
 * A phone's motion sensors. Orientation and motion events fire at 60 Hz from window.__sensors:
 * alpha turns the phone (right is lower), beta tips its top edge up.
 */
function fakeSensors() {
  const make = (type, init) => {
    const Event_ = type === 'deviceorientation' ? window.DeviceOrientationEvent : window.DeviceMotionEvent;
    return typeof Event_ === 'function' ? new Event_(type, init) : Object.assign(new Event(type), init);
  };
  const state = { alpha: 0, beta: 0, gamma: 0 };
  window.__sensors = state;
  setInterval(() => {
    window.dispatchEvent(make('deviceorientation', { ...state, absolute: false }));
    window.dispatchEvent(
      make('devicemotion', {
        acceleration: { x: 0, y: 0, z: 0 },
        accelerationIncludingGravity: { x: 0, y: 0, z: 9.81 },
        rotationRate: { alpha: 0, beta: 0, gamma: 0 },
        interval: 16,
      }),
    );
  }, 16);
}

/**
 * Opens `game` on the big screen and hosts a room. Returns the big screen, a way to join
 * phones, and a close for the phones' browser.
 */
export async function hostRoom({ openPage: openTab }, game) {
  const host = await openTab(VIEW);
  await host.goto(SITE, { waitUntil: 'networkidle', timeout: 120_000 });
  // Choosing a tile picks the game. Choosing the chosen one, like the first, hosts it at once.
  await host.getByRole('button', { name: game, exact: true }).first().click();
  await host.waitForTimeout(1_000);
  if (!(await host.locator('.join__code').count())) await host.getByRole('button', { name: /Host Game/i }).click();
  await host.locator('.join__code').waitFor({ timeout: 120_000 });
  const code = (await host.locator('.join__code').textContent()).trim();

  const phones = await launchBrowser();
  /** A phone that has scanned the code and typed its player's name. */
  const join = async (seat, { landscape = false, sensors = true } = {}) => {
    const { page } = await openPage(phones, {
      width: landscape ? 844 : 390,
      height: landscape ? 390 : 844,
      scale: 1,
      colorScheme: 'dark',
      mobile: true,
      local: VIEW.local,
      init: sensors ? fakeSensors : undefined,
    });
    await page.goto(`${SITE}/join/${code}`, { waitUntil: 'networkidle', timeout: 120_000 });
    await page.getByPlaceholder('Name').fill(NAMES[seat]);
    await page.getByRole('button', { name: 'Join' }).click();
    await page.waitForTimeout(1_500);
    return page;
  };

  return { host, join, close: () => phones.close() };
}

export const point = (phone, angles) => phone.evaluate((a) => Object.assign(window.__sensors, a), angles);

/**
 * The calibration every aiming game starts with: point at the middle of the big screen, then
 * at its top left and bottom right targets. From then on 20 degrees of turn is 80% of the way
 * to the edge.
 */
export async function calibrateAim(phone) {
  const steps = [
    ['Set middle', { alpha: 0, beta: 0 }],
    ['Set top left', { alpha: 20, beta: 12 }],
    ['Set bottom right', { alpha: -20, beta: -12 }],
  ];
  for (const [button, angles] of steps) {
    await point(phone, angles);
    await phone.waitForTimeout(300);
    await phone.getByRole('button', { name: button }).click();
  }
  await phone.getByRole('button', { name: 'Looks good' }).click();
  await phone.waitForTimeout(500);
}

/**
 * Moves a phone's aim on its own clock, in the page, so it keeps moving smoothly however slow
 * the automation is. `path(t, seat)` gives the angles at t seconds.
 */
export async function sweep(phone, seat, path) {
  await phone.evaluate(
    ({ source, seat }) => {
      const path = new Function(`return (${source})`)();
      const start = performance.now();
      setInterval(() => Object.assign(window.__sensors, path((performance.now() - start) / 1000, seat)), 16);
    },
    { source: path.toString(), seat },
  );
}

/** Holds a button down, the way a thumb rests on a trigger or a pedal. */
export async function hold(phone, name) {
  const box = await phone.getByRole('button', { name }).first().boundingBox({ timeout: 120_000 });
  await phone.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await phone.mouse.down();
}

/** Taps the button whose label is `label` every `every` milliseconds, on the phone's own clock. */
export async function tap(phone, label, every) {
  await phone.evaluate(
    ({ label, every }) => {
      setInterval(() => {
        const button = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().toLowerCase() === label);
        if (!button || button.disabled) return;
        const box = button.getBoundingClientRect();
        const init = { bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'touch', clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 };
        button.dispatchEvent(new PointerEvent('pointerdown', init));
        setTimeout(() => {
          button.dispatchEvent(new PointerEvent('pointerup', init));
          button.click();
        }, 60);
      }, every);
    },
    { label: label.toLowerCase(), every },
  );
}

/**
 * Takes the big screen's picture. The aim kit's overlay canvas only draws calibration targets,
 * and at a frame a second headless Chromium can hand back its last lobby frame during play,
 * with a "point here" target the players finished long ago, so it is hidden for the shot.
 */
export async function shoot(host) {
  await host.addStyleTag({ content: '.aim-overlay { visibility: hidden !important; }' });
  return host.screenshot({ timeout: 600_000 });
}
