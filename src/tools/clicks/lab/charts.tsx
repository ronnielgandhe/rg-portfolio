import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL, MODEL_IDS, shownStrategies, statsFor, type Benchmark, type ModelInfo, type Stats } from './data.ts';
import { num, pct, useInView } from './motion.ts';

type Key = 'success' | 'clicks' | 'pages' | 'name';
const SORTS: Record<Key, { label: string; get: (s: Stats, name: string) => number | string; dir: 1 | -1 }> = {
  name: { label: 'strategy', get: (_s, n) => n, dir: 1 },
  success: { label: 'success', get: (s) => s.success, dir: -1 },
  clicks: { label: 'clicks vs shortest', get: (s) => s.clicksMean, dir: 1 },
  pages: { label: 'pages opened', get: (s) => s.pagesOpenedMean, dir: 1 },
};
const ROW = 60;
const CLICK_CAP = 8;

export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export function DifficultySwitch({ bench, value, onChange }: { bench: Benchmark; value: string; onChange: (d: string) => void }) {
  const opts = [ALL, ...bench.difficulties];
  return (
    <div className="lab-seg" role="radiogroup" aria-label="difficulty">
      {opts.map((d) => (
        <button key={d} type="button" role="radio" aria-checked={value === d} className={value === d ? 'lab-seg-on' : ''} onClick={() => onChange(d)}>{d}</button>
      ))}
    </div>
  );
}

function Bar({ value, max, on, model, delay }: { value: number; max: number; on: boolean; model: boolean; delay: number }) {
  const f = Math.max(0, Math.min(1, value / max));
  return (
    <span className="lab-bar">
      <i className={model ? 'lab-bar-model' : ''} style={{ transform: `scaleX(${on ? f : 0})`, transitionDelay: `${delay}ms` }} />
    </span>
  );
}

