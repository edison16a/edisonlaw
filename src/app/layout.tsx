import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { site } from '@/content/site';
import { fontVariables } from './fonts';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}, software engineer`, template: `%s | ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: 'website',
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.description,
    locale: site.locale,
  },
  twitter: { card: 'summary_large_image', title: site.name, description: site.description },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
