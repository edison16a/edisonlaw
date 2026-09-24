import type { SVGProps } from 'react';

/** Edison's mark: an E drawn as three rounded bars, the middle one shifted left. */
export function Logo({ size = 20, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * (884 / 1074))}
      viewBox="0 0 1074 884"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <rect x="257" y="0" width="817" height="267" rx="133.5" />
      <rect x="0" y="312" width="818" height="266" rx="133" />
      <rect x="257" y="617" width="817" height="267" rx="133.5" />
    </svg>
  );
}
