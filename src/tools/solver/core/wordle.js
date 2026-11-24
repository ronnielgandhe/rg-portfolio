(function (root, factory) {
  const ns = root.__gss || (root.__gss = {});
  ns.wordle = factory();
  if (typeof module === 'object' && module.exports) module.exports = ns.wordle;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function feedback(guess, answer) {
    const out = [0, 0, 0, 0, 0];
    const left = {};
    for (let i = 0; i < 5; i++) {
      if (guess[i] === answer[i]) out[i] = 2;
      else left[answer[i]] = (left[answer[i]] || 0) + 1;
    }
    for (let i = 0; i < 5; i++) {
      if (out[i] === 2) continue;
      if (left[guess[i]] > 0) { out[i] = 1; left[guess[i]]--; }
    }
    return out[0] + out[1] * 3 + out[2] * 9 + out[3] * 27 + out[4] * 81;
  }

  const SOLVED = 242;

  function encode(states) {
    return states.reduce((s, v, i) => s + v * Math.pow(3, i), 0);
  }

  function filter(candidates, guess, pattern) {
    return candidates.filter(w => feedback(guess, w) === pattern);
  }

  function score(guess, candidates) {
    const buckets = new Map();
    for (const w of candidates) {
      const p = feedback(guess, w);
      buckets.set(p, (buckets.get(p) || 0) + 1);
    }
    let entropy = 0;
    for (const n of buckets.values()) entropy -= (n / candidates.length) * Math.log2(n / candidates.length);
    return entropy;
  }

  function bestGuess(candidates, pool, opts = {}) {
    if (candidates.length <= 2) return candidates[0];
    const guesses = candidates.length > (opts.wide || 60) ? candidates : pool;
    const inCand = new Set(candidates);
    let best = candidates[0];
    let bestScore = -1;
    for (const g of guesses) {
      const sc = score(g, candidates) + (inCand.has(g) ? 0.01 : 0);
      if (sc > bestScore) { bestScore = sc; best = g; }
    }
    return best;
  }

  function play(answer, words, opts = {}) {
    let candidates = words.slice();
    const history = [];
    for (let turn = 0; turn < (opts.maxTurns || 12); turn++) {
      const guess = turn === 0 && opts.opener ? opts.opener : bestGuess(candidates, words, opts);
      const p = feedback(guess, answer);
      history.push(guess);
      if (p === SOLVED) return history;
      candidates = filter(candidates, guess, p);
      if (!candidates.length) return null;
    }
    return null;
  }

  return { feedback, encode, filter, score, bestGuess, play, SOLVED };
});
