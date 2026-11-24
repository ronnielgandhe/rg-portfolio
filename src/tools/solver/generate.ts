import { gss, type Cell, type PatchClue, type TangoConstraint, type ZipWall } from './algorithms';

const rand = () => Math.random();
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function queensBoard(n = 8): number[][] {
  for (;;) {
    const cols = Array(n).fill(-1);
    const place = (r: number): boolean => {
      if (r === n) return true;
      for (const c of shuffle([...Array(n).keys()])) {
        if (cols.slice(0, r).includes(c) || (r > 0 && Math.abs(cols[r - 1] - c) <= 1)) continue;
        cols[r] = c;
        if (place(r + 1)) return true;
        cols[r] = -1;
      }
      return false;
    };
    if (!place(0)) continue;
    const region = Array.from({ length: n }, () => Array(n).fill(-1));
    const frontier: [number, number][] = [];
    cols.forEach((c, r) => { region[r][c] = r; frontier.push([r, c]); });
    while (frontier.length) {
      const i = Math.floor(rand() * frontier.length);
      const [r, c] = frontier[i];
      const open = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).map(([dr, dc]) => [r + dr, c + dc] as [number, number])
        .filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n && region[a][b] === -1);
      if (!open.length) { frontier.splice(i, 1); continue; }
      const [a, b] = pick(open);
      region[a][b] = region[r][c];
      frontier.push([a, b]);
    }
    return region;
  }
}

export function sudokuBoard(givens = 11): number[][] {
  const g = Array.from({ length: 6 }, () => Array(6).fill(0));
  const ok = (r: number, c: number, v: number) => {
    for (let i = 0; i < 6; i++) if (g[r][i] === v || g[i][c] === v) return false;
    const r0 = r - (r % 2), c0 = c - (c % 3);
    for (let i = r0; i < r0 + 2; i++) for (let j = c0; j < c0 + 3; j++) if (g[i][j] === v) return false;
    return true;
  };
  const fill = (k: number): boolean => {
    if (k === 36) return true;
    const r = Math.floor(k / 6), c = k % 6;
    for (const v of shuffle([1, 2, 3, 4, 5, 6])) {
      if (ok(r, c, v)) { g[r][c] = v; if (fill(k + 1)) return true; g[r][c] = 0; }
    }
    return false;
  };
  fill(0);
  const keep = new Set(shuffle([...Array(36).keys()]).slice(0, givens));
  return g.map((row, r) => row.map((v, c) => (keep.has(r * 6 + c) ? v : 0)));
}

export function tangoBoard(): { grid: number[]; constraints: TangoConstraint[] } {
  const n = 6;
  const g = Array(n * n).fill(-1);
  const okLine = (line: number[]) => {
    if (line.filter((v) => v === 0).length > 3 || line.filter((v) => v === 1).length > 3) return false;
    for (let i = 0; i + 2 < n; i++) if (line[i] !== -1 && line[i] === line[i + 1] && line[i] === line[i + 2]) return false;
    return true;
  };
  const fill = (k: number): boolean => {
    if (k === n * n) return true;
    const r = Math.floor(k / n), c = k % n;
    for (const v of shuffle([0, 1])) {
      g[k] = v;
      if (okLine(g.slice(r * n, r * n + n)) && okLine([...Array(n)].map((_, i) => g[i * n + c])) && fill(k + 1)) return true;
      g[k] = -1;
    }
    return false;
  };
  fill(0);
  const edges: [number, number][] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (c + 1 < n) edges.push([r * n + c, r * n + c + 1]);
    if (r + 1 < n) edges.push([r * n + c, (r + 1) * n + c]);
  }
  const constraints = shuffle(edges).slice(0, 5 + Math.floor(rand() * 5)).map(([i1, i2]) => ({ type: g[i1] === g[i2] ? 'same' as const : 'diff' as const, i1, i2 }));
  const grid = g.slice();
  for (const i of shuffle([...Array(n * n).keys()])) {
    const v = grid[i];
    grid[i] = -1;
    if (gss.tango.count(grid, n, constraints, 2) !== 1) grid[i] = v;
  }
  return { grid, constraints };
}

export function hamiltonian(rows: number, cols: number, moves = 2500): [number, number][] {
  let path: [number, number][] = [];
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) path.push([r, r % 2 ? cols - 1 - k : k]);
  const adj = ([r, c]: [number, number]) => ([[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]] as [number, number][]).filter(([a, b]) => a >= 0 && b >= 0 && a < rows && b < cols);
  for (let m = 0; m < moves; m++) {
    if (rand() < 0.5) path.reverse();
    const end = path[path.length - 1];
    const prev = path[path.length - 2];
    const [a, b] = pick(adj(end).filter(([x, y]) => !(x === prev[0] && y === prev[1])));
    const i = path.findIndex(([x, y]) => x === a && y === b);
    path = path.slice(0, i + 1).concat(path.slice(i + 1).reverse());
  }
  return path;
}

