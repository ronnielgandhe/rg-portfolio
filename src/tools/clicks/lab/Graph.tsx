import { useEffect, useRef } from 'react';
import type { GNode, Lane } from './lane.ts';
import { nodeKey } from './lane.ts';
import { useReducedMotion } from './motion.ts';

interface P { x: number; y: number; a: number }
interface Target { x: number; y: number }
interface Palette { ink: string; faint: string; rule: string; bg: string; accent: string; font: string }

const PAD_X = 16;
const PAD_Y = 30;

function layout(nodes: GNode[], W: number, H: number): Map<string, Target> {
  const cols = { forward: [] as GNode[][], backward: [] as GNode[][] };
  for (const n of nodes) (cols[n.side][n.depth] ??= []).push(n);
  const nF = cols.forward.length, nB = Math.max(cols.backward.length, 1);
  const oneSided = nB <= 1;
  const span = W - PAD_X * 2;
  const colW = oneSided ? Math.min((span * 0.86) / Math.max(nF - 1, 1), 132) : Math.min(span / Math.max(nF + nB - 1, 1), 132);
  const out = new Map<string, Target>();
  for (const side of ['forward', 'backward'] as const) {
    let rank = new Map<string, number>();
    cols[side].forEach((col = [], d) => {
      const sorted = [...col].sort((a, b) => (rank.get(a.parent ?? '') ?? 0) - (rank.get(b.parent ?? '') ?? 0) || a.order - b.order);
      const n = sorted.length;
      const rowH = Math.min(20, (H - PAD_Y * 2) / Math.max(n - 1, 1));
      const x = side === 'forward' ? PAD_X + d * colW : W - PAD_X - d * colW;
      const next = new Map<string, number>();
      sorted.forEach((node, i) => {
        out.set(node.key, { x, y: H / 2 + (i - (n - 1) / 2) * rowH });
        next.set(node.key, i);
      });
      rank = next;
    });
  }
  return out;
}

function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el);
  const v = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
  return { ink: cs.color, faint: v('--faint', '#999'), rule: v('--rule', '#e5e5e5'), bg: v('--bg', '#fff'), accent: v('--lab-accent', cs.color), font: cs.fontFamily };
}

