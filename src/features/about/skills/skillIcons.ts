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
  siJavascript,
  siLinux,
  siMeta,
  siNextdotjs,
  siNodedotjs,
  siNumpy,
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
import { BracesGlyph, DatabaseGlyph } from './glyphs';

/**
 * How a skill's mark is drawn.
 * brand: a Simple Icons path in its brand colour.
 * logo: official full colour logo files in /public/skills, for brands Simple Icons no longer ships.
 *   Sources: Devicon (MIT) for C#, Java, VS Code, OAuth, HTML5 and CSS3. LobeHub Icons (MIT) for
 *   OpenAI, Codex and AWS. The Google Cloud icon library for Cloud Run, Cloud SQL and Vertex AI.
 *   MDAnalysis is traced from the project's own logo, with its black half drawn light for the dark UI.
 * letter: a single display letter, for WESTPA.
 * glyph: a line icon for concepts that have no logo at all, like SQL and REST.
 */
export type SkillIcon =
  | { kind: 'brand'; icon: SimpleIcon; color: string }
  | { kind: 'logo'; srcs: string[] }
  | { kind: 'letter'; letter: string; color: string }
  | { kind: 'glyph'; Glyph: ComponentType<IconProps>; color: string };

const brand = (icon: SimpleIcon): SkillIcon => ({ kind: 'brand', icon, color: visibleOnBlack(icon.hex) });
const logo = (...names: string[]): SkillIcon => ({ kind: 'logo', srcs: names.map((name) => `/skills/${name}.svg`) });
const glyph = (Glyph: ComponentType<IconProps>, hex: string): SkillIcon => ({
  kind: 'glyph',
  Glyph,
  color: visibleOnBlack(hex),
});

/** Keyed by the exact skill names in src/content/about.ts. */
const ICONS: Record<string, SkillIcon> = {
  TypeScript: brand(siTypescript),
  JavaScript: brand(siJavascript),
  Python: brand(siPython),
  'C++': brand(siCplusplus),
  C: brand(siC),
  'C#': logo('csharp'),
  Java: logo('java'),
  SQL: glyph(DatabaseGlyph, '60A5FA'),
  Swift: brand(siSwift),
  'HTML/CSS': logo('html5', 'css3'),
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
  'Cloud SQL': logo('cloudsql'),
  PyTorch: brand(siPytorch),
  NumPy: brand(siNumpy),
  Pandas: brand(siPandas),
  'OpenAI API': logo('openai'),
  'Google Vertex AI': logo('vertexai'),
  'Meta SAM 3': brand(siMeta),
  'Google Cloud Platform': brand(siGooglecloud),
  'Cloud Run': logo('cloudrun'),
  AWS: logo('aws'),
  Docker: brand(siDocker),
  Vercel: brand(siVercel),
  Stripe: brand(siStripe),
  OAuth: logo('oauth'),
  Linux: brand(siLinux),
  Git: brand(siGit),
  'VS Code': logo('vscode'),
  'Claude Code': brand(siClaude),
  Codex: logo('codex'),
  MDAnalysis: logo('mdanalysis'),
  WESTPA: { kind: 'letter', letter: 'W', color: visibleOnBlack('5DADE2') },
  'Raspberry Pi': brand(siRaspberrypi),
};

export function getSkillIcon(name: string): SkillIcon | undefined {
  return ICONS[name];
}
