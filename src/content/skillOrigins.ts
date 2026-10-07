import { experience } from './experience';
import { projects } from './projects';

/** Where a skill came from: a project in the spiral or a job on the timeline. */
export type SkillOrigin = { kind: 'project' | 'experience'; id: string };

/**
 * Skills that no project lists in its stack, and the work they came from. Every other skill
 * belongs to the first project that builds with it.
 */
const FROM_WORK: Record<string, SkillOrigin> = {
  C: { kind: 'project', id: 'autolab' },
  Java: { kind: 'experience', id: 'app-developer' },
  'React Native': { kind: 'experience', id: 'app-developer' },
  SQL: { kind: 'experience', id: 'optagon' },
  PostgreSQL: { kind: 'experience', id: 'optagon' },
  'Google Cloud Platform': { kind: 'experience', id: 'optagon' },
  'Cloud Run': { kind: 'experience', id: 'optagon' },
  Docker: { kind: 'experience', id: 'optagon' },
  'REST APIs': { kind: 'experience', id: 'optagon' },
  FastAPI: { kind: 'experience', id: 'optagon' },
  Flask: { kind: 'experience', id: 'enhanced-ultrasound' },
  Supabase: { kind: 'experience', id: 'enhanced-ultrasound' },
  PyTorch: { kind: 'experience', id: 'enhanced-ultrasound' },
  'Google Vertex AI': { kind: 'experience', id: 'enhanced-ultrasound' },
  'Meta SAM 3': { kind: 'experience', id: 'enhanced-ultrasound' },
  Linux: { kind: 'experience', id: 'enhanced-ultrasound' },
  Flutter: { kind: 'experience', id: 'tanius' },
  Pandas: { kind: 'experience', id: 'tanius' },
  Git: { kind: 'experience', id: 'westpa' },
  'Canvas 2D rendering': { kind: 'project', id: 'photo-craft' },
  'VS Code': { kind: 'project', id: 'content-machine' },
  Codex: { kind: 'project', id: 'content-machine' },
};

/** Skills too short to find by name in a job's text. */
const MIN_NAME = 3;

function mentionedIn(text: string, skill: string) {
  const name = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\w])${name}($|[^\\w])`, 'i').test(text);
}

/**
 * Every project and job a skill came from, the main one first: the work it was filed under,
 * then each project that builds with it, then each job whose text names it.
 */
export function skillOrigins(skill: string): SkillOrigin[] {
  const found: SkillOrigin[] = [];
  if (FROM_WORK[skill]) found.push(FROM_WORK[skill]);
  for (const item of projects) if (item.stack.includes(skill)) found.push({ kind: 'project', id: item.id });
  if (skill.length >= MIN_NAME) {
    for (const item of experience) {
      if (mentionedIn(`${item.company} ${item.points.join(' ')}`, skill)) found.push({ kind: 'experience', id: item.id });
    }
  }
  return found.filter((origin, i) => found.findIndex((other) => other.kind === origin.kind && other.id === origin.id) === i);
}

/** The main project or job a skill came from, or undefined for a skill nothing lists. */
export function skillOrigin(skill: string): SkillOrigin | undefined {
  return skillOrigins(skill)[0];
}

/** What to call an origin: a project's name or the company of a job. */
export function originLabel(origin: SkillOrigin) {
  const list = origin.kind === 'project' ? projects : experience;
  const item = list.find((entry) => entry.id === origin.id);
  return item ? ('name' in item ? item.name : item.company) : origin.id;
}

/** Every origin that must exist, for tests. */
export const originIds = {
  project: new Set(projects.map((item) => item.id)),
  experience: new Set(experience.map((item) => item.id)),
};
