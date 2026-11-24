(function (root, factory) {
  const ns = root.__gss || (root.__gss = {});
  ns.zip = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = ns.zip;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  const clock = () => (root.performance && root.performance.now ? root.performance.now() : Date.now());
  const key = (row, col) => `${row},${col}`;

  function resetConn(conn, size) {
    for (const k of Object.keys(conn)) delete conn[k];
    for (let i = 0; i < size * size; i++) conn[key(Math.floor(i / size), i % size)] = new Set();
    return conn;
  }

  function buildFullGrid(conn, size) {
    resetConn(conn, size);
    for (let i = 0; i < size * size; i++) {
      const row = Math.floor(i / size), col = i % size;
      const k = key(row, col);
      if (row > 0) conn[k].add(key(row - 1, col));
      if (row < size - 1) conn[k].add(key(row + 1, col));
      if (col > 0) conn[k].add(key(row, col - 1));
      if (col < size - 1) conn[k].add(key(row, col + 1));
    }
    return conn;
  }

  function applyWalls(conn, size, walls) {
    for (const wall of walls) {
      const idx = wall.cellIdx;
      const row = Math.floor(idx / size), col = idx % size;
      const k = key(row, col);
      const dir = wall.direction || '';
      let nk = null;
      if (dir.includes('DOWN')) nk = key(row + 1, col);
      else if (dir.includes('RIGHT')) nk = key(row, col + 1);
      if (!nk) continue;
      if (conn[k]) conn[k].delete(nk);
      if (conn[nk]) conn[nk].delete(k);
    }
    return conn;
  }

  function avgDeg(conn) {
    return Object.values(conn).reduce((s, c) => s + c.size, 0) / Object.keys(conn).length;
  }

  function mutual(conn) {
    const out = {};
    for (const k in conn) out[k] = new Set();
    for (const k in conn) {
      for (const nk of conn[k]) {
        if (conn[nk]?.has(k)) {
          out[k].add(nk);
          out[nk].add(k);
        }
      }
    }
    return out;
  }

  function reachable(conn, startKey) {
    const active = new Set([startKey]);
    const queue = [startKey];
    while (queue.length > 0) {
      const cur = queue.shift();
      for (const nk of (conn[cur] || [])) {
        if (!active.has(nk)) {
          active.add(nk);
          queue.push(nk);
        }
      }
    }
    return active;
  }

  function search({ conn, active, waypoints, timeLimit = 10000, now = clock, trace, level = 2, maxNodes = Infinity }) {
    const totalActive = active.size;
    const nbrCache = new Map();
    function getNeighbors(row, col) {
      const k = key(row, col);
      let out = nbrCache.get(k);
      if (!out) {
        out = [];
        for (const nk of (conn[k] || [])) {
          if (active.has(nk)) {
            const [nr, nc] = nk.split(',').map(Number);
            out.push({ row: nr, col: nc, k: nk });
          }
        }
        nbrCache.set(k, out);
      }
      return out;
    }
    const colorOf = new Map();
    for (const k of active) { const [r, c] = k.split(',').map(Number); colorOf.set(k, (r + c) % 2); }

    const end = key(waypoints[waypoints.length - 1].row, waypoints[waypoints.length - 1].col);

    const wpAt = new Map(waypoints.map((w, i) => [key(w.row, w.col), i]));

    function stillCoverable(head) {
      const headKey = key(head.row, head.col);
      const headColor = (head.row + head.col) % 2;
      let start = null;
      let left = 0;
      let other = 0;
      for (const k of active) {
        if (visited.has(k)) continue;
        left++;
        if (level >= 2 && colorOf.get(k) !== headColor) other++;
        let exits = 0;
        for (const nk of conn[k] || []) if (active.has(nk) && (!visited.has(nk) || nk === headKey)) exits++;
        if (exits === 0 || (exits === 1 && k !== end)) return false;
        if (!start) start = k;
      }
      if (!start) return true;
      if (level >= 2 && other !== Math.ceil(left / 2)) return false;
      if (level >= 2 && nextWp < waypoints.length && !reachesNext(headKey)) return false;
      const seen = new Set([start]);
      const queue = [start];
      while (queue.length) {
        const cur = queue.pop();
        for (const nk of conn[cur] || []) {
          if (active.has(nk) && !visited.has(nk) && !seen.has(nk)) { seen.add(nk); queue.push(nk); }
        }
      }
      return seen.size === left;
    }

    function reachesNext(headKey) {
      const target = key(waypoints[nextWp].row, waypoints[nextWp].col);
      const seen = new Set([headKey]);
      const queue = [headKey];
      while (queue.length) {
        const cur = queue.pop();
        for (const nk of conn[cur] || []) {
          if (nk === target) return true;
          if (!active.has(nk) || visited.has(nk) || seen.has(nk)) continue;
          const w = wpAt.get(nk);
          if (w !== undefined && w > nextWp) continue;
          seen.add(nk);
          queue.push(nk);
        }
      }
      return false;
    }

    const deadline = now() + timeLimit;
    const path = [waypoints[0]];
    const visited = new Set([key(waypoints[0].row, waypoints[0].col)]);
    let nextWp = 1;
    let iterations = 0;
    let timedOut = false;
    let budget = false;

    function bt() {
      if (timedOut || budget) return false;
      if (++iterations > maxNodes) { budget = true; return false; }
      if (iterations % 5000 === 0 && now() > deadline) { timedOut = true; return false; }
      if (path.length === totalActive) return nextWp >= waypoints.length;
      if (nextWp >= waypoints.length) return false;
      const curr = path[path.length - 1];

      const candidates = [];
      for (const next of getNeighbors(curr.row, curr.col)) {
        const k = key(next.row, next.col);
        if (visited.has(k)) continue;
        const wpIdx = waypoints.findIndex((w, i) => i >= nextWp && w.row === next.row && w.col === next.col);
        if (wpIdx !== -1 && wpIdx !== nextWp) continue;
        let degree = 0;
        for (const nn of getNeighbors(next.row, next.col)) {
          if (!visited.has(nn.k)) degree++;
        }
        candidates.push({ next, k, degree, isWp: wpIdx === nextWp });
      }
      candidates.sort((a, b) => {
        if (a.isWp !== b.isWp) return a.isWp ? -1 : 1;
        return a.degree - b.degree;
      });
      if (level >= 2) {
        const forced = candidates.filter(x => x.degree === 1 && x.k !== end);
        if (forced.length > 1) return false;
        if (forced.length === 1) candidates.splice(0, candidates.length, forced[0]);
      }

      for (const { next, k, isWp } of candidates) {
        visited.add(k); path.push({ row: next.row, col: next.col });
        if (trace) trace('place', next.row, next.col);
        const oldWp = nextWp;
        if (isWp) nextWp++;
        if ((path.length === totalActive || level === 0 || stillCoverable(next)) && bt()) return true;
        nextWp = oldWp; path.pop(); visited.delete(k);
        if (trace) trace('undo', next.row, next.col);
      }
      return false;
    }

    const found = bt();
    return { path: found ? path : null, iterations, timedOut, budget };
  }

  function solve(args) {
    const { waypoints, timeLimit = 10000, now = clock, trace } = args;
    const deadline = now() + timeLimit;
    let maxNodes = 200;
    let total = 0;
    for (;;) {
      for (const reverse of [false, true]) {
        const wps = reverse ? waypoints.slice().reverse() : waypoints;
        if (trace) trace('start', wps[0].row, wps[0].col);
        const r = search({ ...args, waypoints: wps, timeLimit: Math.max(1, deadline - now()), maxNodes, level: 2 });
        total += r.iterations;
        if (r.path) return { path: reverse ? r.path.slice().reverse() : r.path, iterations: total, timedOut: false };
        if (!r.budget) return { path: null, iterations: total, timedOut: r.timedOut };
        if (now() > deadline) return { path: null, iterations: total, timedOut: true };
      }
      maxNodes *= 3;
    }
  }

  const solveBasic = args => search({ ...args, level: 0 });

  return { solveBasic, search, key, resetConn, buildFullGrid, applyWalls, avgDeg, mutual, reachable, solve };
});
