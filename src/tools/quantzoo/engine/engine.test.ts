import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runPortfolio } from './backtest.ts';
import { computeMetrics, drawdownSeries } from './metrics.ts';
import { cleanBars, runBars, type Bars } from './bars.ts';
import type { BarConfig, PortfolioConfig, PriceMap } from './types.ts';

const close = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

const base = (over: Partial<PortfolioConfig>): PortfolioConfig => ({
  kind: 'portfolio',
  start: '2000-01-01',
  initial: 10000,
  universe: [{ symbol: 'A', weight: 1 }],
  rebalance: 'none',
  costBps: 0,
  benchmark: 'A',
  ...over,
});

test('buy and hold compounds daily returns', () => {
  const prices: PriceMap = { A: { d: ['2020-01-01', '2020-01-02', '2020-01-03'], c: [100, 110, 121] } };
  const r = runPortfolio(base({}), prices);
  assert.deepEqual(r.equity.map((x) => Math.round(x * 1e6) / 1e6), [10000, 11000, 12100]);
  assert.deepEqual(r.benchmark, [10000, 11000, 12100]);
});

test('monthly rebalance resets weights at the month boundary', () => {
  const d = ['2020-01-30', '2020-01-31', '2020-02-03', '2020-02-04'];
  const prices: PriceMap = { A: { d, c: [100, 200, 200, 300] }, B: { d, c: [100, 100, 50, 50] } };
  const cfg = base({ universe: [{ symbol: 'A', weight: 0.5 }, { symbol: 'B', weight: 0.5 }], rebalance: 'monthly' });
  const r = runPortfolio(cfg, prices);
  [10000, 15000, 12500, 15625].forEach((v, i) => close(r.equity[i], v));
  const hold = runPortfolio({ ...cfg, rebalance: 'none' }, prices);
  close(hold.equity[3], 17500);
});

test('trading costs come out of turnover', () => {
  const prices: PriceMap = { A: { d: ['2020-01-01', '2020-01-02'], c: [100, 100] } };
  const r = runPortfolio(base({ costBps: 10 }), prices);
  close(r.equity[0], 9990);
  close(r.costs, 10);
});

test('drawdown, dollars and underwater', () => {
  const dates = ['2020-01-01', '2020-01-02', '2020-01-03', '2020-01-04', '2020-01-05'];
  const eq = [100, 120, 90, 130, 65];
  const m = computeMetrics(dates, eq, [0, 0, 0, 0, 0]);
  close(m.maxDrawdown, -0.5);
  close(m.maxDrawdownDollars, 65);
  assert.equal(m.ddPeakDate, '2020-01-04');
  assert.equal(m.ddTroughDate, '2020-01-05');
  assert.equal(m.longestUnderwaterDays, 2);
  assert.equal(m.recovered, true);
  assert.deepEqual(drawdownSeries(eq).map((x) => Math.round(x * 1000) / 1000), [0, 0, -0.25, 0, -0.5]);
});

test('cagr over two calendar years', () => {
  const m = computeMetrics(['2020-01-01', '2022-01-01'], [100, 121], [0, 0]);
  close(m.cagr, Math.pow(1.21, 1 / (731 / 365.25)) - 1);
  close(m.cagr, 0.1, 1e-3);
});

test('sharpe from daily excess returns', () => {
  const m = computeMetrics(['2020-01-01', '2020-01-02', '2020-01-03', '2020-01-06', '2020-01-07'], [100, 102, 102, 104.04, 104.04], [0, 0, 0, 0, 0]);
  close(m.sharpe, (0.01 / Math.sqrt((4 * 0.0001) / 3)) * Math.sqrt(252), 1e-6);
});

test('worst calendar year', () => {
  const m = computeMetrics(['2020-06-01', '2020-12-31', '2021-12-31', '2022-12-30'], [100, 120, 90, 99], [0, 0, 0, 0]);
  assert.equal(m.worstYear?.year, '2021');
  close(m.worstYear?.ret ?? 0, -0.25);
});

test('trend filter trades at the next open: it eats the crash day, then steps aside', () => {
  const d = ['2020-01-01', '2020-01-02', '2020-01-03', '2020-01-06', '2020-01-07', '2020-01-08', '2020-01-09'];
  const prices: PriceMap = { A: { d, c: [100, 100, 100, 100, 100, 50, 25], o: [100, 100, 100, 100, 100, 100, 50] } };
  const cfg = base({ trend: { signal: 'A', sma: 2, riskOff: [{ symbol: 'CASH', weight: 1 }] } });
  const r = runPortfolio(cfg, prices);
  close(r.equity[5], 5000);
  close(r.equity[6], 5000);
  assert.ok(r.events.some((e) => e.kind === 'risk-off' && e.date === '2020-01-09'));
  const noOpen = runPortfolio(cfg, { A: { d, c: prices.A.c } });
  close(noOpen.equity[6], 2500);
});

test('no lookahead: changing future prices never changes past equity', () => {
  const d: string[] = [];
  const c: number[] = [];
  let p = 100;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  for (let i = 0; i < 300; i++) {
    const dt = new Date(Date.UTC(2020, 0, 1 + i));
    d.push(dt.toISOString().slice(0, 10));
    p *= 1 + rnd() * 0.04;
    c.push(p);
  }
  const cfg = base({ trend: { signal: 'A', sma: 20, riskOff: [{ symbol: 'CASH', weight: 1 }] }, volTarget: { annual: 0.2, lookback: 20, maxExposure: 1 }, costBps: 5 });
  const a = runPortfolio(cfg, { A: { d, c } });
  const k = 150;
  const c2 = c.map((x, i) => (i > k ? x * (i % 2 ? 3 : 0.2) : x));
  const b = runPortfolio(cfg, { A: { d, c: c2 } });
  for (let i = 0; i <= k; i++) close(a.equity[i], b.equity[i], 1e-9);
  assert.notEqual(a.equity[k + 2], b.equity[k + 2]);
});

