/**
 * TrashGo: three phone screens, lightly modernised. The title screen is redrawn around the
 * game's own trash can art. The two game screens are the App Store captures, the low poly park
 * where you walk around picking up litter, and the AR view where you throw it into a bin placed
 * in the real world, with their old black score labels replaced by a cleaner heads up display.
 * The AR screen shows what comes next and which of the game's three bins it belongs in
 * (compost, recycling or landfill, as in CompCan, RecCan and TrashCan in the Unity project).
 * Sources:
 *   https://apps.apple.com/us/app/trash-go/id6452390061 (icon and screenshots)
 *   https://github.com/Aldicodi/Cruzhacks-2023-TrashGo (game logic)
 */
import { dataUrl } from '../lib/layouts/base.mjs';
import { backdrop, icon, productShell } from '../lib/layouts/product.mjs';

const STORE = 'https://is1-ssl.mzstatic.com/image/thumb';
const ICON = `${STORE}/Purple126/v4/d4/1c/c7/d41cc7f8-981c-8d11-159f-46c66ce88ec6/AppIcon-1x_U007emarketing-0-7-0-85-220.png/600x600bb.png`;
const WORLD = `${STORE}/Purple126/v4/9c/39/b4/9c39b4de-722b-9e43-0b6e-9c7f5a9cc063/82facb43-99bc-414f-966d-212fafa1b4a9_image-1242x2688_2_1242x2688.jpg/1242x2688bb.jpg`;
const AR = `${STORE}/PurpleSource126/v4/f6/f0/f5/f6f0f55b-bc1a-6975-c370-170444ae4fbe/7fc72f13-085c-4b24-b543-d9ccf795be50_vertical_6.5.png/1242x2688bb.png`;

/** The gold of the TrashGo title, and the grey behind its art. */
const GOLD = '#e2b97f';
const PHONE = { width: 380, height: 824, bezel: 11 };

const CSS = `
.phone { position: absolute; width: ${PHONE.width}px; height: ${PHONE.height}px; border-radius: 62px; background: #0c0d0c; padding: ${PHONE.bezel}px;
  box-shadow: inset 0 0 0 1.5px #3a3d3a, 0 40px 80px -30px rgba(20, 40, 25, 0.55), 0 14px 30px -12px rgba(20, 40, 25, 0.35); }
.screen { position: relative; width: 100%; height: 100%; border-radius: 51px; overflow: hidden; background: #111; }
.screen > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.island { position: absolute; top: 11px; left: 50%; width: 104px; height: 30px; margin-left: -52px; border-radius: 16px; background: #000; z-index: 3; }
.status { position: absolute; top: 0; left: 0; right: 0; height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 4px 30px 0 36px; font-size: 15px; font-weight: 600; z-index: 2; }
.status .icons { display: flex; gap: 6px; align-items: center; }
.home { position: absolute; bottom: 8px; left: 50%; width: 124px; height: 5px; margin-left: -62px; border-radius: 3px; z-index: 2; }
.glass { background: rgba(14, 18, 15, 0.62); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.14); color: #fff; }
.hud { position: absolute; top: 86px; left: 34px; right: 34px; height: 74px; border-radius: 20px; display: flex; align-items: center; padding: 0 18px; gap: 14px; z-index: 2; }
.hud .stat { flex: 1; display: flex; align-items: center; gap: 10px; }
.hud .stat + .stat { border-left: 1px solid rgba(255, 255, 255, 0.16); padding-left: 16px; }
.hud .ico { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; }
.hud small { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255, 255, 255, 0.66); }
.hud b { font-size: 20px; font-weight: 650; letter-spacing: -0.02em; line-height: 1.1; }
.hint { position: absolute; left: 50%; transform: translateX(-50%); top: 174px; height: 38px; border-radius: 19px; padding: 0 16px; display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 500; white-space: nowrap; z-index: 2; }

.title { background: #212121; color: #fff; display: flex; flex-direction: column; align-items: center; }
.art { width: 250px; height: 210px; margin-top: 170px; background-repeat: no-repeat; background-size: 520px 520px; background-position: -128px -240px; }
.word { font-size: 46px; font-weight: 700; letter-spacing: -0.04em; color: ${GOLD}; margin-top: 18px; }
.tagline { font-size: 16px; color: rgba(255, 255, 255, 0.62); margin-top: 6px; text-align: center; line-height: 1.45; }
.buttons { position: absolute; left: 28px; right: 28px; bottom: 58px; display: flex; flex-direction: column; gap: 10px; }
.b { height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 17px; font-weight: 600; }
.b.gold { background: ${GOLD}; color: #1d1609; }
.b.dim { background: rgba(255, 255, 255, 0.07); color: #f1f1f1; }

.next { position: absolute; left: 16px; right: 16px; bottom: 26px; border-radius: 26px; padding: 16px; z-index: 2; }
.next-top { display: flex; align-items: center; gap: 12px; }
.next-top .thumb { width: 46px; height: 46px; border-radius: 14px; background: rgba(255, 255, 255, 0.1); display: grid; place-items: center; }
.next-top small { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255, 255, 255, 0.6); }
.next-top b { font-size: 18px; font-weight: 650; letter-spacing: -0.02em; }
.bins { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }
.bin { height: 58px; border-radius: 14px; background: rgba(255, 255, 255, 0.07); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 12.5px; font-weight: 550; color: rgba(255, 255, 255, 0.78); }
.bin.on { background: #fff; color: #111; }
.reticle { position: absolute; left: 50%; top: 44%; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.85); z-index: 2; }
.reticle::after { content: ''; position: absolute; left: 50%; top: 50%; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: #fff; }
`;

