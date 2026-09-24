import { site } from '@/content/site';

/**
 * Closes the page. The right padding keeps the text clear of the fixed sound toggle. It spells out
 * its padding instead of using gutter, which would override the wider right side.
 */
export function Footer() {
  return (
    <footer className="flex flex-col gap-1 border-t border-grey-900 px-5 py-10 text-xs text-grey-400 sm:flex-row sm:justify-between sm:pr-28 sm:pl-8 lg:pr-32 lg:pl-12">
      <p>
        © {new Date().getFullYear()} {site.name}
      </p>
      <p>Built with Next.js and React Three Fiber.</p>
    </footer>
  );
}
