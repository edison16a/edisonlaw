/**
 * Standoff, gallery photo 2: Magic Kart on Sunny Shores. Two phones race in split screen,
 * each with a view of their own, against computer karts that fill the grid, with the track
 * map and standings at the top right. The phones join, pick a driver and hold Drive from the
 * start, and the shot catches the pack at the power up cubes on the first straight.
 * Source: Standoff running from github.com/edison16a/standoff (see lib/standoff.mjs)
 */
import { hold, hostRoom } from '../lib/standoff.mjs';

/** Blaze the fox and Mochi the panda, by their places in the phone's driver list. */
const DRIVERS = [0, 3];

export async function capture(tools) {
  const { host, join, close } = await hostRoom(tools, 'Magic Kart');
  try {
    const phones = [];
    for (let seat = 0; seat < DRIVERS.length; seat++) {
      // Held sideways like a wheel. Without a tilt sensor the phone offers steering buttons.
      const phone = await join(seat, { landscape: true, sensors: false });
      await phone.getByRole('button', { name: 'Steer with buttons' }).click();
      await phone.getByRole('button', { name: 'Next' }).click();
      await phone.locator('.mk-pick__card').nth(DRIVERS[seat]).click();
      await phone.getByRole('button', { name: 'Next' }).click({ timeout: 120_000 });
      await phone.getByRole('button', { name: 'Ready' }).click();
      phones.push(phone);
    }
    await host.getByRole('button', { name: 'Start race' }).click();
    // Both press Drive through the countdown and hold it.
    for (const phone of phones) await hold(phone, 'Drive');
    // The shot is taken as the first kart drives through the row of power up cubes on the
    // first straight, when its slot starts to spin.
    await host.locator('.mk-view__item--rolling, .mk-view__item--full').first().waitFor({ timeout: 900_000 });
    return { png: await host.screenshot({ timeout: 600_000 }) };
  } finally {
    await close();
  }
}
