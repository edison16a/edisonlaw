import { site } from '@/content/site';

/** Closes the page. The right padding keeps the text clear of the fixed sound toggle. */
export function Footer() {
  return (
    <footer className="gutter flex flex-col gap-1 border-t border-grey-900 py-10 text-xs text-grey-400 sm:flex-row sm:justify-between sm:pr-28 lg:pr-32">
      <p>
        © {new Date().getFullYear()} {site.name}
      </p>
      <p>Built with Next.js and React Three Fiber.</p>
    </footer>
  );
}
