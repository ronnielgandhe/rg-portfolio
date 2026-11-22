import { cached, pool } from './http.ts';
import { daily, type Daily } from './yahoo.ts';

export const ASSETS = [
  { sym: 'SPY', name: 's&p 500', note: 'the 500 biggest us companies' },
  { sym: 'QQQ', name: 'nasdaq 100', note: 'big tech heavy' },
  { sym: 'IWM', name: 'small caps', note: 'russell 2000, smaller us companies' },
  { sym: '^TNX', name: '10 year yield', note: 'what the us government pays to borrow for 10 years', unit: 'pct' },
  { sym: 'DX-Y.NYB', name: 'us dollar', note: 'dollar vs a basket of major currencies' },
  { sym: 'GC=F', name: 'gold', note: 'front month futures, $ per ounce' },
  { sym: 'CL=F', name: 'oil', note: 'wti crude, front month, $ per barrel' },
  { sym: 'BTC-USD', name: 'bitcoin', note: 'trades every day, weekends too' },
  { sym: '^VIX', name: 'vix', note: 'expected s&p swings over the next 30 days', unit: 'pts' },
  { sym: '^VIX3M', name: 'vix 3 month', note: 'the same, over 3 months', unit: 'pts' },
] as const;

export const SECTORS = [
  { sym: 'XLK', name: 'tech' },
  { sym: 'XLC', name: 'communication' },
  { sym: 'XLY', name: 'consumer discretionary' },
  { sym: 'XLF', name: 'financials' },
  { sym: 'XLV', name: 'health care' },
  { sym: 'XLI', name: 'industrials' },
  { sym: 'XLE', name: 'energy' },
  { sym: 'XLB', name: 'materials' },
  { sym: 'XLP', name: 'consumer staples' },
  { sym: 'XLU', name: 'utilities' },
  { sym: 'XLRE', name: 'real estate' },
];

const EXTRA = ['HYG', 'IEF', 'RSP'];

export interface Tile {
  sym: string;
  name: string;
  note: string;
  unit?: string;
  price: number;
  prev: number;
  ch1d: number;
  ch1m: number;
  ytd: number;
  above50: boolean | null;
  above200: boolean | null;
  spark: number[];
  date: string;
}

export interface GaugePart {
  name: string;
  reading: string;
  points: number;
  why: string;
}

const smaLast = (x: number[], n: number) => (x.length >= n ? x.slice(-n).reduce((a, b) => a + b, 0) / n : NaN);
const back = (x: number[], n: number) => x[Math.max(0, x.length - 1 - n)];

function tile(meta: { sym: string; name: string; note?: string; unit?: string }, d: Daily): Tile {
  const raw = d.raw;
  const last = raw[raw.length - 1];
  const prev = raw[raw.length - 2] ?? last;
  const year = d.d[d.d.length - 1].slice(0, 4);
  const firstThisYear = d.d.findIndex((x) => x.startsWith(year));
  const ytdBase = firstThisYear > 0 ? raw[firstThisYear - 1] : raw[0];
  const m50 = smaLast(d.c, 50);
  const m200 = smaLast(d.c, 200);
  const adjLast = d.c[d.c.length - 1];
  return {
    sym: meta.sym,
    name: meta.name,
    note: meta.note ?? '',
    unit: meta.unit,
    price: last,
    prev,
    ch1d: last / prev - 1,
    ch1m: last / back(raw, 21) - 1,
    ytd: last / ytdBase - 1,
    above50: Number.isFinite(m50) ? adjLast > m50 : null,
    above200: Number.isFinite(m200) ? adjLast > m200 : null,
    spark: raw.slice(-63).map((x) => Number(x.toPrecision(6))),
    date: d.d[d.d.length - 1],
  };
}

