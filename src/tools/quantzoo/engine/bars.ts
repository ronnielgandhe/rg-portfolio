import type { BarConfig, RunResult, Trade } from './types.ts';

export interface Bars {
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
}

export interface Signal {
  side: 1 | -1;
  stopPoints: number;
  trailActivate: number;
  trailOffset: number;
}

export type BarStrategy = (bars: Bars, cfg: BarConfig, minuteOfDay: number[]) => (Signal | null)[];

export function minutesInZone(t: number[], timeZone: string): number[] {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
  return t.map((s) => {
    const parts = fmt.formatToParts(new Date(s * 1000));
    const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    return h * 60 + m;
  });
}

export function dayKey(t: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t * 1000));
}

export function trueRange(b: Bars): number[] {
  return b.c.map((_, i) => (i === 0 ? b.h[0] - b.l[0] : Math.max(b.h[i] - b.l[i], Math.abs(b.h[i] - b.c[i - 1]), Math.abs(b.l[i] - b.c[i - 1]))));
}

export function rma(x: number[], n: number): number[] {
  const out = new Array<number>(x.length).fill(NaN);
  let acc = 0;
  for (let i = 0; i < x.length; i++) {
    if (i < n) {
      acc += x[i];
      if (i === n - 1) out[i] = acc / n;
    } else out[i] = (out[i - 1] * (n - 1) + x[i]) / n;
  }
  return out;
}

export function smaN(x: number[], n: number): number[] {
  const out = new Array<number>(x.length).fill(NaN);
  let s = 0;
  for (let i = 0; i < x.length; i++) {
    s += x[i];
    if (i >= n) s -= x[i - n];
    if (i >= n - 1) out[i] = s / n;
  }
  return out;
}

export function emaN(x: number[], n: number): number[] {
  const out = new Array<number>(x.length).fill(NaN);
  const a = 2 / (n + 1);
  let acc = 0;
  for (let i = 0; i < x.length; i++) {
    if (i < n) {
      acc += x[i];
      if (i === n - 1) out[i] = acc / n;
    } else out[i] = a * x[i] + (1 - a) * out[i - 1];
  }
  return out;
}

export function highest(x: number[], n: number): number[] {
  return x.map((_, i) => (i < n - 1 ? NaN : Math.max(...x.slice(i - n + 1, i + 1))));
}

export function lowest(x: number[], n: number): number[] {
  return x.map((_, i) => (i < n - 1 ? NaN : Math.min(...x.slice(i - n + 1, i + 1))));
}

export function mfi(b: Bars, n: number): number[] {
  const tp = b.c.map((c, i) => (b.h[i] + b.l[i] + c) / 3);
  const out = new Array<number>(tp.length).fill(NaN);
  for (let i = n; i < tp.length; i++) {
    let up = 0;
    let dn = 0;
    for (let j = i - n + 1; j <= i; j++) {
      const flow = tp[j] * b.v[j];
      if (tp[j] > tp[j - 1]) up += flow;
      else if (tp[j] < tp[j - 1]) dn += flow;
    }
    out[i] = dn === 0 ? 100 : 100 - 100 / (1 + up / dn);
  }
  return out;
}

function inSession(min: number, from: string, to: string): boolean {
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  const a = fh * 60 + fm;
  const b = th * 60 + tm;
  return a <= b ? min >= a && min < b : min >= a || min < b;
}

