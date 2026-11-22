import { useEffect, useMemo, useRef, useState } from 'react';
import PageShell from '../../../components/portfolio/PageShell';
import WsbHero from '../../../components/portfolio/heroes/WsbHero';
import type { PortfolioConfig, Version } from '../engine/index.ts';
import { runPortfolio } from '../engine/backtest.ts';
import { status as statusOf, trackPlay } from '../engine/play.ts';
import type { Idea } from '../ideas.ts';
import { loadFor, loadPrices, runConfig, type DataBag, type Run } from './data.ts';
import { niceDate, num, pct, usd, years } from './format.ts';
import LineChart, { type ChartLine } from './LineChart.tsx';
import BoardSlot from './BoardSlot.tsx';
import Tune from './Tune.tsx';
import { QZ_CSS, WSB_CSS } from './styles.ts';

const DAY = 86400000;
const shift = (d: string, days: number) => new Date(Date.parse(d + 'T00:00:00Z') + days * DAY).toISOString().slice(0, 10);

function flag(name: string): boolean {
  try {
    return new URLSearchParams(window.location.search).get(name) === '1';
  } catch {
    return false;
  }
}

interface Since {
  dates: string[];
  values: number[];
  bench: number[];
  before: { dates: string[]; values: number[] };
  ret: number;
  days: number;
}

function rebase(_dates: string[], values: number[], at: number) {
  const k = values[at] || 1;
  return values.map((v) => (v / k) * 1000);
}

async function track(idea: Idea): Promise<Since> {
  const latest = idea.versions[idea.versions.length - 1];
  if (latest && latest.config.kind === 'portfolio') {
    const cfg = latest.config as PortfolioConfig;
    const bag = await loadFor([cfg, { ...cfg, start: shift(idea.date, -150) }]);
    const prior = runPortfolio({ ...cfg, synthetic: false, start: shift(idea.date, -100), end: idea.date }, bag.prices);
    const before = { dates: prior.dates, values: rebase(prior.dates, prior.equity, prior.equity.length - 1) };
    try {
      const r = runPortfolio({ ...cfg, synthetic: false, start: shift(idea.date, 1) }, bag.prices);
      const v = [1000, ...r.equity.map((x) => (x / cfg.initial) * 1000)];
      const b = [1000, ...r.benchmark.map((x) => (x / r.benchmark[0]) * 1000)];
      return { dates: [idea.date, ...r.dates], values: v, bench: b, before, ret: v[v.length - 1] / 1000 - 1, days: r.dates.length };
    } catch {
      return { dates: [], values: [], bench: [], before, ret: 0, days: 0 };
    }
  }
  const syms = [...idea.play.map((l) => l.symbol), idea.benchmark];
  const prices = await loadPrices(syms);
  const t = trackPlay(idea.play, idea.benchmark, prices, idea.date);
  const ret = t.values.length ? t.values[t.values.length - 1] / 1000 - 1 : 0;
  return { dates: t.dates, values: t.values, bench: t.bench, before: t.before, ret, days: Math.max(0, t.dates.length - 1) };
}

const BENCH: Record<string, string> = { SPY: 's&p 500', QQQ: 'nasdaq 100' };
const benchWord = (s: string) => BENCH[s] ?? s.toLowerCase();

const STATUS_CLASS = { working: 'wsb-working', 'not yet': 'wsb-notyet', wrong: 'wsb-wrong' } as const;

function StatusTag({ since }: { since: Since | null }) {
  if (!since) return null;
  const s = statusOf(since.ret, since.days);
  return (
    <span className={`wsb-status ${STATUS_CLASS[s]}`} title="working: up more than 2% since i wrote it. wrong: down more than 10%. otherwise: not yet.">
      <i />
      {s}
    </span>
  );
}

function Ticker({ text }: { text: string }) {
  const parts = text.split(/\(([A-Z]{2,5})\)/);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <span key={i} className="wsb-tk">{p}</span> : <span key={i}>{p}</span>))}
    </>
  );
}

