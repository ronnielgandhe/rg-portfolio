import './core/exactcover.js';
import './core/sudoku.js';
import './core/tango.js';
import './core/queens.js';
import './core/zip.js';
import './core/patches.js';

type Trace = (type: 'place' | 'undo' | 'start', row: number, col: number, value?: number) => void;
type Cell = { row: number; col: number };
type Conn = Record<string, Set<string>>;
type ZipArgs = { conn: Conn; active: Set<string>; waypoints: Cell[]; timeLimit?: number; trace?: Trace };
type ZipResult = { path: Cell[] | null; iterations: number; timedOut: boolean };
type SudokuSolve = (g: number[][], opts?: { size?: number; boxRows?: number; boxCols?: number; trace?: Trace }) => boolean;
type TangoSolve = (g: number[], size: number, constraints: TangoConstraint[], trace?: Trace, stats?: { guesses?: number }) => boolean;
type QueensSolve = (regions: number[][], trace?: Trace) => number[] | null;

export type TangoConstraint = { type: 'same' | 'diff'; i1: number; i2: number };
export type ZipWall = { cellIdx: number; direction: string };
export type PatchClue = { cell: number; size?: number; shape?: 'square' | 'wide' | 'tall' | 'any' };
export type PatchRect = { clue: number; r0: number; c0: number; h: number; w: number; cells: number[] };
export type { Trace, Cell };

interface Gss {
  sudoku: { solve: SudokuSolve; solveBasic: SudokuSolve };
  tango: { solve: TangoSolve; solveBasic: TangoSolve };
  queens: { solve: QueensSolve; solveBasic: QueensSolve };
  zip: {
    key: (row: number, col: number) => string;
    buildFullGrid: (conn: Conn, size: number) => Conn;
    applyWalls: (conn: Conn, size: number, walls: ZipWall[]) => Conn;
    reachable: (conn: Conn, start: string) => Set<string>;
    solve: (args: ZipArgs) => ZipResult;
    solveBasic: (args: ZipArgs) => ZipResult;
  };
  patches: {
    solve: (rows: number, cols: number, clues: PatchClue[], trace?: (t: 'place' | 'undo', rect: PatchRect) => void) => { regions: { cellIdxes: number[] }[] } | null;
  };
}

export const gss = (globalThis as unknown as { __gss: Gss }).__gss;

export type Mode = 'now' | 'before';

export const LINES: Record<string, Record<Mode, string>> = {
  queens: {
    now: 'most constrained first: every step takes the row, column or colour with the fewest legal squares left, so a forced square costs no guess.',
    before: 'the original: row by row, a column is tried only if it clears every queen above it.',
  },
  sudoku: {
    now: 'most constrained cell first: the empty cell with the fewest legal digits goes next, so a cell with one option never needs a guess.',
    before: 'the original: first empty cell, try 1 to 6, undo on a dead end.',
  },
  tango: {
    now: 'rules first: pairs, sandwiches, full counts and the = and × signs fill forced cells, then every cell is probed for a contradiction. it only guesses when nothing is forced.',
    before: 'the original: next empty cell gets a sun, then a moon, and the whole board is re-checked after every placement.',
  },
  zip: {
    now: 'warnsdorff plus five checks per step: the rest still connects, no dead ends, the grid colours balance, the next number is reachable, forced cells go first. if a direction stalls it restarts from the other end.',
    before: 'the original: depth first, next number first, fewest exits next, no look ahead.',
  },
  patches: {
    now: 'exact cover: every rectangle that fits a clue is a row, every cell has to be covered once. algorithm x branches on the cell with the fewest options.',
    before: 'the original never solved patches, it read the answer out of react state. that read is still the fallback.',
  },
};

export const HOW: Record<string, string> = {
  sudoku: 'most constrained cell first',
  tango: 'rule propagation, guesses only when stuck',
  queens: 'fewest legal squares first',
  zip: 'pruned hamiltonian path, two directions',
  patches: 'exact cover, react state as fallback',
  wordle: 'reads the answer, or solves from the board',
  strands: 'dfs per word, words fitted by exact cover',
};
