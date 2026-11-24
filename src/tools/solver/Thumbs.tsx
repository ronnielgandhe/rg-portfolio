import type { Game } from './Demo';

const QR = [[0, 0, 1, 1, 1], [0, 2, 2, 1, 3], [4, 2, 2, 3, 3], [4, 4, 2, 2, 3], [4, 4, 4, 2, 3]];
const QQ = [1, 4, 2, 0, 3];
const TG = [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0];
const ZP = [[0, 0], [0, 1], [1, 1], [1, 0], [2, 0], [3, 0], [3, 1], [2, 1], [2, 2], [3, 2], [3, 3], [2, 3], [1, 3], [1, 2], [0, 2], [0, 3]];
const PR = [[0, 0, 2, 1], [2, 0, 2, 2], [0, 1, 1, 3], [1, 1, 1, 2], [1, 3, 1, 1], [2, 2, 2, 2]];
const SD = [[1, 0, 3, 0, 5, 6], [0, 5, 0, 2, 0, 3], [2, 0, 1, 0, 6, 0]];
const WD = [[0, 1, 0, 0, 2], [2, 0, 1, 2, 2], [2, 2, 2, 2, 2]];

export default function Thumb({ game }: { game: Game }) {
  if (game === 'queens') {
    const u = 12;
    return (
      <svg viewBox="-1 -1 62 62" className="th">
        {QR.flatMap((row, r) => row.map((g, c) => <rect key={`${r}${c}`} x={c * u} y={r * u} width={u} height={u} className={`th-q${g}`} />))}
        {QQ.map((c, r) => <path key={r} d={`M${c * u + 3} ${r * u + 9}h6M${c * u + 3.4} ${r * u + 8}l-.4-4 2.2 1.8 1.8-3 1.8 3 2.2-1.8-.4 4z`} className="th-crown" />)}
        <rect x={0} y={0} width={60} height={60} className="th-frame" />
      </svg>
    );
  }
  if (game === 'tango') {
    const u = 15;
    return (
      <svg viewBox="-1 -1 62 62" className="th">
        {TG.map((v, i) => <circle key={i} cx={(i % 4) * u + 7.5} cy={Math.floor(i / 4) * u + 7.5} r={4.2} className={v ? 'th-moon' : 'th-sun'} />)}
        <rect x={0} y={0} width={60} height={60} className="th-frame" />
      </svg>
    );
  }
  if (game === 'zip') {
    const u = 15;
    return (
      <svg viewBox="-1 -1 62 62" className="th">
        <defs><linearGradient id="th-zg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" className="th-za" /><stop offset="1" className="th-zb" /></linearGradient></defs>
        <polyline points={ZP.map(([r, c]) => `${c * u + 7.5},${r * u + 7.5}`).join(' ')} className="th-zpath" />
        {[[0, 0], [3, 0], [3, 3], [0, 3]].map(([r, c], i) => <g key={i}><circle cx={c * u + 7.5} cy={r * u + 7.5} r={4.6} className="th-zdot" /><text x={c * u + 7.5} y={r * u + 9.6} className="th-zn">{i + 1}</text></g>)}
        <rect x={0} y={0} width={60} height={60} className="th-frame" />
      </svg>
    );
  }
  if (game === 'patches') {
    const u = 15;
    return (
      <svg viewBox="-1 -1 62 62" className="th">
        {PR.map(([c, r, w, h], i) => <rect key={i} x={c * u} y={r * u} width={w * u} height={h * u} className={`th-p${i}`} />)}
        <rect x={0} y={0} width={60} height={60} className="th-frame" />
      </svg>
    );
  }
  if (game === 'sudoku') {
    const u = 10;
    return (
      <svg viewBox="-1 -1 62 32" className="th">
        {SD.flatMap((row, r) => row.map((v, c) => (v ? <text key={`${r}${c}`} x={c * u + 5} y={r * u + 7.6} className="th-num">{v}</text> : null)))}
        <line x1={30} x2={30} y1={0} y2={30} className="th-rule" />
        <rect x={0} y={0} width={60} height={30} className="th-frame" />
      </svg>
    );
  }
  if (game === 'strands') {
    const L = ['SOLV', 'ERSZ', 'QUEE', 'NSTA'];
    const u = 15;
    return (
      <svg viewBox="-1 -1 62 62" className="th">
        <polyline points="7.5,7.5 22.5,7.5 37.5,7.5 52.5,7.5 52.5,22.5" className="th-s0" />
        <polyline points="7.5,37.5 22.5,37.5 37.5,37.5 52.5,37.5" className="th-s1" />
        {L.flatMap((row, r) => [...row].map((ch, c) => <text key={`${r}${c}`} x={c * u + 7.5} y={r * u + 10} className="th-letter">{ch}</text>))}
      </svg>
    );
  }
  return (
    <svg viewBox="-1 -1 62 38" className="th">
      {WD.flatMap((row, r) => row.map((s, c) => <rect key={`${r}${c}`} x={c * 12.2} y={r * 12.2} width={11} height={11} className={s === 2 ? 'th-wg' : s === 1 ? 'th-wy' : 'th-wx'} />))}
    </svg>
  );
}

export const THUMB_CSS = `
  .th { width: 100%; height: 100%; display: block; overflow: visible; }
  .th-frame { fill: none; stroke: var(--ink); stroke-width: 0.8; }
  ${Array.from({ length: 6 }, (_, i) => `.th-q${i} { fill: var(--q${i}); } .th-p${i} { fill: var(--p${i}); stroke: var(--ink); stroke-width: 0.6; }`).join(' ')}
  .th-crown { fill: none; stroke: #1a1a1a; stroke-width: 0.9; }
  .th-sun { fill: var(--sun); }
  .th-moon { fill: var(--moon); }
  .th-za { stop-color: var(--zip-a); } .th-zb { stop-color: var(--zip-b); }
  .th-zpath { fill: none; stroke: url(#th-zg); stroke-width: 6; stroke-linejoin: round; stroke-linecap: round; }
  .th-zdot { fill: #1a1a1a; }
  .th-zn { font-size: 6px; fill: #fff; text-anchor: middle; font-weight: 600; font-family: inherit; }
  .th-num { font-size: 8px; fill: var(--ink); text-anchor: middle; font-family: inherit; }
  .th-rule { stroke: var(--ink); stroke-width: 0.8; }
  .th-s0 { fill: none; stroke: var(--p2); stroke-width: 11; stroke-linecap: round; stroke-linejoin: round; }
  .th-s1 { fill: none; stroke: var(--p3); stroke-width: 11; stroke-linecap: round; stroke-linejoin: round; }
  .th-letter { font-size: 8px; fill: var(--ink); text-anchor: middle; font-weight: 600; font-family: inherit; }
  .th-wg { fill: var(--wg); } .th-wy { fill: var(--wy); } .th-wx { fill: var(--wx); }
`;