export function buildTape() {
  return cached('tape', 10 * 60_000, async () => {
    const from = Math.floor(Date.now() / 86400000 - 420) * 86400;
    const syms = [...ASSETS.map((a) => a.sym), ...SECTORS.map((s) => s.sym), ...EXTRA];
    const res = await pool(syms, 6, (s) => daily(s, from, 10 * 60_000));
    const got: Record<string, Daily> = {};
    res.forEach((r, i) => r.status === 'fulfilled' && (got[syms[i]] = r.value));
    if (!Object.keys(got).length) throw new Error('yahoo down');

    const tiles = ASSETS.map((a) => (got[a.sym] ? tile(a, got[a.sym]) : { sym: a.sym, name: a.name, note: a.note, down: true }));
    const sectors = SECTORS.map((s) => (got[s.sym] ? tile({ ...s, note: '' }, got[s.sym]) : { sym: s.sym, name: s.name, down: true }));
    const live = sectors.filter((s): s is Tile => !('down' in s));

    const parts: GaugePart[] = [];
    const spy = got.SPY;
    if (spy) {
      const m200 = smaLast(spy.c, 200);
      const m50 = smaLast(spy.c, 50);
      const p = spy.c[spy.c.length - 1];
      parts.push({ name: 's&p vs its 200 day average', reading: `${p > m200 ? 'above' : 'below'} by ${Math.abs((p / m200 - 1) * 100).toFixed(1)}%`, points: p > m200 ? 1 : -1, why: 'the classic long term trend line. above it, dips tend to get bought.' });
      parts.push({ name: 's&p vs its 50 day average', reading: `${p > m50 ? 'above' : 'below'} by ${Math.abs((p / m50 - 1) * 100).toFixed(1)}%`, points: p > m50 ? 1 : -1, why: 'the shorter trend. flips first when the mood changes.' });
    }
    const vix = got['^VIX'];
    const vix3 = got['^VIX3M'];
    if (vix) {
      const v = vix.raw[vix.raw.length - 1];
      parts.push({ name: 'vix level', reading: v.toFixed(1), points: v < 18 ? 1 : v > 25 ? -1 : 0, why: 'under 18 is calm, over 25 is scared, in between counts as zero.' });
    }
    if (vix && vix3) {
      const r = vix.raw[vix.raw.length - 1] / vix3.raw[vix3.raw.length - 1];
      parts.push({ name: 'vix term structure', reading: `30 day / 3 month = ${r.toFixed(2)}`, points: r < 0.95 ? 1 : r > 1 ? -1 : 0, why: 'normally near term fear is lower than later fear. when it flips above 1, people want protection right now.' });
    }
    if (live.length) {
      const share = live.filter((s) => s.above50).length / live.length;
      parts.push({ name: 'breadth: sectors above their 50 day', reading: `${live.filter((s) => s.above50).length} of ${live.length}`, points: share >= 0.6 ? 1 : share <= 0.4 ? -1 : 0, why: 'is the whole market going up, or just a few names carrying it?' });
    }
    if (got.HYG && got.IEF) {
      const rel = got.HYG.c[got.HYG.c.length - 1] / back(got.HYG.c, 20) - (got.IEF.c[got.IEF.c.length - 1] / back(got.IEF.c, 20));
      parts.push({ name: 'credit: junk bonds vs treasuries, 20 days', reading: `${rel >= 0 ? '+' : ''}${(rel * 100).toFixed(1)} pts`, points: rel > 0 ? 1 : -1, why: 'lenders get picky before stocks do. junk bonds lagging is an early warning.' });
    }
    if (got.IWM && spy) {
      const rel = got.IWM.c[got.IWM.c.length - 1] / back(got.IWM.c, 20) - spy.c[spy.c.length - 1] / back(spy.c, 20);
      parts.push({ name: 'small caps vs s&p, 20 days', reading: `${rel >= 0 ? '+' : ''}${(rel * 100).toFixed(1)} pts`, points: rel > 0 ? 1 : -1, why: 'small companies need cheap money and a good economy. them leading is risk on.' });
    }
    if (got.RSP && spy) {
      const rel = got.RSP.c[got.RSP.c.length - 1] / back(got.RSP.c, 20) - spy.c[spy.c.length - 1] / back(spy.c, 20);
      parts.push({ name: 'equal weight vs cap weight s&p, 20 days', reading: `${rel >= 0 ? '+' : ''}${(rel * 100).toFixed(1)} pts`, points: rel > 0 ? 1 : -1, why: 'the average stock beating the index means the rally is broad, not five megacaps.' });
    }
    const score = parts.length ? Math.round((parts.reduce((a, p) => a + p.points, 0) / parts.length) * 100) : 0;
    const asOf = spy?.d[spy.d.length - 1] ?? '';
    return {
      tiles,
      sectors,
      gauge: { score, parts },
      failed: syms.filter((s) => !got[s]),
      asOf,
      fetchedAt: new Date().toISOString(),
      source: 'Yahoo Finance chart API',
    };
  });
}
