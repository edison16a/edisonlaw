import type { PainterFactory, ScreenId } from '../types';
import { claudeCode } from './claudeCode';
import { codex } from './codex';
import { nanoscience } from './experience/nanoscience';
import { optagon } from './experience/optagon';
import { placeholder } from './placeholder';
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
  tanius: placeholder('tanius'),
  cisco: placeholder('cisco'),
  stanford: placeholder('stanford'),
  apps: placeholder('apps'),
};