function Sections({ idea, className }: { idea: Idea; className?: string }) {
  return (
    <div className={className}>
      {idea.sections.map((s) => (
        <div key={s.heading} className={`wsb-sec ${s.heading.startsWith('how') ? 'wsb-sec-play' : ''}`}>
          <h3>{s.heading}</h3>
          {s.body.split(/\n\s*\n/).map((para, i) => (
            <p key={i} style={i ? { marginTop: 10 } : undefined}>
              <Ticker text={para.replace(/\n/g, ' ')} />
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function SinceChart({ idea, since, height, showBench }: { idea: Idea; since: Since | null; height: number; showBench?: boolean }) {
  if (!since) return <div className="qz-skel" style={{ height: height + 110 }} />;
  const up = since.ret >= 0;
  const lines: ChartLine[] = [{ key: 'before', label: 'the 3 months before i wrote it', dates: since.before.dates, values: since.before.values, tone: 'grey' }];
  if (showBench && since.dates.length) lines.push({ key: 'bench', label: `just holding the ${benchWord(idea.benchmark)}`, dates: since.dates, values: since.bench, tone: 'bench' });
  if (since.dates.length) lines.push({ key: 'since', label: 'since i wrote it', dates: since.dates, values: since.values, tone: up ? 'up' : 'down' });
  const has = since.dates.length > 1;
  return (
    <div>
      {!has && (
        <div className="qz-hero">
          <div className="qz-label">$1,000 on this idea</div>
          <div className="wsb-empty-num">$1,000</div>
          <div className="qz-hero-sub">
            <span className="qz-muted">no prices since i wrote it yet. tracking starts at the next market open after {niceDate(idea.date)}.</span>
          </div>
        </div>
      )}
      <LineChart
        lines={lines}
        focus={has ? 'since' : 'none'}
        hero={has}
        heroLabel="$1,000 on this idea"
        startWord="since i wrote it"
        height={height}
        strip={false}
        markers={[{ date: idea.date, label: 'written' }]}
        legend
        ariaLabel={`what $1,000 in this idea did since ${niceDate(idea.date)}`}
      />
      <p className="wsb-cap">
        {has
          ? `colored line: $1,000 put into the play on the first market open after i wrote it, fees included. grey: the 3 months before, for context.${showBench ? ` dashed: the same $1,000 just sitting in the ${benchWord(idea.benchmark)}.` : ''}`
          : 'grey: what the play did over the 3 months before i wrote it, scaled to $1,000. the colored line starts once there are prices after the date.'}
      </p>
    </div>
  );
}

function useSince(idea: Idea) {
  const [since, setSince] = useState<Since | null>(null);
  useEffect(() => {
    track(idea)
      .then(setSince)
      .catch(() => setSince({ dates: [], values: [], bench: [], before: { dates: [], values: [] }, ret: 0, days: 0 }));
  }, [idea]);
  return since;
}

function IdeaCard({ idea }: { idea: Idea }) {
  const since = useSince(idea);
  return (
    <article className="wsb-idea qz-enter">
      <div>
        <div className="wsb-top">
          <span>{niceDate(idea.date)}</span>
          <StatusTag since={since} />
          {idea.draft && <span className="wsb-draft">draft</span>}
        </div>
        <h3 className="wsb-title">
          <a href={`/wallstreetbets/${idea.slug}`}>{idea.title}</a>
        </h3>
        <Sections idea={idea} />
        <a className="wsb-open" href={`/wallstreetbets/${idea.slug}`}>
          open this idea{idea.versions.length ? ' and how it changed' : ''}
        </a>
      </div>
      <div style={{ minWidth: 0 }}>
        <SinceChart idea={idea} since={since} height={220} />
      </div>
    </article>
  );
}

export function WsbPage({ ideas }: { ideas: Idea[] }) {
  const [drafts, setDrafts] = useState(false);
  useEffect(() => setDrafts(flag('draft')), []);
  const shown = ideas.filter((i) => !i.draft || drafts || i.slug === 'triple-leverage-basket');
  return (
    <PageShell activePage="projects" crumb="wallstreetbets" wide>
      <div className="site-col qz">
        <WsbHero />
        <section className="qz-section qz-full qz-enter" style={{ animationDelay: '80ms' }} aria-label="what's going on">
          <BoardSlot />
        </section>
        <section className="qz-section qz-full qz-enter" style={{ animationDelay: '160ms' }}>
          <div className="qz-section-head">
            <h2 className="qz-h2">ideas</h2>
            <p className="qz-fine">newest first. each one is scored from the day i wrote it, on real prices.</p>
          </div>
          <div className="wsb-ideas">
            {shown.map((i) => (
              <IdeaCard key={i.slug} idea={i} />
            ))}
          </div>
        </section>
        <p className="wsb-foot qz-full">my own notebook. not affiliated with the subreddit, not advice.</p>
      </div>
      <style>{QZ_CSS + WSB_CSS}</style>
    </PageShell>
  );
}

function plainRows(run: Run, v: Version) {
  const m = run.metrics;
  const b = run.bench;
  return [
    { k: '$10k became', v: usd(m.final), why: `${niceDate(m.start)} to ${niceDate(m.end)}` },
    { k: 'per year', v: pct(m.cagr), why: 'the steady yearly growth that gets you there' },
    { k: 'the worst it got', v: `down ${pct(-m.maxDrawdown, 0)}`, why: `from its best day (${niceDate(m.ddPeakDate)}) to its worst (${niceDate(m.ddTroughDate)})`, loss: true },
    { k: 'biggest loss in dollars', v: `-${usd(m.maxDrawdownDollars)}`, why: `${usd(m.dollarPeak)} at the top, ${usd(m.dollarPeak - m.maxDrawdownDollars)} at the bottom`, loss: true },
    { k: 'worst year', v: pct(m.worstYear?.ret ?? 0), why: `calendar ${m.worstYear?.year ?? ''}`, loss: (m.worstYear?.ret ?? 0) < 0 },
    { k: `just holding the ${benchWord((v.config as PortfolioConfig).benchmark)}`, v: usd(b.final), why: `${pct(b.cagr)} a year, worst it got: down ${pct(-b.maxDrawdown, 0)}` },
  ];
}

function MoreNumbers({ run }: { run: Run }) {
  const m = run.metrics;
  const rows = [
    ['compound annual growth (cagr)', pct(m.cagr, 2)],
    ['max drawdown (worst fall from a high)', pct(m.maxDrawdown, 2)],
    ['sharpe (return per unit of bumpiness)', num(m.sharpe)],
    ['volatility (how bumpy, per year)', pct(m.vol)],
    ['longest stretch below a high', years(m.longestUnderwaterDays)],
    ['trading costs paid on $10k', usd(run.result.costs)],
    ['2020 onward, per year', run.oos ? pct(run.oos.m.cagr) : '-'],
    ['2020 onward, worst fall', run.oos ? pct(run.oos.m.maxDrawdown) : '-'],
    ['times it switched in or out', String(Math.max(0, run.result.events.length - 1))],
  ];
  return (
    <details className="wsb-more">
      <summary>more numbers</summary>
      <div className="wsb-more-grid">
        {rows.map(([k, v]) => (
          <div key={k} className="qz-stat">
            <span className="qz-stat-k">{k}</span>
            <span className="qz-stat-v">{v}</span>
          </div>
        ))}
      </div>
      <p className="qz-fine" style={{ paddingBottom: 16 }}>signals use the previous day's close and trades fill at the next open. every trade pays 0.05%. cash earns the t-bill rate. before march 2010 the funds didn't exist, so those years use a rebuilt version from the index (3x its daily move minus fees and borrowing), shaded on the chart.</p>
    </details>
  );
}

function History({ idea, bag }: { idea: Idea; bag: DataBag }) {
  const versions = idea.versions;
  const runs = useMemo(() => versions.map((v) => runConfig(v.config, bag)), [versions, bag]);
  const [sel, setSel] = useState(versions.length - 1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(0);
  useEffect(() => {
    if (!playing) return;
    timer.current = window.setTimeout(() => (sel >= versions.length - 1 ? setPlaying(false) : setSel(sel + 1)), 1500);
    return () => clearTimeout(timer.current);
  }, [playing, sel, versions.length]);
  const v = versions[sel];
  const run = runs[sel];
  const lines: ChartLine[] = [];
  for (let i = 0; i < sel; i++) lines.push({ key: `g${i}`, label: versions[i].id, dates: runs[i].result.dates, values: runs[i].result.equity, tone: 'ghost' });
  lines.push({ key: 'bench', label: `just holding the ${benchWord((v.config as PortfolioConfig).benchmark)}`, dates: run.result.dates, values: run.result.benchmark, tone: 'bench' });
  const up = run.metrics.final >= run.bench.final;
  lines.push({ key: 'main', label: v.id, dates: run.result.dates, values: run.result.equity, tone: up ? 'up' : 'down' });
  return (
    <section className="qz-section qz-full">
      <div className="qz-section-head">
        <h2 className="qz-h2">i changed my mind</h2>
        <p className="qz-fine">before writing it down i tested versions of this on old prices. that's hindsight, not a track record. press play to watch it go from bad to less bad.</p>
      </div>
      <div className="qz-top" style={{ marginTop: 0 }}>
        <div style={{ minWidth: 0 }}>
          <LineChart lines={lines} focus="main" log hero heroLabel="what $10k would have turned into" startWord="since the start" height={340} synthUntil={run.result.syntheticUntil} legend ariaLabel={`backtest of ${v.id}. arrow keys move through time.`} />
          <p className="wsb-cap">colored line: this version, green when it's ahead of the index, red when it's behind. dashed: just holding the index. faint lines: earlier versions. red strip: how far below its best day it was. the scale is stretched so a double looks the same size in 2005 and 2025.</p>
          <div className="qz-scrub">
            <div className="qz-scrub-row">
              <button className="qz-btn qz-play" onClick={() => { if (playing) setPlaying(false); else { setSel(0); setPlaying(true); } }} aria-label={playing ? 'pause' : 'play every version'}>
                {playing ? <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="3" height="8" fill="currentColor" /><rect x="6" y="1" width="3" height="8" fill="currentColor" /></svg> : <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1 L9 5 L2 9 Z" fill="currentColor" /></svg>}
              </button>
              <div className="qz-steps" role="tablist" aria-label="versions">
                {versions.map((x, i) => (
                  <button key={x.id} role="tab" aria-selected={i === sel} className={i === sel ? 'qz-step qz-step-on' : 'qz-step'} onClick={() => { setPlaying(false); setSel(i); }}>
                    {x.id}
                  </button>
                ))}
              </div>
            </div>
            <div className="qz-note">
              <b>{v.id}</b>
              <span>
                {v.note}
                <span className="qz-muted"> {niceDate(v.date)}.</span>
              </span>
            </div>
            {v.tunedOnFullHistory && <div className="qz-warn">careful: i picked this version's settings by trying lots of them on these same years, so it looks better than it would have in real time. from 2020 on it did {run.oos ? pct(run.oos.m.cagr) : '-'} a year.</div>}
          </div>
        </div>
        <div className="qz-side">
          {plainRows(run, v).map((r) => (
            <div key={r.k} className="qz-stat">
              <span className="qz-stat-k">{r.k}</span>
              <span className={`qz-stat-v ${r.loss ? 'qz-loss' : ''}`}>{r.v}</span>
              <span className="qz-stat-why">{r.why}</span>
            </div>
          ))}
        </div>
      </div>
      <MoreNumbers run={run} />
    </section>
  );
}

export function IdeaPage({ idea }: { idea: Idea }) {
  const since = useSince(idea);
  const [bag, setBag] = useState<DataBag | null>(null);
  const [tune, setTune] = useState(false);
  useEffect(() => {
    setTune(flag('tune'));
    if (idea.versions.length) loadFor(idea.versions.map((v) => v.config)).then(setBag).catch(() => {});
  }, [idea]);
  const symbols = useMemo(() => [...new Set(idea.versions.flatMap((v) => (v.config.kind === 'portfolio' ? v.config.universe.map((l) => l.symbol) : [])))].filter((s) => s !== 'CASH'), [idea]);
  return (
    <PageShell activePage="projects" crumb="wallstreetbets" back={{ href: '/wallstreetbets', label: 'wallstreetbets' }} wide>
      <div className="site-col qz">
        <header className="qz-head qz-enter">
          <div className="wsb-top">
            <span>idea, {niceDate(idea.date)}</span>
            <StatusTag since={since} />
            {idea.draft && <span className="wsb-draft">draft</span>}
          </div>
          <h1 className="qz-title" style={{ marginTop: 12 }}>{idea.title}</h1>
        </header>
        <div className="wsb-big qz-full qz-enter" style={{ animationDelay: '80ms' }}>
          <SinceChart idea={idea} since={since} height={320} showBench />
        </div>
        <Sections idea={idea} className="wsb-cols qz-full" />
        {bag && idea.versions.length > 0 && <History idea={idea} bag={bag} />}
        {bag && tune && idea.versions.length > 0 && <Tune slug={idea.slug} latest={idea.versions[idea.versions.length - 1]} bag={bag} symbols={symbols} intraday={false} />}
        <p className="wsb-foot qz-full">my own notebook. not affiliated with the subreddit, not advice.</p>
      </div>
      <style>{QZ_CSS + WSB_CSS}</style>
    </PageShell>
  );
}

