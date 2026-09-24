/**
 * Headless Chromium and a download client for the capture script.
 *
 * Behind an HTTPS proxy that re-signs TLS (like the sandbox these photos were made in), Chromium
 * does not trust the proxy's certificate but Node does, through NODE_EXTRA_CA_CERTS. So when
 * HTTPS_PROXY is set, every page request is fetched by Node and handed back to the page. That
 * keeps certificate checks on instead of switching them off in the browser.
 */
import { chromium, request } from 'playwright';

const PROXY = process.env.HTTPS_PROXY;

/** SwiftShader lets WebGL pages (Backbond's hero) render without a GPU. */
const LAUNCH_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';

export async function launchBrowser() {
  return chromium.launch({ args: LAUNCH_ARGS, ...(PROXY ? { proxy: { server: PROXY } } : {}) });
}

/**
 * Opens a page in a fresh context.
 * `hosts` maps a made up host name to a handler, so a static site can be served from anywhere.
 */
export async function openPage(browser, options = {}) {
  const { width = 1440, height = 900, scale = 2, colorScheme = 'light', hosts = {} } = options;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    colorScheme,
    userAgent: USER_AGENT,
  });

  if (PROXY || Object.keys(hosts).length > 0) {
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (hosts[url.host]) return hosts[url.host](route, url);
      if (!PROXY || !url.protocol.startsWith('http')) return route.continue();
      // Proxied connections drop now and then, and one missing script chunk can crash a page.
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await route.fulfill({ response: await route.fetch({ maxRedirects: 0 }) });
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      return route.abort();
    });
  }

  const page = await context.newPage();
  page.on('pageerror', (error) => console.warn(`    page error: ${error.message.slice(0, 160)}`));
  return { context, page };
}

/** A small HTTP client for source images, with the same proxy and certificate handling. */
export async function createDownloader() {
  const api = await request.newContext({
    ...(PROXY ? { proxy: { server: PROXY } } : {}),
    extraHTTPHeaders: { 'user-agent': USER_AGENT },
  });

  async function get(url, headers = {}) {
    const response = await api.get(url, { headers, timeout: 90_000 });
    if (!response.ok()) throw new Error(`GET ${url} failed with ${response.status()}`);
    return response.body();
  }

  return { get, dispose: () => api.dispose() };
}
