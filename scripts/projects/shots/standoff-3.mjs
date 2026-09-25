/**
 * Standoff, gallery photo 3: Fruit Ninja. Four phones slice on one wooden board, each blade in
 * the style its player picked and edged in their colour, with fruit splitting and the
 * leaderboard at the top right. The phones join, calibrate and pick their blades like real
 * players, then swing back and forth through the fruit.
 * Source: Standoff running from github.com/edison16a/standoff (see lib/standoff.mjs)
 */
import { calibrateAim, hostRoom, shoot, sweep } from '../lib/standoff.mjs';

/** Plasma, Fire, Lightning and Rainbow, by the order of the phone's blade list. */
const BLADES = [0, 2, 1, 5];

/** Long, curving slashes at different heights and speeds, so the trails cross. */
const slash = (t, seat) => ({
  alpha: 22 * Math.sin(t * (2.4 + seat * 0.3) + seat * 1.7),
  beta: [4, -2, -7, 1][seat] + 5 * Math.cos(t * (2.4 + seat * 0.3) + seat * 1.7),
});

export async function capture(tools) {
  const { host, join, close } = await hostRoom(tools, 'Fruit Ninja');
  try {
    const phones = [];
    for (let seat = 0; seat < 4; seat++) {
      const phone = await join(seat);
      await calibrateAim(phone);
      await phone.locator('.fn-blade').nth(BLADES[seat]).click();
      await phone.getByRole('button', { name: 'Next' }).click();
      await phone.getByRole('button', { name: 'Ready' }).click();
      phones.push(phone);
    }
    // Frantic fruit and no bombs, whose smoke would darken the board.
    await host.getByRole('radio', { name: 'Frantic' }).click();
    await host.getByRole('radio', { name: 'None' }).click();
    await host.getByRole('button', { name: /^Start/ }).click();
    for (const [seat, phone] of phones.entries()) await sweep(phone, seat, slash);
    // A few waves in: the clock is under 50 seconds and three players have scored.
    await host.waitForFunction(
      () => {
        const text = document.body.innerText;
        const clock = text.match(/\b0:(\d\d)\b/);
        const scores = [...text.matchAll(/(?:Edison|Alex|Maya|Leo)\s+(\d+)/g)].map((m) => Number(m[1]));
        return clock && Number(clock[1]) < 50 && scores.filter((score) => score > 0).length >= 3;
      },
      null,
      { timeout: 600_000, polling: 1_000 },
    );
    return { png: await shoot(host) };
  } finally {
    await close();
  }
}
