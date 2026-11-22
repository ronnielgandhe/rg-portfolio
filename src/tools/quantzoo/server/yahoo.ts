import { cached, getJson } from './http.ts';

export interface Daily {
  d: string[];
  c: number[];
  o: number[];
  raw: number[];
}

export interface Intraday {
  t: number[];
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
}

const BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const SYMBOL = /^[A-Z0-9^=.\-]{1,12}$/;

export function validSymbol(s: string): boolean {
  return SYMBOL.test(s);
}

export function daily(symbol: string, fromUnix = 0, ttlMs = 6 * 3600_000): Promise<Daily> {
  return cached(`d:${symbol}:${fromUnix}:${ttlMs}`, ttlMs, async () => {
    const now = Math.floor(Date.now() / 1000);
    const data = await getJson(`${BASE}${encodeURIComponent(symbol)}?period1=${fromUnix}&period2=${now}&interval=1d&events=div%2Csplit`, 12000);
    const r = data?.chart?.result?.[0];
    if (!r?.timestamp) throw new Error(`no data for ${symbol}`);
    const off = Number(r.meta?.gmtoffset ?? 0);
    const q = r.indicators?.quote?.[0] ?? {};
    const adj: (number | null)[] = r.indicators?.adjclose?.[0]?.adjclose ?? q.close;
    const out: Daily = { d: [], c: [], o: [], raw: [] };
    const seen = new Set<string>();
    r.timestamp.forEach((t: number, i: number) => {
      const c = q.close?.[i];
      const a = adj?.[i];
      if (c == null || a == null || !(c > 0)) return;
      const d = new Date((t + off) * 1000).toISOString().slice(0, 10);
      if (seen.has(d)) return;
      seen.add(d);
      const o = q.open?.[i];
      out.d.push(d);
      out.c.push(a);
      out.raw.push(c);
      out.o.push(o != null && o > 0 ? (o * a) / c : a);
    });
    return out;
  });
}

export function intraday(symbol: string, interval: string, range: string): Promise<Intraday> {
  return cached(`i:${symbol}:${interval}:${range}`, 20 * 60_000, async () => {
    const data = await getJson(`${BASE}${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`, 15000);
    const r = data?.chart?.result?.[0];
    if (!r?.timestamp) throw new Error(`no data for ${symbol}`);
    const q = r.indicators?.quote?.[0] ?? {};
    const out: Intraday = { t: [], o: [], h: [], l: [], c: [], v: [] };
    r.timestamp.forEach((t: number, i: number) => {
      const o = q.open?.[i];
      const h = q.high?.[i];
      const l = q.low?.[i];
      const c = q.close?.[i];
      if ([o, h, l, c].some((x) => x == null || !(x > 0))) return;
      out.t.push(t);
      out.o.push(o);
      out.h.push(h);
      out.l.push(l);
      out.c.push(c);
      out.v.push(q.volume?.[i] ?? 0);
    });
    return out;
  });
}
