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

/** A filled single colour brand mark, or a line glyph for skills without one. */
export type SkillIcon = { kind: 'brand'; icon: SimpleIcon } | { kind: 'glyph'; Glyph: ComponentType<IconProps> };

const brand = (icon: SimpleIcon): SkillIcon => ({ kind: 'brand', icon });
const glyph = (Glyph: ComponentType<IconProps>): SkillIcon => ({ kind: 'glyph', Glyph });

/** Keyed by the exact skill names in src/content/about.ts. */
const ICONS: Record<string, SkillIcon> = {
  TypeScript: brand(siTypescript),
  JavaScript: brand(siJavascript),
  Python: brand(siPython),
  'C++': brand(siCplusplus),
  C: brand(siC),
  'C#': glyph(CSharpGlyph),
  Java: brand(siOpenjdk),
  SQL: glyph(DatabaseGlyph),
  Swift: brand(siSwift),
  'HTML/CSS': brand(siHtml5),
  React: brand(siReact),
  'Next.js': brand(siNextdotjs),
  'React Native': brand(siReact),
  'Node.js': brand(siNodedotjs),
  FastAPI: brand(siFastapi),
  Flask: brand(siFlask),
  Flutter: brand(siFlutter),
  'REST APIs': glyph(BracesGlyph),
  PostgreSQL: brand(siPostgresql),
  Supabase: brand(siSupabase),
  'Cloud SQL': glyph(DatabaseGlyph),
  PyTorch: brand(siPytorch),
  NumPy: brand(siNumpy),
  Pandas: brand(siPandas),
  'OpenAI API': glyph(SparkGlyph),
  'Google Vertex AI': glyph(VertexGlyph),
  'Meta SAM 3': brand(siMeta),
  'Google Cloud Platform': brand(siGooglecloud),
  'Cloud Run': glyph(CloudRunGlyph),
  AWS: glyph(CloudGlyph),
  Docker: brand(siDocker),
  Vercel: brand(siVercel),
  Stripe: brand(siStripe),
  OAuth: glyph(KeyGlyph),
  Linux: brand(siLinux),
  Git: brand(siGit),
  'VS Code': glyph(EditorGlyph),
  'Claude Code': brand(siClaude),
  Codex: glyph(TerminalGlyph),
  MDAnalysis: glyph(MoleculeGlyph),
  WESTPA: glyph(BranchesGlyph),
  'Raspberry Pi': brand(siRaspberrypi),
};

export function getSkillIcon(name: string): SkillIcon | undefined {
  return ICONS[name];
}
