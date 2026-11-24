import { useEffect, useMemo, useRef, useState } from 'react';
import { Thumb, useSummary } from '../ui';
import { articleUrl } from '../wiki';
import { BENCH, MODEL_IDS, MODEL_NAME, llmStatsFor, shownStrategies, statsFor, type LlmBench, type LlmStats, type Replay } from './data.ts';
import { declutter, useWidth } from './charts';
import { num, pct, useInView, useReducedMotion } from './motion.ts';

const usd = (v: number | null) => {
  if (v === null || !Number.isFinite(v)) return 'n/a';
  if (v === 0) return '$0';
  if (v < 0.01) return `$${v.toFixed(4)}`;
  if (v < 1) return `$${v.toFixed(3)}`;
  return `$${v.toFixed(2)}`;
};
const tickUsd = (v: number) => (v >= 1 ? `$${v}` : `$${v.toPrecision(1)}`);

interface Pt { id: string; name: string; x: number | null; y: number; ci?: [number, number]; kind: 'llm' | 'free'; accent: boolean }

export function MoneyChart({ llm, diff }: { llm: LlmBench; diff: string }) {
  const [wrap, W] = useWidth<HTMLDivElement>();
  const [ref, seen] = useInView<HTMLDivElement>();
  const narrow = W < 560;
  const H = narrow ? 360 : 440;
  const pad = { l: 44, r: narrow ? 12 : 130, t: 24, b: 48 };
  const free = 64;
  const pts: Pt[] = [];
  for (const s of BENCH ? shownStrategies(BENCH) : []) {
    const st = statsFor(s, diff);
    if (st) pts.push({ id: `s:${s.id}`, name: s.name, x: null, y: st.success, kind: 'free', accent: MODEL_IDS.has(s.id) });
  }
  const skipped: string[] = [];
  for (const m of llm.models) {
    const st = llmStatsFor(m, diff);
    if (!st) continue;
    if (st.costPerSolvedUsd === null || !(st.costPerSolvedUsd > 0)) { skipped.push(m.name); continue; }
    pts.push({ id: `m:${m.id}`, name: m.name, x: st.costPerSolvedUsd, y: st.success, ci: st.successCI, kind: 'llm', accent: false });
  }
  const costs = pts.filter((p) => p.x !== null).map((p) => p.x!);
  const lo = costs.length ? 10 ** Math.floor(Math.log10(Math.min(...costs))) : 0.001;
  const hi = costs.length ? 10 ** Math.ceil(Math.log10(Math.max(...costs))) : 1;
  const decades: number[] = [];
  for (let v = lo; v <= hi * 1.0001; v *= 10) decades.push(v);
  const x0 = pad.l + 18, xL = pad.l + free + 16, xR = Math.max(W - pad.r, xL + 40);
  const ih = H - pad.t - pad.b;
  const X = (v: number | null) => (v === null ? x0 : xL + ((Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo) || 1)) * (xR - xL));
  const floor = Math.max(0, Math.floor(Math.min(...pts.map((p) => Math.min(p.y, p.ci?.[0] ?? p.y))) * 10 - 0.5) / 10);
  const Y = (v: number) => pad.t + ih - ((Math.max(floor, Math.min(1, v)) - floor) / (1 - floor || 1)) * ih;
  const yTicks = Array.from({ length: Math.round((1 - floor) / 0.1) + 1 }, (_, i) => floor + i * 0.1).filter((_, i, a) => a.length <= 6 || i % 2 === (a.length - 1) % 2);
  const placed = pts.map((p) => ({ ...p, px: X(p.x), py: Y(p.y) })).sort((a, b) => Number(a.accent) - Number(b.accent));
  const labelled = (p: Pt) => !narrow || p.kind === 'free';
  const labelY = declutter(placed.filter(labelled).map((p) => ({ id: p.id, x: p.px, y: p.py, text: p.name, left: narrow && p.px > W * 0.62 })));
  const base = pad.t + ih;

  return (
    <div ref={ref} className="lab-money">
      <div ref={wrap}>
        {W > 0 && (
          <svg width={W} height={H} role="img" aria-label="success rate against cost per solved game">
            {yTicks.map((v) => (
              <g key={v}>
                <line x1={pad.l} x2={xR} y1={Math.round(Y(v)) + 0.5} y2={Math.round(Y(v)) + 0.5} className="lab-grid" />
                <text x={pad.l - 10} y={Y(v) + 4} textAnchor="end" className="lab-tick">{pct(v)}</text>
              </g>
            ))}
            {decades.map((v) => (
              <g key={v}>
                <line x1={Math.round(X(v)) + 0.5} x2={Math.round(X(v)) + 0.5} y1={pad.t} y2={base} className="lab-grid" />
                <text x={X(v)} y={base + 18} textAnchor="middle" className="lab-tick">{tickUsd(v)}</text>
              </g>
            ))}
            <text x={x0} y={base + 18} textAnchor="middle" className="lab-tick">$0</text>
            <g className="lab-break">
              <line x1={pad.l + free - 4} x2={pad.l + free + 2} y1={base + 5} y2={base - 5} />
              <line x1={pad.l + free + 2} x2={pad.l + free + 8} y1={base + 5} y2={base - 5} />
            </g>
            <text x={xR} y={H - 6} textAnchor="end" className="lab-axis">cost per solved game, log scale</text>
            <text x={pad.l} y={pad.t - 10} className="lab-axis">success</text>
            {placed.map((p, i) => {
              const ly = labelY.get(p.id) ?? p.py;
              const left = narrow && p.px > W * 0.62;
              const cls = `lab-mp lab-mp-${p.kind}${p.accent ? ' lab-mp-accent' : ''}`;
              return (
                <g key={p.id} className={cls} style={{ transform: seen ? `translate(${p.px}px, ${p.py}px)` : `translate(${p.px}px, ${base}px)`, opacity: seen ? 1 : 0, transitionDelay: `${i * 40}ms` }}>
                  {p.ci && (
                    <g className="lab-mp-ci">
                      <line x1={0} x2={0} y1={Y(p.ci[0]) - p.py} y2={Y(p.ci[1]) - p.py} />
                      <line x1={-3} x2={4} y1={Math.round(Y(p.ci[0]) - p.py) + 0.5} y2={Math.round(Y(p.ci[0]) - p.py) + 0.5} />
                      <line x1={-3} x2={4} y1={Math.round(Y(p.ci[1]) - p.py) + 0.5} y2={Math.round(Y(p.ci[1]) - p.py) + 0.5} />
                    </g>
                  )}
                  <rect x={-3.5} y={-3.5} width={7} height={7} />
                  {labelled(p) && Math.abs(ly - p.py) > 1 && <line className="lab-mp-lead" x1={left ? -6 : 6} x2={left ? -12 : 12} y1={0} y2={ly - p.py} />}
                  {labelled(p) && <text x={left ? -14 : 14} y={ly - p.py + 4} textAnchor={left ? 'end' : 'start'}>{p.name}</text>}
                  <title>{`${p.name}: ${pct(p.y)} solved${p.x === null ? ', free to run' : `, ${usd(p.x)} per solved game`}`}</title>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <p className="lab-note lab-board-note">
        filled squares are the classic searches and {MODEL_NAME}, which cost nothing to run beyond the wikipedia requests, so they sit at $0 behind the break. hollow squares are llms, priced per solved game at list price, with the 95% interval on success as whiskers.{narrow ? ' on a phone the llm names are in the table below.' : ''}
        {skipped.length > 0 && ` ${skipped.join(', ')} solved none at this difficulty, so there is no cost per solved game to plot.`}
      </p>
    </div>
  );
}

type Key = 'name' | 'success' | 'over' | 'invalid' | 'cost' | 'latency';
const COLS: { k: Key; label: string; dir: 1 | -1; get: (s: LlmStats, name: string) => number | string }[] = [
  { k: 'name', label: 'model', dir: 1, get: (_s, n) => n },
  { k: 'success', label: 'success', dir: -1, get: (s) => s.success },
  { k: 'over', label: 'extra clicks', dir: 1, get: (s) => s.clicksOverOptimal },
  { k: 'invalid', label: 'invalid moves', dir: 1, get: (s) => s.invalidMoveRate },
  { k: 'cost', label: 'per solved', dir: 1, get: (s) => s.costPerSolvedUsd ?? Infinity },
  { k: 'latency', label: 'per step', dir: 1, get: (s) => s.latencyMsPerStep },
];
const ROW = 56;

export function LlmTable({ llm, diff }: { llm: LlmBench; diff: string }) {
  const [sort, setSort] = useState<Key>('success');
  const rows = llm.models.map((m) => ({ m, st: llmStatsFor(m, diff) })).filter((r): r is { m: typeof r.m; st: LlmStats } => !!r.st);
  const col = COLS.find((c) => c.k === sort)!;
  const order = [...rows].sort((a, b) => {
    const x = col.get(a.st, a.m.name), y = col.get(b.st, b.m.name);
    const c = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number);
    return c * col.dir || a.m.name.localeCompare(b.m.name);
  }).map((r) => r.m.id);
  return (
    <div className="lab-llm-table">
      <div className="lab-llm-row lab-llm-head" role="row">
        {COLS.map((c) => (
          <button key={c.k} type="button" className={`lab-th lab-c-${c.k}${sort === c.k ? ' lab-th-on' : ''}`} aria-sort={sort === c.k ? (c.dir === 1 ? 'ascending' : 'descending') : 'none'} onClick={() => setSort(c.k)}>
            {c.label}<span className="lab-th-mark" aria-hidden="true">{sort === c.k ? (c.dir === 1 ? '↑' : '↓') : ''}</span>
          </button>
        ))}
      </div>
      <div className="lab-board-body" style={{ height: rows.length * ROW }} role="table" aria-label="llm results">
        {rows.map(({ m, st }) => (
          <div key={m.id} role="row" className="lab-llm-row lab-llm-body" style={{ transform: `translateY(${order.indexOf(m.id) * ROW}px)` }}>
            <div className="lab-llm-name" role="cell">{m.name}<span>{m.provider}</span></div>
            <div className="lab-val lab-c-success" role="cell">{pct(st.success)}<span className="lab-val-sub"> {Math.round(st.successCI[0] * 100)} to {Math.round(st.successCI[1] * 100)}</span></div>
            <div className="lab-val lab-c-over" role="cell">{st.success > 0 ? `+${num(st.clicksOverOptimal)}` : 'n/a'}</div>
            <div className="lab-val lab-c-invalid" role="cell">{pct(st.invalidMoveRate)}</div>
            <div className="lab-val lab-c-cost" role="cell">{usd(st.costPerSolvedUsd)}</div>
            <div className="lab-val lab-c-latency" role="cell">{num(st.latencyMsPerStep / 1000)}s</div>
          </div>
        ))}
      </div>
      <p className="lab-note lab-board-note">extra clicks is the average over solved games beyond the shortest path. an invalid move is answering with a link that was not on the page. cost is list price on {llm.models[0]?.pricedOn ?? llm.date}.</p>
    </div>
  );
}

function Card({ title, caption, state }: { title: string; caption?: string; state: '' | 'now' | 'goal' | 'ghost' | 'hit' }) {
  const s = useSummary(state === 'ghost' ? null : title);
  return (
    <div className={`lab-card lab-card-${state || 'past'}`}>
      <Thumb src={s?.thumbnail} title={title} size={32} />
      <div className="lab-card-text">
        <a className="lab-card-title" href={articleUrl(title)} target="_blank" rel="noopener noreferrer">{title}</a>
        {caption && <div className="lab-card-cap">{caption}</div>}
      </div>
    </div>
  );
}

const STEP_MS = 1100;

export function Replays({ llm }: { llm: LlmBench }) {
  const list = llm.replays ?? [];
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const r: Replay | undefined = list[idx];
  const names = useMemo(() => new Map(llm.models.map((m) => [m.id, m.name])), [llm]);
  const total = r ? r.steps.length : 0;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing || !r) return;
    timer.current = setInterval(() => setT((x) => {
      if (x >= total) { setPlaying(false); return x; }
      return x + 1;
    }), reduced ? 400 : STEP_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, r, total, reduced]);

  if (!r) return null;
  const done = t >= total;
  const shown = r.steps.slice(0, Math.min(t + 1, total));
  const clicks = r.path.length - 1;
  const reached = done && r.outcome === 'solved';

  return (
    <div className="lab-replay">
      <div className="lab-replay-bar">
        <select className="lab-select lab-select-sm" aria-label="pick a recorded game" value={idx} onChange={(e) => { setIdx(Number(e.target.value)); setT(0); setPlaying(false); }}>
          {list.map((x, i) => <option key={i} value={i}>{`${names.get(x.model) ?? x.model}: ${x.start} to ${x.target} (${x.outcome})`}</option>)}
        </select>
        <div className="lab-replay-ctl">
          <button type="button" className="lab-btn" onClick={() => setT((x) => Math.max(0, x - 1))} disabled={t === 0} aria-label="step back">back</button>
          <button type="button" className="lab-btn lab-btn-primary" onClick={() => { if (done) { setT(0); setPlaying(true); } else setPlaying((p) => !p); }}>{playing ? 'pause' : done ? 'replay' : t > 0 ? 'resume' : 'play'}</button>
          <button type="button" className="lab-btn" onClick={() => setT((x) => Math.min(total, x + 1))} disabled={done} aria-label="step forward">next</button>
        </div>
      </div>
      <div className="lab-chain" aria-live="polite">
        {shown.map((s, i) => {
          const isNow = i === shown.length - 1 && !done;
          const cap = s.chosen ? `${s.offered.toLocaleString()} links, picked ${s.chosen}` : `${s.offered.toLocaleString()} links`;
          return (
            <div key={`${i}-${s.page}`} className="lab-chain-step">
              {i > 0 && <span className="lab-chain-line" />}
              <Card title={s.page} caption={isNow || i < shown.length - 1 || done ? cap : undefined} state={isNow ? 'now' : ''} />
            </div>
          );
        })}
        {reached && (
          <div className="lab-chain-step">
            <span className="lab-chain-line" />
            <Card title={r.target} caption="target" state="hit" />
          </div>
        )}
        {!reached && (
          <div className="lab-chain-step">
            <span className="lab-chain-line lab-chain-gap" />
            <Card title={r.target} caption={done ? 'never reached' : 'target'} state={done ? 'ghost' : 'goal'} />
          </div>
        )}
      </div>
      <div className="lab-replay-out">
        <span className="lab-label">{done ? r.outcome : `step ${Math.min(t + 1, total)} of ${total}`}</span>
        <span className="lab-replay-text">
          {done
            ? r.outcome === 'solved' ? `${clicks} click${clicks === 1 ? '' : 's'}, the shortest path is ${r.optimal}` : `gave up after ${total} step${total === 1 ? '' : 's'}, the shortest path is ${r.optimal}`
            : `the shortest path is ${r.optimal} click${r.optimal === 1 ? '' : 's'}`}
        </span>
      </div>
    </div>
  );
}

export function PriorWork({ llm }: { llm: LlmBench }) {
  if (!llm.priorWork?.length) return null;
  return (
    <p className="lab-prior">
      <span className="lab-label">prior work</span>
      <span>this has been studied before: {llm.priorWork.map((p, i) => (
        <span key={p.url}>{i > 0 && ', '}<a href={p.url} target="_blank" rel="noopener noreferrer">{p.name}</a>{p.note ? ` (${p.note})` : ''}</span>
      ))}.</span>
    </p>
  );
}