function clip(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}...`).width > max) t = t.slice(0, -1);
  return `${t.trimEnd()}...`;
}

export default function Graph({ lane, model, label }: { lane: Lane; model: boolean; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const laneRef = useRef(lane);
  const pos = useRef(new Map<string, P>());
  const kick = useRef<() => void>(() => {});
  const reduced = useReducedMotion();
  laneRef.current = lane;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0, raf = 0, last = 0, pal = readPalette(canvas), palAt = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      start();
    };

    const frame = (t: number) => {
      raf = 0;
      const dt = last ? Math.min(t - last, 64) : 16;
      last = t;
      if (t - palAt > 400) { pal = readPalette(canvas); palAt = t; }
      const L = laneRef.current;
      const nodes = Object.values(L.nodes);
      const targets = layout(nodes, W, H);
      const k = reduced ? 1 : 1 - Math.exp(-dt / 110);
      let moving = false;
      for (const n of nodes) {
        const tg = targets.get(n.key)!;
        let p = pos.current.get(n.key);
        if (!p) {
          const from = n.parent ? pos.current.get(n.parent) : null;
          p = from ? { x: from.x, y: from.y, a: 0 } : { x: tg.x, y: tg.y, a: 0 };
          pos.current.set(n.key, p);
        }
        p.x += (tg.x - p.x) * k;
        p.y += (tg.y - p.y) * k;
        p.a += (1 - p.a) * k;
        if (Math.abs(tg.x - p.x) > 0.3 || Math.abs(tg.y - p.y) > 0.3 || 1 - p.a > 0.01) moving = true;
      }

      const done = L.outcome === 'found';
      const lead = model ? pal.accent : pal.ink;
      const onPath = new Set(done ? L.pathKeys : []);
      const trail = new Set<string>();
      if (!done && L.current) {
        const side = L.currentSide;
        for (let key: string | null = nodeKey(side, L.current); key; key = L.nodes[key]?.parent ?? null) trail.add(key);
      }

      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      const px = (v: number) => Math.round(v) + 0.5;
      const line = (a: P, b: P, color: string, alpha: number, dash = false) => {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.setLineDash(dash ? [3, 3] : []);
        ctx.beginPath();
        if (Math.abs(a.y - b.y) < 0.5) { ctx.moveTo(a.x, px(a.y)); ctx.lineTo(b.x, px(b.y)); }
        else {
          const mx = (a.x + b.x) / 2;
          ctx.moveTo(a.x, a.y);
          ctx.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y);
        }
        ctx.stroke();
      };

      const startP = pos.current.get(nodeKey('forward', L.start));
      const targetP = pos.current.get(nodeKey('backward', L.target));
      if (startP && targetP && !done) line(startP, targetP, pal.faint, 0.22, true);

      const dim = done ? 0.35 : 1;
      for (const n of nodes) {
        if (!n.parent) continue;
        const a = pos.current.get(n.parent), b = pos.current.get(n.key)!;
        if (!a) continue;
        const hot = !done && trail.has(n.key);
        line(a, b, hot ? lead : pal.faint, b.a * (hot ? 1 : (n.opened ? 0.42 : 0.2) * dim));
      }
      if (done) {
        for (let i = 1; i < L.pathKeys.length; i++) {
          const pa = pos.current.get(L.pathKeys[i - 1]), pb = pos.current.get(L.pathKeys[i]);
          if (pa && pb) line(pa, pb, lead, Math.min(pa.a, pb.a));
        }
      }
      ctx.setLineDash([]);
      for (const n of nodes) {
        const p = pos.current.get(n.key)!;
        const hot = trail.has(n.key) || onPath.has(n.key);
        const end = (n.side === 'forward' && n.depth === 0) || (n.side === 'backward' && n.depth === 0);
        const x = Math.round(p.x), y = Math.round(p.y);
        if (end) {
          ctx.globalAlpha = p.a;
          ctx.fillStyle = pal.ink;
          ctx.fillRect(x - 3, y - 3, 7, 7);
        } else if (n.opened) {
          ctx.globalAlpha = p.a * (hot ? 1 : 0.6 * (done ? 0.6 : 1));
          ctx.fillStyle = hot ? lead : pal.ink;
          ctx.fillRect(x - 2, y - 2, 5, 5);
        } else {
          ctx.globalAlpha = p.a * 0.5 * dim;
          ctx.strokeStyle = pal.faint;
          ctx.strokeRect(x - 1.5, y - 1.5, 4, 4);
        }
      }

      const cur = L.current ? pos.current.get(nodeKey(L.currentSide, L.current)) : null;
      if (cur) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = lead;
        ctx.strokeRect(Math.round(cur.x) - 5.5, Math.round(cur.y) - 5.5, 12, 12);
      }

      ctx.font = `500 11px ${pal.font}`;
      ctx.textBaseline = 'middle';
      const text = (t: string, p: P, align: CanvasTextAlign, dy: number, color: string, max = 140) => {
        ctx.globalAlpha = p.a;
        ctx.textAlign = align;
        const s = clip(ctx, t, max);
        const w = ctx.measureText(s).width;
        let x = p.x;
        if (align === 'center') x = Math.min(Math.max(x, w / 2 + 2), W - w / 2 - 2);
        ctx.fillStyle = pal.bg;
        const left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
        ctx.globalAlpha = p.a * 0.85;
        ctx.fillRect(left - 2, p.y + dy - 7, w + 4, 14);
        ctx.globalAlpha = p.a;
        ctx.fillStyle = color;
        ctx.fillText(s, x, p.y + dy);
      };
      if (startP) text(L.start, startP, 'left', 16, pal.ink);
      if (targetP) text(L.target, targetP, 'right', 16, pal.ink);
      if (cur && L.current) text(L.current, cur, 'center', -16, pal.ink, 160);
      if (done) {
        L.pathKeys.slice(1, -1).forEach((key, i) => {
          const p = pos.current.get(key);
          if (p) text(L.nodes[key]?.title ?? '', p, 'center', i % 2 ? 16 : -16, pal.ink, 120);
        });
      }
      ctx.globalAlpha = 1;

      if (moving) start();
    };

    function start() {
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    }
    kick.current = start;

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [model, reduced]);

  useEffect(() => {
    if (Object.keys(lane.nodes).length === 0) pos.current.clear();
    kick.current();
  }, [lane]);

  return <canvas ref={canvasRef} className="lab-canvas" role="img" aria-label={label} />;
}
