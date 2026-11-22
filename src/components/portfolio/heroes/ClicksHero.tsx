import { useCallback, useRef } from 'react';
import { Actions, ACTIONS_CSS, BootScript, EASE, SPRING, on, useIdle, useOpening, type HeroAction } from './kit';
import { accentCss } from './brand';
import { Thumb, useSummary } from '../../../tools/clicks/ui';
import { MODEL_NAME } from '../../../tools/clicks/strategies/index.ts';

const ID = 'how-many-clicks';
const HOP0 = 420;
const HOP = 420;
const AW = 44;

export const CHAIN: string[] = ['Pizza', 'Italy', 'Galileo Galilei', 'Moon'];

function firstLine(text: string | undefined) {
  if (!text) return '';
  const m = text.match(/^(.+?[.!?])(\s|$)/);
  return (m ? m[1] : text).trim();
}

function Card({ title, i, next, last }: { title: string; i: number; next?: string; last: boolean }) {
  const s = useSummary(title);
  return (
    <div className={`clh-card${last ? ' clh-card-end' : ''}`} data-i={i}>
      <Thumb src={s?.thumbnail} title={title} className="clh-img" />
      <div className="clh-body">
        <div className="clh-ct">{title}</div>
        <div className="clh-cd">{s ? s.description || firstLine(s.extract) : ' '}</div>
        <div className="clh-go">{next ? <>links to <span className="clh-a">{next.toLowerCase()}</span></> : 'target'}</div>
      </div>
    </div>
  );
}

