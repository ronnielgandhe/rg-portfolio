import type { PriceMap } from './types.ts';
import { alignOpens, alignTo, intersectDates } from './series.ts';

export interface PlayLeg {
  symbol: string;
  side: 'long' | 'short';
  weight: number;
}

export interface Tracked {
  dates: string[];
  values: number[];
  bench: number[];
  before: { dates: string[]; values: number[] };
  entryDate: string | null;
}

export function parsePlay(s: string): PlayLeg[] {
  return s
    .split(',')
    .map((part) => part.trim().split(/\s+/))
    .filter((p) => p.length >= 1 && p[0])
    .map(([symbol, side = 'long', w = '100']) => ({ symbol: symbol.toUpperCase(), side: side.toLowerCase() === 'short' ? 'short' : 'long', weight: Number(w) / 100 }));
}

const legValue = (side: PlayLeg['side'], dollars: number, ratio: number) => (side === 'long' ? dollars * ratio : Math.max(0, dollars * (2 - ratio)));

export function trackPlay(legs: PlayLeg[], benchmark: string, prices: PriceMap, from: string, initial = 1000, costBps = 5, beforeDays = 63): Tracked {
  const syms = [...new Set([...legs.map((l) => l.symbol), benchmark])];
  const all = intersectDates(syms.map((s) => prices[s]).filter(Boolean));
  const total = legs.reduce((a, l) => a + l.weight, 0) || 1;
  const px: Record<string, number[]> = {};
  const po: Record<string, number[]> = {};
  for (const s of syms) {
    px[s] = alignTo(all, prices[s]);
    po[s] = alignOpens(all, prices[s], px[s]);
  }
  const e = all.findIndex((d) => d > from);
  const refIdx = e < 0 ? all.length - 1 : e - 1;
  const b0 = Math.max(0, refIdx - beforeDays);
  const value = (i: number, ref: (s: string) => number, base: number) => legs.reduce((a, l) => a + legValue(l.side, (base * l.weight) / total, px[l.symbol][i] / ref(l.symbol)), 0);
  const before = { dates: all.slice(b0, refIdx + 1), values: all.slice(b0, refIdx + 1).map((_, k) => value(b0 + k, (s) => px[s][refIdx], initial)) };
  if (e < 0) return { dates: [], values: [], bench: [], before, entryDate: null };
  const start = initial * (1 - costBps / 1e4);
  const dates = [from];
  const values = [initial];
  const bench = [initial];
  for (let i = e; i < all.length; i++) {
    dates.push(all[i]);
    values.push(value(i, (s) => po[s][e], start));
    bench.push((initial * px[benchmark][i]) / po[benchmark][e]);
  }
  return { dates, values, bench, before, entryDate: all[e] };
}

export function status(ret: number, days: number): 'working' | 'not yet' | 'wrong' {
  if (days < 1) return 'not yet';
  if (ret >= 0.02) return 'working';
  if (ret <= -0.1) return 'wrong';
  return 'not yet';
}
