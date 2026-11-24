(function (root, factory) {
  const ns = root.__gss || (root.__gss = {});
  ns.exactcover = factory();
  if (typeof module === 'object' && module.exports) module.exports = ns.exactcover;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function solve({ primary, secondary = [], rows, initial = [], trace, limit = 1, maxNodes = Infinity }) {
    const X = new Map();
    const Y = new Map();
    for (const c of primary) X.set(c, new Set());
    for (const c of secondary) X.set(c, new Set());
    for (const [id, cols] of rows) {
      const own = cols.filter(c => X.has(c));
      Y.set(id, own);
      for (const c of own) X.get(c).add(id);
    }

    function select(r) {
      const removed = [];
      for (const j of Y.get(r)) {
        const col = X.get(j);
        for (const i of col) for (const k of Y.get(i)) if (k !== j) X.get(k).delete(i);
        X.delete(j);
        removed.push([j, col]);
      }
      return removed;
    }

    function deselect(removed) {
      for (let n = removed.length - 1; n >= 0; n--) {
        const [j, col] = removed[n];
        X.set(j, col);
        for (const i of col) for (const k of Y.get(i)) if (k !== j) X.get(k).add(i);
      }
    }

    const stats = { nodes: 0, backtracks: 0, guesses: 0 };
    const solution = [];
    for (const r of initial) {
      if (!Y.has(r) || !Y.get(r).every(c => X.has(c) && X.get(c).has(r))) return { solutions: [], count: 0, stats };
      solution.push(r);
      select(r);
    }

    const solutions = [];
    let stopped = false;
    function search() {
      if (stopped) return;
      if (++stats.nodes > maxNodes) { stopped = true; return; }
      let best = null;
      let bestSize = Infinity;
      for (const c of primary) {
        const col = X.get(c);
        if (col && col.size < bestSize) { best = c; bestSize = col.size; if (bestSize < 2) break; }
      }
      if (best === null) {
        solutions.push(solution.slice());
        if (solutions.length >= limit) stopped = true;
        return;
      }
      if (bestSize === 0) return;
      if (bestSize > 1) stats.guesses++;
      for (const r of [...X.get(best)]) {
        solution.push(r);
        const removed = select(r);
        if (trace) trace('place', r);
        search();
        deselect(removed);
        solution.pop();
        if (stopped) return;
        stats.backtracks++;
        if (trace) trace('undo', r);
      }
    }
    search();
    return { solutions, count: solutions.length, stats, exhausted: !stopped || solutions.length >= limit };
  }

  return { solve };
});