export function Leaderboard({ bench, diff }: { bench: Benchmark; diff: string }) {
  const [sort, setSort] = useState<Key>('success');
  const [ref, seen] = useInView<HTMLDivElement>();
  const human = bench.humans?.[diff]?.medianClicks ?? null;
  const rows = useMemo(() => shownStrategies(bench).map((s) => ({ s, st: statsFor(s, diff) })).filter((r): r is { s: typeof r.s; st: Stats } => !!r.st), [bench, diff]);
  const order = useMemo(() => {
    const { get, dir } = SORTS[sort];
    return [...rows].sort((a, b) => {
      const x = get(a.st, a.s.name), y = get(b.st, b.s.name);
      const c = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number);
      return c * dir || a.s.name.localeCompare(b.s.name);
    }).map((r) => r.s.id);
  }, [rows, sort]);
  const pagesMax = Math.max(...rows.map((r) => r.st.pagesOpenedMean), 1);

  return (
    <div className="lab-board" ref={ref}>
      <div className="lab-board-head" role="row">
        {(['name', 'success', 'clicks', 'pages'] as Key[]).map((k) => (
          <button key={k} type="button" className={`lab-th${sort === k ? ' lab-th-on' : ''}`} aria-sort={sort === k ? (SORTS[k].dir === 1 ? 'ascending' : 'descending') : 'none'} onClick={() => setSort(k)}>
            {SORTS[k].label}<span className="lab-th-mark" aria-hidden="true">{sort === k ? (SORTS[k].dir === 1 ? '↑' : '↓') : ''}</span>
          </button>
        ))}
      </div>
      <div className="lab-board-body" style={{ height: rows.length * ROW }} role="table" aria-label="strategy leaderboard">
        {rows.map(({ s, st }, i) => {
          const idx = order.indexOf(s.id);
          const model = MODEL_IDS.has(s.id);
          const d = seen ? i * 50 : 0;
          return (
            <div key={s.id} role="row" className={`lab-row${model ? ' lab-row-model' : ''}`} style={{ transform: `translateY(${idx * ROW}px)` }}>
              <div className="lab-cell lab-cell-name" role="cell">{s.name}</div>
              <div className="lab-cell" role="cell">
                <span className="lab-val">{pct(st.success)}</span>
                <Bar value={st.success} max={1} on={seen} model={model} delay={d} />
              </div>
              <div className="lab-cell lab-cell-clicks" role="cell">
                {human !== null && (
                  <span className="lab-human" style={{ left: `${Math.min(human / CLICK_CAP, 1) * 100}%` }} aria-hidden="true">
                    {idx === 0 && <span>people {num(human)}</span>}
                  </span>
                )}
                <span className="lab-val">{num(st.clicksMean)}<span className="lab-val-sub"> / {num(st.optimalMean)}</span></span>
                <span className="lab-bar lab-bar-clicks">
                  <i className={model ? 'lab-bar-model' : ''} style={{ transform: `scaleX(${seen ? Math.min(st.clicksMean / CLICK_CAP, 1) : 0})`, transitionDelay: `${d}ms` }} />
                  <b style={{ left: `${Math.min(st.optimalMean / CLICK_CAP, 1) * 100}%`, opacity: seen ? 1 : 0 }} />
                  {st.clicksMean > CLICK_CAP && <em aria-hidden="true" />}
                </span>
              </div>
              <div className="lab-cell" role="cell">
                <span className="lab-val">{num(st.pagesOpenedMean)}<span className="lab-val-sub"> median {num(st.pagesOpenedMedian)}</span></span>
                <Bar value={st.pagesOpenedMean} max={pagesMax} on={seen} model={model} delay={d} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="lab-note lab-board-note">
        success is the share of pairs solved inside the budget. clicks are averaged over solved pairs, the tick is the true shortest path for those same pairs{human !== null ? ', the dashed line is the median person who played that pair' : ''}. bars past {CLICK_CAP} clicks are cut.
      </p>
    </div>
  );
}

export interface LabelBox { id: string; x: number; y: number; text: string; left: boolean }

export function declutter(pts: LabelBox[], gap = 15) {
  const box = (p: LabelBox) => {
    const w = p.text.length * 6.6 + 4;
    return p.left ? [p.x - 14 - w, p.x - 10] : [p.x + 10, p.x + 14 + w];
  };
  const ls = pts.map((p) => ({ ...p, ly: p.y, b: box(p) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ls.length; i++) {
    for (let pass = 0, moved = true; moved && pass < 50; pass++) {
      moved = false;
      for (let j = 0; j < i; j++) {
        const hit = ls[i].b[0] < ls[j].b[1] && ls[j].b[0] < ls[i].b[1];
        if (hit && Math.abs(ls[i].ly - ls[j].ly) < gap && ls[j].ly + gap > ls[i].ly) { ls[i].ly = ls[j].ly + gap; moved = true; }
      }
    }
  }
  return new Map(ls.map((l) => [l.id, l.ly]));
}

const log = (v: number) => Math.log2(Math.max(v, 1));

export function Tradeoff({ bench, diff }: { bench: Benchmark; diff: string }) {
  const [wrap, W] = useWidth<HTMLDivElement>();
  const [ref, seen] = useInView<HTMLDivElement>();
  const narrow = W < 520;
  const H = narrow ? 400 : 400;
  const pad = { l: 44, r: W < 520 ? 16 : 120, t: 20, b: 44 };
  const pts = shownStrategies(bench).map((s) => ({ s, st: statsFor(s, diff) })).filter((p): p is { s: typeof p.s; st: Stats } => !!p.st).sort((a, b) => Number(MODEL_IDS.has(a.s.id)) - Number(MODEL_IDS.has(b.s.id)));
  const human = bench.humans?.[diff]?.medianClicks ?? null;
  const xMax = 8, yMin = 2, yMax = 8;
  const iw = Math.max(W - pad.l - pad.r, 10), ih = H - pad.t - pad.b;
  const X = (v: number) => pad.l + (Math.min(log(v), xMax) / xMax) * iw;
  const Y = (v: number) => pad.t + ih - ((Math.min(Math.max(v, yMin), yMax) - yMin) / (yMax - yMin)) * ih;
  const xs = [1, 4, 16, 64, 256];
  const ys = [2, 3, 4, 5, 6, 7, 8];

  const leftOf = (x: number) => narrow && x > W * 0.6;
  const labelOf = (s: { name: string }, st: Stats) => (st.clicksMean > yMax ? `${s.name} ↑ ${num(st.clicksMean)}` : s.name);
  const ly = declutter(pts.map((p) => { const x = X(p.st.pagesOpenedMean); return { id: p.s.id, x, y: Y(p.st.clicksMean), text: labelOf(p.s, p.st), left: leftOf(x) }; }));

  return (
    <div ref={ref} className="lab-trade">
      <div ref={wrap} className="lab-trade-plot">
        {W > 0 && (
          <svg width={W} height={H} role="img" aria-label="path length against pages opened, one point per strategy">
            {xs.map((v) => (
              <g key={`x${v}`}>
                <line x1={Math.round(X(v)) + 0.5} x2={Math.round(X(v)) + 0.5} y1={pad.t} y2={pad.t + ih} className="lab-grid" />
                <text x={X(v)} y={H - pad.b + 18} textAnchor="middle" className="lab-tick">{v}</text>
              </g>
            ))}
            {ys.map((v) => (
              <g key={`y${v}`}>
                <line x1={pad.l} x2={pad.l + iw} y1={Math.round(Y(v)) + 0.5} y2={Math.round(Y(v)) + 0.5} className="lab-grid" />
                <text x={pad.l - 10} y={Y(v) + 4} textAnchor="end" className="lab-tick">{v}</text>
              </g>
            ))}
            <text x={pad.l + iw} y={H - 6} textAnchor="end" className="lab-axis">pages opened, log scale</text>
            <text x={pad.l} y={pad.t - 8} className="lab-axis">clicks in the path</text>
            <line x1={pad.l} x2={pad.l + iw} y1={pad.t + 0.5} y2={pad.t + 0.5} className="lab-grid lab-grid-cut" />
            <path d={`M${pad.l + 0.5} ${pad.t + ih - 46} V${pad.t + ih - 0.5} H${pad.l + 70}`} className="lab-corner" />
            {!narrow && <text x={pad.l + 10} y={pad.t + ih - 30} className="lab-corner-t">fewer pages,</text>}
            {!narrow && <text x={pad.l + 10} y={pad.t + ih - 16} className="lab-corner-t">shorter paths</text>}
            {human !== null && (
              <g className="lab-trade-human">
                <line x1={pad.l} x2={pad.l + iw} y1={Math.round(Y(human)) + 0.5} y2={Math.round(Y(human)) + 0.5} />
                <text x={pad.l + iw - 4} y={Y(human) - 6} textAnchor="end">people, median {num(human)}</text>
              </g>
            )}
            {pts.map(({ s, st }, i) => {
              const x = X(st.pagesOpenedMean), y = Y(st.clicksMean), l = ly.get(s.id) ?? y;
              const model = MODEL_IDS.has(s.id);
              const left = leftOf(x);
              return (
                <g key={s.id} className={`lab-pt${model ? ' lab-pt-model' : ''}`} style={{ transform: seen ? `translate(${x}px, ${y}px)` : `translate(${pad.l}px, ${pad.t + ih}px)`, opacity: seen ? 1 : 0, transitionDelay: `${i * 60}ms` }}>
                  <rect x={-3.5} y={-3.5} width={7} height={7} />
                  {Math.abs(l - y) > 1 && <line x1={left ? -6 : 6} x2={left ? -12 : 12} y1={0} y2={l - y} />}
                  <text x={left ? -14 : 14} y={l - y + 4} textAnchor={left ? 'end' : 'start'}>{labelOf(s, st)}</text>
                  <title>{`${s.name}: ${num(st.clicksMean)} clicks, ${num(st.pagesOpenedMean)} pages opened`}</title>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}

export function DifficultyGrid({ bench }: { bench: Benchmark }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="lab-dgrid" style={{ gridTemplateColumns: `minmax(120px, 1.3fr) repeat(${bench.difficulties.length}, minmax(0, 1fr))` }} role="table" aria-label="success by difficulty">
      <div className="lab-label" role="columnheader">strategy</div>
      {bench.difficulties.map((d) => <div key={d} className="lab-label" role="columnheader">{d}</div>)}
      {shownStrategies(bench).map((s, i) => (
        <div key={s.id} role="row" style={{ display: 'contents' }}>
          <div className={`lab-dgrid-name${MODEL_IDS.has(s.id) ? ' lab-accent' : ''}`} role="cell">{s.name}</div>
          {bench.difficulties.map((d) => {
            const st = s.byDifficulty?.[d];
            return (
              <div key={d} className="lab-dgrid-cell" role="cell">
                {st ? <><span className="lab-val">{pct(st.success)}</span><Bar value={st.success} max={1} on={seen} model={MODEL_IDS.has(s.id)} delay={i * 40} /></> : <span className="lab-val lab-val-sub">n/a</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function LossChart({ model }: { model: ModelInfo }) {
  const [wrap, W] = useWidth<HTMLDivElement>();
  const [ref, seen] = useInView<HTMLDivElement>();
  const pts = model.lossCurve ?? [];
  if (pts.length < 2) return null;
  const H = 220, pad = { l: 44, r: 64, t: 16, b: 34 };
  const iw = Math.max(W - pad.l - pad.r, 10), ih = H - pad.t - pad.b;
  const e0 = pts[0].epoch, e1 = pts[pts.length - 1].epoch;
  const vMax = Math.max(...pts.flatMap((p) => [p.train, p.val])) * 1.1;
  const X = (e: number) => pad.l + ((e - e0) / (e1 - e0 || 1)) * iw;
  const Y = (v: number) => pad.t + ih - (v / vMax) * ih;
  const d = (k: 'train' | 'val') => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.epoch).toFixed(1)} ${Y(p[k]).toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const ticks = [0, vMax / 2, vMax].map((v) => Math.round(v * 100) / 100);
  return (
    <figure ref={ref} className="lab-fig">
      <div ref={wrap}>
        {W > 0 && (
          <svg width={W} height={H} role="img" aria-label="training and validation curves">
            {ticks.map((v) => (
              <g key={v}>
                <line x1={pad.l} x2={pad.l + iw} y1={Math.round(Y(v)) + 0.5} y2={Math.round(Y(v)) + 0.5} className="lab-grid" />
                <text x={pad.l - 10} y={Y(v) + 4} textAnchor="end" className="lab-tick">{v}</text>
              </g>
            ))}
            {Array.from({ length: 6 }, (_, i) => e0 + ((e1 - e0) * i) / 5).map((e) => <text key={e} x={X(e)} y={H - 12} textAnchor="middle" className="lab-tick">{num(e)}</text>)}
            <path d={d('train')} className={`lab-line lab-line-train${seen ? ' lab-draw' : ''}`} pathLength={1} />
            <path d={d('val')} className={`lab-line lab-line-val${seen ? ' lab-draw' : ''}`} pathLength={1} />
            <text x={X(last.epoch) + 8} y={Y(last.train) + 4} className="lab-tick">train</text>
            <text x={X(last.epoch) + 8} y={Y(last.val) + 4} className="lab-tick lab-accent-fill">val</text>
          </svg>
        )}
      </div>
      <figcaption className="lab-note">{model.lossCurveNote ?? 'loss by epoch'}. x axis is epochs.</figcaption>
    </figure>
  );
}

export function Ablations({ model }: { model: ModelInfo }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const rows = model.ablations ?? [];
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => Math.abs(r.metricDelta)), 1e-6);
  const asPts = (model.testMetric?.value ?? 2) <= 1;
  const fmt = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${asPts ? (Math.abs(v) * 100).toFixed(1) : Math.abs(v).toFixed(3)}${asPts ? ' pts' : ''}`;
  return (
    <figure ref={ref} className="lab-fig">
      <div className="lab-abl" role="table" aria-label="ablations">
        {rows.map((r, i) => {
          const f = Math.abs(r.metricDelta) / max;
          return (
            <div key={r.name} className="lab-abl-row" role="row">
              <span className="lab-abl-name" role="cell">{r.name}</span>
              <span className="lab-abl-track" role="cell">
                <i className={r.metricDelta < 0 ? 'lab-abl-neg' : 'lab-abl-pos'} style={{ transform: `scaleX(${seen ? f / 2 : 0})`, transitionDelay: `${i * 60}ms` }} />
              </span>
              <span className="lab-val" role="cell">{fmt(r.metricDelta)}</span>
            </div>
          );
        })}
      </div>
      <figcaption className="lab-note">{model.ablationMetric ?? 'change in the test metric when one piece is removed'}. the centre line is the full model.</figcaption>
    </figure>
  );
}

const kb = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} mb` : `${Math.round(b / 1000)} kb`);
const big = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}m` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));

export function ModelFacts({ model }: { model: ModelInfo }) {
  const facts = [
    { label: 'weights', value: kb(model.sizeBytes), sub: `${big(model.params)} parameters` },
    { label: 'training time', value: `${num(model.trainSeconds)}s`, sub: 'to train' },
    { label: 'training pairs', value: big(model.trainPairs), sub: `${big(model.valPairs)} val, ${big(model.testPairs)} test` },
    { label: 'test score', value: model.testMetric.value <= 1 ? pct(model.testMetric.value) : num(model.testMetric.value, 2), sub: model.testMetric.name },
  ];
  return (
    <div className="lab-facts">
      {facts.map((f) => (
        <div key={f.label} className="lab-fact">
          <div className="lab-label">{f.label}</div>
          <div className="lab-fact-num">{f.value}</div>
          <div className="lab-fact-sub">{f.sub}</div>
        </div>
      ))}
    </div>
  );
}
