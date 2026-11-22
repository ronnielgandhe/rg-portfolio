import { computeMetrics, runBars, runPortfolio, sliceFrom, symbolsFor, tradeStats } from '../engine/index.ts';
import type { Bars, Metrics, PriceMap, RunResult, StrategyConfig, Version } from '../engine/index.ts';

export interface ThesisMeta {
  slug: string;
  title: string;
  kind: 'thesis' | 'algorithm';
  summary: string;
  started: string;
  source?: string;
  body: string;
}

export interface Thesis extends ThesisMeta {
  versions: Version[];
}

export interface Run {
  result: RunResult;
  metrics: Metrics;
  bench: Metrics;
  stats?: ReturnType<typeof tradeStats>;
  oos?: { m: Metrics; b: Metrics } | null;
}

export function parseThesis(slug: string, raw: string): ThesisMeta {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const front: Record<string, string> = {};
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) front[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return {
    slug,
    title: front.title ?? slug,
    kind: front.kind === 'algorithm' ? 'algorithm' : 'thesis',
    summary: front.summary ?? '',
    started: front.started ?? '',
    source: front.source,
    body: m ? m[2] : raw,
  };
}

const priceCache = new Map<string, Promise<PriceMap>>();
const barCache = new Map<string, Promise<Bars>>();

export async function loadPrices(symbols: string[]): Promise<PriceMap> {
  const key = [...new Set(symbols)].sort().join(',');
  if (!priceCache.has(key)) {
    priceCache.set(
      key,
      fetch(`/api/quantzoo/prices?symbols=${encodeURIComponent(key)}`)
        .then((r) => r.json())
        .then((j) => {
          if (!j.data) throw new Error(j.error ?? 'price source down');
          return j.data as PriceMap;
        }),
    );
  }
  return priceCache.get(key)!;
}

export async function loadBars(symbol: string, interval: string): Promise<Bars> {
  const key = `${symbol}:${interval}`;
  if (!barCache.has(key)) {
    barCache.set(
      key,
      fetch(`/api/quantzoo/bars?symbol=${encodeURIComponent(symbol)}&interval=${interval}`)
        .then((r) => r.json())
        .then((j) => {
          if (!j.bars) throw new Error(j.error ?? 'bar source down');
          return j.bars as Bars;
        }),
    );
  }
  return barCache.get(key)!;
}

export interface DataBag {
  prices: PriceMap;
  bars: Record<string, Bars>;
}

export async function loadFor(configs: StrategyConfig[]): Promise<DataBag> {
  const syms = new Set<string>();
  const barKeys = new Set<string>();
  for (const c of configs) {
    if (c.kind === 'portfolio') {
      symbolsFor(c).forEach((s) => syms.add(s));
      symbolsFor({ ...c, synthetic: true }).forEach((s) => syms.add(s));
    } else barKeys.add(`${c.symbol}|${c.interval}`);
  }
  const [prices, ...bars] = await Promise.all([
    syms.size ? loadPrices([...syms]) : Promise.resolve({} as PriceMap),
    ...[...barKeys].map((k) => loadBars(k.split('|')[0], k.split('|')[1])),
  ]);
  const bag: DataBag = { prices, bars: {} };
  [...barKeys].forEach((k, i) => (bag.bars[k] = bars[i]));
  return bag;
}

export function runConfig(cfg: StrategyConfig, bag: DataBag): Run {
  if (cfg.kind === 'bars') {
    const result = runBars(cfg, bag.bars[`${cfg.symbol}|${cfg.interval}`]);
    return {
      result,
      metrics: computeMetrics(result.dates, result.equity, result.rf, result.periodsPerYear),
      bench: computeMetrics(result.dates, result.benchmark, result.rf, result.periodsPerYear),
      stats: tradeStats(result.trades ?? []),
      oos: null,
    };
  }
  const result = runPortfolio(cfg, bag.prices);
  const metrics = computeMetrics(result.dates, result.equity, result.rf);
  const bench = computeMetrics(result.dates, result.benchmark, result.rf);
  let oos: Run['oos'] = null;
  if (cfg.oosStart && cfg.oosStart > result.dates[0]) {
    const e = sliceFrom(result.dates, result.equity, cfg.oosStart);
    const b = sliceFrom(result.dates, result.benchmark, cfg.oosStart);
    const rf = sliceFrom(result.dates, result.rf, cfg.oosStart);
    if (e.d.length > 20) oos = { m: computeMetrics(e.d, e.v, rf.v), b: computeMetrics(b.d, b.v, rf.v) };
  }
  return { result, metrics, bench, oos };
}

export function sinceDate(run: Run, date: string) {
  const r = run.result;
  const i = r.dates.findIndex((d) => d.slice(0, 10) > date);
  if (i < 1) return { days: 0, ret: 0, bench: 0, from: date };
  const j = i - 1;
  const last = r.equity.length - 1;
  return {
    days: last - j,
    ret: r.equity[last] / r.equity[j] - 1,
    bench: r.benchmark[last] / r.benchmark[j] - 1,
    from: r.dates[j],
  };
}
