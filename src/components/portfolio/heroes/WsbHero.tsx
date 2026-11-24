import { useEffect, useRef, useState } from 'react';
import { Actions, ACTIONS_CSS, BootScript, EASE, SPRING, on, rng, since, useOpening, type HeroAction } from './kit';
import { accentCss } from './brand';
import { ProjectLogo } from '../covers/brand';

const ID = 'wallstreetbets';
const VW = 1000;
const VH = 120;
const DRAW0 = 380;
const DRAW = 1000;

const F = on(ID, 'full');

interface Tape { price: number; ch1d: number; abs1d: number; spark: number[]; date: string; name: string }

const ABSTRACT = (() => {
  const r = rng(23);
  let v = 0;
  const pts = Array.from({ length: 66 }, (_, i) => (i === 0 ? v : (v += (r() - 0.47) * 1.2)));
  return pts;
})();

function pathOf(s: number[]) {
  const lo = Math.min(...s);
  const hi = Math.max(...s);
  const y = (v: number) => 10 + (1 - (v - lo) / (hi - lo || 1)) * (VH - 20);
  const d = s.map((v, i) => `${i ? 'L' : 'M'}${((i / (s.length - 1)) * VW).toFixed(1)} ${y(v).toFixed(1)}`).join('');
  return { d, end: y(s[s.length - 1]) / VH };
}

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n * 100).toFixed(2)}%`;
const day = (iso: string) => {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).toLowerCase();
};
const mood = (c: number) => (c <= -0.01 ? 'down bad' : c >= 0.01 ? 'to the moon' : 'going sideways');

const CSS = `
${accentCss(ID, 'wsh')}
.wsh{--up:#0e8f5c;--down:#c8463b}
.site-dark .wsh{--up:#3fbf87;--down:#e8776c}
.site-app .wsh.site-col>*{max-width:none}
.site-col .wsh.site-col{margin-left:0;margin-right:0;max-width:none}
.site-app .wsh.site-col>.wsh-lede{max-width:600px}
.wsh-top{display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap}
.wsh-logo{flex:none;width:58px;height:58px;color:var(--acc);overflow:visible}
.wsh-logo .pl-c{transform-box:fill-box;transform-origin:50% 100%}
.wsh-t{margin:0;font-size:64px;line-height:.95;font-weight:300;letter-spacing:-0.045em;color:var(--ink)}
.wsh-r{color:var(--acc);font-weight:400}
.wsh-mood{align-self:flex-start;margin-top:4px;padding:3px 8px;border:1px solid currentColor;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;transform:rotate(-4deg);opacity:0;transition:opacity .3s}
.wsh-mood[data-on]{opacity:1}
.wsh-mood[data-d=dn]{color:var(--down)}.wsh-mood[data-d=up]{color:var(--up)}.wsh-mood[data-d=fl]{color:var(--half)}
.wsh-chart{position:relative;height:${VH}px;margin-top:22px;border-bottom:1px solid var(--rule)}
.wsh-chart svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.wsh-chart path{fill:none;stroke-width:1.5;vector-effect:non-scaling-stroke;stroke-linejoin:round}
.wsh-abs{stroke:color-mix(in srgb,var(--ink) 35%,transparent)}
.wsh-sa{transition:opacity .4s}
.wsh-real{stroke:var(--line,var(--acc))}
.wsh-sr{animation:wshClip 900ms ${EASE} both}
.wsh-chart[data-real] .wsh-sa{opacity:0}
.wsh-dot{position:absolute;right:0;width:7px;height:7px;margin:-3.5px -3.5px 0 0;border-radius:50%;background:var(--line,var(--acc));opacity:0;transition:opacity .3s .7s}
.wsh-dot::after{content:'';position:absolute;inset:-6px;border-radius:50%;border:1px solid var(--line,var(--acc));animation:wshRing 2.2s ${EASE} infinite}
.wsh-chart[data-real] .wsh-dot{opacity:1}
.wsh-q{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;min-height:20px;margin-top:8px;font-size:12px;line-height:20px;color:var(--half);font-variant-numeric:tabular-nums}
.wsh-q b{font-weight:500;color:var(--ink)}
.wsh-q i{font-style:normal;color:var(--line,var(--half))}
.wsh-q>span{opacity:0;transition:opacity .4s .3s}
.wsh-q[data-on]>span{opacity:1}
.wsh-lede{margin:22px 0 0;font-size:18px;line-height:28px;color:var(--text)}
.wsh-acts{margin-top:24px}
${ACTIONS_CSS('wsh')}
@keyframes wshRing{0%{opacity:.6;transform:scale(.4)}100%{opacity:0;transform:scale(1.5)}}
@keyframes wshCandle{0%{transform:scaleY(0);opacity:0}60%{transform:scaleY(1.12);opacity:1}100%{transform:none;opacity:1}}
@keyframes wshClip{from{clip-path:inset(-10px 100% -10px -10px)}to{clip-path:inset(-10px -10px -10px -10px)}}
@keyframes wshR{0%{opacity:0;transform:translateX(-12px)}100%{opacity:1;transform:none}}
${F} .wsh-logo .pl-c1{animation:wshCandle 360ms ${SPRING} 40ms both}
${F} .wsh-logo .pl-c2{animation:wshCandle 360ms ${SPRING} 160ms both}
${F} .wsh-logo .pl-c3{animation:wshCandle 420ms ${SPRING} 280ms both}
${F} .wsh-r{display:inline-block;animation:wshR 360ms ${SPRING} 240ms both}
${F} .wsh-sa{animation:wshClip ${DRAW}ms cubic-bezier(.5,0,.3,1) ${DRAW0}ms both}
@media (max-width:560px){.wsh-t{font-size:40px}.wsh-logo{width:40px;height:40px}.wsh-top{gap:12px}.wsh-chart{height:84px}.wsh-lede{font-size:17px;line-height:26px}}
@media (prefers-reduced-motion:reduce){.wsh *,.wsh *::after{animation:none!important;transition:none!important}}
`;

export default function WsbHero({
  title = 'wallstreetbets',
  lede = 'where i think out loud about markets.',
  actions = [],
  className,
}: {
  title?: string;
  lede?: string;
  actions?: HeroAction[];
  className?: string;
}) {
  const o = useOpening(ID);
  const [tape, setTape] = useState<Tape | null>(null);
  const priceEl = useRef<HTMLElement>(null);
  const abs = pathOf(ABSTRACT);
  const real = tape ? pathOf(tape.spark) : null;
  const dir = tape ? (tape.ch1d <= -0.01 ? 'dn' : tape.ch1d >= 0.01 ? 'up' : 'fl') : 'fl';
  const drift = tape ? tape.spark[tape.spark.length - 1] - tape.spark[0] : 0;

  useEffect(() => {
    let live = true;
    fetch('/api/quantzoo/board/tape')
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        const q = b?.quotes?.find((x: { sym?: string; spark?: number[] }) => x.sym === '^GSPC' && Array.isArray(x.spark) && x.spark.length > 5);
        if (!live || !q) return;
        const wait = o && o.m === 'full' ? Math.max(0, DRAW0 + DRAW - since(o) - 250) : 0;
        window.setTimeout(() => { if (live) setTape({ price: q.price, ch1d: q.ch1d, abs1d: q.abs1d, spark: q.spark, date: q.date, name: q.name }); }, wait);
      })
      .catch(() => {});
    return () => { live = false; };
  }, [o]);

  useEffect(() => {
    const el = priceEl.current;
    if (!tape || !el || !o || o.m === 'still') return;
    const from = tape.price - tape.abs1d;
    const t0 = performance.now();
    let raf = 0;
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / 900);
      el.textContent = money(from + (tape.price - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, [tape, o]);

  const lineColor = tape ? (drift < 0 ? 'var(--down)' : 'var(--up)') : undefined;

  return (
    <header className={`site-col pi wsh${className ? ` ${className}` : ''}`} style={lineColor ? ({ '--line': lineColor } as React.CSSProperties) : undefined}>
      <BootScript id={ID} />
      <style>{CSS}</style>
      <div className="wsh-top">
        <ProjectLogo id={ID} className="wsh-logo" />
        <h1 className="wsh-t"><span className="wsh-r">r/</span>{title}</h1>
        <span className="wsh-mood" data-d={dir} data-on={tape ? '' : undefined} aria-hidden={!tape}>{tape ? mood(tape.ch1d) : 'loading'}</span>
      </div>
      <div className="wsh-chart" data-real={tape ? '' : undefined} aria-hidden="true">
        <svg className="wsh-sa" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"><path className="wsh-abs" d={abs.d} /></svg>
        {real && <svg className="wsh-sr" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"><path className="wsh-real" d={real.d} /></svg>}
        {real && <span className="wsh-dot" style={{ top: `${real.end * 100}%` }} />}
      </div>
      <div className="wsh-q" data-on={tape ? '' : undefined}>
        {tape ? (
          <>
            <span><b>{tape.name}</b> last {tape.spark.length} sessions</span>
            <span><b ref={priceEl}>{money(tape.price)}</b> <i>{pct(tape.ch1d)}</i> on the day, close {day(tape.date)}</span>
          </>
        ) : <span>&nbsp;</span>}
      </div>
      <p className="wsh-lede">{lede}</p>
      {actions.length > 0 && <div className="wsh-acts"><Actions p="wsh" actions={actions} /></div>}
    </header>
  );
}
