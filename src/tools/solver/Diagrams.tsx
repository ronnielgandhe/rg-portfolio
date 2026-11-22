const E = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

function Grid({ n, size = 96, children, thick }: { n: number; size?: number; children?: React.ReactNode; thick?: { rows?: number[]; cols?: number[] } }) {
  const u = size / n;
  const lines = [];
  for (let i = 1; i < n; i++) {
    const tr = thick?.rows?.includes(i), tc = thick?.cols?.includes(i);
    lines.push(<line key={`h${i}`} x1={0} x2={size} y1={i * u} y2={i * u} className={tr ? 'dg-ink' : 'dg-rule'} />);
    lines.push(<line key={`v${i}`} y1={0} y2={size} x1={i * u} x2={i * u} className={tc ? 'dg-ink' : 'dg-rule'} />);
  }
  return (
    <svg viewBox={`-1 -1 ${size + 2} ${size + 2}`} className="dg-svg" aria-hidden="true">
      {children}
      {lines}
      <rect x={0} y={0} width={size} height={size} className="dg-frame" />
    </svg>
  );
}

export function SudokuMini() {
  const u = 16;
  const givens: [number, number, number][] = [[0, 0, 3], [0, 4, 1], [1, 2, 6], [2, 1, 4], [3, 5, 2], [4, 3, 5], [5, 0, 1], [5, 4, 6]];
  return (
    <Grid n={6} thick={{ rows: [2, 4], cols: [3] }}>
      {givens.map(([r, c, v]) => <text key={`${r}${c}`} x={c * u + 8} y={r * u + 11.5} className="dg-num dg-given">{v}</text>)}
      <rect x={2 * u} y={3 * u} width={u} height={u} className="dg-hot" />
      {[1, 2, 4, 3].map((v, i) => <text key={v} x={2 * u + 8} y={3 * u + 11.5} className="dg-num dg-cycle" style={{ animationDelay: `${i * 0.6}s` }}>{v}</text>)}
    </Grid>
  );
}

export function TangoMini() {
  const u = 16;
  const row = [0, 1, 1, 0, -1, -1];
  return (
    <svg viewBox="-1 -1 98 50" className="dg-svg" aria-hidden="true">
      {row.map((v, i) => <rect key={i} x={i * u} y={8} width={u} height={u} className="dg-cell" />)}
      {row.map((v, i) => (v === 0 ? <circle key={`s${i}`} cx={i * u + 8} cy={16} r={3.6} className="dg-sun" /> : v === 1 ? <circle key={`m${i}`} cx={i * u + 8} cy={16} r={3.6} className="dg-moon" /> : null))}
      <circle cx={4 * u + 8} cy={16} r={3.6} className="dg-moon dg-try" />
      <circle cx={4 * u + 8} cy={16} r={3.6} className="dg-sun dg-try2" />
      <line x1={u * 1 + 2} x2={u * 3 + 14} y1={16} y2={16} className="dg-strike" />
      <text x={0} y={44} className="dg-cap">three in a row dies at once</text>
    </svg>
  );
}

export function QueensMini() {
  const u = 96 / 5;
  const q = [2, 0];
  const blocked: [number, number][] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    if (r === q[0] && c === q[1]) continue;
    if (r === q[0] || c === q[1] || (Math.abs(r - q[0]) <= 1 && Math.abs(c - q[1]) <= 1)) blocked.push([r, c]);
  }
  const region: [number, number][] = [[2, 1], [3, 1], [3, 2]];
  return (
    <Grid n={5}>
      {region.map(([r, c]) => <rect key={`g${r}${c}`} x={c * u} y={r * u} width={u} height={u} className="dg-region" />)}
      {blocked.map(([r, c], i) => <rect key={`b${r}${c}`} x={c * u} y={r * u} width={u} height={u} className="dg-blocked" style={{ animationDelay: `${0.25 + i * 0.05}s` }} />)}
      <path d={`M${q[1] * u + 4} ${q[0] * u + 14}h${u - 8}M${q[1] * u + 5} ${q[0] * u + 12}l-0.6-6 3.6 3 2.6-4.5 2.6 4.5 3.6-3-0.6 6z`} className="dg-crown" />
    </Grid>
  );
}

