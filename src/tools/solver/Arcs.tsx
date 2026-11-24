import { useEffect, useRef, useState } from 'react';
import { HOW } from './algorithms';
import type { Game } from './Demo';
import { paletteCss } from './palette';
import Thumb, { THUMB_CSS } from './Thumbs';

export type ArcGame = { id: Game; name: string; how: string; plays: string };
type Pick = { onPick: (g: Game) => void; active: Game };
export type ArcTrack = { label: string; games: ArcGame[] };

const CARD_W = 184;
const CARD_H = 156;
const SPACING = 212;
const SPEED = 26;
const GAP = 14;

function useMedia(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

function Card({ g }: { g: ArcGame }) {
  return (
    <>
      <div className="sa-thumb"><Thumb game={g.id} /></div>
      <div className="sa-name">{g.name}</div>
      <div className="sa-how">{HOW[g.id] ?? g.how}</div>
      <div className="sa-plays">{g.plays}</div>
    </>
  );
}

export default function Arcs({ top, bottom, onPick, active }: { top: ArcTrack; bottom: ArcTrack } & Pick) {
  const narrow = useMedia('(max-width: 640px)');
  const still = useMedia('(prefers-reduced-motion: reduce)');
  if (narrow) return <Marquees top={top} bottom={bottom} still={still} onPick={onPick} active={active} />;
  return <Lens top={top} bottom={bottom} still={still} onPick={onPick} active={active} />;
}

function Lens({ top, bottom, still, onPick, active }: { top: ArcTrack; bottom: ArcTrack; still: boolean } & Pick) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1040);
  const count = Math.max(top.games.length, Math.ceil((width * 1.5) / SPACING / top.games.length) * top.games.length);
  const tracks = [top, bottom].map((t) => Array.from({ length: count }, (_, i) => t.games[i % t.games.length]));
  const cardRefs = useRef<(HTMLDivElement | null)[][]>([[], []]);
  const state = useRef({ offset: [0, 0], speed: 1, target: 1, drag: null as null | { x: number; x0: number; last: number; v: number; moved: boolean }, inertia: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const L = count * SPACING;
    const half = width / 2;
    const depth = Math.min(170, width * 0.11);
    const height = CARD_H * 2 + GAP + depth * 2 + 40;
    const cy = height / 2;
    if (wrapRef.current) wrapRef.current.style.height = `${height}px`;

    const place = () => {
      const s = state.current;
      for (let k = 0; k < 2; k++) {
        const dirY = k === 0 ? -1 : 1;
        const refs = cardRefs.current[k];
        for (let i = 0; i < count; i++) {
          const el = refs[i];
          if (!el) continue;
          let x = (i * SPACING + s.offset[k]) % L;
          if (x < 0) x += L;
          x -= L / 2;
          const t = x / half;
          const a = Math.min(1.25, Math.abs(t));
          if (a > 1.2) { el.style.opacity = '0'; el.style.visibility = 'hidden'; continue; }
          el.style.visibility = 'visible';
          const y = cy + dirY * (GAP / 2 + CARD_H / 2 + depth * t * t);
          const slope = (dirY * 2 * depth * t) / half;
          const angle = (Math.atan(slope) * 180) / Math.PI * 0.6;
          const scale = 1 - 0.26 * Math.min(1, a);
          const fade = Math.min(1, Math.max(0, (a - 0.45) / 0.7));
          el.style.transform = `translate3d(${half + x - CARD_W / 2}px, ${y - CARD_H / 2}px, 0) rotate(${angle}deg) scale(${scale})`;
          el.style.opacity = String(1 - 0.92 * fade);
          el.style.zIndex = String(100 - Math.round(a * 50));
        }
      }
    };

    if (still) { place(); return; }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;
      s.speed += (s.target - s.speed) * (1 - Math.exp(-dt * 3.2));
      if (!s.drag) {
        const v = SPEED * s.speed + s.inertia;
        s.offset[0] += v * dt;
        s.offset[1] -= v * dt;
        s.inertia *= Math.pow(0.04, dt);
      }
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, width, still]);

  const pause = (on: boolean) => { state.current.target = on ? 0 : 1; };

  const onDown = (e: React.PointerEvent) => {
    if (still || e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    state.current.drag = { x: e.clientX, x0: e.clientX, last: performance.now(), v: 0, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.drag) return;
    const dx = e.clientX - s.drag.x;
    if (Math.abs(e.clientX - s.drag.x0) > 6) s.drag.moved = true;
    const now = performance.now();
    s.drag.v = dx / Math.max(1, now - s.drag.last) * 1000;
    s.drag.x = e.clientX;
    s.drag.last = now;
    s.offset[0] += dx;
    s.offset[1] -= dx;
  };
  const onUp = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.drag) return;
    if (!s.drag.moved) {
      const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-game]');
      if (hit) onPick(hit.getAttribute('data-game') as Game);
    } else s.inertia = Math.max(-900, Math.min(900, s.drag.v));
    s.drag = null;
  };

  return (
    <div
      className={`sa-lens${still ? ' sa-still' : ''}`}
      ref={wrapRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div className="sa-label sa-label-top">{top.label} <span>→</span></div>
      <div className="sa-label sa-label-bottom"><span>←</span> {bottom.label}</div>
      {tracks.map((items, k) => items.map((g, i) => (
        <div
          key={`${k}-${i}`}
          className="sa-slot"
          aria-hidden={i >= (k === 0 ? top : bottom).games.length ? true : undefined}
          ref={(el) => { cardRefs.current[k][i] = el; }}
        >
          <div
            className="sa-card"
            data-game={g.id}
            data-on={g.id === active ? '' : undefined}
            role="button"
            aria-label={`show ${g.name} in the demo`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(g.id); } }}
            tabIndex={i < (k === 0 ? top : bottom).games.length ? 0 : -1}
            onPointerEnter={() => pause(true)}
            onPointerLeave={() => pause(false)}
            onFocus={() => pause(true)}
            onBlur={() => pause(false)}
          >
            <Card g={g} />
          </div>
        </div>
      )))}
      <style>{ARCS_CSS}</style>
    </div>
  );
}

