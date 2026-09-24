import type { ComponentType } from 'react';
import {
  siC,
  siClaude,
  siCplusplus,
  siDocker,
  siFastapi,
  siFlask,
  siFlutter,
  siGit,
  siGooglecloud,
  siHtml5,
  siJavascript,
  siLinux,
  siMeta,
  siNextdotjs,
  siNodedotjs,
  siNumpy,
  siOpenjdk,
  siPandas,
  siPostgresql,
  siPython,
  siPytorch,
  siRaspberrypi,
  siReact,
  siStripe,
  siSupabase,
  siSwift,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from 'simple-icons';
import type { IconProps } from '@/components/icons/IconBase';
import { visibleOnBlack } from '@/lib/color';
import {
  BracesGlyph,
  BranchesGlyph,
  CloudGlyph,
  CloudRunGlyph,
  CSharpGlyph,
  DatabaseGlyph,
  EditorGlyph,
  KeyGlyph,
  MoleculeGlyph,
  SparkGlyph,
  TerminalGlyph,
  VertexGlyph,
} from './glyphs';

/**
 * A filled brand mark in its brand colour, or a line glyph with a fitting colour for skills without one.
 * Colours are adjusted so every mark stays visible on the black cards.
 */
export type SkillIcon =
  | { kind: 'brand'; icon: SimpleIcon; color: string }
  | { kind: 'glyph'; Glyph: ComponentType<IconProps>; color: string };

const brand = (icon: SimpleIcon): SkillIcon => ({ kind: 'brand', icon, color: visibleOnBlack(icon.hex) });
const glyph = (Glyph: ComponentType<IconProps>, hex: string): SkillIcon => ({
  kind: 'glyph',
  Glyph,
  color: visibleOnBlack(hex),
});

const GOOGLE_BLUE = '4285F4';

/** Keyed by the exact skill names in src/content/about.ts. */
const ICONS: Record<string, SkillIcon> = {
  TypeScript: brand(siTypescript),
  JavaScript: brand(siJavascript),
  Python: brand(siPython),
  'C++': brand(siCplusplus),
  C: brand(siC),
  'C#': glyph(CSharpGlyph, 'A179DC'),
  Java: brand(siOpenjdk),
  SQL: glyph(DatabaseGlyph, '60A5FA'),
  Swift: brand(siSwift),
  'HTML/CSS': brand(siHtml5),
  React: brand(siReact),
  'Next.js': brand(siNextdotjs),
  'React Native': brand(siReact),
  'Node.js': brand(siNodedotjs),
  FastAPI: brand(siFastapi),
  Flask: brand(siFlask),
  Flutter: brand(siFlutter),
  'REST APIs': glyph(BracesGlyph, 'F4B942'),
  PostgreSQL: brand(siPostgresql),
  Supabase: brand(siSupabase),
  'Cloud SQL': glyph(DatabaseGlyph, GOOGLE_BLUE),
  PyTorch: brand(siPytorch),
  NumPy: brand(siNumpy),
  Pandas: brand(siPandas),
  'OpenAI API': glyph(SparkGlyph, '10A37F'),
  'Google Vertex AI': glyph(VertexGlyph, '669DF6'),
  'Meta SAM 3': brand(siMeta),
  'Google Cloud Platform': brand(siGooglecloud),
  'Cloud Run': glyph(CloudRunGlyph, GOOGLE_BLUE),
  AWS: glyph(CloudGlyph, 'FF9900'),
  Docker: brand(siDocker),
  Vercel: brand(siVercel),
  Stripe: brand(siStripe),
  OAuth: glyph(KeyGlyph, 'E8A33D'),
  Linux: brand(siLinux),
  Git: brand(siGit),
  'VS Code': glyph(EditorGlyph, '3FA9F5'),
  'Claude Code': brand(siClaude),
  Codex: glyph(TerminalGlyph, 'FFFFFF'),
  MDAnalysis: glyph(MoleculeGlyph, 'FF9200'),
  WESTPA: glyph(BranchesGlyph, '5DADE2'),
  'Raspberry Pi': brand(siRaspberrypi),
};

export function getSkillIcon(name: string): SkillIcon | undefined {
  return ICONS[name];
}
