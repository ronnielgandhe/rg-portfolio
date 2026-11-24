(function (root, factory) {
  const ns = root.__gss || (root.__gss = {});
  ns.patches = factory(ns);
  if (typeof module === 'object' && module.exports) module.exports = ns.patches;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (ns) {
  function corners(solution, cols) {
    return solution.map(region => {
      const rows = region.cellIdxes.map(i => Math.floor(i / cols));
      const cs = region.cellIdxes.map(i => i % cols);
      const minRow = Math.min(...rows), maxRow = Math.max(...rows);
      const minCol = Math.min(...cs), maxCol = Math.max(...cs);
      return { from: minRow * cols + minCol, to: maxRow * cols + maxCol };
    });
  }

  const validSolution = s => Array.isArray(s) && s.length > 0 && s.every(r => r && Array.isArray(r.cellIdxes) && r.cellIdxes.length > 0);

  const fits = (shape, h, w) => (shape === 'square' ? h === w : shape === 'wide' ? w > h : shape === 'tall' ? h > w : true);

  function candidates(rows, cols, clues) {
    const clueAt = new Map(clues.map((c, i) => [c.cell, i]));
    const out = [];
    clues.forEach((clue, i) => {
      const cr = Math.floor(clue.cell / cols), cc = clue.cell % cols;
      for (let r0 = 0; r0 <= cr; r0++) for (let c0 = 0; c0 <= cc; c0++)
        for (let r1 = cr; r1 < rows; r1++) for (let c1 = cc; c1 < cols; c1++) {
          const h = r1 - r0 + 1, w = c1 - c0 + 1;
          if (clue.size && h * w !== clue.size) continue;
          if (!fits(clue.shape, h, w)) continue;
          const cells = [];
          let clean = true;
          for (let r = r0; r <= r1 && clean; r++) for (let c = c0; c <= c1; c++) {
            const idx = r * cols + c;
            if (idx !== clue.cell && clueAt.has(idx)) { clean = false; break; }
            cells.push(idx);
          }
          if (clean) out.push({ clue: i, r0, c0, h, w, cells });
        }
    });
    return out;
  }

  function solve(rows, cols, clues, trace, limit = 1) {
    const cands = candidates(rows, cols, clues);
    const primary = [...Array(rows * cols).keys()].map(i => `x${i}`).concat(clues.map((c, i) => `k${i}`));
    const res = ns.exactcover.solve({
      primary,
      rows: cands.map((c, n) => [n, [`k${c.clue}`, ...c.cells.map(i => `x${i}`)]]),
      trace: trace && ((t, n) => trace(t, cands[n])),
      limit,
    });
    if (!res.count) return null;
    const regions = new Array(clues.length);
    for (const n of res.solutions[0]) regions[cands[n].clue] = { cellIdxes: cands[n].cells };
    return { regions, stats: res.stats, count: res.count };
  }

  function cluesFrom(puzzle) {
    if (!puzzle || typeof puzzle !== 'object') return null;
    const int = vals => vals.find(Number.isInteger);
    for (const [k, v] of Object.entries(puzzle)) {
      if (k === 'solution' || !Array.isArray(v) || !v.length) continue;
      const clues = v.map(c => {
        if (!c || typeof c !== 'object') return null;
        const cell = int([c.cellIdx, c.idx, c.index, c.cellIndex]);
        if (cell === undefined) return null;
        const raw = String(c.shape || c.shapeType || c.type || '').toLowerCase();
        const shape = /square/.test(raw) ? 'square' : /wide|horiz/.test(raw) ? 'wide' : /tall|vert/.test(raw) ? 'tall' : 'any';
        return { cell, size: int([c.size, c.area, c.number, c.value]), shape };
      });
      if (clues.every(Boolean)) return clues;
    }
    return null;
  }

  function solveUnique(rows, cols, clues) {
    const res = solve(rows, cols, clues, null, 2);
    return res && res.count === 1 ? res.regions : null;
  }

  return { corners, validSolution, candidates, solve, solveUnique, cluesFrom };
});
