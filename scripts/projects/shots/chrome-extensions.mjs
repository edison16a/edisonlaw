/**
 * Chrome Extensions: store screenshots of three of Edison's extensions, back to front.
 * uStock and Text & Image Replacer are Featured on the Chrome Web Store, and SafeEats for
 * Chrome sits in front, swapping butter for oil in a recipe.
 * Sources:
 *   https://chromewebstore.google.com/detail/ustock/jekfdcldegcplphgipobcphbfclmfgpp
 *   https://chromewebstore.google.com/detail/text-image-replacer-exten/glamceigjodgbnfondkfloeoiikmlfno
 *   https://github.com/edison16a/safeeats-chrome (README images)
 */
import { readmeAttachment } from '../lib/github.mjs';
import { GLOW, dataUrl, shell } from '../lib/layouts/base.mjs';
import { cascade } from '../lib/layouts/cards.mjs';

const STORE = 'https://lh3.googleusercontent.com';
const USTOCK = `${STORE}/R8fsDIxBqjhaFKUN-LjMkOuArR2wO6MfjeMzk6XpWuRCkRNo0T-IDHMRtSiXC3rKJ2Aymw1YO2QBdphS3IRoLnr-2IE=s1280-w1280-h800`;
const REPLACER = `${STORE}/ilUsxCLgRh7x5d4wT9YmwBv-yyJYsJzy5pZ7vA8S9CFkrt1dtgRvmvKOviftoCPjXIQyNVkZVefphk4EnEVT7uaoBw=s1280-w1280-h800`;
const SAFEEATS_ASSET = '4187869c-e3f2-437e-9d35-58f3193a0ddb';

export async function capture({ download, compose }) {
  const sources = await Promise.all([
    download(USTOCK),
    download(REPLACER),
    readmeAttachment(download, 'edison16a/safeeats-chrome', SAFEEATS_ASSET),
  ]);
  const body = cascade({ images: sources.map(dataUrl), width: 920, aspect: 1280 / 800, radius: 16 });
  const background = `${GLOW}, linear-gradient(135deg, #0b1220 0%, #10263f 55%, #0f3b3a 100%)`;
  return { png: await compose(shell({ background, body })) };
}
