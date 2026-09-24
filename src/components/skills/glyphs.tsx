import { IconBase, type IconProps } from '@/components/icons/IconBase';

/** Line glyphs for skills that are concepts rather than brands, so no official logo exists. */

export function DatabaseGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <ellipse cx="12" cy="6" rx="7" ry="2.8" />
      <path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
    </IconBase>
  );
}

export function BracesGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 4c-2 0-2.5 1-2.5 2.5v2.8c0 1.2-.8 2.2-2 2.7 1.2.5 2 1.5 2 2.7v2.8C5.5 19 6 20 8 20M16 4c2 0 2.5 1 2.5 2.5v2.8c0 1.2.8 2.2 2 2.7-1.2.5-2 1.5-2 2.7v2.8C18.5 19 18 20 16 20" />
      <path d="M12 12h.01" />
    </IconBase>
  );
}

export function EyeGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

export function MapPinGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconBase>
  );
}
