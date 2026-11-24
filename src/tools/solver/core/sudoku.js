(function (root, factory) {
  const ns = root.__gss || (root.__gss = {});
  ns.sudoku = factory(ns);
  if (typeof module === 'object' && module.exports) module.exports = ns.sudoku;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (ns) {
  function isValid(g, r, c, n, size = 6, boxRows = 2, boxCols = 3) {
    for (let i = 0; i < size; i++) {
      if (g[r][i] === n || g[i][c] === n) return false;
    }
    const br = Math.floor(r / boxRows) * boxRows;
    const bc = Math.floor(c / boxCols) * boxCols;
    for (let ri = br; ri < br + boxRows; ri++)
      for (let ci = bc; ci < bc + boxCols; ci++)
        if (g[ri][ci] === n) return false;
    return true;
  }

  function solveBasic(g, opts = {}) {
    const size = opts.size || 6;
    const boxRows = opts.boxRows || 2;
    const boxCols = opts.boxCols || 3;
    const trace = opts.trace;
    function bt() {
      for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
          if (g[r][c] === 0) {
            for (let n = 1; n <= size; n++)
              if (isValid(g, r, c, n, size, boxRows, boxCols)) {
                g[r][c] = n;
                if (trace) trace('place', r, c, n);
                if (bt()) return true;
                g[r][c] = 0;
                if (trace) trace('undo', r, c, n);
              }
            return false;
          }
      return true;
    }
    return bt();
  }

  function solveMrv(g, opts = {}) {
    const size = opts.size || 6;
    const boxRows = opts.boxRows || 2;
    const boxCols = opts.boxCols || 3;
    const trace = opts.trace;
    const full = (1 << (size + 1)) - 2;
    const rowM = new Array(size).fill(0);
    const colM = new Array(size).fill(0);
    const boxM = new Array(size).fill(0);
    const box = (r, c) => Math.floor(r / boxRows) * (size / boxCols) + Math.floor(c / boxCols);
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      const n = g[r][c];
      if (!n) continue;
      const bit = 1 << n;
      if ((rowM[r] | colM[c] | boxM[box(r, c)]) & bit) return false;
      rowM[r] |= bit; colM[c] |= bit; boxM[box(r, c)] |= bit;
    }
    const bits = m => { let k = 0; while (m) { m &= m - 1; k++; } return k; };
    function bt() {
      let br = -1, bc = -1, bm = 0, bn = 99;
      for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
        if (g[r][c]) continue;
        const m = full & ~(rowM[r] | colM[c] | boxM[box(r, c)]);
        const k = bits(m);
        if (k < bn) { br = r; bc = c; bm = m; bn = k; if (k <= 1) break; }
      }
      if (br < 0) return true;
      if (bn === 0) return false;
      const b = box(br, bc);
      for (let n = 1; n <= size; n++) {
        const bit = 1 << n;
        if (!(bm & bit)) continue;
        g[br][bc] = n; rowM[br] |= bit; colM[bc] |= bit; boxM[b] |= bit;
        if (trace) trace('place', br, bc, n);
        if (bt()) return true;
        g[br][bc] = 0; rowM[br] &= ~bit; colM[bc] &= ~bit; boxM[b] &= ~bit;
        if (trace) trace('undo', br, bc, n);
      }
      return false;
    }
    return bt();
  }

  function solveX(g, opts = {}) {
    const size = opts.size || 6;
    const boxRows = opts.boxRows || 2;
    const boxCols = opts.boxCols || 3;
    const box = (r, c) => Math.floor(r / boxRows) * (size / boxCols) + Math.floor(c / boxCols);
    const primary = [];
    const rows = [];
    for (let i = 0; i < size; i++) for (let n = 1; n <= size; n++) primary.push(`p${i}#${n}`, `r${i}#${n}`, `c${i}#${n}`, `b${i}#${n}`);
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      for (let n = 1; n <= size; n++) rows.push([`${r},${c},${n}`, [`p${r}#${c + 1}`, `r${r}#${n}`, `c${c}#${n}`, `b${box(r, c)}#${n}`]]);
    }
    const initial = [];
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (g[r][c]) initial.push(`${r},${c},${g[r][c]}`);
    const trace = opts.trace && ((t, id) => { const [r, c, n] = id.split(',').map(Number); opts.trace(t, r, c, n); });
    const res = ns.exactcover.solve({ primary, rows, initial, trace });
    if (!res.count) return false;
    for (const id of res.solutions[0]) { const [r, c, n] = id.split(',').map(Number); g[r][c] = n; }
    return true;
  }

  const solve = solveMrv;

  return { isValid, solve, solveBasic, solveMrv, solveX };
});
