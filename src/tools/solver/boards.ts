import type { PatchClue, TangoConstraint, ZipWall } from './algorithms';

export const QUEENS: number[][] = [[2, 2, 0, 0, 0, 0, 1, 1], [2, 2, 2, 0, 0, 3, 1, 1], [2, 2, 2, 0, 0, 3, 3, 1], [5, 5, 2, 4, 4, 3, 3, 3], [5, 5, 5, 4, 4, 4, 6, 6], [5, 5, 5, 4, 4, 4, 6, 6], [5, 5, 7, 7, 7, 4, 6, 6], [7, 7, 7, 7, 7, 6, 6, 6]];

export const SUDOKU: number[][] = [[0, 0, 0, 0, 0, 0], [6, 0, 0, 0, 1, 5], [0, 0, 5, 1, 0, 0], [0, 0, 0, 0, 5, 3], [0, 0, 3, 0, 6, 1], [1, 5, 0, 0, 0, 0]];

export const TANGO: { grid: number[]; constraints: TangoConstraint[] } = {"grid": [-1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, -1, -1, -1, -1, -1, 0, -1, 0, -1, -1, -1, -1, 1, 1, -1, -1, -1, -1, -1], "constraints": [{"type": "diff", "i1": 16, "i2": 17}, {"type": "same", "i1": 6, "i2": 7}, {"type": "same", "i1": 23, "i2": 29}, {"type": "diff", "i1": 22, "i2": 23}, {"type": "diff", "i1": 26, "i2": 27}, {"type": "diff", "i1": 27, "i2": 33}, {"type": "diff", "i1": 12, "i2": 18}]};

export const ZIP: { size: number; waypoints: { row: number; col: number }[]; walls: ZipWall[] } = {"size": 6, "waypoints": [{"row": 4, "col": 2}, {"row": 4, "col": 3}, {"row": 4, "col": 4}, {"row": 5, "col": 5}, {"row": 2, "col": 2}, {"row": 5, "col": 0}, {"row": 2, "col": 0}, {"row": 2, "col": 1}], "walls": [{"cellIdx": 2, "direction": "DOWN"}, {"cellIdx": 8, "direction": "RIGHT"}, {"cellIdx": 17, "direction": "DOWN"}, {"cellIdx": 18, "direction": "RIGHT"}, {"cellIdx": 20, "direction": "DOWN"}, {"cellIdx": 22, "direction": "DOWN"}]};

export const PATCHES: { rows: number; cols: number; clues: PatchClue[] } = { rows: 6, cols: 6, clues: [{ cell: 0, size: 2, shape: 'tall' }, { cell: 8, size: 4, shape: 'square' }, { cell: 9, size: 2, shape: 'tall' }, { cell: 14, size: 4, shape: 'wide' }, { cell: 18, size: 3, shape: 'tall' }, { cell: 21, size: 3, shape: 'wide' }, { cell: 25, size: 2, shape: 'tall' }, { cell: 27, size: 4, shape: 'square' }, { cell: 23, size: 8, shape: 'tall' }, { cell: 34, size: 4, shape: 'square' }] };
