import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { frontier, type Pt } from './data';
import { ease, prefersReduced, useReveal } from './motion';

export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    setW(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

interface Props {
  pts: Pt[];
  xLabel: string;
  yLabel: string;
  xBetterLow: boolean;
  yBetterHigh: boolean;
  fmtX: (v: number) => string;
  fmtY: (v: number) => string;
  selected: string | null;
  onPick: (p: Pt) => void;
  card: (p: Pt) => React.ReactNode;
  animKey: string;
}

type Pos = { x: number; y: number; o: number };
type Box = { x: number; y: number; w: number; h: number };

const CHAR = 6.4;
const INTRO = { points: 260, spread: 520, dur: 650, front: 1150, labels: 1750 };
const SWITCH = { dur: 700, spread: 160, front: 380, labels: 900 };

function niceTicks(lo: number, hi: number, n = 5) {
  const span = hi - lo || 1;
  const step0 = span / n;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) ?? step0;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}

function logTicks(lo: number, hi: number) {
  const out: number[] = [];
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) {
    for (const m of [1, 3]) {
      const v = m * 10 ** e;
      if (v >= lo * 0.999 && v <= hi * 1.001) out.push(v);
    }
  }
  return out;
}

export default function Scatter({ pts, xLabel, yLabel, xBetterLow, yBetterHigh, fmtX, fmtY, selected, onPick, card, animKey }: Props) {
  const [wrap, W] = useWidth<HTMLDivElement>();
  const revealed = useReveal(wrap, 0.3);
  const [hover, setHover] = useState<string | null>(null);
  const narrow = W < 640;
  const H = narrow ? 340 : 460;
  const M = { t: 20, r: narrow ? 14 : 24, b: 52, l: narrow ? 44 : 56 };
  const base = H - M.b;

  const known = useRef(new Map<string, Pt>());
  for (const p of pts) known.current.set(p.id, p);
  const all = [...known.current.values()];

  const geo = useMemo(() => {
    if (!pts.length || W === 0) return null;
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const lx0 = Math.log10(Math.min(...xs));
    const lx1 = Math.log10(Math.max(...xs));
    const padX = Math.max(0.08, (lx1 - lx0) * 0.05);
    const xlo = 10 ** (lx0 - padX);
    const xhi = 10 ** (lx1 + padX);
    const ylo0 = Math.min(...ys);
    const yhi0 = Math.max(...ys);
    const padY = (yhi0 - ylo0) * 0.08 || 1;
    const yt = niceTicks(ylo0 - padY, yhi0 + padY);
    const ylo = Math.min(yt[0], ylo0 - padY);
    const yhi = Math.max(yt[yt.length - 1], yhi0 + padY);
    const iw = W - M.l - M.r;
    const ih = H - M.t - M.b;
    const sx = (v: number) => M.l + ((Math.log10(v) - Math.log10(xlo)) / (Math.log10(xhi) - Math.log10(xlo))) * iw;
    const syRaw = (v: number) => (v - ylo) / (yhi - ylo);
    const sy = (v: number) => M.t + (yBetterHigh ? 1 - syRaw(v) : syRaw(v)) * ih;
    const front = frontier(pts, xBetterLow, yBetterHigh);
    const frontIds = new Set(front.map((p) => p.id));
    const sorted = [...front].sort((a, b) => a.x - b.x);
    const verts: [number, number][] = [];
    sorted.forEach((p, i) => {
      if (i > 0) {
        const q = sorted[i - 1];
        const worseX = xBetterLow ? p : q;
        const worseY = (yBetterHigh ? p.y < q.y : p.y > q.y) ? p : q;
        verts.push([sx(worseX.x), sy(worseY.y)]);
      }
      verts.push([sx(p.x), sy(p.y)]);
    });
    const path = verts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
    const segs: Box[] = verts.slice(1).map(([x, y], i) => {
      const [px, py] = verts[i];
      return { x: Math.min(x, px) - 1, y: Math.min(y, py) - 1, w: Math.abs(x - px) + 2, h: Math.abs(y - py) + 2 };
    });

    const placed: Box[] = [];
    const marks: Box[] = pts.map((p) => ({ x: sx(p.x) - 4, y: sy(p.y) - 4, w: 8, h: 8 })).concat(segs);
    const hit = (b: Box) =>
      b.x < M.l + 2 || b.x + b.w > W - M.r + (narrow ? 0 : 20) || b.y < 2 || b.y + b.h > H - M.b - 2 ||
      placed.some((o) => b.x < o.x + o.w + 4 && b.x + b.w + 4 > o.x && b.y < o.y + o.h + 2 && b.y + b.h + 2 > o.y) ||
      marks.some((o) => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
    const labels: { id: string; x: number; y: number; anchor: 'start' | 'end' | 'middle'; text: string }[] = [];
    for (const p of [...front].sort((a, b) => (yBetterHigh ? b.y - a.y : a.y - b.y))) {
      const text = p.label.length > 26 ? `${p.label.slice(0, 25)}.` : p.label;
      const w = text.length * CHAR;
      const h = 14;
      const X = sx(p.x);
      const Y = sy(p.y);
      const tries: { b: Box; tx: number; ty: number; anchor: 'start' | 'end' | 'middle' }[] = [
        { b: { x: X + 9, y: Y - 8, w, h }, tx: X + 9, ty: Y + 4, anchor: 'start' },
        { b: { x: X - 9 - w, y: Y - 8, w, h }, tx: X - 9, ty: Y + 4, anchor: 'end' },
        { b: { x: X - w / 2, y: Y - 24, w, h }, tx: X, ty: Y - 12, anchor: 'middle' },
        { b: { x: X - w / 2, y: Y + 9, w, h }, tx: X, ty: Y + 21, anchor: 'middle' },
        { b: { x: X - 4, y: Y - 24, w, h }, tx: X - 4, ty: Y - 12, anchor: 'start' },
        { b: { x: X - 4, y: Y + 9, w, h }, tx: X - 4, ty: Y + 21, anchor: 'start' },
        { b: { x: X + 4 - w, y: Y - 24, w, h }, tx: X + 4, ty: Y - 12, anchor: 'end' },
        { b: { x: X + 4 - w, y: Y + 9, w, h }, tx: X + 4, ty: Y + 21, anchor: 'end' },
      ];
      const ok = tries.find((t) => !hit(t.b));
      if (ok) { placed.push(ok.b); labels.push({ id: p.id, x: ok.tx, y: ok.ty, anchor: ok.anchor, text }); }
    }
    const target = new Map<string, Pos>(pts.map((p) => [p.id, { x: sx(p.x), y: sy(p.y), o: 1 }]));
    const priceRank = new Map([...pts].sort((a, b) => a.x - b.x).map((p, i) => [p.id, i / Math.max(1, pts.length - 1)]));
    return { sx, sy, xt: logTicks(xlo, xhi), yt: yt.filter((v) => v >= ylo && v <= yhi), frontIds, path, labels, target, priceRank };
  }, [pts, W, H, M.l, M.r, M.t, M.b, xBetterLow, yBetterHigh, narrow]);

  const nodes = useRef(new Map<string, SVGGElement>());
  const pos = useRef(new Map<string, Pos>());
  const raf = useRef(0);
  const phase = useRef<'idle' | 'live'>('idle');
  const lastKey = useRef(animKey);
  const lastW = useRef(W);
  const [timing, setTiming] = useState({ front: INTRO.front, labels: INTRO.labels });

  const write = (id: string, p: Pos) => {
    const g = nodes.current.get(id);
    if (!g) return;
    g.setAttribute('transform', `translate(${p.x.toFixed(2)},${p.y.toFixed(2)})`);
    g.style.opacity = String(p.o);
  };

  useLayoutEffect(() => {
    if (!geo) return;
    const goal = (id: string): Pos => geo.target.get(id) ?? { x: pos.current.get(id)?.x ?? 0, y: base, o: 0 };
    const snap = () => { for (const p of all) { const g = goal(p.id); pos.current.set(p.id, g); write(p.id, g); } };
    cancelAnimationFrame(raf.current);

    if (prefersReduced()) { phase.current = 'live'; snap(); return; }
    if (!revealed) {
      for (const p of all) {
        const g = { x: geo.target.get(p.id)?.x ?? 0, y: base, o: 0 };
        pos.current.set(p.id, g);
        write(p.id, g);
      }
      return;
    }
    const sameKey = lastKey.current === animKey;
    if (phase.current === 'live' && sameKey) { lastW.current = W; snap(); return; }
    const intro = phase.current === 'idle';
    for (const p of all) {
      if (!pos.current.has(p.id)) {
        const g = { x: goal(p.id).x, y: base, o: 0 };
        pos.current.set(p.id, g);
        write(p.id, g);
      }
    }
    const from = new Map(all.map((p) => [p.id, { ...pos.current.get(p.id)! }]));
    const to = new Map(all.map((p) => [p.id, goal(p.id)]));
    const delay = (id: string) => {
      const r = geo.priceRank.get(id) ?? 0;
      return intro ? INTRO.points + r * INTRO.spread : r * SWITCH.spread;
    };
    const dur = intro ? INTRO.dur : SWITCH.dur;
    if (!intro) setTiming({ front: SWITCH.front, labels: SWITCH.labels });
    lastKey.current = animKey;
    lastW.current = W;
    const start = performance.now();
    const tick = (now: number) => {
      let busy = false;
      for (const p of all) {
        const a = from.get(p.id)!;
        const b = to.get(p.id)!;
        const t = Math.min(1, Math.max(0, (now - start - delay(p.id)) / dur));
        if (t < 1) busy = true;
        const e = ease(t);
        const cur = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, o: a.o + (b.o - a.o) * Math.min(1, e * 1.6) };
        pos.current.set(p.id, cur);
        write(p.id, cur);
      }
      if (busy) raf.current = requestAnimationFrame(tick);
    };
    phase.current = 'live';
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [geo, revealed, animKey]);

  const activePt = hover ? pts.find((p) => p.id === hover) : undefined;
  const order = [...all].sort((a, b) =>
    Number(!!geo?.target.has(a.id)) - Number(!!geo?.target.has(b.id)) || Number(!!geo?.frontIds.has(a.id)) - Number(!!geo?.frontIds.has(b.id)));
  const pick = (id: string) => { const p = pts.find((q) => q.id === id); if (p) onPick(p); };

  return (
    <div className={`bx-plot${revealed ? ' bx-on' : ''}`} ref={wrap} onMouseLeave={() => setHover(null)}>
      {geo && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${yLabel} against ${xLabel}`}>
          <g shapeRendering="crispEdges" className="bx-axes">
            {geo.yt.map((v) => (
              <g key={`y${v}`} className="bx-tickrow">
                <line x1={M.l} x2={W - M.r} y1={Math.round(geo.sy(v)) + 0.5} y2={Math.round(geo.sy(v)) + 0.5} className="bx-grid" pathLength={1} />
                <text x={M.l - 10} y={geo.sy(v) + 4} textAnchor="end" className="bx-tick">{fmtY(v)}</text>
              </g>
            ))}
            {geo.xt.map((v) => (
              <g key={`x${v}`} className="bx-tickrow">
                <line x1={Math.round(geo.sx(v)) + 0.5} x2={Math.round(geo.sx(v)) + 0.5} y1={H - M.b} y2={M.t} className="bx-grid" pathLength={1} />
                <text x={geo.sx(v)} y={H - M.b + 18} textAnchor="middle" className="bx-tick">{fmtX(v)}</text>
              </g>
            ))}
            <line x1={M.l} x2={W - M.r} y1={H - M.b + 0.5} y2={H - M.b + 0.5} className="bx-axis" pathLength={1} />
            <line x1={M.l + 0.5} x2={M.l + 0.5} y1={H - M.b} y2={M.t} className="bx-axis" pathLength={1} />
          </g>
          <text x={W - M.r} y={H - 10} textAnchor="end" className="bx-axis-label">{xLabel}</text>
          <text x={M.l} y={12} className="bx-axis-label">{yLabel}</text>

          {revealed && <path key={`f${animKey}`} d={geo.path} className="bx-front" pathLength={1} style={{ animationDelay: `${timing.front}ms` }} />}
          <g>
            {order.map((p) => {
              const here = geo.target.has(p.id);
              const on = here && geo.frontIds.has(p.id);
              const sel = here && selected !== null && p.modelId === selected;
              const cur = known.current.get(p.id)!;
              return (
                <g
                  key={p.id}
                  ref={(el) => { if (el) nodes.current.set(p.id, el); else nodes.current.delete(p.id); }}
                  className={`bx-pt${on ? ' bx-pt-front' : ''}${sel ? ' bx-pt-sel' : ''}${hover === p.id ? ' bx-pt-hot' : ''}${here ? '' : ' bx-pt-off'}`}
                  tabIndex={here ? 0 : -1}
                  role="button"
                  aria-hidden={here ? undefined : true}
                  aria-label={here ? `${p.label}, ${p.sub}, ${fmtY(cur.y)}, ${fmtX(cur.x)}` : undefined}
                  onMouseEnter={() => here && setHover(p.id)}
                  onFocus={() => here && setHover(p.id)}
                  onBlur={() => setHover((h) => (h === p.id ? null : h))}
                  onClick={() => here && pick(p.id)}
                  onKeyDown={(e) => { if (here && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(p.id); } }}
                >
                  <circle r={12} className="bx-hit" />
                  <circle r={on || sel ? 4 : 3.5} className="bx-dot" />
                </g>
              );
            })}
          </g>
          {revealed && (
            <g key={`l${animKey}`} className="bx-labels" style={{ animationDelay: `${timing.labels}ms` }}>
              {geo.labels.map((l) => (
                <text key={l.id} x={l.x} y={l.y} textAnchor={l.anchor} className="bx-plabel" aria-hidden="true">{l.text}</text>
              ))}
            </g>
          )}
        </svg>
      )}
      {geo && activePt && (() => {
        const X = geo.sx(activePt.x);
        const Y = geo.sy(activePt.y);
        const left = X > W - 260 ? X - 248 : X + 14;
        const top = Math.min(Math.max(Y - 30, 4), H - 150);
        return <div className="bx-card" style={{ left: Math.max(4, left), top }}>{card(activePt)}</div>;
      })()}
    </div>
  );
}
