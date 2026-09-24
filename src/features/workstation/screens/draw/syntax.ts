import type { Span } from './terminal';

/**
 * A small highlighter for the TSX and GLSL shown on the screens. It only has to handle code we
 * wrote ourselves, so a handful of rules gets VS Code's colouring close enough to read as real.
 */

export type Language = 'tsx' | 'glsl';

export type TokenKind =
  | 'plain'
  | 'control'
  | 'keyword'
  | 'type'
  | 'function'
  | 'variable'
  | 'property'
  | 'constant'
  | 'string'
  | 'number'
  | 'comment'
  | 'tag'
  | 'attribute'
  | 'punctuation'
  | 'bracket';

export interface Token {
  text: string;
  kind: TokenKind;
  /** Nesting depth, for bracket pair colours. */
  depth?: number;
}

/** VS Code Dark Modern token colours. */
export const DARK_MODERN: Record<TokenKind, string> = {
  plain: '#cccccc',
  control: '#c586c0',
  keyword: '#569cd6',
  type: '#4ec9b0',
  function: '#dcdcaa',
  variable: '#9cdcfe',
  property: '#9cdcfe',
  constant: '#4fc1ff',
  string: '#ce9178',
  number: '#b5cea8',
  comment: '#6a9955',
  tag: '#569cd6',
  attribute: '#9cdcfe',
  punctuation: '#808080',
  bracket: '#ffd700',
};

const BRACKET_COLORS = ['#ffd700', '#da70d6', '#179fff'];

const CONTROL = new Set(
  'import export from return if else for while switch case break continue default as await throw try catch new'.split(' '),
);
const KEYWORDS: Record<Language, Set<string>> = {
  tsx: new Set(
    'const let var function interface type class extends implements enum typeof keyof in of void this true false null undefined readonly async'.split(
      ' ',
    ),
  ),
  glsl: new Set(
    'uniform varying attribute in out inout precision highp mediump lowp const void float int bool vec2 vec3 vec4 mat2 mat3 mat4 sampler2D true false'.split(
      ' ',
    ),
  ),
};
const BUILTIN_TYPES = new Set(['string', 'number', 'boolean', 'unknown', 'never']);

const PATTERN = /(\/\/.*$)|(\/\*.*?(?:\*\/|$))|('(?:\\.|[^'])*'|"(?:\\.|[^"])*"|`(?:\\.|[^`])*`)|(#\w+)|(\d[\d_.]*(?:e[+-]?\d+)?)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g;

interface State {
  inComment: boolean;
  inTag: boolean;
  depth: number;
}

function classifyWord(word: string, line: string, end: number, previous: Token | undefined, language: Language, state: State): TokenKind {
  const after = line.slice(end).trimStart();
  if (state.inTag) {
    if (previous?.text === '<' || previous?.text === '/') return /^[A-Z]/.test(word) ? 'type' : 'tag';
    if (after.startsWith('=')) return 'attribute';
  }
  if (CONTROL.has(word)) return 'control';
  if (KEYWORDS[language].has(word)) return 'keyword';
  if (BUILTIN_TYPES.has(word)) return 'type';
  if (previous?.text === '.') return after.startsWith('(') ? 'function' : 'property';
  if (after.startsWith('(') || (language === 'tsx' && /^<[A-Z][\w,\s]*>\(/.test(after))) return 'function';
  if (/^[A-Z][A-Z0-9_]+$/.test(word)) return 'constant';
  if (/^[A-Z]/.test(word)) return 'type';
  if (word.startsWith('gl_')) return 'constant';
  return 'variable';
}

function tokenizeLine(line: string, language: Language, state: State): Token[] {
  const tokens: Token[] = [];
  let rest = line;
  if (state.inComment) {
    const close = line.indexOf('*/');
    const text = close === -1 ? line : line.slice(0, close + 2);
    tokens.push({ text, kind: 'comment' });
    if (close === -1) return tokens;
    state.inComment = false;
    rest = line.slice(close + 2);
  }
  const offset = line.length - rest.length;
  let previous: Token | undefined;
  for (const match of rest.matchAll(PATTERN)) {
    const [text, lineComment, blockComment, string, directive, number, word] = match;
    const end = offset + (match.index ?? 0) + text.length;
    let token: Token;
    if (lineComment || blockComment) {
      token = { text, kind: 'comment' };
      if (blockComment && !blockComment.endsWith('*/')) state.inComment = true;
    } else if (string) token = { text, kind: 'string' };
    else if (directive) token = { text, kind: 'control' };
    else if (number) token = { text, kind: 'number' };
    else if (word) token = { text, kind: classifyWord(word, line, end, previous, language, state) };
    else if (/\s/.test(text)) token = { text, kind: 'plain' };
    else token = punctuation(text, line, end, previous, state);
    tokens.push(token);
    if (token.text.trim()) previous = token;
  }
  return tokens;
}

function punctuation(text: string, line: string, end: number, previous: Token | undefined, state: State): Token {
  if ('([{'.includes(text)) return { text, kind: 'bracket', depth: state.depth++ };
  if (')]}'.includes(text)) return { text, kind: 'bracket', depth: (state.depth = Math.max(0, state.depth - 1)) };
  // A "<" starts a JSX tag unless it follows a value, where it is a comparison or generic.
  const afterValue = previous && ['variable', 'property', 'number', 'type', 'function'].includes(previous.kind);
  if (text === '<' && !afterValue && /^\/?[A-Za-z]/.test(line.slice(end))) {
    state.inTag = true;
    return { text, kind: 'punctuation' };
  }
  if (state.inTag && text === '>') {
    state.inTag = false;
    return { text, kind: 'punctuation' };
  }
  if (state.inTag && text === '/') return { text, kind: 'punctuation' };
  return { text, kind: 'plain' };
}

/** Tokenizes a whole file so comments and brackets carry across lines. */
export function tokenize(source: string[], language: Language): Token[][] {
  const state: State = { inComment: false, inTag: false, depth: 0 };
  return source.map((line) => tokenizeLine(line, language, state));
}

/** Coloured spans for the terminal grid renderer. */
export function toSpans(tokens: Token[], theme: Record<TokenKind, string> = DARK_MODERN): Span[] {
  return tokens.map((token) => ({
    text: token.text,
    color: token.kind === 'bracket' ? BRACKET_COLORS[(token.depth ?? 0) % BRACKET_COLORS.length] : theme[token.kind],
  }));
}
