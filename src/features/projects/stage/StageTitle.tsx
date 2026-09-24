import { IntroTitle } from '../components/IntroTitle';

/**
 * Edison's name and tagline, the page's h1. On wide screens it sits low on
 * the left, clear of the card and the panel beside it, over a soft shadow
 * from the corner. Where the panel lies along the bottom instead, it moves to
 * the top left, where the whole top edge of the stage sinks into the dark.
 * Either way bright cards passing behind never get in the way of the words.
 */
export function StageTitle() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.9),rgb(0_0_0/0.72)_50%,transparent)] lg:hidden"
      />
      <div className="gutter pointer-events-none absolute top-8 left-0 isolate lg:top-auto lg:bottom-10">
        <div
          aria-hidden="true"
          className="absolute -bottom-10 left-0 -z-10 hidden h-[calc(100%+8rem)] w-[calc(100%+10rem)] bg-[radial-gradient(ellipse_at_bottom_left,rgb(0_0_0/0.82),rgb(0_0_0/0.5)_40%,transparent_70%)] lg:block"
        />
        <IntroTitle />
      </div>
    </>
  );
}
