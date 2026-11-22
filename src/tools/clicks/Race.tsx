import { useEffect, useRef, useState } from 'react';
import type { RaceState } from './raceState';
import { Arrow, OutIcon, PageChip, Thumb, fmtSeconds, useElapsed, useSummary } from './ui';
import type { Summary } from './wiki';

export type Speed = 'watch' | 'quick' | 'instant';
export const PACE: Record<Speed, number> = { watch: 1, quick: 0.3, instant: 0 };

function ArticleCard({ title, depth, side }: { title: string; depth: number; side?: 'forward' | 'backward' }) {
  const fresh = useSummary(title);
  const [shown, setShown] = useState<Summary | null>(fresh);
  useEffect(() => { if (fresh) setShown(fresh); }, [fresh]);
  const s = shown;
  const label = s?.title ?? title;
  return (
    <article className="clk-article">
      <div className="clk-article-top">
        <span className="clk-label">now reading{side === 'backward' ? ', from the target end' : side === 'forward' ? ', from the start' : ''}</span>
        <span className="clk-article-depth">depth {depth}</span>
      </div>
      <div className="clk-article-body clk-fade" key={label}>
        <Thumb src={s?.thumbnail} title={label} className="clk-article-img" />
        <div className="clk-article-text">
          <h2 className="clk-article-title">{label}</h2>
          <div className="clk-article-desc">{s ? s.description || 'wikipedia article' : '\u00a0'}</div>
          <p className="clk-article-extract">{s?.extract || '\u00a0'}</p>
          <a className="clk-out" href={s?.url} target="_blank" rel="noopener noreferrer">read on wikipedia <OutIcon /></a>
        </div>
      </div>
    </article>
  );
}

function Ticks({ n }: { n: number }) {
  if (n === 0) return <span className="clk-stat-num">0</span>;
  return (
    <span className="clk-stat-num clk-ticks" aria-label={`${n} dead ends`}>
      {n <= 12 ? Array.from({ length: n }, (_, i) => <i key={i} />) : n}
    </span>
  );
}

