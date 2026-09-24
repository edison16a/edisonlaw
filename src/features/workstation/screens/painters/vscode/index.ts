import { VIEW_HEIGHT, VIEW_WIDTH, zoomIn } from '../../draw/view';
import type { PainterFactory } from '../../types';
import { ACTIVITY_WIDTH, drawActivityBar, drawStatusBar, drawTitleBar, STATUS_HEIGHT, TITLE_HEIGHT } from './chrome';
import { drawEditor } from './editor';
import { drawExplorer } from './explorer';
import { PANEL_HEIGHT, SIDEBAR_WIDTH } from './layout';
import { drawPanel } from './panel';
import { EDITOR_STILL_TIME, editorView } from './playback';
import { BREADCRUMB_HEIGHT, drawBreadcrumbs, drawTabs, TABS_HEIGHT } from './tabs';

/** VS Code in Dark Modern, zoomed in, with this repo open, typing a line into the spiral card. */
export const vscode: PainterFactory = () => ({
  stillTime: EDITOR_STILL_TIME,
  frameKey: (time) => editorView(time).key,
  paint(ctx, time) {
    const view = editorView(time);
    zoomIn(ctx);
    const bodyTop = TITLE_HEIGHT;
    const bodyHeight = VIEW_HEIGHT - TITLE_HEIGHT - STATUS_HEIGHT;
    const groupX = ACTIVITY_WIDTH + SIDEBAR_WIDTH;
    const group = { x: groupX, y: bodyTop, w: VIEW_WIDTH - groupX, h: bodyHeight };
    const editorTop = bodyTop + TABS_HEIGHT + BREADCRUMB_HEIGHT;

    drawTitleBar(ctx);
    drawActivityBar(ctx);
    drawExplorer(ctx, { x: ACTIVITY_WIDTH, y: bodyTop, w: SIDEBAR_WIDTH, h: bodyHeight });
    drawTabs(ctx, group, view.dirty);
    drawBreadcrumbs(ctx, group);
    drawEditor(ctx, { x: groupX, y: editorTop, w: group.w, h: bodyTop + bodyHeight - PANEL_HEIGHT - editorTop }, view);
    drawPanel(ctx, { x: groupX, y: bodyTop + bodyHeight - PANEL_HEIGHT, w: group.w, h: PANEL_HEIGHT }, view.saves);
    drawStatusBar(ctx, { line: view.caret.line + 1, col: view.caret.col + 1 });
  },
});
