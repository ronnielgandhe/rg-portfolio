import { useEffect, useMemo, useState } from 'react';
import type { BarConfig, PortfolioConfig, StrategyConfig, Version } from '../engine/index.ts';
import { loadBars, runConfig, type DataBag, type Run } from './data.ts';
import { pct, usd, num } from './format.ts';
import LineChart from './LineChart.tsx';
import { Tick } from './Tick.tsx';

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function flatten(o: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(o) && o.every((x) => x && typeof x === 'object' && 'symbol' in x)) {
    for (const l of o as { symbol: string; weight: number }[]) out[`${prefix}${l.symbol}`] = pct(l.weight, 0);
    return out;
  }
  if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
    return out;
  }
  out[prefix] = String(o);
  return out;
}

function diff(a: StrategyConfig, b: StrategyConfig) {
  const fa = flatten(a);
  const fb = flatten(b);
  const keys = [...new Set([...Object.keys(fa), ...Object.keys(fb)])];
  const NAMES: Record<string, string> = { 'volTarget.annual': 'target volatility', 'volTarget.lookback': 'vol lookback, days', 'volTarget.maxExposure': 'max exposure', 'trend.sma': 'trend average, days', 'trend.signal': 'trend signal', costBps: 'cost per trade, bps', rebalance: 'rebalance', synthetic: 'synthetic history', start: 'start date', intrabar: 'order inside each bar', slippageTicks: 'slippage, ticks', symbol: 'market' };
  const fmt = (k: string, v?: string) => (v == null ? 'off' : k === 'volTarget.annual' ? pct(Number(v), 0) : v);
  const group = (k: string) => (k.startsWith('trend.') ? 'trend' : k.startsWith('volTarget.') ? 'volTarget' : '');
  return keys
    .filter((k) => fa[k] !== fb[k] && k !== 'oosStart' && !k.startsWith('trend.riskOff') && !['pointValue', 'tickSize', 'commission'].includes(k))
    .filter((k) => !(group(k) && (fa[k] == null || fb[k] == null) && k !== `${group(k)}.${group(k) === 'trend' ? 'sma' : 'annual'}`))
    .map((k) => {
      const name = k.replace(/^params\./, '').replace(/^universe\./, '');
      return { k: NAMES[k] ?? (k.startsWith('universe.') ? `${name.toLowerCase()} weight` : name), from: fmt(k, fa[k]), to: fmt(k, fb[k]) };
    });
}

function Slider({ label, value, min, max, step, fmt, onChange }: { label: string; value: number; min: number; max: number; step: number; fmt: (x: number) => string; onChange: (x: number) => void }) {
  return (
    <label className="qz-field">
      <span className="qz-field-top">
        {label}
        <b>{fmt(value)}</b>
      </span>
      <input className="qz-range" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </label>
  );
}

function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="qz-field">
      <span className="qz-field-top">{label}</span>
      <div className="qz-seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.v} role="radio" aria-checked={o.v === value} className={o.v === value ? 'qz-seg-on' : ''} onClick={() => onChange(o.v)}>
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

const TREND_DEFAULT = { signal: 'SPY', sma: 200, riskOff: [{ symbol: 'CASH', weight: 1 }] };
const VT_DEFAULT = { annual: 0.4, lookback: 20, maxExposure: 1 };

