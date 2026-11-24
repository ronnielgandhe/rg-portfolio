import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runPortfolio, runBars, symbolsFor, computeMetrics, sliceFrom, tradeStats } from '../src/tools/quantzoo/engine/index.ts';
import { daily, intraday } from '../src/tools/quantzoo/server/yahoo.ts';

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const cacheDir = path.join(os.tmpdir(), 'quantzoo-cache');
fs.mkdirSync(cacheDir, { recursive: true });

async function load(key, fn) {
  const f = path.join(cacheDir, key.replace(/[^A-Za-z0-9=._-]/g, '_') + '.json');
  if (fs.existsSync(f) && Date.now() - fs.statSync(f).mtimeMs < 12 * 3600_000) return JSON.parse(fs.readFileSync(f, 'utf8'));
  const v = await fn();
  fs.writeFileSync(f, JSON.stringify(v));
  return v;
}

const pct = (x) => (x * 100).toFixed(1) + '%';
const usd = (x) => '$' + Math.round(x).toLocaleString('en-US');

async function runOne(cfg) {
  if (cfg.kind === 'bars') {
    const bars = await load(`bars-${cfg.symbol}-${cfg.interval}`, () => intraday(cfg.symbol, cfg.interval, cfg.range));
    const r = runBars(cfg, bars);
    const m = computeMetrics(r.dates, r.equity, r.rf, r.periodsPerYear);
    const s = tradeStats(r.trades);
    return { line: `trades ${s.count} (L${s.longs}/S${s.shorts}) win ${pct(s.winRate)} pf ${s.profitFactor.toFixed(2)} net ${usd(s.net)} avg ${usd(s.avg)} maxDD ${usd(m.maxDrawdownDollars)} costs ${usd(r.costs)} | ${m.start.slice(0, 10)} to ${m.end.slice(0, 10)}`, r, m };
  }
  const prices = {};
  for (const s of symbolsFor(cfg)) prices[s] = await load(`daily-${s}`, () => daily(s));
  const r = runPortfolio(cfg, prices);
  const m = computeMetrics(r.dates, r.equity, r.rf);
  const b = computeMetrics(r.dates, r.benchmark, r.rf);
  let oos = '';
  if (cfg.oosStart) {
    const e = sliceFrom(r.dates, r.equity, cfg.oosStart);
    const rf = sliceFrom(r.dates, r.rf, cfg.oosStart);
    const bm = sliceFrom(r.dates, r.benchmark, cfg.oosStart);
    const mo = computeMetrics(e.d, e.v, rf.v);
    const bo = computeMetrics(bm.d, bm.v, rf.v);
    oos = ` | oos ${cfg.oosStart}: cagr ${pct(mo.cagr)} dd ${pct(mo.maxDrawdown)} sharpe ${mo.sharpe.toFixed(2)} (bench cagr ${pct(bo.cagr)} dd ${pct(bo.maxDrawdown)})`;
  }
  const line = `$10k->${usd(m.final)} cagr ${pct(m.cagr)} dd ${pct(m.maxDrawdown)} (-${usd(m.maxDrawdownDollars)}) worst ${m.worstYear?.year} ${pct(m.worstYear?.ret ?? 0)} sharpe ${m.sharpe.toFixed(2)} uw ${m.longestUnderwaterDays}d costs ${usd(r.costs)} switches ${r.events.length - 1} | bench ${usd(b.final)} cagr ${pct(b.cagr)} dd ${pct(b.maxDrawdown)} sharpe ${b.sharpe.toFixed(2)} | ${m.start} to ${m.end}${r.syntheticUntil ? ' synth<' + r.syntheticUntil : ''}${oos}`;
  return { line, r, m, b };
}

const args = process.argv.slice(2);
if (args[0] === '--config') {
  const cfgs = JSON.parse(fs.readFileSync(args[1], 'utf8'));
  for (const [name, cfg] of Object.entries(Array.isArray(cfgs) ? Object.fromEntries(cfgs.map((c, i) => [String(i), c])) : cfgs)) {
    try {
      console.log(name.padEnd(14), (await runOne(cfg)).line);
    } catch (e) {
      console.log(name.padEnd(14), 'ERROR', e.message);
    }
  }
} else if (args[0]) {
  const f = path.join(root, 'src/data/quantzoo/' + (fs.existsSync(path.join(root, 'src/data/quantzoo/ideas', args[0] + '.versions.json')) ? 'ideas/' + args[0] + '.versions.json' : 'algorithms/' + args[0] + '/versions.json'));
  const versions = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const v of versions) console.log(v.id.padEnd(4), (await runOne(v.config)).line, '\n     ', v.note);
} else {
  console.log('usage: node scripts/quantzoo-research.mjs <slug> | --config file.json');
}