export function zipBoard(n = 6): { size: number; waypoints: Cell[]; walls: ZipWall[] } {
  const path = hamiltonian(n, n);
  const count = 6 + Math.floor(rand() * 4);
  const inner = shuffle([...Array(path.length - 2).keys()].map((i) => i + 1)).slice(0, count - 2).sort((a, b) => a - b);
  const waypoints = [0, ...inner, path.length - 1].map((i) => ({ row: path[i][0], col: path[i][1] }));
  const used = new Set<string>();
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1][0] * n + path[i - 1][1], b = path[i][0] * n + path[i][1];
    used.add(`${Math.min(a, b)}-${Math.max(a, b)}`);
  }
  const walls: ZipWall[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const i = r * n + c;
    if (c + 1 < n && !used.has(`${i}-${i + 1}`) && rand() < 0.3) walls.push({ cellIdx: i, direction: 'RIGHT' });
    if (r + 1 < n && !used.has(`${i}-${i + n}`) && rand() < 0.3) walls.push({ cellIdx: i, direction: 'DOWN' });
  }
  return { size: n, waypoints, walls };
}

export function patchesBoard(rows = 6, cols = 6): { rows: number; cols: number; clues: PatchClue[] } {
  for (let tries = 0; tries < 60; tries++) {
    const rects: { r0: number; c0: number; h: number; w: number }[] = [];
    const cut = (r0: number, c0: number, h: number, w: number) => {
      if (h * w <= 4 || rand() < 0.18) { rects.push({ r0, c0, h, w }); return; }
      const vertical = w > h ? true : h > w ? false : rand() < 0.5;
      const span = vertical ? w : h;
      const k = 1 + Math.floor(rand() * (span - 1));
      if (vertical) { cut(r0, c0, h, k); cut(r0, c0 + k, h, w - k); } else { cut(r0, c0, k, w); cut(r0 + k, c0, h - k, w); }
    };
    cut(0, 0, rows, cols);
    if (rects.length < 6) continue;
    const clues: PatchClue[] = rects.map((r) => ({
      cell: (r.r0 + Math.floor(rand() * r.h)) * cols + r.c0 + Math.floor(rand() * r.w),
      size: r.h * r.w,
      shape: r.h === r.w ? 'square' : r.w > r.h ? 'wide' : 'tall',
    }));
    const res = gss.patches.solve(rows, cols, clues, undefined, 2);
    if (res && res.count === 1) return { rows, cols, clues };
  }
  return patchesBoard(rows, cols);
}

const THEMES: { name: string; words: string[] }[] = [
  { name: 'the games', words: ['QUEENS', 'TANGO', 'SUDOKU', 'PATCHES', 'WORDLE', 'STRANDS', 'SOLVERS', 'ZIPS'] },
  { name: 'fruit bowl', words: ['BANANA', 'CHERRY', 'MANGO', 'PAPAYA', 'LEMON', 'GRAPE', 'APRICOT', 'PEAR', 'KIWI'] },
  { name: 'up there', words: ['PLANET', 'COMET', 'ORBIT', 'GALAXY', 'NEBULA', 'METEOR', 'ROCKET', 'MOON', 'STAR'] },
  { name: 'coffee run', words: ['ESPRESSO', 'LATTE', 'MOCHA', 'CREMA', 'BEANS', 'ROAST', 'GRINDER', 'BREW', 'DRIP'] },
];

export function strandsBoard(): { theme: string; board: string[][]; words: string[] } {
  const theme = pick(THEMES);
  const words = shuffle(theme.words);
  const path = hamiltonian(8, 6, 3000);
  const board = Array.from({ length: 8 }, () => Array(6).fill('?'));
  let i = 0;
  for (const w of words) for (const ch of w) { const [r, c] = path[i++]; board[r][c] = ch; }
  return { theme: theme.name, board, words };
}

const COMMON = ['crane', 'slate', 'pride', 'flame', 'stone', 'brick', 'cloud', 'plant', 'storm', 'grape', 'lemon', 'river', 'tiger', 'ghost', 'smile', 'chair', 'bread', 'house', 'light', 'music', 'ocean', 'paper', 'queen', 'round', 'sweet', 'train', 'water', 'world', 'young', 'zebra', 'blink', 'frost', 'glove', 'honey', 'jolly', 'knife', 'mango', 'noble', 'orbit', 'pilot', 'quiet', 'robin', 'shine', 'tulip', 'urban', 'vivid', 'whale', 'yeast'];

export function wordleAnswer(list: string[]): string {
  const set = new Set(list);
  return pick(COMMON.filter((w) => set.has(w)));
}
