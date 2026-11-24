import type { Metrics } from './types.ts';

const DAY = 86400000;

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY);
}

export function drawdownSeries(equity: number[]): number[] {
  let peak = -Infinity;
  return equity.map((v) => {
    peak = Math.max(peak, v);
    return peak > 0 ? v / peak - 1 : 0;
  });
}

export function computeMetrics(dates: string[], equity: number[], rf: number[], periodsPerYear = 252): Metrics {
  const n = equity.length;
  const initial = equity[0];
  const final = equity[n - 1];
  const years = Math.max(daysBetween(dates[0].slice(0, 10), dates[n - 1].slice(0, 10)) / 365.25, 1 / 365.25);
  const totalReturn = final / initial - 1;
  const cagr = final > 0 ? Math.pow(final / initial, 1 / years) - 1 : -1;

  let peak = equity[0];
  let peakI = 0;
  let maxDd = 0;
  let maxDdDollars = 0;
  let ddPeak = 0;
  let ddTrough = 0;
  let dPeak = 0;
  let dTrough = 0;
  let uwStart = 0;
  let longest = 0;
  let longFrom = 0;
  let longTo = 0;
  let recovered = true;
  for (let i = 1; i < n; i++) {
    if (equity[i] >= peak) {
      const len = daysBetween(dates[peakI].slice(0, 10), dates[i].slice(0, 10));
      if (i - 1 > peakI && len > longest) {
        longest = len;
        longFrom = peakI;
        longTo = i;
      }
      peak = equity[i];
      peakI = i;
      uwStart = i;
      continue;
    }
    const dd = equity[i] / peak - 1;
    if (dd < maxDd) {
      maxDd = dd;
      ddPeak = peakI;
      ddTrough = i;
    }
    if (peak - equity[i] > maxDdDollars) {
      maxDdDollars = peak - equity[i];
      dPeak = peakI;
      dTrough = i;
    }
  }
  if (peakI < n - 1) {
    const len = daysBetween(dates[uwStart].slice(0, 10), dates[n - 1].slice(0, 10));
    if (len > longest) {
      longest = len;
      longFrom = uwStart;
      longTo = n - 1;
      recovered = false;
    }
  }

  const rets: number[] = [];
  for (let i = 1; i < n; i++) rets.push(equity[i - 1] > 0 ? equity[i] / equity[i - 1] - 1 - (rf[i] ?? 0) : 0);
  const mean = rets.reduce((a, b) => a + b, 0) / Math.max(rets.length, 1);
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(rets.length - 1, 1));
  const sharpe = sd > 0 ? (mean / sd) * Math.sqrt(periodsPerYear) : 0;

  const yearEnd = new Map<string, number>();
  const yearStart = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const y = dates[i].slice(0, 4);
    if (!yearStart.has(y)) yearStart.set(y, i === 0 ? equity[0] : equity[i - 1]);
    yearEnd.set(y, equity[i]);
  }
  let worstYear: Metrics['worstYear'] = null;
  for (const [y, end] of yearEnd) {
    const ret = end / (yearStart.get(y) as number) - 1;
    if (!worstYear || ret < worstYear.ret) worstYear = { year: y, ret };
  }

  return {
    start: dates[0],
    end: dates[n - 1],
    years,
    initial,
    final,
    totalReturn,
    cagr,
    maxDrawdown: maxDd,
    maxDrawdownDollars: maxDdDollars,
    dollarPeakDate: dates[dPeak],
    dollarTroughDate: dates[dTrough],
    dollarPeak: equity[dPeak],
    ddPeakDate: dates[ddPeak],
    ddTroughDate: dates[ddTrough],
    worstYear,
    sharpe,
    vol: sd * Math.sqrt(periodsPerYear),
    longestUnderwaterDays: longest,
    underwaterFrom: dates[longFrom],
    underwaterTo: dates[longTo],
    recovered,
  };
}

export function sliceFrom(dates: string[], arr: number[], from: string): { d: string[]; v: number[] } {
  const i = dates.findIndex((d) => d >= from);
  if (i < 0) return { d: [], v: [] };
  return { d: dates.slice(i), v: arr.slice(i) };
}
