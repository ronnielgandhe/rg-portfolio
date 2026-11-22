import { useCallback, useEffect, useRef, useState } from 'react';
import { gss, LINES, type Cell, type Mode, type PatchClue, type PatchRect, type TangoConstraint, type ZipWall } from './algorithms';
import { PATCHES, QUEENS, SUDOKU, TANGO, ZIP } from './boards';
import { patchesBoard, queensBoard, strandsBoard, sudokuBoard, tangoBoard, wordleAnswer, zipBoard } from './generate';
import { Crown, Moon, Sun } from './Glyphs';
import { paletteCss } from './palette';

export type Game = 'queens' | 'tango' | 'zip' | 'sudoku' | 'patches' | 'strands' | 'wordle';
export const GAMES: { id: Game; label: string }[] = [
  { id: 'queens', label: 'queens' },
  { id: 'tango', label: 'tango' },
  { id: 'zip', label: 'zip' },
  { id: 'sudoku', label: 'sudoku' },
  { id: 'patches', label: 'patches' },
  { id: 'strands', label: 'strands' },
  { id: 'wordle', label: 'wordle' },
];

type Ev = { t: 'place' | 'undo' | 'start'; r: number; c: number; v?: number; rect?: PatchRect; word?: string; path?: Cell[] };
type Boards = {
  queens: number[][];
  sudoku: number[][];
  tango: { grid: number[]; constraints: TangoConstraint[] };
  zip: { size: number; waypoints: Cell[]; walls: ZipWall[] };
  patches: { rows: number; cols: number; clues: PatchClue[] };
  strands: { theme: string; board: string[][]; words: string[] };
  wordle: { answer: string };
};
type Run = { game: Game; events: Ev[]; ms: number | null; nodes: number; backs: number; other: number | null; ok: boolean };

const SPEEDS: [string, number][] = [['1x', 6], ['4x', 24], ['16x', 96], ['max', 900]];
const NO_BEFORE: Game[] = ['patches', 'wordle'];
const MAX_EVENTS = 60000;

function fresh(game: Game, b: Boards): Boards {
  const n = { ...b };
  if (game === 'queens') n.queens = queensBoard(8);
  if (game === 'sudoku') n.sudoku = sudokuBoard(10 + Math.floor(Math.random() * 4));
  if (game === 'tango') n.tango = tangoBoard();
  if (game === 'zip') n.zip = zipBoard(6);
  if (game === 'patches') n.patches = patchesBoard(6, 6);
  if (game === 'strands') n.strands = strandsBoard();
  if (game === 'wordle') n.wordle = { answer: wordleAnswer(gss.wordleWords) };
  return n;
}

function initialBoards(): Boards {
  return { queens: QUEENS, sudoku: SUDOKU, tango: TANGO, zip: ZIP, patches: PATCHES, strands: strandsBoard(), wordle: { answer: 'crane' } };
}

function solveOnce(game: Game, mode: Mode, b: Boards, push?: (e: Ev) => void): boolean {
  const now = mode === 'now';
  const trace = push && ((t: 'place' | 'undo' | 'start', r: number, c: number, v?: number) => push({ t, r, c, v }));
  if (game === 'queens') return !!(now ? gss.queens.solve : gss.queens.solveBasic)(b.queens, trace);
  if (game === 'sudoku') return (now ? gss.sudoku.solve : gss.sudoku.solveBasic)(b.sudoku.map((r) => r.slice()), { trace });
  if (game === 'tango') return (now ? gss.tango.solve : gss.tango.solveBasic)(b.tango.grid.slice(), 6, b.tango.constraints, trace);
  if (game === 'zip') {
    const conn = gss.zip.applyWalls(gss.zip.buildFullGrid({}, b.zip.size), b.zip.size, b.zip.walls);
    const active = gss.zip.reachable(conn, gss.zip.key(b.zip.waypoints[0].row, b.zip.waypoints[0].col));
    return !!(now ? gss.zip.solve : gss.zip.solveBasic)({ conn, active, waypoints: b.zip.waypoints, timeLimit: 2500, trace }).path;
  }
  if (game === 'patches') return !!gss.patches.solve(b.patches.rows, b.patches.cols, b.patches.clues, push && ((t, rect) => push({ t, r: rect.r0, c: rect.c0, rect })));
  if (game === 'strands') {
    const tr = push && ((t: 'place' | 'undo', word: string, path: Cell[]) => push({ t, r: path[0].row, c: path[0].col, word, path }));
    const placed = now ? gss.strands.placeExact(b.strands.board, b.strands.words, 20000, tr) : gss.strands.placeGreedy(b.strands.board, b.strands.words, tr);
    return !!placed && placed.length === b.strands.words.length;
  }
  const guesses = gss.wordle.play(b.wordle.answer, gss.wordleWords, { opener: 'raise' });
  if (guesses && push) guesses.forEach((g, i) => push({ t: 'place', r: i, c: 0, word: g }));
  return !!guesses;
}

