import { IntroTitle } from '../components/IntroTitle';

/**
 * Edison's name and tagline, the page's h1. On wide screens it sits low on
 * the left, clear of the card and the panel beside it. Where the panel lies
 * along the bottom instead, it moves to the top left. A soft shadow from the
 * corner keeps the words readable when a bright card passes behind them.
 */
export function StageTitle() {
  return (
    <div className="gutter pointer-events-none absolute top-8 left-0 isolate lg:top-auto lg:bottom-10">
      <div
        aria-hidden="true"
        className="absolute -top-16 left-0 -z-10 h-[calc(100%+8rem)] w-[calc(100%+10rem)] bg-[radial-gradient(ellipse_at_top_left,rgb(0_0_0/0.82),rgb(0_0_0/0.5)_40%,transparent_70%)] lg:top-auto lg:-bottom-10 lg:bg-[radial-gradient(ellipse_at_bottom_left,rgb(0_0_0/0.82),rgb(0_0_0/0.5)_40%,transparent_70%)]"
      />
      <IntroTitle />
    </div>
  );
}
