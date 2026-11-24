(function (root, factory) {
  const ns = root.__gss || (root.__gss = {});
  ns.strands = factory(ns);
  if (typeof module === 'object' && module.exports) module.exports = ns.strands;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (ns) {
  const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

  function findWordPath(board, word, globalUsed) {
    const ROWS = board.length, COLS = board[0].length;
    function dfs(r, c, idx, path, localUsed) {
      if (idx === word.length) return path.map(p => ({ ...p }));
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
      const k = r * COLS + c;
      if (localUsed.has(k) || globalUsed.has(k)) return null;
      if (board[r][c] !== word[idx]) return null;
      localUsed.add(k);
      path.push({ row: r, col: c });
      for (const [dr, dc] of DIRS) {
        const result = dfs(r + dr, c + dc, idx + 1, path, localUsed);
        if (result) return result;
      }
      path.pop();
      localUsed.delete(k);
      return null;
    }
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const result = dfs(r, c, 0, [], new Set());
        if (result) return result;
      }
    return null;
  }

  function allPaths(board, word, used, cap) {
    const ROWS = board.length, COLS = board[0].length;
    const out = [];
    const path = [];
    const local = new Set();
    function dfs(r, c, idx) {
      if (out.length >= cap) return;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      const k = r * COLS + c;
      if (local.has(k) || used.has(k) || board[r][c] !== word[idx]) return;
      local.add(k);
      path.push({ row: r, col: c });
      if (idx === word.length - 1) out.push(path.map(p => ({ ...p })));
      else for (const [dr, dc] of DIRS) dfs(r + dr, c + dc, idx + 1);
      path.pop();
      local.delete(k);
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) dfs(r, c, 0);
    return out;
  }

  function placeGreedy(board, words, trace) {
    const COLS = board[0].length;
    const used = new Set();
    const out = [];
    for (const word of words) {
      const path = findWordPath(board, word, used);
      if (path) {
        out.push({ word, path });
        path.forEach(p => used.add(p.row * COLS + p.col));
        if (trace) trace('place', word, path);
      }
    }
    return out;
  }

  function placeAll(board, words) {
    const greedy = placeGreedy(board, words);
    if (greedy.length === words.length) return greedy;
    return placeExact(board, words) || greedy;
  }

  function placeExact(board, words, cap = 20000, trace) {
    const COLS = board[0].length;
    const placeable = words.map((w, i) => i).filter(i => findWordPath(board, words[i], new Set()));
    const letters = placeable.reduce((n, i) => n + words[i].length, 0);
    const cells = [...Array(board.length * COLS).keys()].map(i => `x${i}`);
    const cover = letters === cells.length;
    const rows = [];
    for (const i of placeable) {
      for (const path of allPaths(board, words[i], new Set(), cap)) {
        rows.push([rows.length, [`w${i}`, ...path.map(p => `x${p.row * COLS + p.col}`)], i, path]);
      }
    }
    const res = ns.exactcover.solve({
      primary: placeable.map(i => `w${i}`).concat(cover ? cells : []),
      secondary: cover ? [] : cells,
      rows: rows.map(r => [r[0], r[1]]),
      trace: trace && ((t, n) => trace(t, words[rows[n][2]], rows[n][3])),
    });
    if (!res.count) return null;
    const chosen = new Map(res.solutions[0].map(n => [rows[n][2], rows[n][3]]));
    return placeable.map(i => ({ word: words[i], path: chosen.get(i) }));
  }

  function extractWords(obj, maxDepth = 10) {
    let foundWords = null;
    let foundSpangram = null;
    const visited = new Set();
    const wordy = s => typeof s === 'string' && s.length >= 3 && s.length <= 25 && /^[a-zA-Z]+$/.test(s);
    function search(o, d) {
      if (!o || typeof o !== 'object' || d > maxDepth || visited.has(o)) return;
      visited.add(o);
      for (const [k, val] of Object.entries(o)) {
        try {
          if (!foundSpangram && typeof val === 'string' && val.length >= 4 && val.length <= 25 &&
              /^[a-zA-Z]+$/.test(val) && /spangram/i.test(k)) {
            foundSpangram = val.toUpperCase();
          }
          if (!foundWords && Array.isArray(val) && val.length >= 4 && val.length <= 20) {
            const result = [];
            for (const item of val) {
              if (!item) continue;
              if (wordy(item)) result.push(item.toUpperCase());
              else if (typeof item === 'object') {
                for (const wk of ['word', 'text', 'value', 'answer', 'content', 'name']) {
                  if (wordy(item[wk])) { result.push(item[wk].toUpperCase()); break; }
                }
              }
            }
            if (result.length >= 4) foundWords = result;
          }
          if (val && typeof val === 'object') search(val, d + 1);
        } catch (_) {}
      }
    }
    search(obj, 0);
    if (foundWords && foundSpangram && !foundWords.includes(foundSpangram)) foundWords.push(foundSpangram);
    return foundWords;
  }

  return { DIRS, findWordPath, allPaths, placeGreedy, placeAll, placeExact, extractWords };
});
