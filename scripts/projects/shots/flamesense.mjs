/**
 * FlameSense: predicted spread for three fires around Lake Isabella, over live NASA EONET
 * wildfire markers, with live Open-Meteo weather for the last point clicked.
 * flamesense.tech is offline, so the static site is served straight from its GitHub repository.
 * Source: https://github.com/edison16a/FlameSense (the public folder)
 */
const RAW = 'https://raw.githubusercontent.com/edison16a/FlameSense/main/public';
const HOST = 'flamesense.local';
const TYPES = {
  html: 'text/html',
  js: 'text/javascript',
  css: 'text/css',
  json: 'application/json',
  png: 'image/png',
  svg: 'image/svg+xml',
};

const VIEW = { center: [35.68, -118.5], zoom: 11 };
const CLICKS = [
  [360, 360],
  [700, 600],
  [900, 300],
];

export async function capture({ openPage, download }) {
  const serve = async (route, url) => {
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    try {
      const body = await download(`${RAW}${path}`);
      await route.fulfill({ body, contentType: TYPES[path.split('.').pop()] ?? 'application/octet-stream' });
    } catch {
      await route.fulfill({ status: 404, body: '' });
    }
  };

  const page = await openPage({ width: 1440, height: 900, scale: 2, hosts: { [HOST]: serve } });
  await page.goto(`http://${HOST}/`, { waitUntil: 'networkidle', timeout: 90_000 });
  // Keep a handle on the Leaflet map so the camera can be placed exactly.
  await page.evaluate(() =>
    window.L.Map.addInitHook(function keepMap() {
      window.captureMap = this;
    }),
  );
  await page.getByText('Predict', { exact: true }).first().click();
  await page.waitForFunction(() => window.captureMap && document.querySelector('.leaflet-marker-icon'), null, {
    timeout: 60_000,
  });
  await page.evaluate(({ center, zoom }) => window.captureMap.setView(center, zoom, { animate: false }), VIEW);
  await page.waitForTimeout(3_000);

  // Each click seeds a fire, fetches weather for that point and grows the spread in four phases.
  for (const [x, y] of CLICKS) {
    await page.mouse.click(x, y);
    await page.waitForTimeout(2_500);
  }
  await page.waitForTimeout(30_000);
  return { png: await page.screenshot() };
}
