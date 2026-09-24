import { IconBase, type IconProps } from '@/components/icons/IconBase';

/**
 * Line glyphs for skills that have no single colour brand mark available.
 * Deliberately generic so no trademark is imitated.
 */

export function DatabaseGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <ellipse cx="12" cy="6" rx="7" ry="2.8" />
      <path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
    </IconBase>
  );
}

export function CSharpGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2.5 20.5 7.3v9.4L12 21.5l-8.5-4.8V7.3z" />
      <path d="M11 9.3a3.2 3.2 0 1 0 0 5.4M14.5 10v4M16.5 10v4M13.8 11.2h3.4M13.8 12.8h3.4" />
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

export function SparkGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z" />
    </IconBase>
  );
}

export function VertexGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 6l7 12 7-12" />
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
    </IconBase>
  );
}

export function CloudGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 18a4.5 4.5 0 0 1-.6-9 5.8 5.8 0 0 1 11.2 1.6A3.8 3.8 0 0 1 17 18z" />
    </IconBase>
  );
}

export function CloudRunGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 18a4.5 4.5 0 0 1-.6-9 5.8 5.8 0 0 1 11.2 1.6A3.8 3.8 0 0 1 17 18z" />
      <path d="m10.5 11 3.5 2-3.5 2z" />
    </IconBase>
  );
}

export function KeyGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 8.7-8.7M16.5 6.5l2.5 2.5M14 9l2 2" />
    </IconBase>
  );
}

export function EditorGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="m10 10-2.5 2.5L10 15M14 10l2.5 2.5L14 15" />
    </IconBase>
  );
}

export function TerminalGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="m7.5 10 2.5 2.5L7.5 15M12.5 15.5h4" />
    </IconBase>
  );
}

export function MoleculeGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="6" cy="17" r="2.5" />
      <circle cx="12" cy="7" r="2.5" />
      <circle cx="18" cy="17" r="2.5" />
      <path d="m7.3 14.8 3.4-5.6M13.3 9.2l3.4 5.6M8.5 17h7" />
    </IconBase>
  );
}

export function BranchesGlyph(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 12h5c2 0 3-1.5 4-3.5S14 5 16.5 5H21M8 12h13M8 12c2 0 3 1.5 4 3.5s2 3.5 4.5 3.5H21" />
    </IconBase>
  );
}
