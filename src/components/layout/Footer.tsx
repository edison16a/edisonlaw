import { site } from '@/content/site';

export function Footer() {
  return (
    <footer className="flex flex-col gap-1 border-t border-grey-900 pt-8 text-xs text-grey-400 sm:flex-row sm:justify-between">
      <p suppressHydrationWarning>
        © {new Date().getFullYear()} {site.name}
      </p>
      <p>Built with Next.js and React Three Fiber.</p>
    </footer>
  );
}