const BARS = `<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>`;
const WIFI = `<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 12 5.6 9.3a3.4 3.4 0 0 1 4.8 0zM2.9 6.6a7.2 7.2 0 0 1 10.2 0l-1.5 1.6a5 5 0 0 0-7.2 0zM0 3.7a11.3 11.3 0 0 1 16 0l-1.5 1.6a9.1 9.1 0 0 0-13 0z"/></svg>`;
const BATTERY = `<svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" opacity="0.4"/><rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor"/><path d="M24.5 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity="0.4"/></svg>`;

function phone(x, y, content, { tint = '#fff', home = '#fff' } = {}) {
  return `
<div class="phone" style="left: ${x}px; top: ${y}px;">
  <div class="screen">
    ${content}
    <div class="island"></div>
    <div class="status" style="color: ${tint};"><span class="num">9:41</span><span class="icons">${BARS}${WIFI}${BATTERY}</span></div>
    <div class="home" style="background: ${home};"></div>
  </div>
</div>`;
}

export async function capture({ download, compose }) {
  const [art, world, ar] = await Promise.all([ICON, WORLD, AR].map(async (url) => dataUrl(await download(url))));

  const title = `
  <div class="screen title" style="position: absolute; inset: 0; border-radius: 0;">
    <div class="art" style="background-image: url(${art});"></div>
    <div class="word">TrashGo</div>
    <div class="tagline">Pick up litter in the park.<br>Sort it into bins in AR.</div>
    <div class="buttons">
      <div class="b gold">${icon('play', { size: 16, fill: '#1d1609', stroke: '#1d1609' })}Play</div>
      <div class="b dim">How to play</div>
    </div>
  </div>`;

  const hud = (stats) => `
  <div class="glass hud">${stats
    .map(([ico, colour, label, value]) => `<div class="stat"><span class="ico" style="background: ${colour}33; color: ${colour};">${icon(ico, { size: 17, width: 2 })}</span><div><small>${label}</small><b class="num">${value}</b></div></div>`)
    .join('')}</div>`;

  const park = `
  <img src="${world}" alt="">
  ${hud([
    ['bag', '#9be15d', 'Trash', '3'],
    ['star', GOLD, 'Points', '12'],
  ])}
  <div class="glass hint">${icon('trash', { size: 15 })}Find a trash can to sort your haul</div>`;

  const bin = (ico, label, on) => `<div class="bin${on ? ' on' : ''}">${icon(ico, { size: 18, width: 2 })}${label}</div>`;
  const reality = `
  <img src="${ar}" alt="">
  ${hud([
    ['bag', '#9be15d', 'In hand', '3'],
    ['star', GOLD, 'Points', '12'],
  ])}
  <div class="glass next">
    <div class="next-top"><span class="thumb">${icon('bag', { size: 22, width: 2 })}</span><div><small>Up next</small><b>Trash bag</b></div></div>
    <div class="bins">${bin('leaf', 'Compost')}${bin('recycle', 'Recycling')}${bin('trash', 'Landfill', true)}</div>
  </div>`;

  const top = 88;
  const body =
    phone(160, top, title) +
    phone(610, top, park, { tint: '#10240f', home: '#10240f' }) +
    phone(1060, top, reality);

  return { png: await compose(productShell({ background: backdrop('#dfe7da', 0.4), body, css: CSS })) };
}
