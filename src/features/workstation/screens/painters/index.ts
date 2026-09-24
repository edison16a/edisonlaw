import type { PainterFactory, ScreenId } from '../types';
import { claudeCode } from './claudeCode';
import { codex } from './codex';
import { placeholder } from './placeholder';
import { vscode } from './vscode';

/** Every screen id and the painter that draws it. */
export const painters: Record<ScreenId, PainterFactory> = {
  'claude-code': claudeCode,
  codex,
  vscode,
  optagon: placeholder('optagon'),
  ultrasound: placeholder('ultrasound'),
  westpa: placeholder('westpa'),
  nanoscience: placeholder('nanoscience'),
  tanius: placeholder('tanius'),
  cisco: placeholder('cisco'),
  stanford: placeholder('stanford'),
  apps: placeholder('apps'),
};
