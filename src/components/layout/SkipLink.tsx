/** First focusable element on the page. Hidden until a keyboard user tabs to it. */
export function SkipLink() {
  return (
    <a
      href="#experience"
      className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform focus:translate-y-0"
    >
      Skip the project spiral
    </a>
  );
}