export function ZipMini() {
  const u = 24;
  const path = [[0, 0], [0, 1], [1, 1], [1, 0], [2, 0], [3, 0], [3, 1], [2, 1], [2, 2], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2], [0, 2], [0, 3]];
  const d = path.map(([r, c], i) => `${i ? 'L' : 'M'}${c * u + 12} ${r * u + 12}`).join(' ');
  const wps: [number, number, number][] = [[0, 0, 1], [3, 0, 2], [3, 3, 3], [0, 3, 4]];
  return (
    <Grid n={4}>
      <line x1={u} x2={u} y1={2 * u} y2={3 * u} className="dg-wall" />
      <line x1={2 * u} x2={3 * u} y1={2 * u} y2={2 * u} className="dg-wall" />
      <path d={d} className="dg-path" pathLength={1} />
      {wps.map(([r, c, n]) => (
        <g key={n}>
          <rect x={c * u + 5} y={r * u + 5} width={14} height={14} className="dg-wp" />
          <text x={c * u + 12} y={r * u + 15} className="dg-wpt">{n}</text>
        </g>
      ))}
    </Grid>
  );
}

export function PatchesMini() {
  const u = 24;
  return (
    <Grid n={4}>
      <rect x={0} y={0} width={2 * u} height={u} className="dg-patch" />
      <rect x={2 * u} y={0} width={2 * u} height={3 * u} className="dg-patch dg-patch2" />
      <rect x={0} y={u} width={u} height={u} className="dg-grow" />
      <circle cx={12} cy={u + 12} r={2.4} className="dg-dot" />
      <circle cx={u + 12} cy={3 * u + 12} r={2.4} className="dg-dot dg-dot2" />
    </Grid>
  );
}

export function StrandsMini() {
  const letters = ['STAR', 'OHNE', 'MOOL', 'BITE'];
  const u = 24;
  const p = [[0, 0], [0, 1], [0, 2], [0, 3]].map(([r, c]) => `${c * u + 12},${r * u + 12}`).join(' ');
  const p2 = [[1, 0], [2, 1], [2, 2], [3, 3]].map(([r, c]) => `${c * u + 12},${r * u + 12}`).join(' ');
  return (
    <svg viewBox="-1 -1 98 98" className="dg-svg" aria-hidden="true">
      <polyline points={p} className="dg-trace" pathLength={1} />
      <polyline points={p2} className="dg-trace dg-trace2" pathLength={1} />
      {letters.flatMap((row, r) => [...row].map((ch, c) => <text key={`${r}${c}`} x={c * u + 12} y={r * u + 16} className="dg-letter">{ch}</text>))}
    </svg>
  );
}

export function Chain({ steps, note }: { steps: string[]; note?: string }) {
  return (
    <div className="dg-chain">
      {steps.map((s, i) => (
        <div key={s} className="dg-step" style={{ animationDelay: `${i * 0.5}s` }}>
          <span className="dg-step-n">{i + 1}</span>{s}
        </div>
      ))}
      {note && <div className="dg-chain-note">{note}</div>}
    </div>
  );
}

