/**
 * SunBlock: a Chrome window on an ad heavy kind of page, a recipe, with no ads left on it.
 * The toolbar badge counts what was blocked in this tab, and the popup is open: protection on,
 * this tab and all time counts, the per site switch for the current domain, the Zapper for
 * removing an element by clicking it, and the settings page with the whitelist.
 *
 * Drawn as HTML, with the popup restyled in the manner of Photo Craft around SunBlock's own
 * amber. The recipe site is made up. The photos are from Unsplash, through Lorem Picsum.
 * Sources:
 *   https://github.com/edison16a/SunBlock (popup copy, badge colour, features)
 *   https://chromewebstore.google.com/detail/sunblock/dokdhfglhjcdfjblneeaglmhbchkkafk
 *   https://picsum.photos/id/835, /id/493, /id/292, /id/999
 */
import { dataUrl } from '../lib/layouts/base.mjs';
import { BROWSER_CSS, backdrop, browserWindow, icon, productShell } from '../lib/layouts/product.mjs';

const PHOTOS = {
  hero: 'https://picsum.photos/id/835/1200/800',
  parfait: 'https://picsum.photos/id/493/600/400',
  soup: 'https://picsum.photos/id/292/600/400',
  cake: 'https://picsum.photos/id/999/600/400',
};

/** SunBlock's badge colour, from data/config.json. */
const AMBER = '#f5a623';
const DOMAIN = 'saltandcrumb.example';

/** The extension's icon: an amber shield with an inner line. */
const SHIELD = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 32 32">
  <defs><linearGradient id="sb${size}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffc21a"/><stop offset="1" stop-color="#ff7a00"/></linearGradient></defs>
  <path d="M16 2.5 4.5 7v8.2c0 7.2 5 12.2 11.5 14.3 6.5-2.1 11.5-7.1 11.5-14.3V7z" fill="url(#sb${size})"/>
  <path d="M16 7 8.6 10v5.4c0 4.8 3.2 8.2 7.4 9.7 4.2-1.5 7.4-4.9 7.4-9.7V10z" fill="none" stroke="#fff" stroke-opacity="0.9" stroke-width="1.6"/>