test('cash earns the bill rate from the prior day', () => {
  const d = ['2020-01-01', '2020-01-02', '2020-01-03'];
  const prices: PriceMap = { A: { d, c: [100, 100, 100] }, '^IRX': { d, c: [2.52, 2.52, 2.52] } };
  const r = runPortfolio(base({ universe: [{ symbol: 'CASH', weight: 1 }] }), prices);
  close(r.equity[2], 10000 * 1.0001 * 1.0001);
});

const barCfg = (over: Partial<BarConfig>): BarConfig => ({
  kind: 'bars',
  strategy: 'donchian808',
  symbol: 'X',
  interval: '5m',
  range: '60d',
  timezone: 'UTC',
  pointValue: 2,
  tickSize: 0.25,
  initial: 50000,
  commission: 0,
  slippageTicks: 0,
  params: { donchLength: 5, emaLength: 5, atrPeriod: 5, trailMult: 1.2, riskDollars: 100, contracts: 1, sessionFrom: '00:00', sessionTo: '23:59' },
  ...over,
});

function walk(n: number): Bars {
  const b: Bars = { t: [], o: [], h: [], l: [], c: [], v: [] };
  let p = 1000;
  let seed = 11;
  const rnd = () => ((seed = (seed * 48271) % 2147483647) / 2147483647) - 0.5;
  for (let i = 0; i < n; i++) {
    const o = p;
    p += rnd() * 8 + (Math.floor(i / 200) % 2 ? 0.6 : -0.6);
    const h = Math.max(o, p) + Math.abs(rnd()) * 3;
    const l = Math.min(o, p) - Math.abs(rnd()) * 3;
    b.t.push(1700000000 + i * 300);
    b.o.push(o);
    b.h.push(h);
    b.l.push(l);
    b.c.push(p);
    b.v.push(100 + Math.abs(rnd()) * 50);
  }
  return b;
}

test('donchian as written cannot fire: the channel includes the current bar', () => {
  const r = runBars(barCfg({}), walk(3000));
  assert.equal(r.trades?.length, 0);
  const fixed = runBars(barCfg({ params: { ...barCfg({}).params, channel: 'prior' } }), walk(3000));
  assert.ok((fixed.trades?.length ?? 0) > 10);
});

test('stop fills at the stop level, entries at the next open', () => {
  const b: Bars = { t: [0, 300, 600, 900, 1200, 1500, 1800, 2100], o: [], h: [], l: [], c: [], v: [1, 1, 1, 1, 1, 1, 1, 1] };
  const closes = [100, 100, 100, 100, 100, 101, 101, 60];
  closes.forEach((c, i) => {
    b.o.push(i === 6 ? 102 : i === 7 ? 100 : c);
    b.c.push(c);
    b.h.push(i === 5 ? 106 : Math.max(c, b.o[i]) + 0.1);
    b.l.push(Math.min(c, b.o[i]) - 0.1);
  });
  const r = runBars(barCfg({ params: { ...barCfg({}).params, donchLength: 3, emaLength: 2, atrPeriod: 2, channel: 'prior', trailMult: 1000, riskDollars: 20 } }), b);
  assert.equal(r.trades?.length, 1);
  const t = r.trades![0];
  assert.equal(t.entry, 102);
  close(t.exit, 92);
  close(t.pnl, -20);
});

test('bad tick filter clips a lone spike and leaves normal bars alone', () => {
  const b = walk(500);
  b.o[300] = b.c[299] + 900;
  b.h[300] = b.o[300];
  const { bars, fixed } = cleanBars(b);
  assert.deepEqual(fixed, [b.t[300]]);
  assert.equal(bars.o[300], b.c[299]);
  assert.ok(bars.h[300] < b.c[299] + 50);
  assert.equal(cleanBars(walk(500)).fixed.length, 0);
});

test('a play is tracked from the next open after the day it was written', async () => {
  const { trackPlay, parsePlay, status } = await import('./play.ts');
  const d = ['2020-01-01', '2020-01-02', '2020-01-03', '2020-01-06'];
  const prices: PriceMap = { A: { d, c: [100, 110, 120, 90], o: [100, 105, 118, 100] }, B: { d, c: [50, 50, 50, 50], o: [50, 50, 50, 50] } };
  const legs = parsePlay('A long 50, B short 50');
  assert.deepEqual(legs, [{ symbol: 'A', side: 'long', weight: 0.5 }, { symbol: 'B', side: 'short', weight: 0.5 }]);
  const t = trackPlay(legs, 'A', prices, '2020-01-01', 1000, 0);
  assert.equal(t.entryDate, '2020-01-02');
  close(t.values[1], 500 * (110 / 105) + 500);
  close(t.values[3], 500 * (90 / 105) + 500);
  close(t.before.values[t.before.values.length - 1], 1000);
  const none = trackPlay(legs, 'A', prices, '2020-01-06', 1000, 0);
  assert.equal(none.entryDate, null);
  assert.equal(status(0.05, 3), 'working');
  assert.equal(status(-0.2, 3), 'wrong');
  assert.equal(status(0.01, 3), 'not yet');
});