export const BAR_STRATEGIES: Record<string, BarStrategy> = {
  donchian808(b, cfg, mins) {
    const p = cfg.params;
    const len = Number(p.donchLength);
    const upper = highest(b.h, len);
    const lower = lowest(b.l, len);
    const ema = emaN(b.c, Number(p.emaLength));
    const atr = rma(trueRange(b), Number(p.atrPeriod));
    const stopPoints = Number(p.riskDollars) / (cfg.pointValue * Number(p.contracts ?? 1));
    const prior = p.channel === 'prior';
    return b.c.map((c, i) => {
      if (i < len + 1 || !Number.isFinite(ema[i]) || !Number.isFinite(atr[i])) return null;
      if (!inSession(mins[i], String(p.sessionFrom), String(p.sessionTo))) return null;
      const up = prior ? upper[i - 1] : upper[i];
      const upPrev = prior ? upper[i - 2] : upper[i - 1];
      const lo = prior ? lower[i - 1] : lower[i];
      const loPrev = prior ? lower[i - 2] : lower[i - 1];
      const trailTicks = atr[i] * Number(p.trailMult);
      const trail = p.trailUnits === 'points' ? trailTicks : trailTicks * cfg.tickSize;
      if (b.h[i] > up && b.h[i - 1] <= upPrev && c > ema[i]) return { side: 1, stopPoints, trailActivate: trail, trailOffset: trail };
      if (b.l[i] < lo && b.l[i - 1] >= loPrev && c < ema[i]) return { side: -1, stopPoints, trailActivate: trail, trailOffset: trail };
      return null;
    });
  },
  anchor808(b, cfg, mins) {
    const p = cfg.params;
    const n = Number(p.lookback);
    const k = Number(p.atrMult);
    const smaTr = smaN(trueRange(b), n);
    const atr = rma(trueRange(b), n);
    const mom = mfi(b, n);
    const ratchet = p.anchorRule === 'ratchet';
    const anchor = new Array<number>(b.c.length).fill(NaN);
    for (let i = 0; i < b.c.length; i++) {
      if (!Number.isFinite(smaTr[i]) || !Number.isFinite(mom[i])) continue;
      const upBand = b.l[i] - smaTr[i] * k;
      const dnBand = b.h[i] + smaTr[i] * k;
      const prev = anchor[i - 1];
      if (mom[i] >= 50) anchor[i] = !Number.isFinite(prev) ? upBand : ratchet ? Math.max(upBand, prev) : Math.min(upBand, prev);
      else anchor[i] = !Number.isFinite(prev) ? dnBand : ratchet ? Math.min(dnBand, prev) : Math.max(dnBand, prev);
    }
    const stopPoints = Number(p.riskDollars) / (cfg.pointValue * Number(p.contracts ?? 1));
    return b.c.map((c, i) => {
      if (i < 3 || !Number.isFinite(anchor[i - 2]) || !Number.isFinite(anchor[i - 3]) || !Number.isFinite(atr[i])) return null;
      if (!inSession(mins[i], String(p.sessionFrom), String(p.sessionTo))) return null;
      const trail = Number(p.trailMult) * atr[i] * (p.trailUnits === 'points' ? 1 : cfg.tickSize);
      const ref = anchor[i - 2];
      const refPrev = anchor[i - 3];
      if (c > ref && b.c[i - 1] <= refPrev) return { side: 1, stopPoints, trailActivate: trail, trailOffset: trail };
      if (c < ref && b.c[i - 1] >= refPrev) return { side: -1, stopPoints, trailActivate: trail, trailOffset: trail };
      return null;
    });
  },
};

function barPath(o: number, h: number, l: number, c: number, highFirst?: boolean): number[] {
  const hf = highFirst ?? Math.abs(h - o) < Math.abs(o - l);
  return hf ? [o, h, l, c] : [o, l, h, c];
}

export function cleanBars(b: Bars, mult = 25): { bars: Bars; fixed: number[] } {
  const moves = b.c.slice(1).map((c, i) => Math.abs(c - b.c[i])).filter((x) => x > 0).sort((x, y) => x - y);
  const med = moves[Math.floor(moves.length / 2)] ?? 0;
  const thr = med * mult;
  const out: Bars = { t: b.t.slice(), o: b.o.slice(), h: b.h.slice(), l: b.l.slice(), c: b.c.slice(), v: b.v.slice() };
  const fixed: number[] = [];
  if (!(thr > 0)) return { bars: out, fixed };
  for (let i = 1; i < out.c.length; i++) {
    const prev = out.c[i - 1];
    let touched = false;
    if (Math.abs(out.o[i] - prev) > thr && Math.abs(out.o[i] - out.c[i]) > thr) {
      out.o[i] = prev;
      touched = true;
    }
    const hiBody = Math.max(out.o[i], out.c[i]);
    const loBody = Math.min(out.o[i], out.c[i]);
    if (out.h[i] - hiBody > thr) {
      out.h[i] = hiBody;
      touched = true;
    }
    if (loBody - out.l[i] > thr) {
      out.l[i] = loBody;
      touched = true;
    }
    if (touched) fixed.push(out.t[i]);
  }
  return { bars: out, fixed };
}

