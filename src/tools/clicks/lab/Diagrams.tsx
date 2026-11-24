import { useEffect, useState } from 'react';
import { STRATEGIES, type Strategy } from '../strategies/index.ts';
import { MODEL_IDS } from './data.ts';
import { useInView, useReducedMotion } from './motion.ts';

const N: Record<string, [number, number]> = {
  S: [16, 70], a: [62, 26], b: [62, 70], c: [62, 114],
  d: [108, 14], e: [108, 50], f: [108, 90], g: [108, 126],
  H: [150, 70],
  h: [192, 14], i: [192, 50], j: [192, 90], k: [192, 126],
  l: [238, 36], m: [238, 104], T: [284, 70],
};
const E: [string, string][] = [
  ['S', 'a'], ['S', 'b'], ['S', 'c'], ['a', 'd'], ['a', 'e'], ['b', 'e'], ['b', 'f'], ['c', 'f'], ['c', 'g'],
  ['a', 'H'], ['c', 'H'], ['H', 'h'], ['H', 'i'], ['H', 'j'], ['H', 'k'], ['e', 'i'], ['f', 'j'], ['g', 'k'], ['d', 'h'],
  ['h', 'l'], ['i', 'l'], ['j', 'm'], ['k', 'm'], ['l', 'T'], ['m', 'T'],
];
const DIST: Record<string, number> = { S: 4, a: 3, b: 3, c: 3, d: 3, e: 2, f: 2, g: 3, H: 2, h: 2, i: 2, j: 2, k: 2, l: 1, m: 1, T: 0 };
const SIM: Record<string, number> = { S: 0.1, a: 0.2, b: 0.5, c: 0.15, d: 0.1, e: 0.7, f: 0.3, g: 0.1, H: 0.3, h: 0.2, i: 0.8, j: 0.3, k: 0.1, l: 0.9, m: 0.4, T: 1 };

type Step = { n: string; p?: string; side?: 'b'; front?: string[] };
const SCRIPTS: Record<Strategy['shape'], Step[]> = {
  walk: [{ n: 'S' }, { n: 'c', p: 'S' }, { n: 'g', p: 'c' }, { n: 'k', p: 'g' }, { n: 'H', p: 'k' }, { n: 'a', p: 'H' }, { n: 'd', p: 'a' }, { n: 'h', p: 'd' }, { n: 'l', p: 'h' }, { n: 'T', p: 'l' }],
  line: [{ n: 'S', front: ['a', 'b', 'c'] }, { n: 'b', p: 'S', front: ['e', 'f'] }, { n: 'e', p: 'b', front: ['i'] }, { n: 'i', p: 'e', front: ['l'] }, { n: 'l', p: 'i' }, { n: 'T', p: 'l' }],
  fan: [{ n: 'S', front: ['a', 'b', 'c'] }, { n: 'b', p: 'S', front: ['e', 'f'] }, { n: 'a', p: 'S', front: ['d', 'H'] }, { n: 'e', p: 'b', front: ['i'] }, { n: 'H', p: 'a', front: ['h', 'j', 'k'] }, { n: 'i', p: 'e', front: ['l'] }, { n: 'l', p: 'i' }, { n: 'T', p: 'l' }],
  hub: [{ n: 'S', front: ['a', 'b', 'c'] }, { n: 'a', p: 'S', front: ['H'] }, { n: 'H', p: 'a', front: ['h', 'i', 'j', 'k'] }, { n: 'i', p: 'H', front: ['l'] }, { n: 'l', p: 'i' }, { n: 'T', p: 'l' }],
  meet: [{ n: 'S' }, { n: 'T', side: 'b' }, { n: 'a', p: 'S' }, { n: 'b', p: 'S' }, { n: 'c', p: 'S' }, { n: 'l', p: 'T', side: 'b' }, { n: 'm', p: 'T', side: 'b' }, { n: 'e', p: 'b' }, { n: 'h', p: 'l', side: 'b' }, { n: 'i', p: 'l', side: 'b' }],
  cloud: [{ n: 'S', front: ['a', 'b', 'c'] }, { n: 'b', p: 'S', front: ['e', 'f'] }, { n: 'e', p: 'b', front: ['i'] }, { n: 'i', p: 'e', front: ['l'] }, { n: 'l', p: 'i' }, { n: 'T', p: 'l' }],
  guided: [{ n: 'S', front: ['a', 'b', 'c'] }, { n: 'a', p: 'S', front: ['d', 'e', 'H'] }, { n: 'e', p: 'a', front: ['i'] }, { n: 'i', p: 'e', front: ['l'] }, { n: 'l', p: 'i' }, { n: 'T', p: 'l' }],
  'meet-guided': [{ n: 'S', front: ['a', 'b', 'c'] }, { n: 'T', side: 'b', front: ['l', 'm'] }, { n: 'b', p: 'S', front: ['e', 'f'] }, { n: 'l', p: 'T', side: 'b', front: ['h', 'i'] }, { n: 'e', p: 'b' }, { n: 'i', p: 'l', side: 'b' }],
};
const MEETS: Partial<Record<Strategy['shape'], [string, string]>> = { meet: ['e', 'i'], 'meet-guided': ['e', 'i'] };

