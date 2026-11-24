import { useEffect, useState } from 'react';
import { DifficultySwitch, Leaderboard, LossChart, ModelFacts, Tradeoff } from './charts';
import { LlmTable, MoneyChart } from './llm';
import Diagrams from './Diagrams';
import RaceLab from './RaceLab';
import { ALL, BENCH, CODE, LLM, MODEL_NAME } from './data.ts';
import { pct } from './motion.ts';

import { OPEN_ROW } from './openRow';

const IDS = ['race', 'model', 'leaderboard', 'llms', 'how'];
const num = (n: number) => n.toLocaleString('en-US');

function Row({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <section id={id} className="rows-item" data-open={open ? '' : undefined}>
      <h2 className="rows-h">
        <button type="button" className="rows-btn" aria-expanded={open} aria-controls={`${id}-panel`} onClick={onToggle}>
          <span>{title}</span>
          <i className="rows-mark" aria-hidden="true" />
        </button>
      </h2>
      {open && <div id={`${id}-panel`} className="rows-body">{children}</div>}
    </section>
  );
}

function Model() {
  const m = BENCH?.model;
  const d = BENCH?.dataset as (NonNullable<typeof BENCH>['dataset'] & { humanPaths?: number }) | undefined;
  if (!m || !d) return null;
  const mx = m as typeof m & { humanClicks?: { train: number } };
  return (
    <>
      <p className="rows-p">
        a small model that answers one question: standing on this link, how many clicks away is the target? it learned on <a href={d.url} target="_blank" rel="noopener noreferrer">wikispeedia</a>, a frozen {num(d.articles)}-article slice of wikipedia with the true shortest path between every pair{mx.humanClicks ? `, then ${num(mx.humanClicks.train)} real player clicks` : ''}. test races only use articles it never saw. trained with numpy on a laptop, no gpu.
      </p>
      <ModelFacts model={m} />
      <LossChart model={m} />
    </>
  );
}

function Races({ diff, setDiff }: { diff: string; setDiff: (d: string) => void }) {
  if (!BENCH) return null;
  const solo = BENCH.strategies.find((s) => s.id === 'model');
  const wide = BENCH.strategies.find((s) => s.id === 'god');
  return (
    <>
      <p className="rows-p">
        {BENCH.dataset.pairs} held-out races, the same for every search.
        {solo && wide ? ` ${MODEL_NAME}'s model playing alone, with no backward search, solves ${pct(solo.overall.success)} of them against ${pct(wide.overall.success)} for a wide keyword beam.` : ''} the bottom left of the second chart is where you want to be.
      </p>
      <div className="lab-bar-row"><DifficultySwitch bench={BENCH} value={diff} onChange={setDiff} /></div>
      <Leaderboard bench={BENCH} diff={diff} />
      <div className="rows-gap" />
      <Tradeoff bench={BENCH} diff={diff} />
    </>
  );
}

function Llms({ diff, setDiff }: { diff: string; setDiff: (d: string) => void }) {
  if (!LLM) return null;
  const fa = LLM.failureAnalysis as { failed: number; failuresByReason: { step_limit: number }; failuresWithARevisit: number } | undefined;
  const top = LLM.models.filter((m) => m.overall.success >= 0.92).map((m) => m.overall.success);
  const lo = Math.round(Math.min(...top) * 100), hi = Math.round(Math.max(...top) * 100);
  return (
    <>
      <p className="rows-p">
        {LLM.models.length} language models, {LLM.protocol.pairs} races, link titles only, up to {LLM.protocol.maxSteps} clicks each. {top.length} of them finish {lo} to {hi}%.
        {fa ? ` ${fa.failed} games failed and ${Math.round(fa.failuresWithARevisit * 100)}% of those revisited a page they had already been on: they mostly loop.` : ''}
      </p>
      {BENCH && <div className="lab-bar-row"><DifficultySwitch bench={BENCH} value={diff} onChange={setDiff} /></div>}
      <MoneyChart llm={LLM} diff={diff} />
      <LlmTable llm={LLM} diff={diff} />
    </>
  );
}

