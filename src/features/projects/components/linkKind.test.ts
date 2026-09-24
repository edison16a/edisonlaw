import { describe, expect, it } from 'vitest';
import { projects } from '@/content/projects';
import { linkKind } from './linkKind';

describe('linkKind', () => {
  it('knows code on GitHub', () => {
    expect(linkKind('https://github.com/edison16a/SafeEats')).toBe('github');
    expect(linkKind('https://www.github.com/westpa/westpa')).toBe('github');
  });

  it('knows the App Store and the Chrome Web Store', () => {
    expect(linkKind('https://apps.apple.com/us/app/safeeats-food-scanner/id6739729515')).toBe('appStore');
    expect(linkKind('https://chromewebstore.google.com/detail/abc/xyz')).toBe('chromeWebStore');
    expect(linkKind('https://chrome.google.com/webstore/detail/abc')).toBe('chromeWebStore');
  });

  it('treats everything else as a website, even a look alike host', () => {
    expect(linkKind('https://backbond.net')).toBe('site');
    expect(linkKind('https://notgithub.com/x')).toBe('site');
    expect(linkKind('https://chrome.google.com/intl/en/chrome')).toBe('site');
    expect(linkKind('not a url')).toBe('site');
  });

  it('gives the right logo to the links in the content', () => {
    const safeEats = projects.find((project) => project.id === 'safeeats');
    expect(safeEats?.links.map((link) => linkKind(link.href))).toEqual(['appStore', 'github']);
  });
});
