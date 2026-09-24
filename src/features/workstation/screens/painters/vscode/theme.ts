/** VS Code Dark Modern workbench colours. */
export const VSCODE_THEME = {
  chrome: '#181818',
  editor: '#1f1f1f',
  border: '#2b2b2b',
  accent: '#0078d4',
  text: '#cccccc',
  bright: '#ffffff',
  muted: '#9d9d9d',
  faint: '#6e7681',
  icon: '#868686',
  selection: '#37373d',
  lineHighlight: '#282828',
  indentGuide: '#404040',
  activeIndentGuide: '#707070',
  textSelection: '#264f78',
  caret: '#aeafad',
  modified: '#e2c08d',
  untracked: '#73c991',
  widget: '#202020',
  widgetBorder: '#454545',
  suggestSelected: '#04395e',
  suggestMatch: '#2aaaff',
  commandCenter: '#2a2a2a',
} as const;

/** Seti file icon colours, keyed by extension. */
export const FILE_COLORS: Record<string, string> = {
  tsx: '#519aba',
  ts: '#519aba',
  json: '#cbcb41',
  mjs: '#cbcb41',
  frag: '#8dc149',
  css: '#519aba',
  md: '#519aba',
};