</svg>`;

const CSS = `
${BROWSER_CSS}
.site { position: absolute; inset: 0; background: #fffdf9; color: #1d1a16; }
.site-head { height: 64px; display: flex; align-items: center; padding: 0 48px; border-bottom: 1px solid #efe9df; gap: 40px; }
.brand { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
.brand span { color: #c2410c; }
.site-nav { display: flex; gap: 26px; font-size: 14px; color: #57514a; }
.page { display: grid; grid-template-columns: 740px 1fr; gap: 40px; padding: 30px 48px 0; }
.rail { padding-top: 440px; }
.ingredients { margin-top: 28px; }
.ingredients h2 { font-size: 22px; letter-spacing: -0.02em; font-weight: 650; margin-bottom: 12px; }
.ingredients li { font-size: 15.5px; color: #3b3630; padding: 9px 0; border-top: 1px solid #efe9df; display: flex; gap: 14px; }
.ingredients li b { width: 90px; font-weight: 600; color: #1d1a16; }
.crumbs { font-size: 13px; color: #8a8278; }
h1 { font-size: 44px; line-height: 1.05; letter-spacing: -0.035em; font-weight: 650; margin: 10px 0 12px; }
.intro { font-size: 16.5px; line-height: 1.55; color: #57514a; max-width: 660px; }
.facts { display: flex; gap: 28px; margin: 18px 0 20px; font-size: 13px; color: #8a8278; }
.facts b { display: block; font-size: 15px; color: #1d1a16; font-weight: 600; margin-top: 2px; }
.hero { height: 360px; border-radius: 8px; overflow: hidden; }
.hero img, .more img { width: 100%; height: 100%; object-fit: cover; display: block; }
.jump { display: inline-flex; align-items: center; gap: 8px; margin-top: 18px; font-size: 14px; font-weight: 600; color: #c2410c; }
.rail h4 { font-size: 12px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #8a8278; margin-bottom: 14px; }
.more { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
.more .t { width: 88px; height: 64px; border-radius: 6px; overflow: hidden; flex: none; }
.more b { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; display: block; }
.more span { font-size: 13px; color: #8a8278; }

.badge { position: absolute; right: -5px; bottom: -3px; min-width: 18px; height: 15px; padding: 0 4px; border-radius: 8px; background: ${AMBER}; color: #fff; font-size: 10px; font-weight: 700; display: grid; place-items: center; box-shadow: 0 0 0 2px #fff; }

.popup { position: absolute; right: 14px; top: 6px; width: 360px; background: #17150f; color: #efece6; border-radius: 14px; border: 1px solid #2b2820;
  box-shadow: 0 24px 60px -12px rgba(30, 20, 5, 0.45), 0 8px 20px -8px rgba(30, 20, 5, 0.3); padding: 18px; }
.pp-head { display: flex; align-items: center; gap: 12px; }
.pp-title { flex: 1; }
.pp-title b { display: block; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
.pp-title span { font-size: 12.5px; color: #948e82; }
.switch { width: 40px; height: 24px; border-radius: 12px; background: ${AMBER}; position: relative; flex: none; }
.switch::after { content: ''; position: absolute; right: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; }
.status { display: flex; align-items: center; gap: 10px; margin-top: 16px; padding: 10px 12px; border-radius: 9px; background: rgba(62, 207, 142, 0.09); color: #bfe9d3; font-size: 13px; }
.status i { width: 7px; height: 7px; border-radius: 50%; background: #3ecf8e; flex: none; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
.stat { border: 1px solid #2b2820; background: #1e1b15; border-radius: 10px; padding: 12px 14px; }
.stat .k { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #948e82; }
.stat .v { font-size: 30px; font-weight: 600; letter-spacing: -0.03em; margin: 4px 0 0; line-height: 1.1; }
.stat .c { font-size: 12px; color: #948e82; }
.stat.hot .v { color: ${AMBER}; }
.site-card { margin-top: 12px; border: 1px solid #2b2820; border-radius: 10px; padding: 12px 14px; }
.site-row { display: flex; align-items: center; gap: 10px; }
.site-row .fav { width: 22px; height: 22px; border-radius: 6px; background: #c2410c; color: #fff; font-size: 12px; font-weight: 700; display: grid; place-items: center; flex: none; }
.site-row div { flex: 1; font-size: 13px; }
.site-row div b { display: block; font-weight: 550; font-size: 13.5px; }
.site-row div span { color: #948e82; font-size: 12px; }
.site-card p { font-size: 12px; color: #948e82; margin-top: 10px; line-height: 1.45; }
.btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
.btn { height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13.5px; font-weight: 550; border: 1px solid #34302a; color: #e4e0d8; }
.pp-foot { display: flex; justify-content: space-between; margin-top: 14px; font-size: 12px; color: #948e82; }
`;

export async function capture({ download, compose }) {
  const entries = await Promise.all(Object.entries(PHOTOS).map(async ([key, url]) => [key, dataUrl(await download(url))]));
  const photo = Object.fromEntries(entries);

  const more = (key, title, meta, position = 'center') => `
    <div class="more"><div class="t"><img src="${photo[key]}" style="object-position: ${position};" alt=""></div><div><b>${title}</b><span>${meta}</span></div></div>`;

  const site = `
<div class="site">
  <div class="site-head">
    <div class="brand">Salt <span>&amp;</span> Crumb</div>
    <div class="site-nav"><span>Recipes</span><span>Baking</span><span>Weeknight</span><span>Guides</span><span>About</span></div>
  </div>
  <div class="page">
    <div>
      <div class="crumbs">Baking &nbsp;/&nbsp; Cookies</div>
      <h1>Lemon butter cookies</h1>
      <p class="intro">Crisp at the edges, soft in the middle, with lemon zest rubbed into the sugar so every bite tastes bright. One bowl, no mixer, ready in under an hour.</p>
      <div class="facts"><span>Prep<b>15 min</b></span><span>Bake<b>12 min</b></span><span>Makes<b>18 cookies</b></span><span>Level<b>Easy</b></span></div>
      <div class="hero"><img src="${photo.hero}" style="object-position: 50% 60%;" alt=""></div>
      <div class="ingredients">
        <h2>Ingredients</h2>
        <ul>
          <li><b>225 g</b>Unsalted butter, softened</li>
          <li><b>200 g</b>Sugar, rubbed with the zest of 2 lemons</li>
          <li><b>1</b>Large egg, at room temperature</li>
        </ul>
      </div>
    </div>
    <div class="rail">
      <h4>More from the kitchen</h4>
      ${more('parfait', 'Strawberry yogurt cups', '10 min', '50% 40%')}
      ${more('soup', 'Weeknight vegetable soup', '35 min')}
      ${more('cake', 'Brown butter almond cake', '1 hr 10 min')}
    </div>
  </div>

  <div class="popup">
    <div class="pp-head">
      ${SHIELD(36)}
      <div class="pp-title"><b>SunBlock</b><span>Ad and tracker blocker</span></div>
      <div class="switch"></div>
    </div>
    <div class="status"><i></i>Protecting this browser in real time</div>
    <div class="stats">
      <div class="stat hot"><div class="k">This tab</div><div class="v num">23</div><div class="c">Since the page loaded</div></div>
      <div class="stat"><div class="k">All time</div><div class="v num">3,418</div><div class="c">Ads and trackers</div></div>
    </div>
    <div class="site-card">
      <div class="site-row"><span class="fav">S</span><div><b>${DOMAIN}</b><span>Blocking on this site</span></div><div class="switch" style="flex: none;"></div></div>
      <p>Pause SunBlock here if the site breaks or you want to support it with its ads.</p>
    </div>
    <div class="btns">
      <div class="btn">${icon('crosshair', { size: 15 })}Zapper</div>
      <div class="btn">${icon('settings', { size: 15 })}Settings</div>
    </div>
    <div class="pp-foot"><span>Whitelist and details in settings</span><span>v3.5</span></div>
  </div>
</div>`;

  const favicon = `<span style="flex: none; width: 16px; height: 16px; border-radius: 4px; background: #c2410c; color: #fff; font-size: 10px; font-weight: 700; display: grid; place-items: center;">S</span>`;
  const extensions = `<span class="bw-ext-btn on">${SHIELD(18)}<span class="badge num">23</span></span>`;
  const body = browserWindow({
    width: 1235,
    height: 814,
    tab: 'Lemon butter cookies',
    favicon,
    url: `${DOMAIN}/lemon-butter-cookies`,
    extensions,
    page: site,
  });

  return { png: await compose(productShell({ background: backdrop('#ecdcc2', 0.35), body, css: CSS })) };
}