export function runBars(cfg: BarConfig, rawBars: Bars, fine?: Bars): RunResult {
  const { bars, fixed } = cleanBars(rawBars);
  const strat = BAR_STRATEGIES[cfg.strategy];
  if (!strat) throw new Error(`unknown strategy ${cfg.strategy}`);
  const mins = minutesInZone(bars.t, cfg.timezone);
  const signals = strat(bars, cfg, mins);
  const qty = Number(cfg.params.contracts ?? 1);
  const pv = cfg.pointValue * qty;
  const slip = cfg.slippageTicks * cfg.tickSize;
  const n = bars.c.length;
  const trades: Trade[] = [];
  const equity: number[] = new Array(n);
  let realized = cfg.initial;
  let costs = 0;
  type Pos = { side: 1 | -1; entry: number; entryTime: number; stop: number; best: number; trailOn: boolean; sig: Signal };
  let pos: Pos | null = null;
  const fineIndex = new Map<number, number[]>();
  if (fine && n > 1) {
    const step = bars.t[1] - bars.t[0];
    let j = 0;
    for (let i = 0; i < n; i++) {
      while (j < fine.t.length && fine.t[j] < bars.t[i]) j++;
      const pts: number[] = [];
      for (let k = j; k < fine.t.length && fine.t[k] < bars.t[i] + step; k++) pts.push(...barPath(fine.o[k], fine.h[k], fine.l[k], fine.c[k]));
      if (pts.length) fineIndex.set(bars.t[i], pts);
    }
  }
  let pending: Signal | null = null;

  const close = (exitPx: number, time: number, reason: string) => {
    if (!pos) return;
    const fill = exitPx - pos.side * slip;
    const gross = (fill - pos.entry) * pos.side * pv;
    costs += cfg.commission * qty + slip * pv;
    realized += gross - cfg.commission * qty;
    trades.push({ side: pos.side, entryTime: pos.entryTime, exitTime: time, entry: pos.entry, exit: fill, pnl: gross - 2 * cfg.commission * qty, reason });
    pos = null;
  };

  for (let i = 0; i < n; i++) {
    if (pending && !pos) {
      const fill = bars.o[i] + pending.side * slip;
      realized -= cfg.commission * qty;
      costs += cfg.commission * qty + slip * pv;
      pos = { side: pending.side, entry: fill, entryTime: bars.t[i], stop: fill - pending.side * pending.stopPoints, best: fill, trailOn: false, sig: pending };
    }
    pending = null;
    if (pos) {
      const o = bars.o[i];
      const sub = fine ? fineIndex.get(bars.t[i]) : undefined;
      const path = sub && sub.length ? sub : barPath(o, bars.h[i], bars.l[i], bars.c[i], cfg.intrabar === 'worst' ? pos.side === -1 : undefined);
      let prev = path[0];
      const p = pos;
      const level = () => {
        const trail = p.trailOn ? p.best - p.side * p.sig.trailOffset : NaN;
        if (!Number.isFinite(trail)) return p.stop;
        return p.side === 1 ? Math.max(p.stop, trail) : Math.min(p.stop, trail);
      };
      if ((p.side === 1 && prev <= level()) || (p.side === -1 && prev >= level())) close(prev, bars.t[i], p.trailOn ? 'trail' : 'stop');
      for (let s = 1; s < path.length && pos; s++) {
        const nextPx = path[s];
        const favorable = (nextPx - prev) * p.side > 0;
        if (favorable) {
          p.best = p.side === 1 ? Math.max(p.best, nextPx) : Math.min(p.best, nextPx);
          if (!p.trailOn && (p.best - p.entry) * p.side >= p.sig.trailActivate) p.trailOn = true;
        } else {
          const lv = level();
          if ((p.side === 1 && nextPx <= lv) || (p.side === -1 && nextPx >= lv)) close(lv, bars.t[i], p.trailOn ? 'trail' : 'stop');
        }
        prev = nextPx;
      }
    }
    const openPnl = pos ? (bars.c[i] - pos.entry) * pos.side * pv : 0;
    equity[i] = realized + openPnl;
    const sig = signals[i];
    if (!pos && sig && i < n - 1) pending = sig;
  }

  const t0 = bars.c[0];
  const benchmark = bars.c.map((c) => cfg.initial + (c - t0) * pv);
  const dates = bars.t.map((s) => new Date(s * 1000).toISOString());
  const events = trades.map((t) => ({ date: new Date(t.entryTime * 1000).toISOString(), kind: t.side === 1 ? 'long' : 'short' }));
  const barsPerYear = Math.round((252 * n) / Math.max(1, new Set(bars.t.map((s) => dayKey(s, cfg.timezone))).size));
  return { dates, equity, benchmark, exposure: equity.map(() => 0), rf: equity.map(() => 0), events, costs, trades, periodsPerYear: barsPerYear, cleaned: fixed };
}

export function tradeStats(trades: Trade[]) {
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const gross = wins.reduce((a, t) => a + t.pnl, 0);
  const lossSum = -losses.reduce((a, t) => a + t.pnl, 0);
  return {
    count: trades.length,
    winRate: trades.length ? wins.length / trades.length : 0,
    profitFactor: lossSum > 0 ? gross / lossSum : wins.length ? Infinity : 0,
    avg: trades.length ? trades.reduce((a, t) => a + t.pnl, 0) / trades.length : 0,
    net: trades.reduce((a, t) => a + t.pnl, 0),
    longs: trades.filter((t) => t.side === 1).length,
    shorts: trades.filter((t) => t.side === -1).length,
  };
}