function Marquees({ top, bottom, still, onPick, active }: { top: ArcTrack; bottom: ArcTrack; still: boolean } & Pick) {
  return (
    <div className={`sa-rows${still ? ' sa-still' : ''}`}>
      {[top, bottom].map((t, k) => (
        <div key={t.label} className="sa-row-wrap">
          <div className="sa-label sa-label-inline">{t.label} <span>{k === 0 ? '→' : '←'}</span></div>
          <div className="sa-row">
            <div className={`sa-track ${k === 0 ? 'sa-right' : 'sa-left'}`}>
              {[...t.games, ...t.games].map((g, i) => (
                <button key={i} className="sa-card sa-card-flat" aria-hidden={i >= t.games.length ? true : undefined} data-on={g.id === active ? '' : undefined} onClick={() => onPick(g.id)} tabIndex={i < t.games.length ? 0 : -1}><Card g={g} /></button>
              ))}
            </div>
          </div>
        </div>
      ))}
      <style>{ARCS_CSS}</style>
    </div>
  );
}

const ARCS_CSS = `
  .sa-lens { position: relative; width: 100%; overflow: hidden; touch-action: pan-y; cursor: grab; user-select: none; }
  .sa-lens:active { cursor: grabbing; }
  .sa-still { cursor: default; }
  .sa-slot { position: absolute; left: 0; top: 0; width: ${CARD_W}px; height: ${CARD_H}px; will-change: transform, opacity; transform-origin: 50% 50%; }
  .sa-card { position: relative; width: 100%; height: 100%; padding: 18px 18px 16px; border: 1px solid var(--rule); background: var(--bg); display: flex; flex-direction: column; outline: none; transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); cursor: pointer; }
  .sa-card:hover, .sa-card:focus-visible { transform: translateY(-6px); border-color: var(--ink); }
  ${paletteCss('.sa-lens, .sa-rows')}
  ${THUMB_CSS}
  .sa-thumb { height: 52px; width: 64px; margin-bottom: 12px; pointer-events: none; display: flex; align-items: flex-start; }
  .sa-card[data-on] { border-color: var(--ink); }
  .sa-card[data-on]::after { content: ''; position: absolute; right: 14px; top: 14px; width: 6px; height: 6px; background: var(--ink); }
  .sa-card-flat { text-align: left; font: inherit; color: inherit; }
  .sa-name { font-size: 15px; line-height: 20px; font-weight: 500; color: var(--ink); }
  .sa-how { margin-top: 4px; font-size: 12.5px; line-height: 18px; color: var(--text); transition: opacity 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
  .sa-plays { position: absolute; left: 18px; right: 18px; bottom: 16px; font-size: 12px; line-height: 17px; color: var(--ink); opacity: 0; transform: translateY(4px); transition: opacity 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
  .sa-plays::before { content: 'plays it: '; color: var(--half); }
  .sa-card:hover .sa-plays, .sa-card:focus-visible .sa-plays { opacity: 1; transform: none; }
  .sa-card:hover .sa-how, .sa-card:focus-visible .sa-how { opacity: 0; transform: translateY(-4px); }
  .sa-label { position: absolute; z-index: 200; font-size: 13px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); pointer-events: none; }
  .sa-label span { letter-spacing: 0; }
  .sa-label-top { left: max(24px, calc(50% - 520px)); top: 0; }
  .sa-label-bottom { right: max(24px, calc(50% - 520px)); bottom: 0; }
  .sa-rows { display: flex; flex-direction: column; gap: 28px; }
  .sa-label-inline { position: static; margin-bottom: 12px; padding-left: 24px; }
  .sa-row { overflow: hidden; padding: 6px 0 6px 24px; }
  .sa-track { display: flex; width: max-content; }
  .sa-right { animation: saRight 38s linear infinite; }
  .sa-left { animation: saLeft 38s linear infinite; }
  .sa-row:hover .sa-track, .sa-row:focus-within .sa-track { animation-play-state: paused; }
  .sa-card-flat { width: 168px; height: 150px; flex-shrink: 0; margin-right: 12px; }
  .sa-still .sa-track { animation: none; }
  @keyframes saLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes saRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
`;
