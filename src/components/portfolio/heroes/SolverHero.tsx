import { useCallback, useRef } from 'react';
import { Actions, ACTIONS_CSS, BootScript, SPRING, on, useIdle, useOpening, type HeroAction } from './kit';
import { accentCss } from './brand';
import { ProjectLogo } from '../covers/brand';

const ID = 'game-solver-suite';
const START = 220;
const GAP = 70;
const DUR = 1560;
const ORDER = [7, 1, 12, 4, 9, 14, 0, 10, 5, 2, 13, 8, 3, 11, 6];
const WRONG = { at: 5, tile: 5, letter: 'a' };

type Ev = { t: number; tile: number; kind: 'put' | 'bad' | 'undo' };
const EVENTS: Ev[] = (() => {
  const out: Ev[] = [];
  let j = 0;
  ORDER.forEach((tile, k) => {
    if (k === WRONG.at) {
      out.push({ t: START + j++ * GAP, tile: WRONG.tile, kind: 'bad' });
      out.push({ t: START + j++ * GAP + 90, tile: WRONG.tile, kind: 'undo' });
    }
    out.push({ t: START + j++ * GAP + (k >= WRONG.at ? 120 : 0), tile, kind: 'put' });
  });
  return out;
})();
const SOLVED = EVENTS[EVENTS.length - 1].t + 120;

const F = on(ID, 'full');
const Q = on(ID, 'quick');
const pc = (t: number) => `${((t / DUR) * 100).toFixed(2)}%`;

