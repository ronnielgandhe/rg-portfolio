(function (root, factory) {
  const ns = root.__gss || (root.__gss = {});
  ns.tango = factory();
  if (typeof module === 'object' && module.exports) module.exports = ns.tango;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const EMPTY = -1;
  const SUN = 0;
  const MOON = 1;

  function isValidPartial(g, size, constraints) {
    const idx = (r, c) => r * size + c;
    const half = size / 2;
    for (let r = 0; r < size; r++) {
      let sunCount = 0, moonCount = 0;
      for (let c = 0; c < size; c++) {
        const v = g[idx(r, c)];
        if (v === SUN) sunCount++;
        if (v === MOON) moonCount++;
      }
      if (sunCount > half || moonCount > half) return false;
      for (let c = 0; c <= size - 3; c++) {
        const a = g[idx(r, c)], b = g[idx(r, c + 1)], cc = g[idx(r, c + 2)];
        if (a !== -1 && a === b && b === cc) return false;
      }
    }
    for (let c = 0; c < size; c++) {
      let sunCount = 0, moonCount = 0;
      for (let r = 0; r < size; r++) {
        const v = g[idx(r, c)];
        if (v === SUN) sunCount++;
        if (v === MOON) moonCount++;
      }
      if (sunCount > half || moonCount > half) return false;
      for (let r = 0; r <= size - 3; r++) {
        const a = g[idx(r, c)], b = g[idx(r + 1, c)], d = g[idx(r + 2, c)];
        if (a !== -1 && a === b && b === d) return false;
      }
    }
    for (const { type, i1, i2 } of constraints) {
      const v1 = g[i1], v2 = g[i2];
      if (v1 === -1 || v2 === -1) continue;
      if (type === 'same' && v1 !== v2) return false;
      if (type === 'diff' && v1 === v2) return false;
    }
    return true;
  }

  function solveBasic(g, size, constraints, trace) {
    function bt() {
      const emptyIdx = g.indexOf(EMPTY);
      if (emptyIdx === -1) return true;
      for (const val of [SUN, MOON]) {
        g[emptyIdx] = val;
        if (trace) trace('place', Math.floor(emptyIdx / size), emptyIdx % size, val);
        if (isValidPartial(g, size, constraints) && bt()) return true;
        g[emptyIdx] = EMPTY;
        if (trace) trace('undo', Math.floor(emptyIdx / size), emptyIdx % size, val);
      }
      return false;
    }
    return bt();
  }

  const lineCache = new Map();
  function linesFor(size) {
    if (!lineCache.has(size)) {
      const lines = [];
      for (let i = 0; i < size; i++) {
        lines.push(Array.from({ length: size }, (_, k) => i * size + k));
        lines.push(Array.from({ length: size }, (_, k) => k * size + i));
      }
      lineCache.set(size, lines);
    }
    return lineCache.get(size);
  }

  function propagate(g, size, constraints, trace, changed) {
    const half = size / 2;
    const lines = linesFor(size);
    function set(i, v) {
      if (g[i] === v) return true;
      if (g[i] !== EMPTY) return false;
      g[i] = v;
      changed.push(i);
      if (trace) trace('place', Math.floor(i / size), i % size, v, true);
      return true;
    }
    let progress = true;
    while (progress) {
      progress = false;
      const before = changed.length;
      for (const line of lines) {
        let suns = 0, moons = 0;
        for (const i of line) { if (g[i] === SUN) suns++; else if (g[i] === MOON) moons++; }
        if (suns > half || moons > half) return false;
        if (suns === half && moons < half) { for (const i of line) if (g[i] === EMPTY && !set(i, MOON)) return false; }
        else if (moons === half && suns < half) { for (const i of line) if (g[i] === EMPTY && !set(i, SUN)) return false; }
        for (let k = 0; k + 2 < size; k++) {
          const a = g[line[k]], b = g[line[k + 1]], c = g[line[k + 2]];
          if (a !== EMPTY && a === b && b === c) return false;
          if (a !== EMPTY && a === b && c === EMPTY && !set(line[k + 2], 1 - a)) return false;
          if (b !== EMPTY && b === c && a === EMPTY && !set(line[k], 1 - b)) return false;
          if (a !== EMPTY && a === c && b === EMPTY && !set(line[k + 1], 1 - a)) return false;
        }
      }
      for (const { type, i1, i2 } of constraints) {
        const a = g[i1], b = g[i2];
        if (a !== EMPTY && b !== EMPTY) { if ((type === 'same') !== (a === b)) return false; continue; }
        if (a !== EMPTY && !set(i2, type === 'same' ? a : 1 - a)) return false;
        if (b !== EMPTY && !set(i1, type === 'same' ? b : 1 - b)) return false;
      }
      if (changed.length > before) progress = true;
    }
    return true;
  }

  function search(g, size, constraints, trace, stats, limit) {
    const changed = [];
    const undo = () => {
      for (let k = changed.length - 1; k >= 0; k--) {
        const i = changed[k];
        if (trace) trace('undo', Math.floor(i / size), i % size, g[i]);
        g[i] = EMPTY;
      }
    };
    if (!propagate(g, size, constraints, trace, changed) || !isValidPartial(g, size, constraints)) { undo(); return 0; }
    if (!probe(g, size, constraints, trace, changed)) { undo(); return 0; }
    const empty = g.indexOf(EMPTY);
    if (empty === -1) {
      stats.solutions++;
      if (stats.solutions < limit) undo();
      return 1;
    }
    stats.guesses++;
    let found = 0;
    for (const v of [SUN, MOON]) {
      g[empty] = v;
      if (trace) trace('place', Math.floor(empty / size), empty % size, v, false);
      found += search(g, size, constraints, trace, stats, limit);
      if (stats.solutions >= limit) return found;
      if (trace) trace('undo', Math.floor(empty / size), empty % size, v);
      g[empty] = EMPTY;
    }
    undo();
    return found;
  }

  function probe(g, size, constraints, trace, changed) {
    let forced = true;
    while (forced) {
      forced = false;
      for (let i = 0; i < g.length; i++) {
        if (g[i] !== EMPTY) continue;
        for (const v of [SUN, MOON]) {
          const work = g.slice();
          work[i] = v;
          if (propagate(work, size, constraints, null, []) && isValidPartial(work, size, constraints)) continue;
          g[i] = 1 - v;
          changed.push(i);
          if (trace) trace('place', Math.floor(i / size), i % size, 1 - v, true);
          if (!propagate(g, size, constraints, trace, changed) || !isValidPartial(g, size, constraints)) return false;
          forced = true;
          break;
        }
      }
    }
    return true;
  }

  function solvePropagate(g, size, constraints, trace, stats = {}) {
    stats.guesses = 0;
    stats.solutions = 0;
    return search(g, size, constraints, trace, stats, 1) > 0;
  }

  function count(g, size, constraints, limit = 2) {
    const work = g.slice();
    const stats = { guesses: 0, solutions: 0 };
    search(work, size, constraints, null, stats, limit);
    return stats.solutions;
  }

  const solve = solvePropagate;

  return { EMPTY, SUN, MOON, isValidPartial, solve, solveBasic, solvePropagate, propagate, count };
});
