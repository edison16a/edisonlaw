/**
 * Standoff, gallery photo 5: Shooting Gallery. Four phones are BB guns in the fairground
 * booth, each laser in its player's colour, with ducks riding the waves, targets on the rail,
 * points popping up and the scores along the top. The phones join, calibrate, pick a finish
 * for their gun, then point and tap Shoot a few times a second.
 * Source: Standoff running from github.com/edison16a/standoff (see lib/standoff.mjs)
 */
import { calibrateAim, hostRoom, shoot, sweep, tap } from '../lib/standoff.mjs';

const FINISHES = ['Walnut', 'Midnight', 'Cherry', 'Showman'];

/** Each player sweeps their own part of the booth, over the ducks and up to the targets. */
const aim = (t, seat) => ({
  alpha: [14, 5, -5, -14][seat] + 9 * Math.sin(t * (0.8 + seat * 0.15) + seat * 2),
  beta: 1 + 5 * Math.sin(t * (0.6 + seat * 0.1) + seat),
});

export async function capture(tools) {
  const { host, join, close } = await hostRoom(tools, 'Shooting Gallery');
  try {
    const phones = [];
    for (let seat = 0; seat < FINISHES.length; seat++) {
      const phone = await join(seat);
      await calibrateAim(phone);
      await phone.getByText(FINISHES[seat], { exact: true }).first().click();
      await phone.getByRole('button', { name: 'Next' }).click();
      phones.push(phone);
    }
    // The longest round. It starts once everyone connected says ready.
    await host.getByRole('button', { name: '45s' }).click();
    for (const phone of phones) await phone.getByRole('button', { name: 'I am ready' }).click();
    for (const [seat, phone] of phones.entries()) {
      await sweep(phone, seat, aim);
      await tap(phone, 'Shoot', 420 + seat * 70);
    }
    // Midway through, with the booth busy and three players on the board.
    await host.waitForFunction(
      () => {
        const text = document.body.innerText;
        const time = Number(text.match(/TIME\s+(\d+)/)?.[1] ?? 99);
        const scores = [...text.matchAll(/(?:Edison|Alex|Maya|Leo)\s+(\d+)/g)].map((m) => Number(m[1]));
        return time <= 30 && scores.filter((score) => score > 0).length >= 3;
      },
      null,
      { timeout: 600_000, polling: 1_000 },
    );
    return { png: await shoot(host) };
  } finally {
    await close();
  }
}