function PortfolioControls({ cfg, set, symbols }: { cfg: PortfolioConfig; set: (c: PortfolioConfig) => void; symbols: string[] }) {
  const weight = (s: string) => cfg.universe.find((l) => l.symbol === s)?.weight ?? 0;
  const setWeight = (s: string, w: number) => {
    const others = cfg.universe.filter((l) => l.symbol !== s);
    const universe = w > 0 ? [...others, { symbol: s, weight: w }] : others;
    const total = universe.reduce((a, l) => a + l.weight, 0) || 1;
    set({ ...cfg, universe: symbols.map((x) => universe.find((l) => l.symbol === x)).filter((l): l is { symbol: string; weight: number } => !!l).map((l) => ({ ...l, weight: Number((l.weight / total).toFixed(4)) })) });
  };
  return (
    <>
      {symbols.map((s) => (
        <Slider key={s} label={`${s.toLowerCase()} weight`} value={Math.round(weight(s) * 100)} min={0} max={100} step={1} fmt={(x) => `${x}%`} onChange={(x) => setWeight(s, x / 100 || 0)} />
      ))}
      <Seg label="rebalance" value={cfg.rebalance} options={[{ v: 'none', l: 'never' }, { v: 'monthly', l: 'monthly' }, { v: 'quarterly', l: 'quarterly' }, { v: 'yearly', l: 'yearly' }]} onChange={(rebalance) => set({ ...cfg, rebalance })} />
      <Seg label="trend filter (spy vs its average)" value={cfg.trend ? 'on' : 'off'} options={[{ v: 'off', l: 'off' }, { v: 'on', l: 'on' }]} onChange={(v) => set({ ...cfg, trend: v === 'on' ? clone(TREND_DEFAULT) : undefined })} />
      {cfg.trend && <Slider label="trend average, days" value={cfg.trend.sma} min={20} max={300} step={10} fmt={(x) => String(x)} onChange={(sma) => set({ ...cfg, trend: { ...cfg.trend!, sma } })} />}
      <Seg label="volatility target" value={cfg.volTarget ? 'on' : 'off'} options={[{ v: 'off', l: 'off' }, { v: 'on', l: 'on' }]} onChange={(v) => set({ ...cfg, volTarget: v === 'on' ? clone(VT_DEFAULT) : undefined })} />
      {cfg.volTarget && (
        <>
          <Slider label="target volatility, per year" value={Math.round(cfg.volTarget.annual * 100)} min={10} max={100} step={5} fmt={(x) => `${x}%`} onChange={(x) => set({ ...cfg, volTarget: { ...cfg.volTarget!, annual: x / 100 } })} />
          <Slider label="volatility lookback, days" value={cfg.volTarget.lookback} min={5} max={120} step={5} fmt={(x) => String(x)} onChange={(lookback) => set({ ...cfg, volTarget: { ...cfg.volTarget!, lookback } })} />
        </>
      )}
      <Slider label="cost per trade" value={cfg.costBps} min={0} max={50} step={1} fmt={(x) => `${x} bps`} onChange={(costBps) => set({ ...cfg, costBps })} />
      <Seg label="history" value={cfg.synthetic ? 'syn' : 'real'} options={[{ v: 'real', l: 'real funds, 2010 on' }, { v: 'syn', l: 'synthetic, 2000 on' }]} onChange={(v) => set({ ...cfg, synthetic: v === 'syn' || undefined, start: v === 'syn' ? '2000-01-03' : '2010-03-11' })} />
    </>
  );
}

const BAR_KNOBS: Record<string, { k: string; label: string; min: number; max: number; step: number }[]> = {
  donchian808: [
    { k: 'donchLength', label: 'channel length, bars', min: 5, max: 60, step: 1 },
    { k: 'emaLength', label: 'trend ema, bars', min: 10, max: 200, step: 5 },
    { k: 'trailMult', label: 'trail, x atr', min: 0.2, max: 5, step: 0.1 },
    { k: 'riskDollars', label: 'stop, dollars', min: 20, max: 400, step: 10 },
  ],
  anchor808: [
    { k: 'lookback', label: 'atr and money flow period', min: 5, max: 30, step: 1 },
    { k: 'atrMult', label: 'band width, x atr', min: 0.5, max: 4, step: 0.1 },
    { k: 'trailMult', label: 'trail, x atr', min: 0.2, max: 5, step: 0.1 },
    { k: 'riskDollars', label: 'stop, dollars', min: 20, max: 200, step: 5 },
  ],
};

const FUTURES: Record<string, { pointValue: number; tickSize: number; commission: number; label: string }> = {
  'MNQ=F': { pointValue: 2, tickSize: 0.25, commission: 0.61, label: 'micro nasdaq' },
  'MGC=F': { pointValue: 10, tickSize: 0.1, commission: 0.76, label: 'micro gold' },
};

