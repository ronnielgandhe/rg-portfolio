import { useEffect, useMemo, useRef, useState } from 'react';
import { gss, LINES, type Cell, type Mode, type PatchRect } from './algorithms';
import { PATCHES, QUEENS, SUDOKU, TANGO, ZIP } from './boards';

type Game = 'queens' | 'sudoku' | 'tango' | 'zip' | 'patches';
type Ev = { t: 'place' | 'undo' | 'start'; r: number; c: number; v?: number; rect?: PatchRect };
type Rec = { events: Ev[]; ms: number };

const TABS: { id: Game; label: string }[] = [
  { id: 'queens', label: 'queens' },
  { id: 'sudoku', label: 'sudoku' },
  { id: 'tango', label: 'tango' },
  { id: 'zip', label: 'zip' },
  { id: 'patches', label: 'patches' },
];
const GAMES = TABS.map((t) => t.id);

const SPEEDS: [string, number][] = [['1x', 6], ['4x', 24], ['16x', 96], ['max', 900]];

function median(xs: number[]) {
  const s = xs.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function zipGraph() {
  const conn = gss.zip.applyWalls(gss.zip.buildFullGrid({}, ZIP.size), ZIP.size, ZIP.walls);
  const active = gss.zip.reachable(conn, gss.zip.key(ZIP.waypoints[0].row, ZIP.waypoints[0].col));
  return { conn, active };
}

function run(game: Game, mode: Mode, push?: (e: Ev) => void) {
  const trace = push && ((t: 'place' | 'undo' | 'start', r: number, c: number, v?: number) => push({ t, r, c, v }));
  const now = mode === 'now';
  if (game === 'queens') (now ? gss.queens.solve : gss.queens.solveBasic)(QUEENS, trace);
  else if (game === 'sudoku') (now ? gss.sudoku.solve : gss.sudoku.solveBasic)(SUDOKU.map((r) => r.slice()), { trace });
  else if (game === 'tango') (now ? gss.tango.solve : gss.tango.solveBasic)(TANGO.grid.slice(), 6, TANGO.constraints, trace);
  else if (game === 'zip') { const { conn, active } = zipGraph(); (now ? gss.zip.solve : gss.zip.solveBasic)({ conn, active, waypoints: ZIP.waypoints, timeLimit: 4000, trace }); }
  else gss.patches.solve(PATCHES.rows, PATCHES.cols, PATCHES.clues, push && ((t, rect) => push({ t, r: rect.r0, c: rect.c0, rect })));
}

function record(game: Game, mode: Mode, timed = true): Rec {
  const events: Ev[] = [];
  run(game, mode, (e) => events.push(e));
  if (!timed) return { events, ms: 0 };
  const times: number[] = [];
  for (let k = 0; k < 5; k++) {
    let reps = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < 12) { run(game, mode); reps++; }
    times.push((performance.now() - t0) / reps);
  }
  return { events, ms: median(times) };
}

const count = (events: Ev[], upto = events.length) => {
  let nodes = 0, backs = 0;
  for (let i = 0; i < upto; i++) { if (events[i].t === 'place') nodes++; else if (events[i].t === 'undo') backs++; }
  return { nodes, backs };
};

function replay(game: Game, events: Ev[], upto: number) {
  if (game === 'queens') {
    const q = Array(QUEENS.length).fill(-1);
    for (let i = 0; i < upto; i++) { const e = events[i]; q[e.r] = e.t === 'place' ? e.c : -1; }
    return q;
  }
  if (game === 'sudoku') {
    const g = SUDOKU.map((r) => r.slice());
    for (let i = 0; i < upto; i++) { const e = events[i]; g[e.r][e.c] = e.t === 'place' ? (e.v as number) : 0; }
    return g;
  }
  if (game === 'tango') {
    const g = TANGO.grid.slice();
    for (let i = 0; i < upto; i++) { const e = events[i]; g[e.r * 6 + e.c] = e.t === 'place' ? (e.v as number) : -1; }
    return g;
  }
  if (game === 'patches') {
    const rects: PatchRect[] = [];
    for (let i = 0; i < upto; i++) { const e = events[i]; if (e.t === 'place') rects.push(e.rect!); else rects.pop(); }
    return rects;
  }
  let path: Cell[] = [ZIP.waypoints[0]];
  for (let i = 0; i < upto; i++) {
    const e = events[i];
    if (e.t === 'start') path = [{ row: e.r, col: e.c }];
    else if (e.t === 'place') path.push({ row: e.r, col: e.c });
    else path.pop();
  }
  return path;
}

