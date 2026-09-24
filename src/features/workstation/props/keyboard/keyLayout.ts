/**
 * Full size ANSI layout in key units (1u is one letter key). Each row lists
 * [label, width] pairs; a label of '' is a gap. Tall keys carry a height of 2.
 */
type KeySpec = [label: string, width: number, height?: number];

interface RowSpec {
  /** Row top in units, from the top of the board. */
  y: number;
  keys: KeySpec[];
}

const ROWS: RowSpec[] = [
  {
    y: 0,
    keys: [
      ['esc', 1], ['', 1], ['f1', 1], ['f2', 1], ['f3', 1], ['f4', 1], ['', 0.5], ['f5', 1], ['f6', 1], ['f7', 1], ['f8', 1],
      ['', 0.5], ['f9', 1], ['f10', 1], ['f11', 1], ['f12', 1], ['', 0.25], ['prt', 1], ['scr', 1], ['pause', 1],
    ],
  },
  {
    y: 1.25,
    keys: [
      ['`', 1], ['1', 1], ['2', 1], ['3', 1], ['4', 1], ['5', 1], ['6', 1], ['7', 1], ['8', 1], ['9', 1], ['0', 1], ['-', 1],
      ['=', 1], ['backspace', 2], ['', 0.25], ['ins', 1], ['home', 1], ['pgup', 1], ['', 0.25], ['num', 1], ['n/', 1],
      ['n*', 1], ['n-', 1],
    ],
  },
  {
    y: 2.25,
    keys: [
      ['tab', 1.5], ['q', 1], ['w', 1], ['e', 1], ['r', 1], ['t', 1], ['y', 1], ['u', 1], ['i', 1], ['o', 1], ['p', 1], ['[', 1],
      [']', 1], ['\\', 1.5], ['', 0.25], ['del', 1], ['end', 1], ['pgdn', 1], ['', 0.25], ['n7', 1], ['n8', 1], ['n9', 1],
      ['n+', 1, 2],
    ],
  },
  {
    y: 3.25,
    keys: [
      ['caps', 1.75], ['a', 1], ['s', 1], ['d', 1], ['f', 1], ['g', 1], ['h', 1], ['j', 1], ['k', 1], ['l', 1], [';', 1],
      ["'", 1], ['enter', 2.25], ['', 3.5], ['n4', 1], ['n5', 1], ['n6', 1],
    ],
  },
  {
    y: 4.25,
    keys: [
      ['lshift', 2.25], ['z', 1], ['x', 1], ['c', 1], ['v', 1], ['b', 1], ['n', 1], ['m', 1], [',', 1], ['.', 1], ['/', 1],
      ['rshift', 2.75], ['', 1.25], ['up', 1], ['', 1.25], ['n1', 1], ['n2', 1], ['n3', 1], ['nenter', 1, 2],
    ],
  },
  {
    y: 5.25,
    keys: [
      ['lctrl', 1.25], ['lwin', 1.25], ['lalt', 1.25], ['space', 6.25], ['ralt', 1.25], ['rwin', 1.25], ['menu', 1.25],
      ['rctrl', 1.25], ['', 0.25], ['left', 1], ['down', 1], ['right', 1], ['', 0.25], ['n0', 2], ['n.', 1],
    ],
  },
];

/** Total size of the key field in units. */
export const LAYOUT_WIDTH_U = 22.5;
export const LAYOUT_DEPTH_U = 6.25;

export interface KeyCap {
  label: string;
  /** Centre of the key in units, measured from the centre of the key field. X right, Z toward the typist. */
  x: number;
  z: number;
  width: number;
  depth: number;
}

function buildKeys(): KeyCap[] {
  const keys: KeyCap[] = [];
  for (const row of ROWS) {
    let x = 0;
    for (const [label, width, height = 1] of row.keys) {
      if (label) {
        keys.push({
          label,
          x: x + width / 2 - LAYOUT_WIDTH_U / 2,
          z: row.y + height / 2 - LAYOUT_DEPTH_U / 2,
          width,
          depth: height,
        });
      }
      x += width;
    }
  }
  return keys;
}

export const KEYS: KeyCap[] = buildKeys();