function measure(fn: () => void) {
  const t0 = performance.now();
  fn();
  const first = performance.now() - t0;
  if (first > 4) return first;
  let reps = 1;
  while (performance.now() - t0 < 10 && reps < 400) { fn(); reps++; }
  return (performance.now() - t0) / reps;
}

function countNodes(game: Game, mode: Mode, b: Boards) {
  let n = 0;
  solveOnce(game, mode, b, (e) => { if (e.t === 'place') n++; });
  return n;
}

function runReal(game: Game, mode: Mode, b: Boards): Run {
  const events: Ev[] = [];
  const ok = solveOnce(game, mode, b, (e) => { if (events.length < MAX_EVENTS) events.push(e); });
  const ms = measure(() => solveOnce(game, mode, b));
  let nodes = 0, backs = 0;
  for (const e of events) { if (e.t === 'place') nodes++; else if (e.t === 'undo') backs++; }
  const other = NO_BEFORE.includes(game) ? null : countNodes(game, mode === 'now' ? 'before' : 'now', b);
  return { game, events, ms, nodes, backs, other, ok };
}

type View = {
  q: number[]; grid: number[][]; tgrid: number[]; path: Cell[]; rects: PatchRect[]; placed: { word: string; path: Cell[] }[]; guesses: string[];
};

function emptyView(game: Game, b: Boards): View {
  return {
    q: Array(b.queens.length).fill(-1),
    grid: b.sudoku.map((r) => r.slice()),
    tgrid: b.tango.grid.slice(),
    path: [b.zip.waypoints[0]],
    rects: [],
    placed: [],
    guesses: [],
  };
}

function apply(v: View, e: Ev, game: Game) {
  if (game === 'queens') v.q[e.r] = e.t === 'place' ? e.c : -1;
  else if (game === 'sudoku') v.grid[e.r][e.c] = e.t === 'place' ? (e.v as number) : 0;
  else if (game === 'tango') v.tgrid[e.r * 6 + e.c] = e.t === 'place' ? (e.v as number) : -1;
  else if (game === 'zip') { if (e.t === 'start') v.path = [{ row: e.r, col: e.c }]; else if (e.t === 'place') v.path.push({ row: e.r, col: e.c }); else v.path.pop(); }
  else if (game === 'patches') { if (e.t === 'place') v.rects.push(e.rect!); else v.rects.pop(); }
  else if (game === 'strands') { if (e.t === 'place') v.placed.push({ word: e.word!, path: e.path! }); else v.placed.pop(); }
  else if (e.t === 'place') v.guesses.push(e.word!);
}

function useTicker(target: number | null, key: number) {
  const [val, setVal] = useState<number | null>(target);
  useEffect(() => {
    if (target === null) { setVal(null); return; }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 420);
      setVal(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, key]);
  return val;
}

const fmtMs = (ms: number | null) => (ms === null ? '' : ms < 0.1 ? ms.toFixed(3) : ms < 10 ? ms.toFixed(2) : ms.toFixed(1));

