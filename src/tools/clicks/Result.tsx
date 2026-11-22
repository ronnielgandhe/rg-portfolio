import { useState } from 'react';
import type { RaceState } from './raceState';
import { Arrow, OutIcon, Thumb, fmtSeconds, useSummary } from './ui';
import { LAB_HREF } from './Start';

function PathCard({ title, label }: { title: string; label: string }) {
  const s = useSummary(title);
  return (
    <a className="clk-pcard" href={s?.url} target="_blank" rel="noopener noreferrer">
      <Thumb src={s?.thumbnail} title={title} className="clk-pcard-img" />
      <span className="clk-pcard-body">
        <span className="clk-pcard-label">{label}</span>
        <span className="clk-pcard-title">{title}</span>
        <span className="clk-pcard-desc">{s ? s.description || s.extract.split('. ')[0] || 'wikipedia article' : ' '}</span>
        <span className="clk-out">wikipedia <OutIcon /></span>
      </span>
    </a>
  );
}

export function PathRow({ path }: { path: string[] }) {
  return (
    <div className="clk-path">
      {path.map((t, i) => (
        <div key={`${i}-${t}`} className="clk-path-step clk-in" style={{ animationDelay: `${i * 70}ms` }}>
          {i > 0 && <span className="clk-path-line" aria-hidden="true" />}
          <PathCard title={t} label={i === 0 ? 'start' : i === path.length - 1 ? 'target' : `click ${i}`} />
        </div>
      ))}
    </div>
  );
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

function verdict(race: RaceState) {
  const n = (race.path?.length ?? 1) - 1;
  const total = race.explored;
  const nw = WORDS[n] ?? String(n);
  if (n === 0) return 'same article. zero clicks, nothing to see here.';
  const pages = `${total} page${total === 1 ? '' : 's'} opened along the way`;
  const dead = race.deadEnds ? `, ${race.deadEnds} dead end${race.deadEnds === 1 ? '' : 's'}` : ', no dead ends';
  const vibe = n <= 2 ? 'almost too easy.' : n <= 4 ? 'a nice short walk.' : n <= 6 ? 'it took the scenic route.' : 'a long way round.';
  return `${nw} click${n === 1 ? '' : 's'}, ${pages}${dead}. ${vibe}`;
}

export default function Result({ race, onPlay, onNew, retry }: { race: RaceState; onPlay: () => void; onNew: () => void; retry: { label: string; run: () => void } | null }) {
  const [copied, setCopied] = useState(false);
  const elapsed = race.finishedAt ? (race.finishedAt - race.startedAt) / 1000 : 0;
  const found = race.outcome === 'found' && race.path;

  const copy = async () => {
    try { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };

  return (
    <div className="clk-view">
      <div className="clk-head">
        <div className="clk-kicker">{found ? 'found it' : race.outcome === 'error' ? 'that did not work' : 'no luck this time'}</div>
        <h1 className="clk-title clk-title-pair">{race.start} <Arrow size={26} /> {race.target}</h1>
        <p className="clk-lede">
          {found ? verdict(race)
            : race.outcome === 'error' ? race.error
            : `it opened ${race.explored} pages and never landed on ${race.target}. these two live far apart, or it took a wrong turn early.`}
        </p>
      </div>

      <p className="clk-strategy-line"><span className="clk-label">strategy</span> {race.strategy.name}{race.strategy.blurb ? `: ${race.strategy.blurb}` : ''}</p>

      {race.outcome !== 'error' && (
        <div className="clk-big">
          <div className="clk-big-cell">
            <span className="clk-big-num">{found ? race.path!.length - 1 : '×'}</span>
            <span className="clk-label">prime clicks</span>
            <span className="clk-big-sub">length of the path it found</span>
          </div>
          <div className="clk-big-cell">
            <span className="clk-big-num">{race.explored}</span>
            <span className="clk-label">total clicks</span>
            <span className="clk-big-sub">every page it opened</span>
          </div>
          <div className="clk-big-cell clk-big-minor">
            <span className="clk-big-num">{fmtSeconds(elapsed)}</span>
            <span className="clk-label">time</span>
            <span className="clk-big-sub">{race.strategy.name}</span>
          </div>
        </div>
      )}

      {found && (
        <section className="clk-section">
          <div className="clk-label">the path</div>
          <PathRow path={race.path!} />
        </section>
      )}

      <div className="clk-actions">
        {found && race.path!.length > 1 && <button type="button" className="st-btn st-btn-primary" onClick={onPlay}>play it yourself</button>}
        {!found && race.outcome === 'not_found' && retry && <button type="button" className="st-btn st-btn-primary" onClick={retry.run}>{retry.label}</button>}
        <button type="button" className="st-btn" onClick={onNew}>new pair</button>
        {race.outcome !== 'error' && <button type="button" className="st-btn" onClick={copy}>{copied ? 'link copied' : 'copy link'}</button>}
        <span className="clk-grow" />
        <a className="clk-quiet clk-actions-quiet" href={LAB_HREF}>how the strategies compare</a>
      </div>
    </div>
  );
}
