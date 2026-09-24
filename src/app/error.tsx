'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

/** Last resort if something on the page throws past every section's own fallback. */
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="gutter flex min-h-dvh flex-col items-start justify-center gap-6 bg-black">
      <span className="text-xs font-medium tracking-[0.2em] text-grey-400">ERROR</span>
      <h1 className="text-5xl font-bold sm:text-7xl">Something broke.</h1>
      <p className="max-w-md text-grey-300">
        Part of this page failed to load. Try again, or reload the page if it keeps happening.
      </p>
      <button
        type="button"
        onClick={retry}
        className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-85"
      >
        Try again
      </button>
    </main>
  );
}