export default function Race({ race, speed, onSpeed, onStop }: { race: RaceState; speed: Speed; onSpeed: (s: Speed) => void; onStop: () => void }) {
  const elapsed = useElapsed(race.startedAt, race.finishedAt);
  const trailRef = useRef<HTMLDivElement>(null);
  const bi = race.backChain.length > 0;
  const depth = Math.max(0, (race.side === 'backward' ? race.backChain.length : race.chain.length) - 1);
  const top = race.ranked.length ? Math.max(1, race.ranked[0].score) : 1;
  const selected = new Set(race.selected);
  const running = race.outcome === 'running';
  const stale = race.rankedFor !== race.current;
  const ghost = race.chosen && running ? (
    <div key={`${race.side === 'backward' ? 'b' : 'f'}-${race.chosen}`} className="clk-trail-step clk-in">
      {race.side === 'forward' && <span className="clk-link-line clk-link-line-dash" />}
      <PageChip title={race.chosen} label="best lead" state="clk-chip-ghost" />
      {race.side === 'backward' && <span className="clk-link-line clk-link-line-dash" />}
    </div>
  ) : null;
  const back = [...race.backChain].reverse();

  useEffect(() => {
    const el = trailRef.current;
    if (!el) return;
    if (!bi) { el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' }); return; }
    const cur = el.querySelector<HTMLElement>(race.side === 'backward' ? '.clk-trail-back .clk-chip-current' : '.clk-trail-fwd .clk-chip-current');
    if (!cur) return;
    const box = el.getBoundingClientRect();
    const c = cur.getBoundingClientRect();
    if (c.left < box.left || c.right > box.right) el.scrollTo({ left: el.scrollLeft + c.left - box.left - 24, behavior: 'smooth' });
  }, [race.chain.length, race.backChain.length, race.chosen, race.side, bi]);

  return (
    <div className="clk-view">
      <div className="clk-head">
        <div className="clk-kicker">the race, {race.strategy.name}</div>
        <h1 className="clk-title clk-title-pair">{race.start} <Arrow size={26} /> {race.target}</h1>
        {race.strategy.blurb && <p className="clk-blurb">{race.strategy.blurb}</p>}
        <p className="clk-status" aria-live="polite">{race.status}</p>
      </div>

      <div className="clk-bar">
        <div className="clk-stats">
          <div className="clk-stat"><span className="clk-stat-num">{race.explored}</span><span className="clk-label">pages opened</span></div>
          <div className="clk-stat"><span className="clk-stat-num">{bi ? `${race.chain.length - 1} + ${race.backChain.length - 1}` : depth}</span><span className="clk-label">depth</span></div>
          <div className="clk-stat"><span className="clk-stat-num">{fmtSeconds(elapsed)}</span><span className="clk-label">elapsed</span></div>
          <div className="clk-stat"><Ticks n={race.deadEnds} /><span className="clk-label">dead ends</span></div>
        </div>
        <div className="clk-controls">
          <div className="clk-seg" role="radiogroup" aria-label="speed">
            {(['watch', 'quick', 'instant'] as Speed[]).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={speed === s} className={speed === s ? 'clk-seg-on' : ''} onClick={() => onSpeed(s)}>{s}</button>
            ))}
          </div>
          <button type="button" className="st-btn" onClick={onStop}>stop</button>
        </div>
      </div>

      <div className={`clk-trail${bi ? ' clk-trail-bi' : ''}`} ref={trailRef}>
        <div className="clk-trail-fwd">
          {race.chain.map((t, i) => (
            <div key={`f-${t}`} className="clk-trail-step clk-in">
              {i > 0 && <span className="clk-link-line" />}
              <PageChip title={t} label={i === 0 ? 'start' : race.outcome === 'found' && i === race.chain.length - 1 ? 'target' : `click ${i}`} state={i === race.chain.length - 1 && (race.side === 'forward' || !running) ? 'clk-chip-current' : ''} />
            </div>
          ))}
          {race.side === 'forward' && ghost}
        </div>
        {running && <span className="clk-trail-gap" aria-hidden="true" />}
        {running && (
          <div className="clk-trail-back">
            {race.side === 'backward' && ghost}
            {bi ? back.map((t, i) => {
              const n = back.length - 1 - i;
              return (
                <div key={`b-${t}`} className="clk-trail-step clk-in">
                  <PageChip title={t} label={n === 0 ? 'target' : `${n} from target`} state={n === back.length - 1 && race.side === 'backward' ? 'clk-chip-current' : n === 0 ? 'clk-chip-target' : ''} />
                  {i < back.length - 1 && <span className="clk-link-line" />}
                </div>
              );
            }) : <PageChip title={race.target} label="target" state="clk-chip-target" />}
          </div>
        )}
      </div>
      <div className="clk-backtrack" aria-live="polite">{race.backTo && <span key={race.backTo.n} className="clk-flash">dead end {race.backTo.n}: went back to {race.backTo.title} for a better lead</span>}</div>

      <div className="clk-race-grid">
        {race.current ? <ArticleCard title={race.current} depth={depth} side={bi ? race.side : undefined} /> : (
          <article className="clk-article clk-article-wait"><span className="clk-label">finding the start page</span></article>
        )}

        <section className="clk-links">
          <div className="clk-links-head">
            <span className="clk-label">links it is weighing</span>
            <span className="clk-links-count">{race.linkCount === null ? 'reading' : `${race.linkCount.toLocaleString()} on this page`}</span>
          </div>
          {race.outcome === 'found' && race.path && race.path.length > 1 && (
            <div className="clk-links-found clk-in">
              <span className="clk-big-num">{race.path.length - 1}</span>
              <p className="site-p">{race.target} was linked right there on {race.path[race.path.length - 2]}. {race.path.length - 1} clicks, {race.explored} pages opened.</p>
            </div>
          )}
          {race.stuck && <div className="clk-links-note">nothing scored well, so it is leaning on general pages</div>}
          <ol className={stale ? 'clk-rank clk-rank-stale' : 'clk-rank'}>
            {race.ranked.map((r, i) => {
              const cls = [
                'clk-rank-row',
                selected.has(r.title) || stale ? '' : 'clk-rank-out',
                !stale && race.considering === i ? 'clk-rank-look' : '',
                !stale && race.chosen === r.title ? 'clk-rank-chosen' : '',
                r.title === race.target ? 'clk-rank-target' : '',
              ].join(' ');
              return (
                <li key={r.title} className={cls} style={{ animationDelay: `${Math.min(i, 14) * 14}ms` }}>
                  <span className="clk-rank-i">{i + 1}</span>
                  <span className="clk-rank-title">{r.title}</span>
                  <span className="clk-rank-bar"><i style={{ width: `${Math.max(2, Math.min(100, (Math.max(0, r.score) / top) * 100))}%` }} /></span>
                  <span className="clk-rank-score">{r.score}</span>
                </li>
              );
            })}
            {race.ranked.length === 0 && running && Array.from({ length: 8 }, (_, i) => (
              <li key={`ph-${i}`} className="clk-rank-row clk-rank-ph"><span className="clk-rank-i">{i + 1}</span><span className="clk-rank-title" /></li>
            ))}
          </ol>
          {race.outcome !== 'found' && <p className="clk-small">score = word overlap with {race.target}, related terms and hub bonuses, minus a penalty for staying in the same cluster. the faded rows did not make the cut.</p>}
        </section>
      </div>
    </div>
  );
}