export default function Rows() {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [diff, setDiff] = useState(ALL);

  useEffect(() => {
    const show = (id: string | null | undefined, scroll: boolean) => {
      if (!id || !IDS.includes(id)) return;
      setOpen((s) => new Set(s).add(id));
      if (scroll) window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    };
    const q = new URLSearchParams(location.search);
    if (q.has('race') || q.has('a') || q.has('b')) show('race', false);
    show(location.hash.slice(1), true);
    const onHash = () => show(location.hash.slice(1), true);
    const onOpen = (e: Event) => show((e as CustomEvent<string>).detail, true);
    window.addEventListener('hashchange', onHash);
    window.addEventListener(OPEN_ROW, onOpen);
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener(OPEN_ROW, onOpen); };
  }, []);

  const flip = (id: string) => () => setOpen((s) => { const n = new Set(s); if (!n.delete(id)) n.add(id); return n; });
  const row = (id: string, title: string, body: React.ReactNode) => (
    <Row key={id} id={id} title={title} open={open.has(id)} onToggle={flip(id)}>{body}</Row>
  );

  return (
    <div className="rows">
      {row('race', 'race two searches side by side', <RaceLab />)}
      {BENCH?.model && row('model', `how ${MODEL_NAME} was trained`, <Model />)}
      {BENCH && row('leaderboard', `every search on the same ${BENCH.dataset.pairs} races`, <Races diff={diff} setDiff={setDiff} />)}
      {LLM && row('llms', 'how llms did', <Llms diff={diff} setDiff={setDiff} />)}
      {row('how', 'how each search works', <Diagrams />)}
    </div>
  );
}

export function Breakdown() {
  const pairs = BENCH?.dataset.pairs ?? 450;
  const hop = BENCH?.strategies.find((s) => s.id === 'guided');
  const pages = hop ? hop.overall.pagesOpenedMean.toFixed(1) : '4.6';
  return (
    <div className="bd">
      <p className="bd-p">
        {MODEL_NAME} is a*-style search where the distance estimate is a small model i trained. it searches from both ends, the start forward and the target backward through what links here. it finished all {pairs} benchmark races, opening {pages} pages on average. a shortest-path search (dijkstra, bfs) still wins on fewest clicks, it just has to open thousands of pages to get there. everything runs in your browser.
      </p>
      <a className="bd-link" href={CODE.page} target="_blank" rel="noopener noreferrer">read the code</a>
    </div>
  );
}

export const ROWS_CSS = `
.bd { margin-top: 72px; padding-top: 20px; border-top: 1px solid var(--rule); max-width: 640px; }
.bd-p { margin: 0; font-size: 15px; line-height: 24px; color: var(--text); }
.bd-link { display: inline-block; margin-top: 12px; font-size: 13px; line-height: 20px; color: var(--ink); text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 3px; text-decoration-thickness: 1px; }
.bd-link:hover { text-decoration-color: var(--ink); }
.rows { margin-top: 56px; border-top: 1px solid var(--rule); }
.rows-item { border-bottom: 1px solid var(--rule); scroll-margin-top: 80px; }
.rows-h { margin: 0; font-size: inherit; font-weight: inherit; }
.rows-btn { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; padding: 18px 0; text-align: left; font-size: 15px; line-height: 22px; font-weight: 500; color: var(--ink); cursor: pointer; }
.rows-btn:hover .rows-mark { opacity: 1; }
.rows-mark { position: relative; flex: none; width: 11px; height: 11px; opacity: 0.55; transition: opacity 0.2s; }
.rows-mark::before, .rows-mark::after { content: ''; position: absolute; background: var(--ink); transition: transform 0.25s var(--ease); }
.rows-mark::before { left: 0; right: 0; top: 5px; height: 1px; }
.rows-mark::after { top: 0; bottom: 0; left: 5px; width: 1px; }
.rows-item[data-open] .rows-mark::after { transform: scaleY(0); }
.rows-body { padding: 4px 0 40px; animation: rowsIn 0.3s var(--ease) both; }
.rows-p { margin: 0 0 24px; max-width: 640px; font-size: 15px; line-height: 24px; color: var(--text); }
.rows-p a { color: var(--ink); text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 3px; text-decoration-thickness: 1px; }
.rows-gap { height: 48px; }
.rows .lab-facts { margin-bottom: 24px; }
@keyframes rowsIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .rows-body { animation: none; } }
`;
