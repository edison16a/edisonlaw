/** Where a project link goes, judged by its host, so its button can carry the right logo. */
export type LinkKind = 'github' | 'appStore' | 'chromeWebStore' | 'site';

const hostOf = (href: string) => {
  try {
    return new URL(href);
  } catch {
    return null;
  }
};

/** True for `host` itself and any of its subdomains. */
const isHost = (hostname: string, host: string) => hostname === host || hostname.endsWith(`.${host}`);

export function linkKind(href: string): LinkKind {
  const url = hostOf(href);
  if (!url) return 'site';
  const host = url.hostname.toLowerCase();
  if (isHost(host, 'github.com')) return 'github';
  if (host === 'apps.apple.com' || host === 'itunes.apple.com') return 'appStore';
  if (host === 'chromewebstore.google.com') return 'chromeWebStore';
  if (host === 'chrome.google.com' && url.pathname.startsWith('/webstore')) return 'chromeWebStore';
  return 'site';
}