export default function Demo({ game, onGame }: { game: Game; onGame: (g: Game) => void }) {
  const boardsRef = useRef<Boards | null>(null);
  if (!boardsRef.current) boardsRef.current = initialBoards();
  const [boards, setBoards] = useState<Boards>(boardsRef.current);
  const [mode, setMode] = useState<Mode>('now');
  const [run, setRun] = useState<Run | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [flash, setFlash] = useState(0);
  const [snap, setSnap] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const cache = useRef<{ events: Ev[] | null; applied: number; view: View | null; game: Game; boards: Boards | null }>({ events: null, applied: 0, view: null, game, boards: null });
  const effMode: Mode = NO_BEFORE.includes(game) ? 'now' : mode;

  const solveReal = useCallback((g: Game, m: Mode, newBoard: boolean) => {
    setPlaying(false);
    const b = newBoard ? fresh(g, boardsRef.current!) : boardsRef.current!;
    boardsRef.current = b;
    const r = runReal(g, NO_BEFORE.includes(g) ? 'now' : m, b);
    setBoards(b);
    setRun(r);
    setSnap(true);
    setIdx(r.events.length);
    setFlash((f) => f + 1);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        window.setTimeout(() => solveReal(game, mode, false), Math.max(450, 1900 - performance.now()));
      }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [game, mode, solveReal]);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    solveReal(game, mode, game === 'strands' || game === 'wordle');
  }, [game, solveReal]);

  const live = run && run.game === game ? run : null;
  const total = live ? live.events.length : 0;
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      acc = Math.min(acc + ((now - last) / 1000) * SPEEDS[speed][1], 60);
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

  const watch = () => {
    if (!live) return;
    if (playing) { setPlaying(false); return; }
    setSnap(false);
    if (idx >= total) setIdx(0);
    setPlaying(true);
  };
  const pickMode = (m: Mode) => { setMode(m); solveReal(game, m, false); };

  const c = cache.current;
  const events = live ? live.events : [];
  if (c.events !== events || c.game !== game || c.boards !== boards || Math.min(idx, events.length) < c.applied || !c.view) {
    c.events = events; c.game = game; c.boards = boards; c.applied = 0; c.view = emptyView(game, boards);
  }
  for (; c.applied < idx && c.applied < events.length; c.applied++) apply(c.view!, events[c.applied], game);
  const view = c.view!;

  let nodes = 0, backs = 0;
  if (live && idx >= total) { nodes = live.nodes; backs = live.backs; }
  else for (let i = 0; i < Math.min(idx, total); i++) { if (events[i].t === 'place') nodes++; else if (events[i].t === 'undo') backs++; }
  const at = Math.min(idx, total);
  const last = at > 0 && events[at - 1].t !== 'start' ? events[at - 1] : null;
  const done = !!live && idx >= total;
  const shown = useTicker(live ? live.ms : null, flash);
  const isWordle = game === 'wordle';
  const isStrands = game === 'strands';

  const vs = !live ? '' : NO_BEFORE.includes(game)
    ? (isWordle ? 'before: read the answer the page ships' : 'before: read from react state, no solver')
    : `before ${(effMode === 'before' ? live.nodes : live.other ?? 0).toLocaleString()} nodes · now ${(effMode === 'now' ? live.nodes : live.other ?? 0).toLocaleString()}`;

  let status = 'ready';
  if (live && done) {
    if (isWordle) status = `solved "${boards.wordle.answer}" in ${live.nodes} guesses.`;
    else if (isStrands) status = live.ok ? `all ${boards.strands.words.length} words placed, theme: ${boards.strands.theme}.` : `greedy placed ${view.placed.length} of ${boards.strands.words.length}. the rest had no free path left.`;
    else status = live.ok ? `solved. ${live.nodes.toLocaleString()} placements, ${live.backs.toLocaleString()} undone.` : 'gave up within the time limit.';
  } else if (last) {
    if (isWordle) status = `guess ${last.r + 1}: ${last.word}`;
    else if (isStrands) status = `${last.t === 'place' ? 'trace' : 'lift'} ${last.word}`;
    else if (game === 'patches' && last.rect) status = `${last.t === 'place' ? 'place' : 'lift'} a ${last.rect.h}x${last.rect.w} rectangle`;
    else status = `${last.t === 'place' ? 'try' : 'undo'} row ${last.r + 1}, column ${last.c + 1}`;
  }

  return (
    <div className={`sd sd-g-${game}`} ref={rootRef}>
      <div className="sd-board">
        <div className={`sd-board-in${snap ? ' sd-snap' : ''}`} key={`${game}-${flash}`}>
          {game === 'queens' && <QueensBoard regions={boards.queens} q={view.q} last={last} />}
          {game === 'sudoku' && <SudokuBoard givens={boards.sudoku} g={view.grid} last={last} />}
          {game === 'tango' && <TangoBoard board={boards.tango} g={view.tgrid} last={last} />}
          {game === 'zip' && <ZipBoard board={boards.zip} path={view.path} />}
          {game === 'patches' && <PatchesBoard board={boards.patches} rects={view.rects} />}
          {game === 'strands' && <StrandsBoard board={boards.strands.board} placed={view.placed} />}
          {game === 'wordle' && <WordleBoard answer={boards.wordle.answer} guesses={view.guesses} />}
        </div>
        <div className="sd-progress"><span style={{ transform: `scaleX(${total ? idx / total : 0})` }} /></div>
      </div>

      <div className="sd-side">
        <div className="sd-tabs" role="tablist">
          {GAMES.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === game} className={t.id === game ? 'sd-tab sd-tab-on' : 'sd-tab'} onClick={() => onGame(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="sd-mode">
          <div className="sd-seg" role="tablist" aria-label="algorithm">
            {(['now', 'before'] as Mode[]).map((m) => (
              <button key={m} role="tab" aria-selected={effMode === m} disabled={NO_BEFORE.includes(game) && m === 'before'} className={effMode === m ? 'sd-seg-on' : ''} onClick={() => pickMode(m)}>{m}</button>
            ))}
          </div>
          <span className="sd-vs">{vs}</span>
        </div>
        <p className="sd-line">{LINES[game][effMode]}</p>

        <button className="sd-time" onClick={() => solveReal(game, effMode, true)} aria-label="solve a new board now">
          <span className="sd-k">solved live in</span>
          <span className="sd-time-v">{fmtMs(shown)}<small>ms</small></span>
          <span className="sd-time-note">{isWordle ? 'one full game, measured on this click' : 'measured on this click, averaged over repeat runs of this board'}</span>
        </button>

        <div className="sd-stats">
          <div><div className="sd-k">{isWordle ? 'guesses' : isStrands ? 'words placed' : 'nodes explored'}</div><div className="sd-v">{nodes.toLocaleString()}</div></div>
          <div><div className="sd-k">{isWordle ? 'answer' : 'backtracks'}</div><div className="sd-v">{isWordle ? (done ? boards.wordle.answer : '·····') : backs.toLocaleString()}</div></div>
        </div>
        <div className="sd-status">{status}</div>

        <div className="sd-controls">
          <button className="sd-btn sd-btn-primary" onClick={() => solveReal(game, effMode, true)}>solve a new one</button>
          <button className="sd-btn" onClick={watch} disabled={!live}>{playing ? 'pause' : idx < total && !snap ? 'resume' : 'watch it think'}</button>
        </div>
        <div className="sd-speed">
          <span className="sd-k">replay speed</span>
          <div className="sd-seg">
            {SPEEDS.map(([label], i) => (
              <button key={label} className={i === speed ? 'sd-seg-on' : ''} onClick={() => setSpeed(i)}>{label}</button>
            ))}
          </div>
        </div>
        <p className="sd-note">this is the extension's own <code>core/{game === 'wordle' ? 'wordle' : game}.js</code>, byte for byte, running in your browser on a freshly generated board. before is the code the extension shipped with.</p>
      </div>
      <style>{DEMO_CSS}</style>
    </div>
  );
}

function hotClass(last: Ev | null, r: number, c: number) {
  if (!last || last.r !== r || last.c !== c) return '';
  return last.t === 'place' ? ' sd-hot' : ' sd-undo';
}

function QueensBoard({ regions, q, last }: { regions: number[][]; q: number[]; last: Ev | null }) {
  const n = regions.length;
  return (
    <div className="sd-grid sd-queens" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` }}>
      {regions.flatMap((row, r) => row.map((reg, c) => (
        <div key={`${r}-${c}`} className={`sd-cell sd-q${reg % 11}${hotClass(last, r, c)}`}>
          {q[r] === c && <span className="sd-pop"><Crown /></span>}
        </div>
      )))}
    </div>
  );
}

function SudokuBoard({ givens, g, last }: { givens: number[][]; g: number[][]; last: Ev | null }) {
  return (
    <div className="sd-grid sd-sudoku" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(6, 1fr)' }}>
      {g.flatMap((row, r) => row.map((v, c) => {
        const given = givens[r][c] !== 0;
        const cls = `sd-cell ${given ? 'sd-given' : 'sd-placed'}${c === 2 ? ' sd-br' : ''}${r % 2 === 1 && r < 5 ? ' sd-bb' : ''}${hotClass(last, r, c)}`;
        return <div key={`${r}-${c}`} className={cls}>{v ? <span className={given ? '' : 'sd-pop'}>{v}</span> : null}</div>;
      }))}
    </div>
  );
}

function TangoBoard({ board, g, last }: { board: { grid: number[]; constraints: TangoConstraint[] }; g: number[]; last: Ev | null }) {
  const unit = 100 / 6;
  return (
    <div className="sd-tango">
      <div className="sd-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(6, 1fr)' }}>
        {g.map((v, i) => {
          const r = Math.floor(i / 6), c = i % 6;
          const given = board.grid[i] !== -1;
          return (
            <div key={i} className={`sd-cell${given ? ' sd-tgiven' : ''}${hotClass(last, r, c)}`}>
              {v === 0 && <span className={`sd-sun${given ? '' : ' sd-pop'}`}><Sun /></span>}
              {v === 1 && <span className={`sd-moon${given ? '' : ' sd-pop'}`}><Moon /></span>}
            </div>
          );
        })}
      </div>
      {board.constraints.map((k, i) => {
        const r1 = Math.floor(k.i1 / 6), c1 = k.i1 % 6, r2 = Math.floor(k.i2 / 6), c2 = k.i2 % 6;
        return <span key={i} className="sd-sign" style={{ left: `${((c1 + c2) / 2 + 0.5) * unit}%`, top: `${((r1 + r2) / 2 + 0.5) * unit}%` }}>{k.type === 'same' ? '=' : '×'}</span>;
      })}
    </div>
  );
}

function ZipBoard({ board, path }: { board: { size: number; waypoints: Cell[]; walls: ZipWall[] }; path: Cell[] }) {
  const n = board.size;
  const walls = new Set(board.walls.map((w) => `${w.cellIdx}:${w.direction}`));
  const pts = path.map((p) => `${(p.col + 0.5) * 10},${(p.row + 0.5) * 10}`).join(' ');
  const a = path[0], z = path[path.length - 1];
  return (
    <div className="sd-zip">
      <div className="sd-grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` }}>
        {Array.from({ length: n * n }, (_, i) => (
          <div key={i} className={`sd-cell${walls.has(`${i}:RIGHT`) ? ' sd-wr' : ''}${walls.has(`${i}:DOWN`) ? ' sd-wd' : ''}`} />
        ))}
      </div>
      <svg className="sd-path" viewBox={`0 0 ${n * 10} ${n * 10}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sd-zipgrad" gradientUnits="userSpaceOnUse" x1={(a.col + 0.5) * 10} y1={(a.row + 0.5) * 10} x2={(z.col + 0.5) * 10 + 0.01} y2={(z.row + 0.5) * 10 + 0.01}>
            <stop offset="0" className="sd-zip-a" />
            <stop offset="1" className="sd-zip-b" />
          </linearGradient>
        </defs>
        <polyline points={pts} fill="none" stroke="url(#sd-zipgrad)" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {board.waypoints.map((w, i) => (
        <span key={i} className="sd-wp" style={{ left: `${((w.col + 0.5) / n) * 100}%`, top: `${((w.row + 0.5) / n) * 100}%` }}>{i + 1}</span>
      ))}
    </div>
  );
}

function PatchesBoard({ board, rects }: { board: { rows: number; cols: number; clues: PatchClue[] }; rects: PatchRect[] }) {
  const { rows, cols, clues } = board;
  const glyph = (s?: string) => (s === 'square' ? '□' : s === 'wide' ? '▭' : s === 'tall' ? '▯' : '');
  return (
    <div className="sd-patches" style={{ aspectRatio: `${cols} / ${rows}` }}>
      <div className="sd-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {Array.from({ length: rows * cols }, (_, i) => <div key={i} className="sd-cell" />)}
      </div>
      {rects.map((r, i) => (
        <div key={i} className={`sd-rect sd-p${r.clue % 10}`} style={{ left: `${(r.c0 / cols) * 100}%`, top: `${(r.r0 / rows) * 100}%`, width: `${(r.w / cols) * 100}%`, height: `${(r.h / rows) * 100}%` }} />
      ))}
      {clues.map((k, i) => (
        <span key={i} className="sd-clue" style={{ left: `${(((k.cell % cols) + 0.5) / cols) * 100}%`, top: `${((Math.floor(k.cell / cols) + 0.5) / rows) * 100}%` }}>{k.size}<em>{glyph(k.shape)}</em></span>
      ))}
    </div>
  );
}

function StrandsBoard({ board, placed }: { board: string[][]; placed: { word: string; path: Cell[] }[] }) {
  const rows = board.length, cols = board[0].length;
  const owner = new Map<string, number>();
  placed.forEach((p, i) => p.path.forEach((c) => owner.set(`${c.row},${c.col}`, i)));
  return (
    <div className="sd-strands" style={{ aspectRatio: `${cols} / ${rows}` }}>
      <svg className="sd-path" viewBox={`0 0 ${cols * 10} ${rows * 10}`} preserveAspectRatio="none">
        {placed.map((p, i) => (
          <polyline key={i} className={`sd-sline sd-s${i % 9}`} points={p.path.map((c) => `${(c.col + 0.5) * 10},${(c.row + 0.5) * 10}`).join(' ')} fill="none" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="sd-sgrid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {board.flatMap((row, r) => row.map((ch, c) => {
          const o = owner.get(`${r},${c}`);
          return <div key={`${r}-${c}`} className={`sd-letter${o !== undefined ? ` sd-on sd-s${o % 9}` : ''}`}><span>{ch}</span></div>;
        }))}
      </div>
    </div>
  );
}

function WordleBoard({ answer, guesses }: { answer: string; guesses: string[] }) {
  const rows = Math.max(6, guesses.length);
  return (
    <div className="sd-wordle" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}>
      {Array.from({ length: rows }, (_, r) => {
        const g = guesses[r];
        const p = g ? gss.wordle.feedback(g, answer) : 0;
        return (
          <div key={r} className="sd-wrow">
            {Array.from({ length: 5 }, (_, i) => {
              const s = g ? Math.floor(p / 3 ** i) % 3 : -1;
              return <div key={i} className={`sd-tile${s === 2 ? ' sd-tg' : s === 1 ? ' sd-ty' : s === 0 ? ' sd-tx' : ''}`} style={g ? { animationDelay: `${i * 60}ms` } : undefined}>{g ? g[i] : ''}</div>;
            })}
          </div>
        );
      })}
    </div>
  );
}

const DEMO_CSS = `
  ${paletteCss('.sd')}
  .sd { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); border: 1px solid var(--rule); }
  .sd-board { position: relative; display: flex; align-items: center; justify-content: center; padding: 48px 40px; border-right: 1px solid var(--rule); background: var(--hover); }
  .sd-board-in { width: 100%; max-width: 380px; animation: sdIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .sd-board-in.sd-snap { animation: sdSettle 0.34s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .sd-snap .sd-pop, .sd-snap .sd-rect, .sd-snap .sd-tile, .sd-snap .sd-sline { animation: none; }
  .sd-progress { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--rule); }
  .sd-progress span { display: block; height: 100%; background: var(--ink); transform-origin: left; }
  .sd-grid { display: grid; aspect-ratio: 1; border: 1px solid var(--ink); background: var(--bg); }
  .sd-cell { position: relative; min-width: 0; min-height: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); color: var(--ink); font-size: 20px; font-weight: 300; font-variant-numeric: tabular-nums; }
  .sd-queens .sd-cell { border-color: rgba(0, 0, 0, 0.12); color: #1a1a1a; }
  .site-dark .sd-queens .sd-cell { border-color: rgba(0, 0, 0, 0.35); color: #f2f2f0; }
  ${Array.from({ length: 11 }, (_, i) => `.sd-q${i} { background: var(--q${i}); }`).join(' ')}
  ${Array.from({ length: 10 }, (_, i) => `.sd-p${i} { background: var(--p${i}); }`).join(' ')}
  .sd-hot { box-shadow: inset 0 0 0 2px var(--ink); }
  .sd-undo { outline: 1px dashed var(--ink); outline-offset: -4px; }
  .sd-pop { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; animation: sdPop 0.18s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .sd-sudoku .sd-br { border-right-color: var(--ink); }
  .sd-sudoku .sd-bb { border-bottom-color: var(--ink); }
  .sd-given { font-weight: 500; background: var(--hover); }
  .sd-placed { color: var(--text); }
  .sd-tango, .sd-zip, .sd-patches, .sd-strands { position: relative; }
  .sd-tgiven { background: var(--hover); }
  .sd-sun { color: var(--sun); }
  .sd-moon { color: var(--moon); }
  .sd-sign { position: absolute; transform: translate(-50%, -50%); width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 12px; line-height: 1; color: var(--ink); background: var(--bg); border: 1px solid var(--rule); pointer-events: none; }
  .sd-zip .sd-wr { border-right: 3px solid var(--ink); }
  .sd-zip .sd-wd { border-bottom: 3px solid var(--ink); }
  .sd-path { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .sd-zip-a { stop-color: var(--zip-a); }
  .sd-zip-b { stop-color: var(--zip-b); }
  .sd-wp { position: absolute; transform: translate(-50%, -50%); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #1a1a1a; color: #fff; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .site-dark .sd-wp { background: #f2f2f0; color: #111; }
  .sd-patches .sd-grid { aspect-ratio: auto; height: 100%; }
  .sd-rect { position: absolute; box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--ink) 70%, transparent); animation: sdPop 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .sd-clue { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 2px; font-size: 14px; font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; pointer-events: none; }
  .sd-clue em { font-style: normal; font-size: 12px; color: var(--text); }
  .sd-sgrid { position: relative; display: grid; width: 100%; height: 100%; }
  .sd-letter { display: flex; align-items: center; justify-content: center; }
  .sd-letter span { width: 78%; aspect-ratio: 1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 500; color: var(--ink); }
  .sd-letter.sd-on span { font-weight: 600; }
  ${Array.from({ length: 9 }, (_, i) => `.sd-sline.sd-s${i} { stroke: var(--p${i}); } .sd-letter.sd-s${i} span { background: var(--p${i}); }`).join(' ')}
  .sd-sline { animation: sdFade 0.25s ease both; }
  .sd-wordle { display: grid; gap: 6px; max-width: 300px; margin: 0 auto; }
  .sd-wrow { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .sd-tile { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border: 1px solid var(--rule); font-size: 22px; font-weight: 600; text-transform: uppercase; color: var(--ink); }
  .sd-tg, .sd-ty, .sd-tx { color: #fff; border-color: transparent; animation: sdFlip 0.3s ease both; }
  .sd-tg { background: var(--wg); } .sd-ty { background: var(--wy); } .sd-tx { background: var(--wx); }
  .sd-side { padding: 32px 32px 28px; display: flex; flex-direction: column; gap: 18px; min-width: 0; }
  .sd-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--rule); border-left: 1px solid var(--rule); }
  .sd-tab { height: 36px; font-size: 13px; color: var(--text); border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); transition: color 0.2s, background 0.2s; white-space: nowrap; }
  .sd-tab:hover { color: var(--ink); background: var(--hover); }
  .sd-tab.sd-tab-on { color: var(--bg); background: var(--ink); }
  .sd-mode { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .sd-vs { font-size: 12.5px; color: var(--half); font-variant-numeric: tabular-nums; }
  .sd-line { margin: 0; font-size: 15px; line-height: 24px; color: var(--text); min-height: 72px; }
  .sd-time { display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 4px 16px; text-align: left; padding: 14px 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--rule); cursor: pointer; }
  .sd-time:hover .sd-time-v { opacity: 0.75; }
  .sd-time-v { grid-row: span 2; font-size: 44px; line-height: 1; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); font-variant-numeric: tabular-nums; transition: opacity 0.2s; }
  .sd-time-v small { font-size: 14px; margin-left: 4px; color: var(--half); letter-spacing: 0; }
  .sd-time-note { font-size: 12px; line-height: 17px; color: var(--half); }
  .sd-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-bottom: 1px solid var(--rule); }
  .sd-stats > div { padding: 0 0 12px 14px; border-left: 1px solid var(--rule); }
  .sd-stats > div:first-child { padding-left: 0; border-left: 0; }
  .sd-k { font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
  .sd-v { margin-top: 6px; font-size: 26px; line-height: 1; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); font-variant-numeric: tabular-nums; }
  .sd-status { font-size: 13px; line-height: 20px; color: var(--half); font-variant-numeric: tabular-nums; min-height: 20px; }
  .sd-controls { display: flex; gap: 8px; flex-wrap: wrap; }
  .sd-btn { height: 38px; padding: 0 18px; border: 1px solid var(--rule); font-size: 13px; font-weight: 500; color: var(--ink); transition: background 0.2s, opacity 0.2s; }
  .sd-btn:hover { background: var(--hover); }
  .sd-btn:disabled { opacity: 0.4; cursor: default; }
  .sd-btn-primary { background: var(--ink); color: var(--bg); border-color: var(--ink); }
  .sd-btn-primary:hover { opacity: 0.86; background: var(--ink); }
  .sd-speed { display: flex; align-items: center; gap: 14px; }
  .sd-seg { display: flex; border: 1px solid var(--rule); }
  .sd-seg button { height: 30px; padding: 0 12px; font-size: 12px; color: var(--text); border-right: 1px solid var(--rule); transition: color 0.2s, background 0.2s; font-variant-numeric: tabular-nums; }
  .sd-seg button:last-child { border-right: 0; }
  .sd-seg button:hover { color: var(--ink); }
  .sd-seg .sd-seg-on { color: var(--ink); background: var(--hover); }
  .sd-seg button:disabled { opacity: 0.35; cursor: default; }
  .sd-note { margin: auto 0 0; font-size: 12px; line-height: 19px; color: var(--half); }
  .sd-note code { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 11.5px; color: var(--ink); }
  @keyframes sdPop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
  @keyframes sdIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes sdSettle { 0% { transform: scale(0.985); filter: brightness(1.08); } 45% { transform: scale(1.012); } 100% { transform: none; filter: none; } }
  @keyframes sdFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes sdFlip { from { transform: rotateX(80deg); } to { transform: none; } }
  @media (max-width: 860px) {
    .sd { grid-template-columns: 1fr; }
    .sd-board { border-right: 0; border-bottom: 1px solid var(--rule); padding: 28px 20px; }
    .sd-side { padding: 24px 20px; }
  }
  @media (max-width: 480px) {
    .sd-tab { font-size: 12px; }
    .sd-time-v { font-size: 36px; }
    .sd-cell { font-size: 16px; }
  }
  @media (prefers-reduced-motion: reduce) { .sd-pop, .sd-board-in, .sd-rect, .sd-tile, .sd-sline { animation: none; } }
`;
