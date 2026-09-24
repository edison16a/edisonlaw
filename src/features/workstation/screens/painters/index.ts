import type { PainterFactory, ScreenId } from '../types';
import { claudeCode } from './claudeCode';
import { codex } from './codex';
import { apps } from './experience/apps';
import { cisco } from './experience/cisco';
import { nanoscience } from './experience/nanoscience';
import { optagon } from './experience/optagon';
import { stanford } from './experience/stanford';
import { tanius } from './experience/tanius';
import { ultrasound } from './experience/ultrasound';
import { westpa } from './experience/westpa';
import { vscode } from './vscode';

/** Every screen id and the painter that draws it. */
export const painters: Record<ScreenId, PainterFactory> = {
  'claude-code': claudeCode,
  codex,
  vscode,
  optagon,
  ultrasound,
  westpa,
  nanoscience,
  tanius,
  cisco,
  stanford,
  apps,
};
