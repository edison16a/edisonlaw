import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../types';

/**
 * VS Code runs zoomed in, like its window zoom setting, so the editor still reads when the
 * monitor shows the canvas at a fifth of its size. The workbench is laid out in this smaller
 * logical view, 800 by 450, and scaled up to fill the canvas.
 */
export const ZOOM = 1.6;
export const VIEW_WIDTH = SCREEN_WIDTH / ZOOM;
export const VIEW_HEIGHT = SCREEN_HEIGHT / ZOOM;

export const SIDEBAR_WIDTH = 200;
export const PANEL_HEIGHT = 100;
