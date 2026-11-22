import { daily, type Daily } from '../../server/yahoo.ts';
import { cached, guard, pool } from './common.ts';
import type { Down, GaugePart, Quote, TapeData } from '../types.ts';

type Meta = { sym: string; name: string; group: string; unit?: Quote['unit'] };

export const QUOTES: Meta[] = [
  { sym: '^GSPC', name: 's&p 500', group: 'stocks' },
  { sym: '^IXIC', name: 'nasdaq', group: 'stocks' },
  { sym: '^RUT', name: 'small companies', group: 'stocks' },
  { sym: '^VIX', name: 'fear index', group: 'fear', unit: 'pts' },
  { sym: '^TNX', name: '10 year rate', group: 'rates', unit: 'pct' },
  { sym: 'GC=F', name: 'gold', group: 'things', unit: 'usd' },
  { sym: 'CL=F', name: 'oil', group: 'things', unit: 'usd' },
  { sym: 'BTC-USD', name: 'bitcoin', group: 'things', unit: 'usd' },
];

export const SECTORS: Meta[] = [
  ['XLK', 'tech'],
  ['XLC', 'media and telecom'],
  ['XLY', 'shopping and cars'],
  ['XLF', 'financials'],
  ['XLV', 'health care'],
  ['XLI', 'industrials'],
  ['XLE', 'energy'],
  ['XLB', 'materials and mining'],
  ['XLP', 'groceries and basics'],
  ['XLU', 'utilities'],
  ['XLRE', 'property'],
].map(([sym, name]) => ({ sym, name, group: 'sector', unit: 'usd' as const }));

const HELPERS = ['^VIX3M', 'HYG', 'IEF', 'RSP', 'SPY'];

const sma = (x: number[], n: number) => (x.length >= n ? x.slice(-n).reduce((a, b) => a + b, 0) / n : NaN);
const last = <T,>(x: T[]): T => x[x.length - 1];
const ret = (x: number[], n: number) => last(x) / x[Math.max(0, x.length - 1 - n)] - 1;
const sign = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}`;

function quote(m: Meta, d: Daily): Quote {
  const price = last(d.raw);
  const prev = d.raw[d.raw.length - 2] ?? price;
  const m50 = sma(d.c, 50);
  const m200 = sma(d.c, 200);
  return {
    ...m,
    price,
    ch1d: price / prev - 1,
    abs1d: price - prev,
    above50: Number.isFinite(m50) ? last(d.c) > m50 : null,
    above200: Number.isFinite(m200) ? last(d.c) > m200 : null,
    spark: d.raw.slice(-66).map((x) => Number(x.toPrecision(6))),
    date: last(d.d),
  };
}

function gauge(got: Record<string, Daily>, sectors: Quote[]): GaugePart[] {
  const parts: GaugePart[] = [];
  const add = (name: string, reading: string, points: -1 | 0 | 1, rule: string) => parts.push({ name, reading, points, rule });
  const spx = got['^GSPC'];
  if (spx) {
    const p = last(spx.c);
    const m200 = sma(spx.c, 200);
    const m50 = sma(spx.c, 50);
    add('stocks above their long run average (200 days)', `${sign(p / m200 - 1)}%`, p > m200 ? 1 : -1, 'yes +1, no -1');
    add('stocks above their recent average (50 days)', `${sign(p / m50 - 1)}%`, p > m50 ? 1 : -1, 'yes +1, no -1');
  }
  const vix = got['^VIX'];
  if (vix) {
    const v = last(vix.raw);
    add('fear index is low', v.toFixed(1), v < 17 ? 1 : v > 24 ? -1 : 0, 'under 17 +1, over 24 -1, else 0');
    const v3 = got['^VIX3M'];
    if (v3) {
      const r = v / last(v3.raw);
      add('people more worried about later than right now', r.toFixed(2), r < 0.92 ? 1 : r > 1 ? -1 : 0, 'this month\'s fear / next 3 months\' fear. under 0.92 +1, over 1 -1');
    }
  }
  if (sectors.length) {
    const n = sectors.filter((s) => s.above50).length;
    add('most parts of the market trending up', `${n} of ${sectors.length}`, n / sectors.length >= 0.6 ? 1 : n / sectors.length <= 0.4 ? -1 : 0, '7 or more of 11 +1, 4 or fewer -1');
  }
  const rel = (a: string, b: string, name: string) => {
    if (!got[a] || !got[b]) return;
    const r = ret(got[a].c, 20) - ret(got[b].c, 20);
    add(name, `${sign(r)} pts`, r > 0 ? 1 : -1, 'over the last month. yes +1, no -1');
  };
  rel('HYG', 'IEF', 'risky loans doing better than safe ones');
  rel('^RUT', '^GSPC', 'small companies keeping up with big ones');
  rel('RSP', 'SPY', 'the average stock keeping up with the giants');
  rel('XLY', 'XLP', 'nice to have stocks beating need to have ones');
  return parts;
}

export function buildTape(down: Set<string> = new Set()): Promise<TapeData> {
  const load = async () => {
    guard(down, 'yahoo');
    const from = Math.floor(Date.now() / 86400000 - 400) * 86400;
    const metas = [...QUOTES, ...SECTORS];
    const syms = [...metas.map((m) => m.sym), ...HELPERS];
    const res = await pool(syms, 6, (s) => daily(s, from, 5 * 60_000));
    const got: Record<string, Daily> = {};
    res.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value.raw.length > 2) got[syms[i]] = r.value;
    });
    if (!Object.keys(got).length) throw new Error('yahoo down');
    const make = (m: Meta): Quote | Down => (got[m.sym] ? quote(m, got[m.sym]) : { sym: m.sym, name: m.name, group: m.group, down: true });
    const sectors = SECTORS.map(make);
    const live = sectors.filter((s): s is Quote => !('down' in s));
    const parts = gauge(got, live);
    const score = parts.length ? Math.round((parts.reduce((a, p) => a + p.points, 0) / parts.length) * 100) : 0;
    return {
      quotes: QUOTES.map(make),
      sectors,
      breadth: {
        up: live.filter((s) => s.ch1d > 0).length,
        above50: live.filter((s) => s.above50).length,
        above200: live.filter((s) => s.above200).length,
        of: live.length,
      },
      gauge: { score, parts },
      asOf: got['^GSPC'] ? last(got['^GSPC'].d) : '',
      fetchedAt: new Date().toISOString(),
    };
  };
  return down.size ? load() : cached('board:tape', 5 * 60_000, load);
}
