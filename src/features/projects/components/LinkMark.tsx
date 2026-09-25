import { siAppstore, siGithub, siGooglechrome } from 'simple-icons';
import { IconBase } from '@/components/icons/IconBase';
import type { LinkKind } from './linkKind';

const BRANDS = {
  github: siGithub,
  appStore: siAppstore,
  chromeWebStore: siGooglechrome,
} as const;

/**
 * The logo at the start of a project link: GitHub, the App Store or the Chrome
 * Web Store (shown as the Chrome logo), or a globe for a website. Drawn in the button's text colour.
 */
export function LinkMark({ kind, size = 16 }: { kind: LinkKind; size?: number }) {
  if (kind === 'site') {
    return (
      <IconBase size={size} strokeWidth={1.6}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.75 5.6 3.75 9S14.5 18.4 12 21c-2.5-2.6-3.75-5.6-3.75-9S9.5 5.6 12 3z" />
      </IconBase>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={BRANDS[kind].path} />
    </svg>
  );
}
