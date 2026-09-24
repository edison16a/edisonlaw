import localFont from 'next/font/local';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

/** Satoshi (Fontshare, ITF Free Font License) for headings. */
export const satoshi = localFont({
  variable: '--font-satoshi',
  display: 'swap',
  src: [
    { path: '../assets/fonts/Satoshi-400.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/Satoshi-500.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/Satoshi-700.woff2', weight: '700', style: 'normal' },
    { path: '../assets/fonts/Satoshi-900.woff2', weight: '900', style: 'normal' },
  ],
});

export const geistSans = GeistSans;
export const geistMono = GeistMono;

export const fontVariables = [satoshi.variable, geistSans.variable, geistMono.variable].join(' ');
