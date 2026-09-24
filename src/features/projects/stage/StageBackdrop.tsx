/**
 * Plain black behind the spiral, with one very faint round glow at the centre
 * that gives the strand a little depth to sit in.
 */
export function StageBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black">
      <div className="absolute top-1/2 left-1/2 aspect-square w-[min(96vh,78vw)] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.035),transparent_66%)]" />
    </div>
  );
}
