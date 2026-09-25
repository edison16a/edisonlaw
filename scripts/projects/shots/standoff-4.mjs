/**
 * Standoff, gallery photo 4: Zombie Survival. Three phones are guns, a shotgun, an assault
 * rifle and a submachine gun, each following where its phone points, and the team fights the
 * dead up a night street on the first stage of the route to the chopper.
 * Source: Standoff running from github.com/edison16a/standoff (see lib/standoff.mjs)
 */
import { calibrateAim, hold, hostRoom, shoot, sweep, tap } from '../lib/standoff.mjs';

const GUNS = ['Shotgun', 'Assault Rifle', 'Submachine Gun'];

/** Each player works across the middle of the street, where the dead come, at head and chest height. */
const aim = (t, seat) => ({
  alpha: [4, -1, -6][seat] + 4 * Math.sin(t * (0.9 + seat * 0.25) + seat * 2),
  beta: 1.5 * Math.sin(t * (0.7 + seat * 0.2) + seat),
});

export async function capture(tools) {
  const { host, join, close } = await hostRoom(tools, 'Zombie Survival');
  try {
    const phones = [];
    for (let seat = 0; seat < GUNS.length; seat++) {
      const phone = await join(seat);
      await calibrateAim(phone);
      await phone.getByText(GUNS[seat], { exact: true }).first().click();
      await phone.getByRole('button', { name: /^Take the/ }).click();
      phones.push(phone);
    }
    // The run starts once everyone connected is ready.
    for (const phone of phones) await phone.getByRole('button', { name: 'I am ready' }).click();

    for (const [seat, phone] of phones.entries()) {
      await sweep(phone, seat, aim);
      // The automatic guns fire while Shoot is held. The pump shotgun fires once a tap.
      if (GUNS[seat] === 'Shotgun') await tap(phone, 'Shoot', 900);
      else await hold(phone, /shoot/i);
    }
    // Well into the first fight, with the dead closing in and several already down.
    await host.waitForFunction(
      () => {
        const text = document.body.innerText;
        const kills = [...text.matchAll(/(\d+) kills?/g)].reduce((sum, m) => sum + Number(m[1]), 0);
        // A reload swings the gun up across the view, so the shot waits for every gun to be firing.
        return kills >= 6 && !text.includes('Reloading');
      },
      null,
      { timeout: 900_000, polling: 1_000 },
    );
    return { png: await shoot(host) };
  } finally {
    await close();
  }
}
