import type { PriceMap, Series } from './types.ts';

export const CASH = 'CASH';
export const RATE_SYMBOL = '^IRX';
export const SWAP_SPREAD = 0.0075;

export interface LeveragedSpec {
  base: string;
  mult: number;
  expense: number;
}

export const LEVERAGED: Record<string, LeveragedSpec> = {
  TQQQ: { base: 'QQQ', mult: 3, expense: 0.0084 },
  QLD: { base: 'QQQ', mult: 2, expense: 0.0095 },
  UPRO: { base: 'SPY', mult: 3, expense: 0.0091 },
  SSO: { base: 'SPY', mult: 2, expense: 0.0089 },
  TECL: { base: 'XLK', mult: 3, expense: 0.0085 },
  SOXL: { base: '^SOX', mult: 3, expense: 0.0075 },
  TMF: { base: 'TLT', mult: 3, expense: 0.0091 },
  TYD: { base: 'IEF', mult: 3, expense: 0.0101 },
  UGL: { base: 'GLD', mult: 2, expense: 0.0095 },
};

export function sma(values: number[], n: number): number[] {
  const out = new Array<number>(values.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= n) sum -= values[i - n];
    if (i >= n - 1) out[i] = sum / n;
  }
  return out;
}

export function intersectDates(series: Series[]): string[] {
  if (!series.length) return [];
  let set = new Set(series[0].d);
  for (const s of series.slice(1)) {
    const next = new Set<string>();
    for (const d of s.d) if (set.has(d)) next.add(d);
    set = next;
  }
  return [...set].sort();
}

export function alignTo(dates: string[], s: Series): number[] {
  const m = new Map<string, number>();
  s.d.forEach((d, i) => m.set(d, s.c[i]));
  const out: number[] = [];
  let last = NaN;
  for (const d of dates) {
    const v = m.get(d);
    if (v != null && Number.isFinite(v)) last = v;
    out.push(last);
  }
  return out;
}

export function alignOpens(dates: string[], s: Series, closes: number[]): number[] {
  if (!s.o) return closes.slice();
  const m = new Map<string, number>();
  s.d.forEach((d, i) => {
    const o = s.o?.[i];
    if (o != null && Number.isFinite(o) && o > 0) m.set(d, o);
  });
  return dates.map((d, i) => m.get(d) ?? closes[i]);
}

export function dailyRate(dates: string[], prices: PriceMap): number[] {
  const irx = prices[RATE_SYMBOL];
  if (!irx) return dates.map(() => 0);
  return alignTo(dates, irx).map((y) => (Number.isFinite(y) ? y / 100 / 252 : 0));
}

export function syntheticLeveraged(symbol: string, prices: PriceMap): { series: Series; realFrom: string } | null {
  const spec = LEVERAGED[symbol];
  const base = prices[spec?.base ?? ''];
  const real = prices[symbol];
  if (!spec || !base || !real || !real.d.length) return null;
  const realFrom = real.d[0];
  const rf = dailyRate(base.d, prices);
  const d: string[] = [];
  const c: number[] = [];
  let level = 1;
  let i = 0;
  for (; i < base.d.length && base.d[i] < realFrom; i++) {
    if (i > 0) {
      const r = base.c[i] / base.c[i - 1] - 1;
      level *= 1 + spec.mult * r - spec.expense / 252 - (spec.mult - 1) * (rf[i - 1] + SWAP_SPREAD / 252);
      level = Math.max(level, 1e-9);
    }
    d.push(base.d[i]);
    c.push(level);
  }
  if (!d.length) return { series: real, realFrom };
  const bridgeDate = d[d.length - 1];
  const realIdx = real.d.findIndex((x) => x >= realFrom);
  const baseAtStart = base.d.indexOf(realFrom);
  if (baseAtStart > 0) {
    const r = base.c[baseAtStart] / base.c[baseAtStart - 1] - 1;
    level *= 1 + spec.mult * r - spec.expense / 252 - (spec.mult - 1) * (rf[baseAtStart - 1] + SWAP_SPREAD / 252);
  }
  const scale = level / real.c[realIdx];
  for (let j = realIdx; j < real.d.length; j++) {
    if (real.d[j] <= bridgeDate) continue;
    d.push(real.d[j]);
    c.push(real.c[j] * scale);
  }
  return { series: { d, c }, realFrom };
}