function pathOf(steps: Step[], shape: Strategy['shape']): [string, string][] {
  const parent = new Map(steps.map((s) => [s.n, s.p]));
  const up = (n: string) => { const out = [n]; for (let p = parent.get(n); p; p = parent.get(p)) out.push(p); return out; };
  const meet = MEETS[shape];
  const chain = meet ? [...up(meet[0]).reverse(), ...up(meet[1])] : up('T').reverse();
  return chain.slice(1).map((n, i) => [chain[i], n]);
}

const STEP_MS = 520;

function Toy({ s }: { s: Strategy }) {
  const steps = SCRIPTS[s.shape] ?? SCRIPTS.line;
  const total = steps.length + 4;
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>(false);
  const [t, setT] = useState(total - 1);
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    if (reduced || !inView) return;
    if (!played) { setT(0); setPlayed(true); }
    const id = setInterval(() => setT((x) => (x + 1) % total), STEP_MS);
    return () => clearInterval(id);
  }, [inView, reduced, total, played]);
  const shown = steps.slice(0, Math.min(t + 1, steps.length));
  const done = t >= steps.length;
  const open = new Map(shown.map((x) => [x.n, x]));
  const front = new Set(shown.flatMap((x) => x.front ?? []).filter((n) => !open.has(n)));
  const path = done ? pathOf(steps, s.shape) : [];
  const onPath = new Set(path.flat());
  const model = MODEL_IDS.has(s.id);
  const cur = !done ? shown[shown.length - 1]?.n : null;

  return (
    <div ref={ref} className={`lab-toy${model ? ' lab-toy-model' : ''}`}>
      <svg viewBox="0 0 300 140" role="img" aria-label={`${s.name} on a toy graph`}>
        {E.map(([u, v]) => <line key={`${u}${v}`} x1={N[u][0]} y1={N[u][1]} x2={N[v][0]} y2={N[v][1]} className="lab-toy-e" />)}
        {shown.filter((x) => x.p).map((x) => (
          <line key={`p${x.n}`} x1={N[x.p!][0]} y1={N[x.p!][1]} x2={N[x.n][0]} y2={N[x.n][1]} className={`lab-toy-walk${x.side ? ' lab-toy-back' : ''}`} />
        ))}
        {path.map(([u, v]) => <line key={`r${u}${v}`} x1={N[u][0]} y1={N[u][1]} x2={N[v][0]} y2={N[v][1]} className="lab-toy-path" />)}
        {Object.entries(N).map(([k, [x, y]]) => {
          const hub = k === 'H';
          const r = hub ? 5 : k === 'S' || k === 'T' ? 4 : 3;
          const cls = open.has(k) ? (onPath.has(k) || cur === k ? 'lab-toy-n lab-toy-hot' : 'lab-toy-n lab-toy-on') : front.has(k) ? 'lab-toy-n lab-toy-front' : 'lab-toy-n';
          const fade = s.shape === 'cloud' && !open.has(k) ? { opacity: 0.25 + SIM[k] * 0.75 } : undefined;
          return <rect key={k} x={x - r} y={y - r} width={r * 2} height={r * 2} className={cls} style={fade} />;
        })}
        {cur && <rect x={N[cur][0] - 7} y={N[cur][1] - 7} width={14} height={14} className="lab-toy-cur" />}
        {(s.shape === 'guided' || s.shape === 'meet-guided') && [...front].map((k) => (
          <text key={`d${k}`} x={N[k][0]} y={N[k][1] - 8} textAnchor="middle" className="lab-toy-num">{DIST[k]}</text>
        ))}
        {s.shape === 'hub' && <text x={N.H[0]} y={N.H[1] + 18} textAnchor="middle" className="lab-toy-lbl">hub</text>}
        <text x={N.S[0]} y={N.S[1] + 18} textAnchor="middle" className="lab-toy-lbl">a</text>
        <text x={N.T[0]} y={N.T[1] + 18} textAnchor="middle" className="lab-toy-lbl">b</text>
      </svg>
    </div>
  );
}

export default function Diagrams() {
  return (
    <div className="lab-diagrams">
      {STRATEGIES.map((s) => (
        <article key={s.id} className="lab-dia">
          <Toy s={s} />
          <h3 className={`lab-dia-name${MODEL_IDS.has(s.id) ? ' lab-accent' : ''}`}>{s.name}</h3>
          <p className="lab-dia-blurb">{s.blurb}</p>
          <details><summary>how it works</summary><p className="lab-dia-explain">{s.explain}</p></details>
        </article>
      ))}
    </div>
  );
}