export function FlowDiagram() {
  const box = (x: number, y: number, w: number, label: string, sub?: string, strong?: boolean) => (
    <g>
      <rect x={x} y={y} width={w} height={sub ? 52 : 40} className={strong ? 'fl-box fl-strong' : 'fl-box'} />
      <text x={x + 14} y={y + (sub ? 22 : 25)} className="fl-t">{label}</text>
      {sub && <text x={x + 14} y={y + 40} className="fl-s">{sub}</text>}
    </g>
  );
  const arrow = (d: string) => <path d={d} className="fl-arrow" markerEnd="url(#fl-head)" />;
  return (
    <svg viewBox="0 0 960 300" className="fl-svg" role="img" aria-label="how a read strategy is picked and remembered">
      <defs>
        <marker id="fl-head" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0L8 4L0 8z" className="fl-headfill" />
        </marker>
      </defs>
      {box(0, 24, 170, 'learned winner', 'chrome.storage.local')}
      {box(210, 24, 160, 'strategy 1', 'tried first')}
      {box(410, 24, 160, 'sanity check', 'square, 4x4, 5 letters')}
      {box(610, 24, 160, 'remember winner', 'gssWins[game]', true)}
      {box(810, 24, 150, 'solve + play', 'core/*.js')}
      {box(210, 144, 160, 'strategy 2', 'next in order')}
      {box(210, 228, 160, 'strategy n', '…')}
      {box(410, 228, 160, 'all failed', 'error, red dot')}
      {box(610, 144, 160, 'health panel', 'strategy, ms, chain')}
      {arrow('M170 50H206')}
      {arrow('M370 50H406')}
      {arrow('M570 50H606')}
      {arrow('M770 50H806')}
      {arrow('M490 76V112H290V140')}
      {arrow('M370 170H440V80')}
      {arrow('M290 196V224')}
      {arrow('M370 254H406')}
      {arrow('M690 76V140')}
      {arrow('M570 254H690V200')}
      <text x={498} y={104} className="fl-s">fails</text>
      <text x={578} y={44} className="fl-s">ok</text>
      <path id="fl-route" d="M85 50H290V50H490V76V112H290V170H440V50H690V50H885" className="fl-route" />
      <rect x={-4} y={-4} width={8} height={8} className="fl-probe">
        <animateMotion dur="6s" repeatCount="indefinite" rotate="0" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
          <mpath href="#fl-route" />
        </animateMotion>
      </rect>
    </svg>
  );
}

