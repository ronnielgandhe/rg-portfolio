import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { STRATEGIES, strategyById, type LabEvent, type Strategy } from '../strategies/index.ts';
import { EXAMPLES } from '../Start';
import { Arrow, TitleInput, Thumb, fmtSeconds, useElapsed, useSummary } from '../ui';
import { articleUrl } from '../wiki';
import Graph from './Graph';
import { initialLane, laneReducer, stopLane, type Lane } from './lane.ts';
import { MODEL_IDS } from './data.ts';

type Pace = 'watch' | 'quick';
const PACE: Record<Pace, number> = { watch: 1, quick: 0.35 };
const PRESETS: [string, string][] = [...EXAMPLES, ['Volcano', 'William Shakespeare'], ['Chess', 'Ancient Egypt']];

type Act = { kind: 'reset'; lane: Lane } | { kind: 'event'; e: LabEvent } | { kind: 'stop' };
function reducer(s: Lane | null, a: Act): Lane | null {
  if (a.kind === 'reset') return a.lane;
  if (!s) return s;
  return a.kind === 'stop' ? stopLane(s) : laneReducer(s, a.e);
}

const compact = (n: number) => (n >= 10000 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const running = (l: Lane | null) => l?.outcome === 'running';
const ok = (l: Lane | null): l is Lane & { path: string[] } => !!l && l.outcome === 'found' && !!l.path;

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="lab-stat">
      <div className="lab-label">{label}</div>
      <div className="lab-stat-num">{value}{sub && <span className="lab-stat-sub">{sub}</span>}</div>
    </div>
  );
}

function PathStep({ title, i }: { title: string; i: number }) {
  const s = useSummary(title);
  return (
    <li className="lab-path-step" style={{ animationDelay: `${i * 60}ms` }}>
      <span className="lab-path-i">{i}</span>
      <Thumb src={s?.thumbnail} title={title} size={24} />
      <a className="lab-path-t" href={articleUrl(title)} target="_blank" rel="noopener noreferrer">{title}</a>
    </li>
  );
}

