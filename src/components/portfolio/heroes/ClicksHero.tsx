import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BootScript, EASE, SPRING, on } from './kit';
import { accentCss } from './brand';

const ID = 'how-many-clicks';
const WORDS = ['how', 'many', 'clicks'];
const STEP = 460;
const LIFT = 22;
const DOT = 11;
const Y = -16;
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const F = on(ID, 'full');

const CSS = `
${accentCss(ID, 'clh')}
.site-app .clh.site-col>*{max-width:none}
.site-col .clh.site-col{margin-left:0;margin-right:0;max-width:none}
.clh{padding-top:28px}
.clh-t{position:relative;display:inline-block;margin:0;font-size:60px;line-height:1.1;font-weight:300;letter-spacing:-0.035em;color:var(--ink);white-space:nowrap}
.clh-w{display:inline-block}
.clh-hops{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none;color:var(--acc)}
.clh-hops path{fill:none;stroke:currentColor;stroke-width:1.25}
.clh-hops circle{fill:var(--bg);stroke:currentColor;stroke-width:1.25}
.clh-hops text{fill:currentColor;font-size:11px;font-weight:500;text-anchor:middle;dominant-baseline:central;font-variant-numeric:tabular-nums;letter-spacing:0}
.clh-hops g,.clh-hops path{transform-box:fill-box;transform-origin:center}
.clh-lede{margin:20px 0 0;font-size:18px;line-height:28px;color:var(--text)}
@keyframes clhWord{from{opacity:.14}to{opacity:1}}
@keyframes clhArc{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes clhDot{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:none}}
@keyframes clhLede{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
${F} .clh-w{animation:clhWord 380ms ${EASE} both}
${WORDS.map((_, i) => `${F} .clh-w[data-i="${i}"]{animation-delay:${i * STEP}ms}${F} .clh-d[data-i="${i}"]{animation:clhDot 300ms ${SPRING} ${i * STEP}ms both}`).join('')}
${WORDS.slice(1).map((_, k) => `${F} .clh-arc[data-i="${k}"]{stroke-dasharray:1;animation:clhArc ${STEP - 80}ms ${EASE} ${k * STEP + 120}ms both}`).join('')}
${F} .clh-lede{animation:clhLede 420ms ${SPRING} ${(WORDS.length - 1) * STEP + 200}ms both}
@media (max-width:640px){.clh{padding-top:24px}.clh-t{font-size:clamp(30px,9.6vw,48px)}.clh-lede{font-size:17px;line-height:26px}}
@media (prefers-reduced-motion:reduce){.clh *{animation:none!important}}
`;

interface Geo { w: number; xs: number[] }

export default function ClicksHero({ className }: { className?: string }) {
  const h1 = useRef<HTMLHeadingElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const [geo, setGeo] = useState<Geo | null>(null);

  useIso(() => {
    const el = h1.current;
    if (!el) return;
    const measure = () => {
      const b = el.getBoundingClientRect();
      const xs = words.current.map((w) => { const r = w!.getBoundingClientRect(); return r.left - b.left + r.width / 2; });
      setGeo((g) => (g && g.xs.length === xs.length && g.xs.every((x, i) => Math.abs(x - xs[i]) < 0.5) ? g : { w: b.width, xs }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={`site-col pi clh${className ? ` ${className}` : ''}`}>
      <BootScript id={ID} />
      <style>{CSS}</style>
      <h1 ref={h1} className="clh-t" aria-label="how many clicks">
        {WORDS.map((w, i) => (
          <span key={w} aria-hidden="true">
            <span ref={(el) => { words.current[i] = el; }} className="clh-w" data-i={i}>{w}</span>
            {i < WORDS.length - 1 && ' '}
          </span>
        ))}
        {geo && (
          <svg className="clh-hops" aria-hidden="true">
            {geo.xs.slice(1).map((x, k) => {
              const x0 = geo.xs[k];
              return <path key={k} className="clh-arc" data-i={k} pathLength={1} d={`M${x0} ${Y}Q${(x0 + x) / 2} ${Y - LIFT * 2} ${x} ${Y}`} />;
            })}
            {geo.xs.map((x, i) => (
              <g key={i} className="clh-d" data-i={i}>
                <circle cx={x} cy={Y} r={DOT} />
                <text x={x} y={Y}>{i}</text>
              </g>
            ))}
          </svg>
        )}
      </h1>
      <p className="clh-lede">the wikipedia game, except i trained a model to play it.</p>
    </div>
  );
}
