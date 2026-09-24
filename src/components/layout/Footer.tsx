import { site } from '@/content/site';
import { CurrentYear } from './CurrentYear';

/** Closes the page. */
export function Footer() {
  return (
    <footer className="gutter flex flex-col gap-1 py-10 text-xs text-grey-400 sm:flex-row sm:justify-between">
      <p>
        © <CurrentYear /> {site.name}
      </p>
      <p>Built with Next.js and React Three Fiber.</p>
    </footer>
  );
}