function LaneView({ name, strategy, lane, tags, onPick, locked, slot }: {
  name: string; strategy: Strategy; lane: Lane | null; tags: string[]; onPick: (id: string) => void; locked: boolean; slot: 'a' | 'b';
}) {
  const elapsed = useElapsed(lane?.startedAt ?? null, lane?.finishedAt ?? null);
  const model = MODEL_IDS.has(strategy.id);
  const bidi = strategy.shape.startsWith('meet');
  const clicks = ok(lane) ? lane.path.length - 1 : null;
  const label = lane
    ? `${strategy.name}: ${lane.opened} pages opened, ${lane.outcome === 'found' ? `found a ${clicks} click path` : lane.status}`
    : `${strategy.name}: waiting to start`;
  return (
    <section className={`lab-lane${model ? ' lab-lane-model' : ''}`} aria-label={`lane ${slot}`}>
      <div className="lab-lane-head">
        <label className="lab-label" htmlFor={`lab-pick-${slot}`}>{name}</label>
        <div className="lab-tags" aria-live="polite">{tags.map((t) => <span key={t} className="lab-tag">{t}</span>)}</div>
      </div>
      <select id={`lab-pick-${slot}`} className="lab-select" value={strategy.id} disabled={locked} onChange={(e) => onPick(e.target.value)}>
        {STRATEGIES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <p className="lab-lane-blurb">{strategy.blurb}</p>
      <div className="lab-graph">
        <Graph lane={lane ?? initialLane('', '')} model={model} label={label} />
        {!lane && <div className="lab-graph-empty">{bidi ? 'two frontiers, one from each end' : 'one frontier, growing from the start'}</div>}
      </div>
      <div className="lab-status" aria-live="polite">{lane ? lane.status : 'ready'}</div>
      <div className="lab-stats">
        <Stat label="pages opened" value={lane ? String(lane.opened) : '0'} sub={` / ${strategy.budget}`} />
        <Stat label={lane?.outcome === 'found' ? 'path' : 'depth'} value={lane ? String(clicks ?? lane.depth) : '0'} sub={clicks !== null ? ' clicks' : undefined} />
        <Stat label={bidi ? 'frontier f / b' : 'elapsed'} value={bidi ? compact(lane?.frontier?.forward ?? 0) : fmtSeconds(elapsed)} sub={bidi ? ` / ${compact(lane?.frontier?.backward ?? 0)}` : undefined} />
        {bidi && <Stat label="elapsed" value={fmtSeconds(elapsed)} />}
      </div>
      {ok(lane) && (
        <ol className="lab-path" aria-label="path found">
          {lane.path.map((t, i) => <PathStep key={`${i}-${t}`} title={t} i={i} />)}
        </ol>
      )}
      {lane && lane.outcome === 'not_found' && (
        <p className="lab-miss">{`gave up after ${lane.opened} pages without finding it.`}</p>
      )}
    </section>
  );
}

function verdict(a: Lane | null, b: Lane | null, na: string, nb: string) {
  if (!a || !b || running(a) || running(b) || a.outcome === 'stopped' || b.outcome === 'stopped') return null;
  const lines: { label: string; text: string }[] = [];
  const tags: [string[], string[]] = [[], []];
  if (a.outcome === 'error' || b.outcome === 'error') {
    const both = a.outcome === 'error' && b.outcome === 'error';
    return { lines: [{ label: 'no contest', text: both ? 'both lanes hit an error' : `${a.outcome === 'error' ? na : nb} hit an error, try another pair or strategy` }], tags };
  }
  if (ok(a) && ok(b)) {
    const ca = a.path.length - 1, cb = b.path.length - 1;
    if (ca === cb) lines.push({ label: 'path length', text: `a tie, ${ca} clicks each` });
    else {
      const w = ca < cb ? 0 : 1;
      tags[w].push('shorter path');
      lines.push({ label: 'shorter path', text: `${w ? nb : na}, ${Math.min(ca, cb)} clicks vs ${Math.max(ca, cb)}` });
    }
  } else if (ok(a) || ok(b)) {
    const w = ok(a) ? 0 : 1;
    tags[w].push('found it');
    lines.push({ label: 'path', text: `only ${w ? nb : na} found one` });
  } else {
    lines.push({ label: 'path', text: 'neither found one inside its budget' });
  }
  if (a.opened !== b.opened) {
    const w = a.opened < b.opened ? 0 : 1;
    tags[w].push('fewer pages');
    lines.push({ label: 'fewer pages opened', text: `${w ? nb : na}, ${Math.min(a.opened, b.opened)} vs ${Math.max(a.opened, b.opened)}` });
  } else lines.push({ label: 'pages opened', text: `a tie, ${a.opened} each` });
  return { lines, tags };
}

export default function RaceLab() {
  const [from, setFrom] = useState(PRESETS[0][0]);
  const [to, setTo] = useState(PRESETS[0][1]);
  const [ids, setIds] = useState<[string, string]>(['keyword', 'guided']);
  const [pace, setPace] = useState<Pace>('watch');
  const [a, da] = useReducer(reducer, null);
  const [b, db] = useReducer(reducer, null);
  const ctl = useRef<AbortController | null>(null);
  const paceRef = useRef(pace);
  paceRef.current = pace;

  const sa = strategyById(ids[0]) ?? STRATEGIES[0];
  const sb = strategyById(ids[1]) ?? STRATEGIES[1];
  const live = running(a) || running(b);

  const go = useCallback((f: string, t: string) => {
    if (!f.trim() || !t.trim()) return;
    ctl.current?.abort();
    const c = new AbortController();
    ctl.current = c;
    const opts = { signal: c.signal, pace: () => PACE[paceRef.current], seed: 7 };
    const lanes: [Strategy, typeof da][] = [[sa, da], [sb, db]];
    for (const [s, d] of lanes) {
      d({ kind: 'reset', lane: initialLane(f.trim(), t.trim()) });
      const onStep = (e: LabEvent) => { if (!c.signal.aborted) d({ kind: 'event', e }); };
      Promise.resolve()
        .then(() => s.run(f.trim(), t.trim(), onStep, opts))
        .catch((err) => {
          if (c.signal.aborted || err?.name === 'AbortError') return;
          console.error(err);
          d({ kind: 'event', e: { type: 'error', message: 'the search crashed partway through.' } });
        });
    }
  }, [sa, sb]);

  const stop = () => { ctl.current?.abort(); da({ kind: 'stop' }); db({ kind: 'stop' }); };
  useEffect(() => () => ctl.current?.abort(), []);
  const boot = useRef(false);
  useEffect(() => {
    if (boot.current) return;
    boot.current = true;
    const q = new URLSearchParams(location.search);
    const qa = q.get('a'), qb = q.get('b'), qf = q.get('from'), qt = q.get('to');
    if (qa && strategyById(qa)) setIds((p) => [qa, p[1]]);
    if (qb && strategyById(qb)) setIds((p) => [p[0], qb]);
    if (qf) setFrom(qf);
    if (qt) setTo(qt);
    if (q.get('race') === '1' && qf && qt) setPending([qf, qt]);
  }, []);
  const [pending, setPending] = useState<[string, string] | null>(null);
  useEffect(() => { if (pending) { setPending(null); go(pending[0], pending[1]); } }, [pending, go]);

  const v = verdict(a, b, sa.name, sb.name);
  const pick = (slot: 0 | 1) => (id: string) => setIds((p) => (slot === 0 ? [id, p[1]] : [p[0], id]));

  return (
    <div className="lab-race">
      <form className="lab-controls" onSubmit={(e) => { e.preventDefault(); if (live) stop(); else go(from, to); }}>
        <div className="lab-presets" role="group" aria-label="preset pairs">
          {PRESETS.map(([pf, pt]) => {
            const on = pf === from && pt === to;
            return (
              <button key={`${pf}>${pt}`} type="button" className={`lab-preset${on ? ' lab-preset-on' : ''}`} aria-pressed={on} disabled={live}
                onClick={() => { setFrom(pf); setTo(pt); }}>
                {pf.toLowerCase()} <Arrow size={11} /> {pt.toLowerCase()}
              </button>
            );
          })}
        </div>
        <div className="lab-pair">
          <TitleInput label="from" value={from} onChange={setFrom} placeholder="any article" />
          <span className="lab-pair-arrow"><Arrow size={16} /></span>
          <TitleInput label="to" value={to} onChange={setTo} placeholder="any other article" />
        </div>
        <div className="lab-go-row">
          <div className="lab-seg" role="radiogroup" aria-label="pace">
            {(['watch', 'quick'] as Pace[]).map((p) => (
              <button key={p} type="button" role="radio" aria-checked={pace === p} className={pace === p ? 'lab-seg-on' : ''} onClick={() => setPace(p)}>{p}</button>
            ))}
          </div>
          <span className="lab-note">both lanes share one polite connection to wikipedia, four requests at a time.</span>
          <span className="lab-grow" />
          <button type="submit" className={`lab-btn${live ? '' : ' lab-btn-primary'}`} disabled={!live && (!from.trim() || !to.trim())}>{live ? 'stop' : a ? 'race again' : 'race them'}</button>
        </div>
      </form>

      <div className={`lab-verdict${v ? ' lab-verdict-on' : ''}`} aria-live="polite">
        {v ? v.lines.map((l) => (
          <div key={l.label} className="lab-verdict-cell">
            <div className="lab-label">{l.label}</div>
            <div className="lab-verdict-text">{l.text}</div>
          </div>
        )) : (
          <div className="lab-verdict-cell">
            <div className="lab-label">{live ? 'racing' : a ? 'stopped' : 'same pair, two minds'}</div>
            <div className="lab-verdict-text lab-verdict-quiet">{live ? `${from} to ${to}, live from wikipedia` : 'pick two strategies and a pair, then race them'}</div>
          </div>
        )}
      </div>

      <div className="lab-lanes">
        <LaneView name="lane a" slot="a" strategy={sa} lane={a} tags={v?.tags[0] ?? []} onPick={pick(0)} locked={live} />
        <LaneView name="lane b" slot="b" strategy={sb} lane={b} tags={v?.tags[1] ?? []} onPick={pick(1)} locked={live} />
      </div>
    </div>
  );
}