export default function SolverHero({
  title = 'game solver suite',
  lede = 'one chrome extension that solves the linkedin and nyt daily games in real time. ten solvers, a pure algorithm core with its own test suite, and a read layer that repairs itself when the sites change. no ai, no server, just vanilla js.',
  actions = [
    { label: 'get it on github', href: 'https://github.com/ronnielgandhe/game-solver-suite', primary: true, external: true },
    { label: 'how to install', href: '#install' },
  ],
  className,
}: {
  title?: string;
  lede?: string;
  actions?: HeroAction[];
  className?: string;
}) {
  const o = useOpening(ID);
  const board = useRef<HTMLSpanElement>(null);
  const words = title.split(' ');
  const tiles = words.flatMap((w, r) => [...w].map((ch, c) => ({ ch, r, c })));
  const pos = (i: number) => {
    const t = tiles[i] ?? tiles[0];
    return `translate(calc(${t.c} * (var(--s) + var(--g))),calc(${t.r} * (var(--s) + var(--g))))`;
  };
  const evs = EVENTS.filter((e) => e.tile < tiles.length);
  const last = evs[evs.length - 1]?.tile ?? 0;
  const crown = (words[0]?.length ?? 1) - 1;

  const cursorKf = `@keyframes svhCur{0%{opacity:0;transform:${pos(evs[0]?.tile ?? 0)}}${pc(START - 60)}{opacity:1;transform:${pos(evs[0]?.tile ?? 0)}}${evs
    .map((e, i) => {
      const next = evs[i + 1];
      return `${pc(e.t)}{opacity:1;transform:${pos(e.tile)}}${next ? `${pc(next.t - 20)}{opacity:1;transform:${pos(e.tile)}}` : ''}`;
    })
    .join('')}${pc(SOLVED + 200)}{opacity:1;transform:${pos(last)}}100%{opacity:0;transform:${pos(last)}}}`;

  const putAt = (i: number) => evs.find((e) => e.tile === i && e.kind === 'put')?.t ?? START;
  const bad = evs.find((e) => e.kind === 'bad');
  const undo = evs.find((e) => e.kind === 'undo');

  const CSS = `
${accentCss(ID, 'svh')}
.site-app .svh.site-col>*{max-width:none}
.site-col .svh.site-col{margin-left:0;margin-right:0;max-width:none}
.svh{--s:62px;--g:6px;padding-top:30px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:28px 64px;align-items:end}
.svh-h1{margin:0;font-size:inherit;font-weight:inherit;line-height:1}
.svh-board{position:relative;display:flex;flex-direction:column;gap:var(--g)}
.svh-row{display:flex;gap:var(--g)}
.svh-tile{position:relative;display:grid;place-items:center;width:var(--s);height:var(--s);border:1px solid color-mix(in srgb,var(--ink) 22%,transparent);font-size:calc(var(--s) * .52);line-height:1;font-weight:300;letter-spacing:-0.02em;color:var(--ink)}
.svh-tile>span{grid-area:1/1}
.svh-bad{color:#c25a4e;opacity:0}
.site-dark .svh-bad{color:#e08376}
.svh-tile[data-i="${crown}"]{background:var(--acc);border-color:var(--acc);color:#1a1a1a}
.svh-crown{position:absolute;left:calc(${crown} * (var(--s) + var(--g)) + var(--s) * .14);top:calc(var(--s) * -.74);width:calc(var(--s) * .74);height:calc(var(--s) * .74);color:var(--ink);transform:rotate(12deg);transform-origin:50% 100%}
.svh-crown .pl-crown{fill:var(--acc)}
.svh-cur{position:absolute;left:0;top:0;width:var(--s);height:var(--s);box-shadow:inset 0 0 0 2px var(--ink);opacity:0;pointer-events:none}
.svh-tile[data-re] .svh-l{animation:svhRe 1100ms ${SPRING} both}
.svh-tile[data-re]{animation:svhReB 1100ms ease both}
.svh-side{padding-bottom:2px}
.svh-lede{margin:0;max-width:500px;font-size:17px;line-height:27px;color:var(--text)}
.svh-acts{margin-top:24px}
${ACTIONS_CSS('svh')}
${cursorKf}
@keyframes svhPut{0%{opacity:0;transform:translateY(5px) scale(.9)}100%{opacity:1;transform:none}}
@keyframes svhBad{0%{opacity:0;transform:scale(.9)}20%{opacity:1;transform:none}70%{opacity:1;transform:translateX(0)}78%{transform:translateX(-3px)}86%{transform:translateX(3px)}100%{opacity:0;transform:translateX(0)}}
@keyframes svhBorder{from{border-color:color-mix(in srgb,var(--ink) 8%,transparent)}to{border-color:color-mix(in srgb,var(--ink) 22%,transparent)}}
@keyframes svhCrown{0%{opacity:0;transform:translateY(8px) rotate(0) scale(.5)}60%{opacity:1;transform:translateY(-3px) rotate(16deg) scale(1.08)}100%{opacity:1;transform:rotate(12deg)}}
@keyframes svhGold{from{background:transparent;border-color:color-mix(in srgb,var(--ink) 22%,transparent)}to{background:var(--acc);border-color:var(--acc)}}
@keyframes svhSolve{0%{background:transparent}30%{background:color-mix(in srgb,var(--acc) 45%,transparent);border-color:var(--acc)}100%{background:transparent}}
@keyframes svhRe{0%{opacity:1}25%{opacity:0;transform:translateY(-4px)}55%{opacity:0;transform:translateY(5px)}80%,100%{opacity:1;transform:none}}
@keyframes svhReB{0%,100%{box-shadow:none}20%,80%{box-shadow:inset 0 0 0 2px var(--ink)}}
${F} .svh-cur{animation:svhCur ${DUR}ms linear both}
${F} .svh-tile{animation:svhBorder 260ms ease both}
${tiles.map((_, i) => `${F} .svh-tile[data-i="${i}"] .svh-l{animation:svhPut 220ms ${SPRING} ${putAt(i)}ms both}`).join('')}
${bad && undo ? `${F} .svh-bad{animation:svhBad ${undo.t - bad.t + 160}ms ease ${bad.t}ms both}` : ''}
${tiles.map((t, i) => `${F} .svh-tile[data-i="${i}"]{animation:svhBorder 260ms ease both,svhSolve 520ms ease ${SOLVED + t.r * 50 + t.c * 25}ms both}`).join('')}
${F} .svh-crown{animation:svhCrown 480ms ${SPRING} ${SOLVED + 260}ms both}
${F} .svh-tile[data-i="${crown}"]{animation:svhBorder 260ms ease both,svhGold 300ms ease ${SOLVED + 200}ms both}
${Q} .svh-tile{animation:svhSolve 300ms ease both}
${Q} .svh-crown{animation:svhCrown 300ms ${SPRING} both}
${Q} .svh-tile[data-i="${crown}"]{animation:svhGold 300ms ease both}
${Q} .svh-tile[data-i="${last}"] .svh-l{animation:svhPut 300ms ${SPRING} both}
@media (max-width:820px){.svh{grid-template-columns:minmax(0,1fr);align-items:start}}
@media (max-width:560px){.svh{--s:46px;--g:4px}.svh-lede{font-size:16px;line-height:26px}}
@media (prefers-reduced-motion:reduce){.svh *,.svh{animation:none!important}}
`;

  const re = useCallback(() => {
    const el = board.current;
    if (!el) return;
    const all = el.querySelectorAll<HTMLElement>('.svh-tile');
    const t = all[Math.floor(Math.random() * all.length)];
    if (!t) return;
    t.setAttribute('data-re', '');
    window.setTimeout(() => t.removeAttribute('data-re'), 1150);
  }, []);
  useIdle(!!o && o.m !== 'still', 6500, re);

  let k = 0;
  return (
    <div className={`site-col pi svh${className ? ` ${className}` : ''}`}>
      <BootScript id={ID} />
      <style>{CSS}</style>
      <h1 className="svh-h1" aria-label={title}>
        <span className="svh-board" ref={board} aria-hidden="true">
          {words.map((w, r) => (
            <span key={r} className="svh-row">
              {[...w].map((ch) => {
                const i = k++;
                return (
                  <span key={i} className="svh-tile" data-i={i}>
                    <span className="svh-l">{ch}</span>
                    {i === WRONG.tile && <span className="svh-bad">{WRONG.letter}</span>}
                  </span>
                );
              })}
            </span>
          ))}
          <span className="svh-cur" />
          <ProjectLogo id="game-solver-suite" className="svh-crown" />
        </span>
      </h1>
      <div className="svh-side">
        <p className="svh-lede">{lede}</p>
        <div className="svh-acts"><Actions p="svh" actions={actions} /></div>
      </div>
    </div>
  );
}