function BarControls({ cfg, set }: { cfg: BarConfig; set: (c: BarConfig) => void }) {
  const p = cfg.params;
  const setP = (k: string, v: number | string) => set({ ...cfg, params: { ...p, [k]: v } });
  return (
    <>
      <Seg label="market" value={cfg.symbol} options={Object.entries(FUTURES).map(([v, f]) => ({ v, l: f.label }))} onChange={(symbol) => set({ ...cfg, symbol, pointValue: FUTURES[symbol].pointValue, tickSize: FUTURES[symbol].tickSize, commission: FUTURES[symbol].commission })} />
      {(BAR_KNOBS[cfg.strategy] ?? []).map((kn) => (
        <Slider key={kn.k} label={kn.label} value={Number(p[kn.k])} min={kn.min} max={kn.max} step={kn.step} fmt={(x) => (kn.step < 1 ? x.toFixed(1) : String(x))} onChange={(x) => setP(kn.k, x)} />
      ))}
      {cfg.strategy === 'donchian808' && <Seg label="channel" value={String(p.channel ?? 'current')} options={[{ v: 'current', l: 'as written' }, { v: 'prior', l: 'previous bar' }]} onChange={(v) => setP('channel', v)} />}
      {cfg.strategy === 'anchor808' && <Seg label="anchor" value={String(p.anchorRule ?? 'as-written')} options={[{ v: 'as-written', l: 'as written' }, { v: 'ratchet', l: 'ratchet fix' }]} onChange={(v) => setP('anchorRule', v)} />}
      <Seg label="trail units" value={String(p.trailUnits ?? 'ticks')} options={[{ v: 'ticks', l: 'ticks (original)' }, { v: 'points', l: 'points' }]} onChange={(v) => setP('trailUnits', v)} />
      <Seg label="order inside each bar" value={cfg.intrabar ?? 'tv'} options={[{ v: 'tv', l: 'tradingview' }, { v: 'worst', l: 'worst case' }]} onChange={(intrabar) => set({ ...cfg, intrabar })} />
      <Slider label="slippage per fill" value={cfg.slippageTicks} min={0} max={4} step={1} fmt={(x) => `${x} tick${x === 1 ? '' : 's'}`} onChange={(slippageTicks) => set({ ...cfg, slippageTicks })} />
    </>
  );
}

