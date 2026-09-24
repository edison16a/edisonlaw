import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="gutter flex min-h-dvh flex-col items-start justify-center gap-6">
      <span className="font-mono text-xs tracking-widest text-grey-400">404</span>
      <h1 className="text-5xl font-bold sm:text-7xl">Nothing here.</h1>
      <p className="max-w-md text-grey-400">This page does not exist. The spiral, the desk and everything else live on the home page.</p>
      <Link href="/" className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-85">
        Back home
      </Link>
    </main>
  );
}
