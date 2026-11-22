(function (root, factory) {
  const ns = root.__gss || (root.__gss = {});
  ns.queens = factory(ns);
  if (typeof module === 'object' && module.exports) module.exports = ns.queens;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (ns) {
  function solveBasic(regionGrid, trace) {
    const SIZE = regionGrid.length;
    if (new Set(regionGrid.flat()).size !== SIZE) return null;
    const queens = new Array(SIZE).fill(-1);

    function isSafe(row, col) {
      for (let r = 0; r < row; r++) {
        const c = queens[r];
        if (c === col) return false;
        if (Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1) return false;
      }
      const region = regionGrid[row][col];
      for (let r = 0; r < row; r++) {
        if (regionGrid[r][queens[r]] === region) return false;
      }
      return true;
    }

    function bt(row) {
      if (row === SIZE) return true;
      for (let col = 0; col < SIZE; col++) {
        if (isSafe(row, col)) {
          queens[row] = col;
          if (trace) trace('place', row, col);
          if (bt(row + 1)) return true;
          queens[row] = -1;
          if (trace) trace('undo', row, col);
        }
      }
      return false;
    }

    if (bt(0)) return queens;
    return null;
  }

  function solveX(regionGrid, trace) {
    const SIZE = regionGrid.length;
    const regions = [...new Set(regionGrid.flat())];
    if (regions.length !== SIZE) return null;
    const primary = [];
    for (let i = 0; i < SIZE; i++) primary.push(`r${i}`, `c${i}`);
    for (const g of regions) primary.push(`g${g}`);
    const secondary = [];
    for (let r = 0; r < SIZE - 1; r++) for (let c = 0; c < SIZE - 1; c++) secondary.push(`w${r},${c}`);
    const rows = [];
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      const cols = [`r${r}`, `c${c}`, `g${regionGrid[r][c]}`];
      for (let dr = -1; dr <= 0; dr++) for (let dc = -1; dc <= 0; dc++) {
        const wr = r + dr, wc = c + dc;
        if (wr >= 0 && wc >= 0 && wr < SIZE - 1 && wc < SIZE - 1) cols.push(`w${wr},${wc}`);
      }
      rows.push([r * SIZE + c, cols]);
    }
    const res = ns.exactcover.solve({ primary, secondary, rows, trace: trace && ((t, id) => trace(t, Math.floor(id / SIZE), id % SIZE)) });
    if (!res.count) return null;
    const queens = new Array(SIZE).fill(-1);
    for (const id of res.solutions[0]) queens[Math.floor(id / SIZE)] = id % SIZE;
    return queens;
  }

  function solveUnits(regionGrid, trace) {
    const SIZE = regionGrid.length;
    const ids = [...new Set(regionGrid.flat())];
    if (ids.length !== SIZE) return null;
    const regionOf = regionGrid.map(row => row.map(g => ids.indexOf(g)));
    const queens = new Array(SIZE).fill(-1);
    const colUsed = new Array(SIZE).fill(false);
    const regUsed = new Array(SIZE).fill(false);
    const blocked = new Array(SIZE * SIZE).fill(0);
    const count = new Array(SIZE * 3);
    function mark(r, c, d) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && cc >= 0 && rr < SIZE && cc < SIZE) blocked[rr * SIZE + cc] += d;
      }
    }
    function bt(placed) {
      if (placed === SIZE) return true;
      count.fill(0);
      for (let r = 0; r < SIZE; r++) {
        if (queens[r] >= 0) continue;
        for (let c = 0; c < SIZE; c++) {
          if (colUsed[c] || blocked[r * SIZE + c] || regUsed[regionOf[r][c]]) continue;
          count[r]++; count[SIZE + c]++; count[2 * SIZE + regionOf[r][c]]++;
        }
      }
      let best = -1, bestN = Infinity;
      for (let u = 0; u < SIZE * 3; u++) {
        const open = u < SIZE ? queens[u] < 0 : u < 2 * SIZE ? !colUsed[u - SIZE] : !regUsed[u - 2 * SIZE];
        if (open && count[u] < bestN) { best = u; bestN = count[u]; if (bestN === 0) return false; }
      }
      const cells = [];
      for (let r = 0; r < SIZE; r++) {
        if (queens[r] >= 0) continue;
        for (let c = 0; c < SIZE; c++) {
          if (colUsed[c] || blocked[r * SIZE + c] || regUsed[regionOf[r][c]]) continue;
          if ((best < SIZE && r === best) || (best >= SIZE && best < 2 * SIZE && c === best - SIZE) || (best >= 2 * SIZE && regionOf[r][c] === best - 2 * SIZE)) cells.push([r, c]);
        }
      }
      for (const [r, c] of cells) {
        queens[r] = c; colUsed[c] = true; regUsed[regionOf[r][c]] = true; mark(r, c, 1);
        if (trace) trace('place', r, c);
        if (bt(placed + 1)) return true;
        queens[r] = -1; colUsed[c] = false; regUsed[regionOf[r][c]] = false; mark(r, c, -1);
        if (trace) trace('undo', r, c);
      }
      return false;
    }
    return bt(0) ? queens : null;
  }

  const solve = solveUnits;

  return { solve, solveBasic, solveX, solveUnits };
});
