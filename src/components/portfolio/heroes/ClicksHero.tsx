import { useCallback, useRef } from 'react';
import { Actions, ACTIONS_CSS, BootScript, EASE, SPRING, on, useIdle, useOpening, type HeroAction } from './kit';
import { accentCss } from './brand';
import { ProjectLogo } from '../covers/brand';

const ID = 'how-many-clicks';
const HOP0 = 360;
const HOP = 330;
const AW = 38;

export interface Page { title: string; link?: string; lead: number }

export const CHAIN: Page[] = [
  { title: 'pizza', link: 'italy', lead: 34 },
  { title: 'italy', link: 'galileo galilei', lead: 18 },
  { title: 'galileo galilei', link: 'moon', lead: 46 },
  { title: 'moon', lead: 0 },
];


export default function ClicksHero({
  title = 'how many clicks',
  lede = 'there are a lot of ways to search through something. this lets you watch one work. pick two wikipedia articles and a strategy, then see every page it opens, every link it weighs and why, live. then try to beat it yourself.',
  actions = [],
  chain = CHAIN,
  hid = ID,
  className,
}: {
  title?: string;
  lede?: string;
  actions?: HeroAction[];
  chain?: Page[];
  hid?: string;
  className?: string;
}) {
  const o = useOpening(hid);
  const root = useRef<HTMLDivElement>(null);
  const n = chain.length;
  const hops = n - 1;
  const hopAt = (i: number) => HOP0 + i * HOP;
  const land = hopAt(hops - 1) + 160;
  const dur = land + 420;
  const pc = (t: number) => `${((t / dur) * 100).toFixed(2)}%`;
  const cardX = (i: number) => `calc((100cqw - ${AW * hops}px) / ${n} * ${i} + ${AW * i}px)`;
  const curAt = (i: number) => `translate(calc(${cardX(i)} + ${chain[i].lead}px * var(--m) + 22px),44px)`;
  const F2 = on(hid, 'full');
  const Q2 = on(hid, 'quick');

  const CSS = `
${accentCss(ID, 'clh')}
.clh{--link:#3366cc;--m:1}
.site-dark .clh{--link:#7fa3ec}
.site-app .clh.site-col>*{max-width:none}
.site-col .clh.site-col{margin-left:0;margin-right:0;max-width:none}
.site-app .clh.site-col>.clh-chain{max-width:760px}
.site-app .clh.site-col>.clh-lede{max-width:640px}
.clh-chain{position:relative;display:flex;align-items:stretch;container-type:inline-size;max-width:760px}
.clh-card{position:relative;flex:1 1 0;min-width:0;padding:10px 10px 12px;border:1px solid var(--rule);background:var(--bg)}
.clh-card:last-of-type{border-color:color-mix(in srgb,var(--ink) 40%,transparent)}
.clh-ct{font-size:12px;line-height:16px;font-weight:500;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.clh-cr{height:1px;margin:6px 0 9px;background:var(--rule)}
.clh-ln{display:flex;align-items:center;gap:5px;height:12px;margin-top:5px;white-space:nowrap;overflow:hidden}
.clh-bar{flex:none;height:3px;background:color-mix(in srgb,var(--ink) 14%,transparent)}
.clh-a{position:relative;font-size:11px;line-height:12px;color:var(--link);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px;transition:color .3s}
.clh-card[data-v] .clh-a{color:var(--acc)}
.clh-arrow{flex:none;align-self:center;width:${AW}px;height:24px;overflow:visible;color:var(--acc)}
.clh-arrow path{fill:none;stroke:currentColor;stroke-width:1.2;stroke-dasharray:1 0}
.clh-arrow circle{stroke:currentColor;stroke-width:1.2}
.clh-logo{flex:none;color:var(--acc);vertical-align:-3px;margin-right:6px}
.clh-cur{position:absolute;left:0;top:0;width:13px;height:17px;opacity:0;pointer-events:none;color:var(--ink)}
.clh-cur path{fill:var(--bg);stroke:currentColor;stroke-width:1}
.clh-head{margin-top:36px}
.clh-t{margin:0;font-size:48px;line-height:1.1;font-weight:300;letter-spacing:-0.035em;color:var(--ink)}
.clh-rule{height:1px;margin-top:10px;background:color-mix(in srgb,var(--ink) 30%,transparent);transform-origin:left}
.clh-arrow circle{opacity:1}
.clh-from{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:8px;font-size:13px;line-height:20px;color:var(--half)}
.clh-from b{font-weight:500;color:var(--ink);font-variant-numeric:tabular-nums}
.clh-lede{margin:18px 0 0;max-width:640px;font-size:18px;line-height:28px;color:var(--text)}
.clh-acts{margin-top:24px}
${ACTIONS_CSS('clh')}
.clh-a[data-wander]{animation:clhWander 1.6s ${EASE} both}
@keyframes clhWander{0%,100%{text-decoration-color:currentColor}40%{text-decoration-color:transparent}}
@keyframes clhCard{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
@keyframes clhDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes clhVisit{from{color:var(--link)}to{color:var(--acc)}}
@keyframes clhPress{0%,100%{transform:none}50%{transform:scale(.97)}}
@keyframes clhLand{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes clhRule{from{transform:scaleX(0);background:var(--acc)}to{transform:none}}
@keyframes clhIn{from{opacity:0}to{opacity:1}}
@keyframes clhCur{0%{opacity:0;transform:${curAt(0)} translate(18px,26px)}${pc(HOP0 - 160)}{opacity:1}${chain
    .slice(0, hops)
    .map((_, i) => `${pc(hopAt(i) - 70)}{transform:${curAt(i)}}${pc(hopAt(i))}{transform:${curAt(i)} scale(.86)}${pc(hopAt(i) + 50)}{transform:${curAt(i)}}`)
    .join('')}${pc(land)}{opacity:1;transform:${curAt(hops - 1)}}${pc(land + 200)}{opacity:0;transform:${curAt(hops - 1)} translate(20px,60px)}100%{opacity:0}}
${F2} .clh-cur{animation:clhCur ${dur}ms cubic-bezier(.45,0,.25,1) both}
${chain.map((_, i) => (i === 0 ? `${F2} .clh-card[data-i="0"]{animation:clhCard 260ms ${SPRING} both}` : `${F2} .clh-card[data-i="${i}"]{animation:clhCard 300ms ${SPRING} ${hopAt(i - 1) + 110}ms both}${F2} .clh-arrow[data-i="${i - 1}"] path{stroke-dasharray:1;animation:clhDraw 200ms ease ${hopAt(i - 1) + 10}ms both}${F2} .clh-arrow[data-i="${i - 1}"] circle{animation:clhIn 120ms ease ${hopAt(i - 1)}ms both}${F2} .clh-arrow[data-i="${i - 1}"] .clh-n2{animation:clhIn 120ms ease ${hopAt(i - 1) + 200}ms both}`)).join('')}
${chain.slice(0, hops).map((_, i) => `${F2} .clh-card[data-i="${i}"] .clh-a{animation:clhVisit 200ms ease ${hopAt(i)}ms both}`).join('')}
${F2} .clh-head{animation:clhLand 420ms ${SPRING} ${land}ms both}
${F2} .clh-rule{animation:clhRule 520ms ${EASE} ${land + 120}ms both}
${chain.slice(0, hops).map((_, i) => `${F2} .clh-k[data-k="${i + 1}"]{animation:clhIn 1ms linear ${hopAt(i)}ms both}`).join('')}
${Q2} .clh-head{animation:clhLand 300ms ${SPRING} both}
${Q2} .clh-rule{animation:clhRule 300ms ${EASE} both}
.clh-n{position:relative;display:inline-grid}
.clh-k{grid-area:1/1;opacity:0}
.clh-k:last-child{opacity:1}
${F2} .clh-k:last-child{opacity:0}
@media (max-width:560px){.clh{--m:0}.clh-ln .clh-bar:first-child:not(:only-child){display:none}.clh-t{font-size:38px}.clh-lede{font-size:17px;line-height:26px}.clh-card{padding:8px 7px 10px}.clh-ct{font-size:11px}.clh-a{font-size:10px}.clh-head{margin-top:28px}}
@media (prefers-reduced-motion:reduce){.clh *{animation:none!important}.clh-cur{display:none}}
`;

  const wander = useCallback(() => {
    const el = root.current;
    if (!el) return;
    const links = el.querySelectorAll<HTMLElement>('.clh-a');
    const a = links[Math.floor(Math.random() * links.length)];
    if (!a) return;
    a.setAttribute('data-wander', '');
    window.setTimeout(() => a.removeAttribute('data-wander'), 1700);
  }, []);
  useIdle(!!o && o.m !== 'still', 5200, wander);

  const first = chain[0]?.title;
  const end = chain[n - 1]?.title;
  return (
    <div ref={root} className={`site-col pi clh${className ? ` ${className}` : ''}`}>
      <BootScript id={hid} />
      <style>{CSS}</style>
      <div className="clh-chain" aria-hidden="true">
        {chain.map((p, i) => (
          <Frag key={p.title} i={i} last={i === n - 1}>
            <div className="clh-card" data-i={i} data-v={i < hops ? '' : undefined}>
              <div className="clh-ct">{p.title}</div>
              <div className="clh-cr" />
              <div className="clh-ln">
                {p.link ? <><span className="clh-bar" style={{ width: p.lead }} /><span className="clh-a">{p.link}</span><span className="clh-bar" style={{ width: 40 }} /></> : <span className="clh-bar" style={{ width: '70%' }} />}
              </div>
              <div className="clh-ln"><span className="clh-bar" style={{ width: '88%' }} /></div>
              <div className="clh-ln"><span className="clh-bar" style={{ width: `${46 + ((i * 17) % 30)}%` }} /></div>
            </div>
          </Frag>
        ))}
        <svg className="clh-cur" viewBox="0 0 13 17"><path d="M1 1v13l3.4-3.2 2.4 5.4 2-.9-2.4-5.3 4.6-.2z" /></svg>
      </div>
      <div className="clh-head">
        <h1 className="clh-t">{title}</h1>
        <div className="clh-rule" />
        <div className="clh-from">
          <span><ProjectLogo id="how-many-clicks" size={16} className="clh-logo" />from wikipedia, the free encyclopedia</span>
          <span>{first} to {end} in <span className="clh-n"><b className="clh-k" data-k="0">0</b>{Array.from({ length: hops }, (_, k) => <b key={k} className="clh-k" data-k={k + 1}>{k + 1}</b>)}</span> clicks</span>
        </div>
      </div>
      <p className="clh-lede">{lede}</p>
      {actions.length > 0 && <div className="clh-acts"><Actions p="clh" actions={actions} /></div>}
    </div>
  );
}

function Frag({ i, last, children }: { i: number; last: boolean; children: React.ReactNode }) {
  return (
    <>
      {children}
      {!last && (
        <svg className="clh-arrow" data-i={i} viewBox="0 0 38 24" aria-hidden="true">
          <circle cx={5} cy={18} r={2.4} fill="currentColor" />
          <path pathLength={1} d="M7 16C11 6 25 4 31 7.5" />
          <circle className="clh-n2" cx={33} cy={8.5} r={2.4} fill="none" />
        </svg>
      )}
    </>
  );
}