const Crown = () => (
  <svg viewBox="0 0 24 24" width="58%" height="58%" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter"><path d="M4 18h16M5 15l-1-8 5 4 3-6 3 6 5-4-1 8z" /></svg>
);

const Sun = () => (
  <svg viewBox="0 0 24 24" width="62%" height="62%" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4.5" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></svg>
);

const Moon = () => (
  <svg viewBox="0 0 24 24" width="58%" height="58%" fill="currentColor"><path d="M15.5 3.2A9 9 0 1 0 20.8 15 7.2 7.2 0 0 1 15.5 3.2z" /></svg>
);

export default function Demo() {
  const [game, setGame] = useState<Game>('queens');
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState<Mode>('now');
  const rec = useMemo(() => {
    const out = {} as Record<Game, Record<Mode, Rec>>;
    for (const g of GAMES) out[g] = { now: record(g, 'now', false), before: g === 'patches' ? { events: [], ms: 0 } : record(g, 'before', false) };
    return out;
  }, []);
  const [times, setTimes] = useState<Partial<Record<string, number>>>({});
  useEffect(() => {
    const t: Record<string, number> = {};
    for (const g of GAMES) { t[`${g}:now`] = record(g, 'now').ms; if (g !== 'patches') t[`${g}:before`] = record(g, 'before').ms; }
    setTimes(t);
  }, []);
  const effMode: Mode = game === 'patches' ? 'now' : mode;
  const { events } = rec[game][effMode];
  const ms = times[`${game}:${effMode}`];
  const total = events.length;
  const nowTotal = count(rec[game].now.events);
  const beforeTotal = count(rec[game].before.events);
  const rootRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || started.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) { started.current = true; setPlaying(true); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      acc += ((now - last) / 1000) * SPEEDS[speed][1];
      last = now;
      const n = Math.floor(acc);
      if (n > 0) {
        acc -= n;
        setIdx((i) => {
          const next = Math.min(total, i + n);
          if (next >= total) setPlaying(false);
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total]);

  const pick = (g: Game) => { setGame(g); setIdx(0); setPlaying(true); };
  const pickMode = (m: Mode) => { setMode(m); setIdx(0); setPlaying(true); };
  const reset = () => { setIdx(0); setPlaying(false); };
  const step = () => { setPlaying(false); setIdx((i) => Math.min(total, i + 1)); };
  const toggle = () => { if (idx >= total) { setIdx(0); setPlaying(true); } else setPlaying((p) => !p); };

  const { nodes, backs } = count(events, idx);
  const last = idx > 0 && events[idx - 1].t !== 'start' ? events[idx - 1] : null;
  const done = idx >= total;

  return (
    <div className="sd" ref={rootRef}>
      <div className="sd-board">
        <div className="sd-board-in" key={game}>
          {game === 'queens' && <QueensBoard q={replay(game, events, idx) as number[]} last={last} />}
          {game === 'sudoku' && <SudokuBoard g={replay(game, events, idx) as number[][]} last={last} />}
          {game === 'tango' && <TangoBoard g={replay(game, events, idx) as number[]} last={last} />}
          {game === 'zip' && <ZipBoard path={replay(game, events, idx) as Cell[]} />}
          {game === 'patches' && <PatchesBoard rects={replay(game, events, idx) as PatchRect[]} last={last} />}
        </div>
        <div className="sd-progress"><span style={{ transform: `scaleX(${total ? idx / total : 0})` }} /></div>
      </div>

      <div className="sd-side">
        <div className="sd-tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === game} className={t.id === game ? 'sd-tab sd-tab-on' : 'sd-tab'} onClick={() => pick(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="sd-mode">
          <div className="sd-seg" role="tablist" aria-label="algorithm">
            {(['now', 'before'] as Mode[]).map((m) => (
              <button key={m} role="tab" aria-selected={effMode === m} disabled={game === 'patches' && m === 'before'} className={effMode === m ? 'sd-seg-on' : ''} onClick={() => pickMode(m)}>{m === 'now' ? 'now' : 'before'}</button>
            ))}
          </div>
          <span className="sd-vs">{game === 'patches' ? 'before: read from react state, no solver' : `before ${beforeTotal.nodes.toLocaleString()} nodes · now ${nowTotal.nodes.toLocaleString()}`}</span>
        </div>
        <p className="sd-line">{LINES[game][effMode]}</p>

        <div className="sd-stats">
          <div><div className="sd-k">nodes explored</div><div className="sd-v">{nodes}</div></div>
          <div><div className="sd-k">backtracks</div><div className="sd-v">{backs}</div></div>
          <div><div className="sd-k">real solve time</div><div className="sd-v">{ms === undefined ? '' : ms < 0.1 ? ms.toFixed(3) : ms.toFixed(2)}<small>ms</small></div></div>
        </div>
        <div className="sd-status">{done ? `solved. ${nodes.toLocaleString()} placements, ${backs.toLocaleString()} of them undone.` : last ? (game === 'patches' && last.rect ? `${last.t === 'place' ? 'place' : 'lift'} a ${last.rect.h}x${last.rect.w} rectangle at row ${last.r + 1}, column ${last.c + 1}` : `${last.t === 'place' ? 'try' : 'undo'} row ${last.r + 1}, column ${last.c + 1}${last.v !== undefined && game !== 'queens' && game !== 'zip' ? (game === 'tango' ? (last.v === 0 ? ', sun' : ', moon') : `, ${last.v}`) : ''}`) : 'ready'}</div>

        <div className="sd-controls">
          <button className="sd-btn sd-btn-primary" onClick={toggle}>{playing ? 'pause' : done ? 'replay' : idx ? 'resume' : 'solve'}</button>
          <button className="sd-btn" onClick={step} disabled={done}>step</button>
          <button className="sd-btn" onClick={reset}>reset</button>
        </div>
        <div className="sd-speed">
          <span className="sd-k">speed</span>
          <div className="sd-seg">
            {SPEEDS.map(([label], i) => (
              <button key={label} className={i === speed ? 'sd-seg-on' : ''} onClick={() => setSpeed(i)}>{label}</button>
            ))}
          </div>
        </div>
        <p className="sd-note">this is the extension's own <code>core/{game}.js</code>, byte for byte, running in your browser. before is the code the extension shipped with, now is the upgrade. playback is slowed down; the real solve time is the number above.</p>
      </div>
      <style>{DEMO_CSS}</style>
    </div>
  );
}

function QueensBoard({ q, last }: { q: number[]; last: Ev | null }) {
  const n = QUEENS.length;
  return (
    <div className="sd-grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` }}>
      {QUEENS.flatMap((row, r) => row.map((reg, c) => {
        const hasQ = q[r] === c;
        const hot = last && last.r === r && last.c === c;
        return (
          <div key={`${r}-${c}`} className={`sd-cell${hot ? (last!.t === 'place' ? ' sd-hot' : ' sd-undo') : ''}`} style={{ background: `var(--sq${reg})` }}>
            {hasQ && <span className="sd-pop"><Crown /></span>}
          </div>
        );
      }))}
    </div>
  );
}

function SudokuBoard({ g, last }: { g: number[][]; last: Ev | null }) {
  return (
    <div className="sd-grid sd-sudoku" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(6, 1fr)' }}>
      {g.flatMap((row, r) => row.map((v, c) => {
        const given = SUDOKU[r][c] !== 0;
        const hot = last && last.r === r && last.c === c;
        const cls = ['sd-cell', given ? 'sd-given' : 'sd-placed', c === 2 ? 'sd-br' : '', r % 2 === 1 && r < 5 ? 'sd-bb' : '', hot ? (last!.t === 'place' ? 'sd-hot' : 'sd-undo') : ''].join(' ');
        return <div key={`${r}-${c}`} className={cls}>{v ? <span className={given ? '' : 'sd-pop'}>{v}</span> : null}</div>;
      }))}
    </div>
  );
}

function TangoBoard({ g, last }: { g: number[]; last: Ev | null }) {
  const unit = 100 / 6;
  return (
    <div className="sd-tango">
      <div className="sd-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(6, 1fr)' }}>
        {g.map((v, i) => {
          const r = Math.floor(i / 6), c = i % 6;
          const given = TANGO.grid[i] !== -1;
          const hot = last && last.r === r && last.c === c;
          return (
            <div key={i} className={`sd-cell${given ? ' sd-tgiven' : ''}${hot ? (last!.t === 'place' ? ' sd-hot' : ' sd-undo') : ''}`}>
              {v === 0 && <span className={given ? '' : 'sd-pop'}><Sun /></span>}
              {v === 1 && <span className={given ? '' : 'sd-pop'}><Moon /></span>}
            </div>
          );
        })}
      </div>
      {TANGO.constraints.map((k, i) => {
        const r1 = Math.floor(k.i1 / 6), c1 = k.i1 % 6, r2 = Math.floor(k.i2 / 6), c2 = k.i2 % 6;
        const x = ((c1 + c2) / 2 + 0.5) * unit, y = ((r1 + r2) / 2 + 0.5) * unit;
        return <span key={i} className="sd-sign" style={{ left: `${x}%`, top: `${y}%` }}>{k.type === 'same' ? '=' : '×'}</span>;
      })}
    </div>
  );
}

function ZipBoard({ path }: { path: Cell[] }) {
  const n = ZIP.size;
  const walls = new Set(ZIP.walls.map((w) => `${w.cellIdx}:${w.direction}`));
  const pts = path.map((p) => `${(p.col + 0.5) * 10},${(p.row + 0.5) * 10}`).join(' ');
  const head = path[path.length - 1];
  return (
    <div className="sd-zip">
      <div className="sd-grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` }}>
        {Array.from({ length: n * n }, (_, i) => (
          <div key={i} className={`sd-cell${walls.has(`${i}:RIGHT`) ? ' sd-wr' : ''}${walls.has(`${i}:DOWN`) ? ' sd-wd' : ''}`} />
        ))}
      </div>
      <svg className="sd-path" viewBox={`0 0 ${n * 10} ${n * 10}`} preserveAspectRatio="none">
        <polyline points={pts} fill="none" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {head && <rect x={(head.col + 0.5) * 10 - 1.4} y={(head.row + 0.5) * 10 - 1.4} width="2.8" height="2.8" />}
      </svg>
      {ZIP.waypoints.map((w, i) => (
        <span key={i} className="sd-wp" style={{ left: `${((w.col + 0.5) / n) * 100}%`, top: `${((w.row + 0.5) / n) * 100}%` }}>{i + 1}</span>
      ))}
    </div>
  );
}

function PatchesBoard({ rects, last }: { rects: PatchRect[]; last: Ev | null }) {
  const { rows, cols, clues } = PATCHES;
  const glyph = (s?: string) => (s === 'square' ? '□' : s === 'wide' ? '▭' : s === 'tall' ? '▯' : '');
  return (
    <div className="sd-patches" style={{ aspectRatio: `${cols} / ${rows}` }}>
      <div className="sd-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {Array.from({ length: rows * cols }, (_, i) => <div key={i} className="sd-cell" />)}
      </div>
      {rects.map((r, i) => {
        const hot = last && last.rect === r;
        return <div key={i} className={`sd-rect${hot ? ' sd-rect-hot' : ''}`} style={{ left: `${(r.c0 / cols) * 100}%`, top: `${(r.r0 / rows) * 100}%`, width: `${(r.w / cols) * 100}%`, height: `${(r.h / rows) * 100}%` }} />;
      })}
      {clues.map((k, i) => (
        <span key={i} className="sd-clue" style={{ left: `${(((k.cell % cols) + 0.5) / cols) * 100}%`, top: `${((Math.floor(k.cell / cols) + 0.5) / rows) * 100}%` }}>{k.size}<em>{glyph(k.shape)}</em></span>
      ))}
    </div>
  );
}

const DEMO_CSS = `
  .sd { --sq0: hsl(12 45% 90%); --sq1: hsl(40 50% 88%); --sq2: hsl(75 30% 87%); --sq3: hsl(150 25% 87%); --sq4: hsl(190 30% 88%); --sq5: hsl(222 35% 90%); --sq6: hsl(268 28% 90%); --sq7: hsl(330 30% 90%); --sq8: hsl(0 0% 92%); --sq9: hsl(100 20% 90%); --sq10: hsl(300 20% 90%);
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); border: 1px solid var(--rule); }
  .site-dark .sd { --sq0: hsl(12 18% 20%); --sq1: hsl(40 20% 19%); --sq2: hsl(75 14% 18%); --sq3: hsl(150 12% 18%); --sq4: hsl(190 14% 19%); --sq5: hsl(222 16% 21%); --sq6: hsl(268 13% 21%); --sq7: hsl(330 13% 20%); --sq8: hsl(0 0% 18%); --sq9: hsl(100 10% 18%); --sq10: hsl(300 10% 19%); }
  .sd-board { position: relative; display: flex; align-items: center; justify-content: center; padding: 48px 40px; border-right: 1px solid var(--rule); background: var(--hover); }
  .sd-board-in { width: 100%; max-width: 380px; animation: sdIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .sd-progress { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--rule); }
  .sd-progress span { display: block; height: 100%; background: var(--ink); transform-origin: left; transition: transform 0.15s linear; }
  .sd-grid { display: grid; aspect-ratio: 1; border: 1px solid var(--ink); background: var(--bg); }
  .sd-cell { position: relative; min-width: 0; min-height: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); color: var(--ink); font-size: 20px; font-weight: 300; font-variant-numeric: tabular-nums; transition: background 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.15s; }
  .sd-hot { box-shadow: inset 0 0 0 1.5px var(--ink); }
  .sd-undo { outline: 1px dashed var(--half); outline-offset: -4px; }
  .sd-pop { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; animation: sdPop 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .sd-sudoku .sd-br { border-right-color: var(--ink); }
  .sd-sudoku .sd-bb { border-bottom-color: var(--ink); }
  .sd-given { font-weight: 500; background: var(--hover); }
  .sd-placed { color: var(--text); }
  .sd-tango, .sd-zip, .sd-patches { position: relative; }
  .sd-patches .sd-grid { aspect-ratio: auto; height: 100%; }
  .sd-rect { position: absolute; box-shadow: inset 0 0 0 1.5px var(--ink); background: color-mix(in srgb, var(--ink) 6%, transparent); animation: sdPop 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .sd-rect-hot { background: color-mix(in srgb, var(--ink) 12%, transparent); }
  .sd-clue { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 2px; font-size: 14px; font-weight: 500; color: var(--ink); font-variant-numeric: tabular-nums; pointer-events: none; }
  .sd-clue em { font-style: normal; font-size: 12px; color: var(--half); }
  .sd-mode { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .sd-vs { font-size: 12.5px; color: var(--half); font-variant-numeric: tabular-nums; }
  .sd-seg button:disabled { opacity: 0.35; cursor: default; }
  .sd-tgiven { background: var(--hover); }
  .sd-sign { position: absolute; transform: translate(-50%, -50%); width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 12px; line-height: 1; color: var(--ink); background: var(--bg); border: 1px solid var(--rule); pointer-events: none; }
  .sd-zip .sd-wr { border-right: 2px solid var(--ink); }
  .sd-zip .sd-wd { border-bottom: 2px solid var(--ink); }
  .sd-path { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .sd-path polyline { stroke: var(--ink); opacity: 0.85; }
  .sd-path rect { fill: var(--ink); }
  .sd-wp { position: absolute; transform: translate(-50%, -50%); width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; background: var(--ink); color: var(--bg); font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums; }
  .sd-side { padding: 32px 32px 28px; display: flex; flex-direction: column; gap: 20px; min-width: 0; }
  .sd-tabs { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border: 1px solid var(--rule); }
  .sd-tab { height: 38px; font-size: 13px; color: var(--text); border-right: 1px solid var(--rule); transition: color 0.2s, background 0.2s; white-space: nowrap; }
  .sd-tab:last-child { border-right: 0; }
  .sd-tab:hover { color: var(--ink); background: var(--hover); }
  .sd-tab.sd-tab-on { color: var(--bg); background: var(--ink); }
  .sd-line { margin: 0; font-size: 15px; line-height: 24px; color: var(--text); min-height: 48px; }
  .sd-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
  .sd-stats > div { padding: 14px 0 14px 14px; border-left: 1px solid var(--rule); }
  .sd-stats > div:first-child { padding-left: 0; border-left: 0; }
  .sd-k { font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
  .sd-v { margin-top: 6px; font-size: 30px; line-height: 1; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); font-variant-numeric: tabular-nums; }
  .sd-v small { font-size: 13px; margin-left: 3px; color: var(--half); letter-spacing: 0; }
  .sd-status { font-size: 13px; line-height: 20px; color: var(--half); font-variant-numeric: tabular-nums; min-height: 20px; }
  .sd-controls { display: flex; gap: 8px; flex-wrap: wrap; }
  .sd-btn { height: 38px; padding: 0 20px; border: 1px solid var(--rule); font-size: 13px; font-weight: 500; color: var(--ink); transition: background 0.2s, opacity 0.2s; }
  .sd-btn:hover { background: var(--hover); }
  .sd-btn:disabled { opacity: 0.4; cursor: default; }
  .sd-btn-primary { min-width: 92px; background: var(--ink); color: var(--bg); border-color: var(--ink); }
  .sd-btn-primary:hover { opacity: 0.86; background: var(--ink); }
  .sd-speed { display: flex; align-items: center; gap: 14px; }
  .sd-seg { display: flex; border: 1px solid var(--rule); }
  .sd-seg button { height: 30px; padding: 0 12px; font-size: 12px; color: var(--text); border-right: 1px solid var(--rule); transition: color 0.2s, background 0.2s; font-variant-numeric: tabular-nums; }
  .sd-seg button:last-child { border-right: 0; }
  .sd-seg button:hover { color: var(--ink); }
  .sd-seg .sd-seg-on { color: var(--ink); background: var(--hover); }
  .sd-note { margin: auto 0 0; font-size: 12px; line-height: 19px; color: var(--half); }
  .sd-note code { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 11.5px; color: var(--ink); }
  @keyframes sdPop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
  @keyframes sdIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @media (max-width: 860px) {
    .sd { grid-template-columns: 1fr; }
    .sd-board { border-right: 0; border-bottom: 1px solid var(--rule); padding: 28px 20px; }
    .sd-side { padding: 24px 20px; }
  }
  @media (max-width: 480px) {
    .sd-tab { font-size: 12px; }
    .sd-v { font-size: 24px; }
    .sd-cell { font-size: 16px; }
  }
  @media (prefers-reduced-motion: reduce) { .sd-pop, .sd-board-in { animation: none; } }
`;
