/**
 * Near-black backdrop behind the spiral: a faint square grid that only shows
 * inside a wide soft ellipse, and a very faint round glow at the centre.
 */
export function StageBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grey-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_58%_at_50%_50%,rgb(255_255_255/0.028),transparent_72%)]" />
      <div
        className="absolute inset-0 bg-center [mask-image:radial-gradient(ellipse_60%_62%_at_50%_50%,black_35%,transparent_100%)]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(255 255 255 / 0.065) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.065) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 aspect-square w-[min(88vh,70vw)] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.025),transparent_68%)]" />
    </div>
  );
}