export default function ClicksHero({
  title = 'how many clicks',
  lede = `the wikipedia game, played by a model i trained. pick two articles and watch ${MODEL_NAME} or one of six classic searches click its way between them, live, then try to beat it yourself. below that: how the model works, how every search scores on the same 450 races, and how large language models do.`,
  actions = [],
  chain = CHAIN,
  hid = ID,
  className,
}: {
  title?: string;
  lede?: string;
  actions?: HeroAction[];
  chain?: string[];
  hid?: string;
  className?: string;
}) {
  const o = useOpening(hid);
  const root = useRef<HTMLDivElement>(null);
  const n = chain.length;
  const hops = n - 1;
  const hopAt = (i: number) => HOP0 + i * HOP;
  const land = hopAt(hops - 1) + 200;
  const F2 = on(hid, 'full');
  const Q2 = on(hid, 'quick');

  const CSS = `
${accentCss(ID, 'clh')}
.site-app .clh.site-col>*{max-width:none}
.site-col .clh.site-col{margin-left:0;margin-right:0;max-width:none}
.site-app .clh.site-col>.clh-lede{max-width:640px}
.clh-chain{display:flex;align-items:stretch;max-width:880px}
.clh-card{position:relative;flex:1 1 0;min-width:0;display:flex;flex-direction:column;border:1px solid var(--rule);background:var(--bg);transition:border-color .3s}
.clh-card-end{border-color:var(--acc)}
.clh-img{width:100%;height:auto;aspect-ratio:4/3;border:0;border-bottom:1px solid var(--rule);font-size:28px}
.clh-body{display:flex;flex-direction:column;gap:3px;padding:10px 12px 12px;min-width:0}
.clh-ct{font-size:14px;line-height:18px;font-weight:500;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.clh-cd{font-size:12px;line-height:16px;color:var(--faint);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:32px}
.clh-go{margin-top:6px;padding-top:7px;border-top:1px solid var(--rule);font-size:11px;line-height:14px;color:var(--half);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.clh-a{color:var(--acc);font-weight:500}
.clh-arrow{flex:none;align-self:center;width:${AW}px;height:28px;overflow:visible;color:var(--acc)}
.clh-arrow path{fill:none;stroke:currentColor;stroke-width:1.25}
.clh-arrow circle{stroke:currentColor;stroke-width:1.25}
.clh-head{margin-top:40px}
.clh-t{margin:0;font-size:48px;line-height:1.1;font-weight:300;letter-spacing:-0.035em;color:var(--ink)}
.clh-from{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:10px;font-size:13px;line-height:20px;color:var(--half)}
.clh-from b{font-weight:500;color:var(--acc);font-variant-numeric:tabular-nums}
.clh-lede{margin:18px 0 0;max-width:640px;font-size:18px;line-height:28px;color:var(--text)}
.clh-acts{margin-top:24px}
${ACTIONS_CSS('clh')}
.clh-a[data-wander]{animation:clhWander 1.6s ${EASE} both}
@keyframes clhWander{0%,100%{opacity:1}40%{opacity:.35}}
@keyframes clhCard{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes clhDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes clhLand{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes clhIn{from{opacity:0}to{opacity:1}}
@keyframes clhOut{to{opacity:0}}
@keyframes clhBlip{0%,99.9%{opacity:1}100%{opacity:0}}
@keyframes clhEnd{from{border-color:var(--rule)}to{border-color:var(--acc)}}
${F2} .clh-card[data-i="0"]{animation:clhCard 320ms ${SPRING} both}
${chain.slice(1).map((_, k) => {
    const i = k + 1, t = hopAt(k);
    return `${F2} .clh-card[data-i="${i}"]{animation:clhCard 360ms ${SPRING} ${t + 140}ms both}${F2} .clh-arrow[data-i="${k}"] path{stroke-dasharray:1;animation:clhDraw 240ms ${EASE} ${t}ms both}${F2} .clh-arrow[data-i="${k}"] circle{animation:clhIn 150ms ease ${t - 40}ms both}${F2} .clh-arrow[data-i="${k}"] .clh-n2{animation:clhIn 150ms ease ${t + 220}ms both}${F2} .clh-card[data-i="${k}"] .clh-go{animation:clhIn 200ms ease ${t - 120}ms both}`;
  }).join('')}
${F2} .clh-card-end{animation:clhCard 360ms ${SPRING} ${hopAt(hops - 1) + 140}ms both,clhEnd 400ms ease ${land}ms both}
${F2} .clh-head{animation:clhLand 420ms ${SPRING} ${land}ms both}
${F2} .clh-k[data-k="0"]{opacity:1;animation:clhOut 1ms linear ${hopAt(0) + 140}ms forwards}
${chain.slice(0, hops).map((_, i) => (i === hops - 1 ? `${F2} .clh-k[data-k="${i + 1}"]{animation:clhIn 1ms linear ${hopAt(i) + 140}ms both}` : `${F2} .clh-k[data-k="${i + 1}"]{animation:clhBlip ${HOP}ms linear ${hopAt(i) + 140}ms forwards}`)).join('')}
${Q2} .clh-head{animation:clhLand 300ms ${SPRING} both}
.clh-n{position:relative;display:inline-grid}
.clh-k{grid-area:1/1;opacity:0}
.clh-k:last-child{opacity:1}
${F2} .clh-k:last-child{opacity:0}
@media (max-width:640px){.clh-chain{display:grid;grid-template-columns:minmax(0,1fr) 24px minmax(0,1fr);row-gap:10px}.clh-arrow{width:24px}.clh-arrow[data-i="1"]{display:none}.clh-cd{display:none}.clh-body{padding:8px 9px 9px}.clh-ct{font-size:12px}.clh-t{font-size:38px}.clh-lede{font-size:17px;line-height:26px}.clh-head{margin-top:28px}}
@media (prefers-reduced-motion:reduce){.clh *{animation:none!important}}
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

  const first = chain[0].toLowerCase();
  const end = chain[n - 1].toLowerCase();
  return (
    <div ref={root} className={`site-col pi clh${className ? ` ${className}` : ''}`}>
      <BootScript id={hid} />
      <style>{CSS}</style>
      <div className="clh-chain" aria-label={`a real path: ${chain.join(', then ')}`} role="img">
        {chain.map((t, i) => (
          <Hop key={t} i={i} last={i === n - 1}>
            <Card title={t} i={i} next={chain[i + 1]} last={i === n - 1} />
          </Hop>
        ))}
      </div>
      <div className="clh-head">
        <h1 className="clh-t">{title}</h1>
        <div className="clh-from">
          <span>a real path on today's wikipedia: {first} to {end} in <span className="clh-n"><b className="clh-k" data-k="0">0</b>{Array.from({ length: hops }, (_, k) => <b key={k} className="clh-k" data-k={k + 1}>{k + 1}</b>)}</span> clicks</span>
        </div>
      </div>
      <p className="clh-lede">{lede}</p>
      {actions.length > 0 && <div className="clh-acts"><Actions p="clh" actions={actions} /></div>}
    </div>
  );
}

function Hop({ i, last, children }: { i: number; last: boolean; children: React.ReactNode }) {
  return (
    <>
      {children}
      {!last && (
        <svg className="clh-arrow" data-i={i} viewBox="0 0 44 28" aria-hidden="true">
          <circle cx={5} cy={21} r={2.4} fill="currentColor" />
          <path pathLength={1} d="M7.5 19C12 7 28 4 36 8.5" />
          <circle className="clh-n2" cx={38.5} cy={9.6} r={2.4} fill="none" />
        </svg>
      )}
    </>
  );
}
