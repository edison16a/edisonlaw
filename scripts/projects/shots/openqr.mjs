/**
 * OpenQR: the generator with a blue code on a pale blue background and an uploaded logo in the
 * middle, beside the content types, center image options and color fields.
 * Source: the generator screenshot in https://github.com/edison16a/openqr, pinned to the commit
 * below. It is a 2880 x 1800 capture of the live app at https://openqrgen.vercel.app, 16:10 like a card.
 */
const COMMIT = 'e3b6a7d918a646aff5c6801cb121e24d64c24ade';
const SHOT = `https://raw.githubusercontent.com/edison16a/openqr/${COMMIT}/assets/screenshots/generator-custom.png`;

export async function capture({ download }) {
  return { png: await download(SHOT), quality: 0.92 };
}
