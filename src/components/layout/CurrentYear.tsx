'use client';

/** The year on the visitor's clock, so a static build never shows a stale copyright year. */
export function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