export default function Tune({ slug, latest, bag, symbols, intraday }: { slug: string; latest: Version; bag: DataBag; symbols: string[]; intraday: boolean }) {
  const [cfg, setCfg] = useState<StrategyConfig>(() => clone(latest.config));
  const [bars, setBars] = useState(bag.bars);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const base = useMemo(() => runConfig(latest.config, bag), [latest, bag]);

  useEffect(() => {
    if (cfg.kind === 'bars' && !bars[`${cfg.symbol}|${cfg.interval}`]) loadBars(cfg.symbol, cfg.interval).then((b) => setBars((x) => ({ ...x, [`${cfg.symbol}|${cfg.interval}`]: b }))).catch(() => setStatus('that market is down right now'));
  }, [cfg, bars]);

  const run: Run | null = useMemo(() => {
    try {
      if (cfg.kind === 'portfolio' && !cfg.universe.length) return null;
      if (cfg.kind === 'bars' && !bars[`${cfg.symbol}|${cfg.interval}`]) return null;
      return runConfig(cfg, { prices: bag.prices, bars });
    } catch {
      return null;
    }
  }, [cfg, bag, bars]);

  const changes = diff(latest.config, cfg);
  const nextId = `v${Number(latest.id.replace(/\D/g, '')) + 1}`;

  const save = async () => {
    const entry: Version = { id: nextId, date: new Date().toISOString().slice(0, 10), note: note.trim() || 'tuned in the browser', config: cfg };
    if (import.meta.env.DEV) {
      try {
        const res = await fetch('/api/quantzoo/versions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, version: entry }) });
        const j = await res.json();
        setStatus(res.ok ? `saved ${j.id} to versions.json. reload to see it in the timeline.` : j.error ?? 'save failed');
        return;
      } catch {
        setStatus('save failed');
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
      setStatus(`copied ${nextId} as json. paste it at the end of versions.json.`);
    } catch {
      setStatus('clipboard blocked. copy it from the console.');
      console.log(JSON.stringify(entry, null, 2));
    }
  };

  const isBars = cfg.kind === 'bars';
  const m = run?.metrics;
  const mini = run
    ? isBars
      ? [
          { k: 'net profit', v: run.stats!.net, f: (x: number) => usd(x), loss: run.stats!.net < 0 },
          { k: 'trades', v: run.stats!.count, f: (x: number) => String(Math.round(x)) },
          { k: 'profit factor', v: run.stats!.profitFactor, f: (x: number) => (Number.isFinite(x) ? num(x) : '-') },
          { k: 'worst drop', v: -m!.maxDrawdownDollars, f: (x: number) => usd(x), loss: true },
        ]
      : [
          { k: '$10k became', v: m!.final, f: (x: number) => usd(x) },
          { k: 'per year', v: m!.cagr, f: (x: number) => pct(x) },
          { k: 'worst drop', v: m!.maxDrawdown, f: (x: number) => pct(x), loss: true },
          { k: 'biggest $ loss', v: -m!.maxDrawdownDollars, f: (x: number) => usd(x), loss: true },
        ]
    : [];

  return (
    <section className="qz-tune qz-full" aria-label="tune">
      <div className="qz-tune-head">
        <div>
          <div className="qz-label">tune</div>
          <p className="qz-fine" style={{ marginTop: 4 }}>
            starts from {latest.id}. drag anything and the backtest re-runs in your browser on the same data.
          </p>
        </div>
        <button className="qz-btn" onClick={() => setCfg(clone(latest.config))} disabled={!changes.length}>
          reset to {latest.id}
        </button>
      </div>
      <div className="qz-tune-body">
        <div className="qz-tune-controls">
          {cfg.kind === 'portfolio' ? <PortfolioControls cfg={cfg} set={setCfg} symbols={symbols} /> : <BarControls cfg={cfg as BarConfig} set={setCfg} />}
        </div>
        <div className="qz-tune-out">
          {run ? (
            <>
              <LineChart
                lines={[
                  { key: 'base', label: latest.id, dates: base.result.dates, values: base.result.equity, tone: 'grey' },
                  { key: 'draft', label: changes.length ? 'your tweak' : `${latest.id} (no changes yet)`, dates: run.result.dates, values: run.result.equity, tone: 'ink' },
                ]}
                focus="draft"
                log={!isBars}
                height={300}
                intraday={intraday}
                synthUntil={run.result.syntheticUntil}
                legend
                ariaLabel="equity curve of your tweak against the latest version"
              />
              <div className="qz-mini">
                {mini.map((x) => (
                  <div key={x.k}>
                    <span className="qz-label">{x.k}</span>
                    <b className={x.loss ? 'qz-loss' : ''}>
                      <Tick value={x.v} format={x.f} />
                    </b>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="qz-fine">pick at least one thing to hold.</p>
          )}
          <div className="qz-diff">
            <div className="qz-label">changed vs {latest.id}</div>
            {changes.length ? (
              <ul>
                {changes.map((c) => (
                  <li key={c.k}>
                    <span style={{ minWidth: 150 }}>{c.k}</span>
                    <s>{c.from}</s>
                    <span>to {c.to}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="qz-fine" style={{ marginTop: 6 }}>nothing yet.</p>
            )}
          </div>
          <div className="qz-save">
            <input className="qz-input" placeholder={`one line on why, saved as ${nextId}`} value={note} onChange={(e) => setNote(e.target.value)} aria-label="version note" />
            <button className="qz-btn qz-btn-primary" onClick={save} disabled={!changes.length || !run}>
              {import.meta.env.DEV ? 'save as new version' : 'copy as new version'}
            </button>
          </div>
          {status && <p className="qz-fine" style={{ marginTop: 8 }}>{status}</p>}
        </div>
      </div>
    </section>
  );
}
