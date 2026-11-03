// The shapes of the team puzzle (emfc.es/puzzle) and the table it lies on. Pure functions, no React.
// Every piece is cut from the same set of edges, so neighbours always fit: an edge is made once,
// and the piece on its other side uses it backwards.

/** The board's width in its own units. Heights follow the photo. */
export const W0 = 1000;

export type Level = { pieces: number; cols: number; rows: number };
export type Pt = [number, number];

export type Piece = {
  /** Its place on the board, counted from the top left. */
  col: number;
  row: number;
  /** Its outline, in board units. */
  d: string;
  /** The box around the piece and its knobs, in board units. */
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Puzzle = { cols: number; rows: number; cell: { w: number; h: number }; margin: number; pieces: Piece[] };

/** A small seeded random generator (mulberry32): one number gives a game its shapes and its spread. */
export function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One cubic curve: its two control points and where it ends. */
type Seg = [number, number, number, number, number, number];
type Edge = { from: Pt; segs: Seg[] };

/**
 * A knob, centred on 0, in units of the piece's shorter side, standing up from the edge (+v): a
 * pinched neck, then a round head about 0.23 wide and 0.28 high. Each entry is a cubic curve
 * (control, control, end), smooth where they meet.
 */
const KNOB_START: Pt = [-0.16, 0];
const KNOB: [Pt, Pt, Pt][] = [
  [[-0.05, 0], [-0.025, 0.075], [-0.07, 0.1]],
  [[-0.16, 0.15], [-0.12, 0.28], [0, 0.28]],
  [[0.12, 0.28], [0.16, 0.15], [0.07, 0.1]],
  [[0.025, 0.075], [0.05, 0], [0.16, 0]],
];
/** How far a knob can reach past its edge, as a share of the shorter side (with its random size). */
const MARGIN = 0.36;

function straight(from: Pt, to: Pt): Seg {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  return [from[0] + dx / 3, from[1] + dy / 3, from[0] + (dx * 2) / 3, from[1] + (dy * 2) / 3, to[0], to[1]];
}

/** An inside edge from one corner to the next, with a knob on a random side, size, place and lean. */
function knobEdge(from: Pt, to: Pt, size: number, rand: () => number): Edge {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const along: Pt = [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
  const side = rand() < 0.5 ? 1 : -1;
  const normal: Pt = [-along[1] * side, along[0] * side];
  const scale = size * (0.9 + rand() * 0.18);
  const centre = length / 2 + (rand() - 0.5) * 0.12 * size;
  const lean = (rand() - 0.5) * 0.08;
  const at = ([u, v]: Pt): Pt => {
    const s = centre + (u + (lean * v) / 0.28) * scale;
    const t = v * scale;
    return [from[0] + along[0] * s + normal[0] * t, from[1] + along[1] * s + normal[1] * t];
  };
  const start = at(KNOB_START);
  const segs: Seg[] = [straight(from, start)];
  for (const [c1, c2, end] of KNOB) segs.push([...at(c1), ...at(c2), ...at(end)]);
  segs.push(straight(at(KNOB[KNOB.length - 1][2]), to));
  return { from, segs };
}

function flat(from: Pt, to: Pt): Edge {
  return { from, segs: [straight(from, to)] };
}

/** The same edge, walked the other way. */
function reverse(edge: Edge): Edge {
  const points: Pt[] = [edge.from, ...edge.segs.map((s): Pt => [s[4], s[5]])];
  const segs = edge.segs.map((s, i): Seg => [s[2], s[3], s[0], s[1], points[i][0], points[i][1]]).reverse();
  return { from: points[points.length - 1], segs };
}

const n = (v: number) => Math.round(v * 100) / 100;

/** Cuts a board `height` units tall (and W0 wide) into the level's pieces. */
export function makePuzzle({ cols, rows }: Level, height: number, seed: number): Puzzle {
  const rand = random(seed);
  const cell = { w: W0 / cols, h: height / rows };
  const size = Math.min(cell.w, cell.h);
  const corner = (c: number, r: number): Pt => [c * cell.w, r * cell.h];
  // Edges between rows run left to right; edges between columns run top to bottom.
  const across = Array.from({ length: rows + 1 }, (_, r) =>
    Array.from({ length: cols }, (_, c) => (r > 0 && r < rows ? knobEdge(corner(c, r), corner(c + 1, r), size, rand) : null)),
  );
  const down = Array.from({ length: cols + 1 }, (_, c) =>
    Array.from({ length: rows }, (_, r) => (c > 0 && c < cols ? knobEdge(corner(c, r), corner(c, r + 1), size, rand) : null)),
  );
  const margin = size * MARGIN;
  const pieces: Piece[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const [tl, tr, br, bl] = [corner(c, r), corner(c + 1, r), corner(c + 1, r + 1), corner(c, r + 1)];
      const top = across[r][c] ?? flat(tl, tr);
      const right = down[c + 1][r] ?? flat(tr, br);
      const bottom = across[r + 1][c] ? reverse(across[r + 1][c]!) : flat(br, bl);
      const left = down[c][r] ? reverse(down[c][r]!) : flat(bl, tl);
      const curves = [top, right, bottom, left].flatMap((e) => e.segs).map((s) => `C${s.map(n).join(" ")}`);
      pieces.push({
        col: c,
        row: r,
        d: `M${n(tl[0])} ${n(tl[1])}${curves.join("")}Z`,
        x: tl[0] - margin,
        y: tl[1] - margin,
        w: cell.w + 2 * margin,
        h: cell.h + 2 * margin,
      });
    }
  }
  return { cols, rows, cell, margin, pieces };
}

export type Table = {
  width: number;
  height: number;
  /** Pixels per board unit. */
  scale: number;
  /** Where the board lies on the table, in pixels. */
  board: { x: number; y: number; w: number; h: number };
  /** Top-left corners (of the piece boxes, in pixels) where loose pieces start, more than enough. */
  slots: Pt[];
  /** How close (in pixels) a piece must be dropped to its place to click in. */
  snap: number;
};

/**
 * Lays out the table: on a wide screen the board sits in the middle with loose pieces around and
 * below it, sized so the whole table fits the window; on a phone the board takes the full width and
 * the pieces lie underneath. The table grows until every piece has a place of its own.
 */
export function layTable(width: number, viewport: number, level: Level, boardHeight: number): Table {
  const wide = width >= 720;
  let boardWidth = wide ? Math.min(width * 0.62, 920) : width;
  for (;;) {
    const table = arrange(width, boardWidth, level, boardHeight, wide);
    if (!wide || table.height <= Math.max(440, viewport - 150) || boardWidth <= width * 0.42) return table;
    boardWidth *= 0.93;
  }
}

function arrange(width: number, boardWidth: number, { cols, rows }: Level, boardHeight: number, wide: boolean): Table {
  const scale = boardWidth / W0;
  const board = { x: (width - boardWidth) / 2, y: wide ? 20 : 0, w: boardWidth, h: boardHeight * scale };
  const cell = { w: board.w / cols, h: board.h / rows };
  const size = Math.min(cell.w, cell.h);
  const margin = size * MARGIN;
  // Loose pieces keep clear of the board, and of the table's edge.
  const gap = size * 0.4;
  const pad = wide ? 16 : 8;
  const step = { x: cell.w * 1.12, y: cell.h * 1.12 };
  const perRow = Math.max(1, Math.floor((width - 2 * pad - cell.w) / step.x) + 1);
  const first = (width - ((perRow - 1) * step.x + cell.w)) / 2;
  const clear = (left: number, top: number) =>
    left + cell.w <= board.x - gap || left >= board.x + board.w + gap || top >= board.y + board.h + gap;
  let height = board.y + board.h + gap + cell.h + pad;
  let slots: Pt[] = [];
  for (let tries = 0; tries < 200; tries++) {
    slots = [];
    for (let top = pad; top + cell.h <= height - pad; top += step.y) {
      for (let i = 0; i < perRow; i++) {
        const left = first + i * step.x;
        if (clear(left, top)) slots.push([left - margin, top - margin]);
      }
    }
    if (slots.length >= cols * rows) break;
    height += step.y / 2;
  }
  return { width, height, scale, board, slots, snap: Math.max(10, size * 0.3) };
}

/** A shuffled copy (Fisher-Yates). */
export function shuffle<T>(items: T[], rand: () => number) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