export const DIAGRAM_CSS = `
  .dg-svg { width: 100%; height: auto; display: block; overflow: visible; }
  .dg-rule { stroke: var(--rule); stroke-width: 1; }
  .dg-ink { stroke: var(--ink); stroke-width: 1; }
  .dg-frame { fill: none; stroke: var(--ink); stroke-width: 1; }
  .dg-cell { fill: var(--bg); stroke: var(--rule); }
  .dg-num { font-size: 9px; text-anchor: middle; fill: var(--text); font-family: inherit; }
  .dg-given { fill: var(--ink); font-weight: 500; }
  .dg-hot { fill: none; stroke: var(--ink); stroke-width: 1.4; }
  .dg-cycle { fill: var(--ink); opacity: 0; animation: dgCycle 2.4s ${E} infinite; }
  .dg-cycle:last-child { animation-name: dgStay; }
  .dg-sun { fill: none; stroke: var(--ink); stroke-width: 1.2; }
  .dg-moon { fill: var(--ink); }
  .dg-try { opacity: 0; animation: dgTry 3s ${E} infinite; }
  .dg-try2 { opacity: 0; animation: dgTry2 3s ${E} infinite; }
  .dg-sign { font-size: 8px; fill: var(--ink); text-anchor: middle; }
  .dg-strike { stroke: var(--half); stroke-width: 1; stroke-dasharray: 2 2; opacity: 0; animation: dgFlash 3s ${E} infinite; }
  .dg-cap { font-size: 7px; fill: var(--half); font-family: inherit; }
  .dg-region { fill: var(--hover); }
  .dg-blocked { fill: var(--rule); opacity: 0; animation: dgFade 3.2s ${E} infinite; }
  .dg-crown { fill: none; stroke: var(--ink); stroke-width: 1.3; }
  .dg-wall { stroke: var(--ink); stroke-width: 2.4; }
  .dg-path { fill: none; stroke: var(--ink); stroke-width: 2; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: dgDraw 4s ${E} infinite; }
  .dg-wp { fill: var(--ink); }
  .dg-wpt { font-size: 9px; fill: var(--bg); text-anchor: middle; font-weight: 500; }
  .dg-patch { fill: var(--hover); stroke: var(--ink); stroke-width: 1.2; }
  .dg-grow { fill: var(--hover); stroke: var(--ink); stroke-width: 1.2; vector-effect: non-scaling-stroke; fill-opacity: 0.6; transform-box: fill-box; transform-origin: 0 0; animation: dgGrow 3s ${E} infinite; }
  .dg-dot { fill: var(--ink); }
  .dg-dot2 { opacity: 0; animation: dgFlash 3s ${E} infinite; }
  .dg-letter { font-size: 11px; text-anchor: middle; fill: var(--ink); font-family: inherit; }
  .dg-trace { fill: none; stroke: var(--rule); stroke-width: 14; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: dgDraw 4s ${E} infinite; }
  .site-dark .dg-trace { stroke: rgba(255,255,255,0.14); }
  .dg-trace2 { animation-delay: 1.2s; }
  .dg-chain { display: flex; flex-direction: column; gap: 6px; }
  .dg-step { display: flex; align-items: center; gap: 10px; height: 30px; padding: 0 10px; border: 1px solid var(--rule); font-size: 12.5px; color: var(--text); font-family: ui-monospace, 'SF Mono', Menlo, monospace; animation: dgStep 5s ${E} infinite; }
  .dg-step-n { width: 14px; font-family: Manrope, sans-serif; font-size: 11px; color: var(--half); font-variant-numeric: tabular-nums; }
  .dg-chain-note { margin-top: 4px; font-size: 12px; line-height: 18px; color: var(--half); }
  .fl-svg { width: 100%; height: auto; display: block; }
  .fl-box { fill: var(--bg); stroke: var(--rule); stroke-width: 1; }
  .fl-strong { stroke: var(--ink); }
  .fl-t { font-size: 13px; fill: var(--ink); font-weight: 500; font-family: inherit; }
  .fl-s { font-size: 11px; fill: var(--half); font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
  .fl-arrow { fill: none; stroke: var(--half); stroke-width: 1; }
  .fl-headfill { fill: var(--half); }
  .fl-route { fill: none; stroke: none; }
  .fl-probe { fill: var(--ink); }
  @keyframes dgCycle { 0% { opacity: 0; } 8%, 22% { opacity: 1; } 30%, 100% { opacity: 0; } }
  @keyframes dgStay { 0%, 70% { opacity: 0; } 80%, 100% { opacity: 1; } }
  @keyframes dgTry { 0%, 15% { opacity: 0; } 25%, 45% { opacity: 1; } 55%, 100% { opacity: 0; } }
  @keyframes dgTry2 { 0%, 55% { opacity: 0; } 65%, 95% { opacity: 1; } 100% { opacity: 0; } }
  @keyframes dgFlash { 0%, 25% { opacity: 0; } 35%, 50% { opacity: 1; } 60%, 100% { opacity: 0; } }
  @keyframes dgFade { 0%, 10% { opacity: 0; } 30%, 75% { opacity: 1; } 90%, 100% { opacity: 0; } }
  @keyframes dgDraw { 0% { stroke-dashoffset: 1; } 60%, 85% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; opacity: 0; } }
  @keyframes dgGrow { 0%, 20% { transform: scale(1, 1); } 55%, 85% { transform: scale(2, 3); } 100% { transform: scale(1, 1); } }
  @keyframes dgStep { 0% { border-color: var(--rule); color: var(--text); } 6%, 16% { border-color: var(--ink); color: var(--ink); } 26%, 100% { border-color: var(--rule); color: var(--text); } }
  @media (prefers-reduced-motion: reduce) {
    .dg-cycle, .dg-try, .dg-try2, .dg-strike, .dg-blocked, .dg-path, .dg-grow, .dg-dot2, .dg-trace, .dg-step { animation: none; }
    .dg-blocked, .dg-try2 { opacity: 1; }
    .dg-path, .dg-trace { stroke-dashoffset: 0; }
    .fl-probe { display: none; }
  }
`;
