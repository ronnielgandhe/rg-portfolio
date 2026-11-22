import type { Leg, PortfolioConfig, PriceMap, RunResult, Series } from './types.ts';
import { CASH, LEVERAGED, alignOpens, alignTo, dailyRate, intersectDates, sma, syntheticLeveraged } from './series.ts';

const BORROW_SPREAD = 0.005 / 252;

export function symbolsFor(cfg: PortfolioConfig): string[] {
  const s = new Set<string>([cfg.benchmark, '^IRX']);
  for (const l of cfg.universe) s.add(l.symbol);
  if (cfg.trend) {
    s.add(cfg.trend.signal);
    for (const l of cfg.trend.riskOff) s.add(l.symbol);
  }
  if (cfg.synthetic) for (const sym of [...s]) if (LEVERAGED[sym]) s.add(LEVERAGED[sym].base);
  s.delete(CASH);
  return [...s];
}

function period(d: string, rule: PortfolioConfig['rebalance']): string {
  if (rule === 'monthly') return d.slice(0, 7);
  if (rule === 'quarterly') return d.slice(0, 4) + 'Q' + Math.floor((Number(d.slice(5, 7)) - 1) / 3);
  if (rule === 'yearly') return d.slice(0, 4);
  return '';
}

function legsToMap(legs: Leg[], scale = 1): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of legs) m.set(l.symbol, (m.get(l.symbol) ?? 0) + l.weight * scale);
  return m;
}

export function runPortfolio(cfg: PortfolioConfig, prices: PriceMap): RunResult {
  const syms = symbolsFor(cfg).filter((s) => s !== '^IRX');
  const resolved: PriceMap = { ...prices };
  let syntheticUntil: string | undefined;
  if (cfg.synthetic) {
    for (const s of syms) {
      if (!LEVERAGED[s]) continue;
      const syn = syntheticLeveraged(s, prices);
      if (syn && syn.series.d[0] < syn.realFrom) {
        resolved[s] = syn.series;
        if (!syntheticUntil || syn.realFrom > syntheticUntil) syntheticUntil = syn.realFrom;
      }
    }
  }
  const needed: Series[] = syms.map((s) => {
    const ser = resolved[s];
    if (!ser) throw new Error(`missing prices for ${s}`);
    return ser;
  });
  let dates = intersectDates(needed).filter((d) => d >= cfg.start && (!cfg.end || d <= cfg.end));
  const trendWarm = Math.max(cfg.trend ? cfg.trend.sma : 0, cfg.volTarget ? cfg.volTarget.lookback : 0);
  const allDates = intersectDates(needed);
  const firstIdx = allDates.indexOf(dates[0]);
  const warmStart = Math.max(0, firstIdx - trendWarm - 5);
  const fullDates = allDates.slice(warmStart).filter((d) => !cfg.end || d <= cfg.end);
  const offset = fullDates.indexOf(dates[0]);
  dates = fullDates.slice(offset);
  if (dates.length < 2) throw new Error('not enough overlapping history for this config');
  if (syntheticUntil && syntheticUntil <= dates[0]) syntheticUntil = undefined;

  const px: Record<string, number[]> = {};
  const po: Record<string, number[]> = {};
  for (const s of syms) {
    px[s] = alignTo(fullDates, resolved[s]);
    po[s] = alignOpens(fullDates, resolved[s], px[s]);
  }
  const rfFull = dailyRate(fullDates, prices);
  const trendSma = cfg.trend ? sma(px[cfg.trend.signal], cfg.trend.sma) : null;

  const lev = cfg.leverage ?? 1;
  const riskOn = legsToMap(cfg.universe, lev);
  const riskOff = cfg.trend ? legsToMap(cfg.trend.riskOff) : riskOn;
  const band = cfg.band ?? (cfg.volTarget ? 0.1 : Infinity);

  let on = true;
  const regimeAt = (k: number): boolean => {
    if (!cfg.trend || !trendSma) return true;
    const p = px[cfg.trend.signal][k];
    const m = trendSma[k];
    if (!Number.isFinite(m)) return on;
    const b = cfg.trend.buffer ?? 0;
    if (on && p < m * (1 - b)) on = false;
    else if (!on && p > m * (1 + b)) on = true;
    return on;
  };

  const exposureScale = (k: number): number => {
    const vt = cfg.volTarget;
    if (!vt) return 1;
    const from = k - vt.lookback + 1;
    if (from < 1) return Math.min(vt.maxExposure, 1);
    const rets: number[] = [];
    for (let j = from; j <= k; j++) {
      let r = 0;
      for (const [s, w] of riskOn) if (s !== CASH) r += (w / lev) * (px[s][j] / px[s][j - 1] - 1);
      rets.push(r * lev);
    }
    const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
    const v = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1)) * Math.sqrt(252);
    if (!(v > 0)) return vt.maxExposure;
    return Math.min(vt.maxExposure, vt.annual / v);
  };

  const target = (k: number): { w: Map<string, number>; on: boolean } => {
    const isOn = regimeAt(k);
    if (!isOn) return { w: riskOff, on: false };
    const scale = exposureScale(k);
    if (scale === 1) return { w: riskOn, on: true };
    const w = new Map<string, number>();
    for (const [s, x] of riskOn) w.set(s, x * scale);
    return { w, on: true };
  };

  for (let k = 0; k < offset - 1; k++) regimeAt(k);

  const n = dates.length;
  const equity = new Array<number>(n);
  const benchmark = new Array<number>(n);
  const exposure = new Array<number>(n);
  const rf = new Array<number>(n);
  const events: RunResult['events'] = [];
  const bpx = px[cfg.benchmark];
  let costs = 0;
  const vals = new Map<string, number>();
  let cash = 0;

  const applyTarget = (w: Map<string, number>, total: number) => {
    let turnover = 0;
    const next = new Map<string, number>();
    let risky = 0;
    for (const [s, x] of w) {
      if (s === CASH) continue;
      next.set(s, x * total);
      risky += x;
    }
    for (const s of new Set([...vals.keys(), ...next.keys()])) turnover += Math.abs((next.get(s) ?? 0) - (vals.get(s) ?? 0));
    const cost = (turnover * cfg.costBps) / 1e4;
    costs += cost;
    const after = total - cost;
    vals.clear();
    for (const [s, v] of next) vals.set(s, (v / total) * after);
    cash = after * (1 - risky);
  };

  const g = (i: number) => offset + i;
  let cur = target(g(0) - 1 >= 0 ? g(0) - 1 : 0);
  applyTarget(cur.w, cfg.initial);
  equity[0] = [...vals.values()].reduce((a, b) => a + b, cash);
  exposure[0] = (equity[0] - cash) / equity[0];
  benchmark[0] = cfg.initial;
  rf[0] = rfFull[g(0)];
  events.push({ date: dates[0], kind: cur.on ? 'buy' : 'risk-off' });

  for (let i = 1; i < n; i++) {
    const t = g(i);
    for (const [s, v] of vals) vals.set(s, (v * po[s][t]) / px[s][t - 1]);
    const r = rfFull[t - 1];
    cash *= 1 + (cash < 0 ? r + BORROW_SPREAD : r);
    let total = cash;
    for (const v of vals.values()) total += v;
    benchmark[i] = (cfg.initial * bpx[t]) / bpx[g(0)];
    rf[i] = r;
    if (total <= 0) {
      vals.clear();
      cash = 0;
      equity[i] = 0;
      exposure[i] = 0;
      continue;
    }
    const next = target(t - 1);
    const flip = next.on !== cur.on;
    const cal = cfg.rebalance !== 'none' && period(dates[i], cfg.rebalance) !== period(dates[i - 1], cfg.rebalance);
    let drift = 0;
    for (const s of new Set([...next.w.keys(), ...vals.keys()])) {
      if (s === CASH) continue;
      drift = Math.max(drift, Math.abs((next.w.get(s) ?? 0) - (vals.get(s) ?? 0) / total));
    }
    if (flip || cal || drift > band) {
      applyTarget(next.w, total);
      if (flip) events.push({ date: dates[i], kind: next.on ? 'risk-on' : 'risk-off' });
      cur = next;
    }
    let risky = 0;
    for (const [s, v] of vals) {
      const nv = (v * px[s][t]) / po[s][t];
      vals.set(s, nv);
      risky += nv;
    }
    equity[i] = Math.max(0, cash + risky);
    exposure[i] = equity[i] > 0 ? risky / equity[i] : 0;
  }

  return { dates, equity, benchmark, exposure, rf, events, costs, syntheticUntil, periodsPerYear: 252 };
}
