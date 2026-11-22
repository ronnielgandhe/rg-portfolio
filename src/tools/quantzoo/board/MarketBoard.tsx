import { useLayoutEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { Tick } from '../ui/Tick';
import { BOARD_CSS } from './styles.ts';
import { useBoard, useInView, useNow, type Slot } from './useBoard.ts';
import { BAD_WHEN_UP, BOOSTERS, MOVES, NEGATORS, RULE, TONE_DOWN, TONE_UP } from './lexicon.ts';
import { breadthLine, dir, happened, meaning, moodLine, moodOf, niceDay, newsAbout, oddsLine, price, readOf, signed, why } from './plain.ts';
import type { Down, HistoryData, NewsData, OddsData, Quote, TapeData } from './types.ts';

const live = (x: Quote | Down): x is Quote => !('down' in x);
const vars = (o: Record<string, string | number>) => o as CSSProperties;

function ago(ms: number, now: number) {
  if (!ms || !now) return 'loading';
  const m = Math.round(Math.max(0, now - ms) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
}

function Spark({ values, h = 40, w = 240, baseline, tone, i = 0 }: { values: number[]; h?: number; w?: number; baseline?: number; tone?: 'up' | 'down' | 'ink'; i?: number }) {
  const d = useMemo(() => {
    if (values.length < 2) return null;
    let lo = Math.min(...values, baseline ?? Infinity);
    let hi = Math.max(...values, baseline ?? -Infinity);
    if (hi - lo < 1e-9) (hi += 0.5), (lo -= 0.5);
    const x = (k: number) => (k / (values.length - 1)) * w;
    const y = (v: number) => 2 + (1 - (v - lo) / (hi - lo)) * (h - 4);
    return { line: values.map((v, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)},${y(v).toFixed(1)}`).join(''), base: baseline != null ? y(baseline) : null };
  }, [values, h, w, baseline]);
  if (!d) return <svg className="qzb-spark" viewBox={`0 0 ${w} ${h}`} height={h} aria-hidden="true" />;
  const t = tone ?? (values[values.length - 1] >= values[0] ? 'up' : 'down');
  return (
    <svg className="qzb-spark" viewBox={`0 0 ${w} ${h}`} height={h} preserveAspectRatio="none" aria-hidden="true" style={vars({ '--i': i })}>
      {d.base != null && <path className="qzb-s-base" d={`M0,${d.base}H${w}`} />}
      <path className={`qzb-s-${t}`} d={d.line} />
    </svg>
  );
}

function Block({ title, sub, children }: { title: string; sub?: ReactNode; children: ReactNode }) {
  const [ref, seen] = useInView<HTMLElement>();
  return (
    <section ref={ref} className={`qzb-sec${seen ? ' qzb-on' : ''}`}>
      <div className="qzb-sec-head">
        <h3 className="qzb-h3">{title}</h3>
        {sub ? <span className="qzb-asof">{sub}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Pending<T>({ slot, name, children }: { slot: Slot<T>; name: string; children: (d: T) => ReactNode }) {
  if (slot.data) return <>{children(slot.data)}</>;
  if (slot.error) return <div className="qzb-out"><b>source down.</b> {name} is not answering right now. everything else still works, and this part tries again in a few minutes.</div>;
  return <div className="qzb-skel">checking {name}...</div>;
}

function Dial({ score }: { score: number }) {
  const a = Math.PI * (1 - (Math.max(-100, Math.min(100, score)) + 100) / 200);
  const R = 80;
  const pt = (ang: number, r = R) => `${(100 + r * Math.cos(ang)).toFixed(1)},${(96 - r * Math.sin(ang)).toFixed(1)}`;
  const arc = (from: number, to: number) => `M${pt(from)}A${R},${R} 0 0 1 ${pt(to)}`;
  const cut1 = Math.PI * (1 - 60 / 200);
  const cut2 = Math.PI * (1 - 120 / 200);
  return (
    <svg className="qzb-dial" viewBox="0 0 200 108" aria-hidden="true">
      <path className="qzb-dial-down" d={arc(Math.PI, cut1 + 0.03)} />
      <path className="qzb-dial-mid" d={arc(cut1 - 0.03, cut2 + 0.03)} />
      <path className="qzb-dial-up" d={arc(cut2 - 0.03, 0)} />
      <g className="qzb-needle" style={vars({ transform: `rotate(${(-a * 180) / Math.PI + 90}deg)` })}>
        <line x1="100" y1="96" x2="100" y2="30" />
      </g>
      <circle cx="100" cy="96" r="3" className="qzb-dial-hub" />
      <text x="14" y="106" className="qzb-dial-t">scared</text>
      <text x="100" y="10" className="qzb-dial-t" textAnchor="middle">nervous</text>
      <text x="186" y="106" className="qzb-dial-t" textAnchor="end">calm</text>
    </svg>
  );
}

function MoodBlock({ d, now }: { d: TapeData; now: number }) {
  const mood = moodOf(d.gauge.score);
  const total = d.gauge.parts.reduce((a, p) => a + p.points, 0);
  return (
    <div className="qzb-mood">
      <div className="qzb-in">
        <div className={`qzb-mood-word qzb-mood-${mood}`}>{mood}</div>
        <p className="qzb-mood-line">{moodLine(d, now)}</p>
      </div>
      <div className="qzb-in" style={vars({ '--i': 1 })}>
        <Dial score={d.gauge.score} />
      </div>
      <details className="qzb-how qzb-mood-how">
        <summary>how we get this</summary>
        <div className="qzb-how-body">
          <p className="qzb-fine">nine yes or no checks. each yes is +1, each no is -1, in between is 0. we add them up ({signed(total, 0)}), divide by nine and multiply by 100, so the score runs from -100 to +100 (now {signed(d.gauge.score, 0)}). above +20 is calm, below -40 is scared, the rest is nervous.</p>
          <div className="qzb-recipe">
            {d.gauge.parts.map((p) => (
              <div className="qzb-recipe-row" key={p.name}>
                <span>{p.name}</span>
                <span className="qzb-recipe-v">{p.reading}</span>
                <span className={`qzb-recipe-p ${dir(p.points)}`}>{p.points > 0 ? 'yes' : p.points < 0 ? 'no' : 'meh'}</span>
                <i>{p.rule}</i>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}

function Markets({ d, now }: { d: TapeData; now: number }) {
  const sectors = d.sectors.filter(live).sort((a, b) => b.ch1d - a.ch1d);
  const maxAbs = Math.max(0.005, ...sectors.map((s) => Math.abs(s.ch1d)));
  return (
    <>
      <div className="qzb-tiles">
        {d.quotes.map((q, i) => (
          <article className="qzb-tile qzb-in" key={q.sym} style={vars({ '--i': i })}>
            <div className="qzb-label">{q.name}</div>
            {live(q) ? (
              <>
                <div className="qzb-tile-row">
                  <span className="qzb-tile-p">
                    <Tick value={q.price} format={(x) => price(q, x)} />
                  </span>
                  <span className={`qzb-tile-ch ${dir(q.sym === '^VIX' ? -q.ch1d : q.ch1d)}`}>{signed(q.ch1d * 100, q.unit === 'pts' ? 0 : 1)}%</span>
                </div>
                <Spark values={q.spark} i={i} tone={q.sym === '^VIX' ? (q.spark[q.spark.length - 1] >= q.spark[0] ? 'down' : 'up') : undefined} />
                <p className="qzb-tile-what">{happened(q, now)}</p>
                <p className="qzb-tile-mean">{meaning(q)}</p>
              </>
            ) : (
              <p className="qzb-tile-mean">source down for this one.</p>
            )}
          </article>
        ))}
      </div>
      <div className="qzb-sectors">
        <p className="qzb-big-line qzb-in">{breadthLine(d, now)}</p>
        <div className="qzb-bars">
          {sectors.map((s, i) => {
            const w = (Math.abs(s.ch1d) / maxAbs) * 50;
            return (
              <div className="qzb-bar qzb-in" key={s.sym} style={vars({ '--i': i })}>
                <span className="qzb-bar-name">{s.name}</span>
                <span className="qzb-bar-track">
                  <span className={`qzb-bar-fill ${s.ch1d < 0 ? 'qzb-neg' : 'qzb-pos'}`} style={vars({ left: s.ch1d >= 0 ? '50%' : `${50 - w}%`, width: `${w}%`, '--i': i })} />
                </span>
                <span className={`qzb-bar-v ${dir(s.ch1d)}`}>{signed(s.ch1d * 100, 1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function useFlip(keys: string) {
  const rows = useRef(new Map<string, HTMLElement>());
  const prev = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    let reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {}
    const next = new Map<string, number>();
    rows.current.forEach((el, k) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      next.set(k, top);
      const was = prev.current.get(k);
      if (!reduce && was != null && Math.abs(was - top) > 1 && el.animate) el.animate([{ transform: `translateY(${was - top}px)` }, { transform: 'none' }], { duration: 480, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
    });
    prev.current = next;
  }, [keys]);
  return (k: string) => (el: HTMLElement | null) => {
    if (el) rows.current.set(k, el);
    else rows.current.delete(k);
  };
}

function Odds({ d }: { d: OddsData }) {
  const rows = d.rows;
  const bind = useFlip(rows.map((r) => r.id).join('|'));
  return (
    <>
      <p className="qzb-odds-intro qzb-in">people put real money on yes or no questions. the price of a yes is the crowd's odds.</p>
      <div className="qzb-odds">
        {rows.map((r, i) => {
          const ch = r.d7 ?? r.d1;
          return (
            <article className="qzb-odd qzb-in" key={r.id} ref={bind(r.id)} style={vars({ '--i': i })}>
              <a className="qzb-odd-title" href={r.prices[0]?.url} target="_blank" rel="noopener noreferrer" title={r.prices.map((x) => `${x.source}: ${x.title}`).join('\n')}>
                {r.question}
              </a>
              <div className="qzb-odd-p">
                <Tick value={r.p * 100} format={(x) => `${Math.round(x)}%`} />
              </div>
              <div className="qzb-odd-bar" aria-hidden="true">
                <span className={`qzb-odd-fill ${dir(ch)}`} style={{ width: `${(r.p * 100).toFixed(1)}%` }} />
              </div>
              <p className="qzb-odd-line">
                <span className={dir(ch)}>{oddsLine(r)}</span>
                <span className="qzb-odd-src">
                  {r.prices.map((x, k) => (
                    <span key={x.source}>
                      {k ? ', ' : ''}
                      <a className="qzb-link" href={x.url} target="_blank" rel="noopener noreferrer" title={x.title}>
                        {x.source} {Math.round(x.p * 100)}%
                      </a>
                    </span>
                  ))}
                </span>
              </p>
              <p className="qzb-odd-why">why it matters: {r.why}</p>
            </article>
          );
        })}
      </div>
      {d.sources.some((s) => !s.ok) ? (
        <p className="qzb-fine qzb-note">
          {d.sources.filter((s) => !s.ok).map((s) => (
            <span key={s.id} className="qzb-down">{s.id} is down right now, showing the other one. </span>
          ))}
        </p>
      ) : null}
    </>
  );
}

const words = (o: Record<string, number>) =>
  Object.entries(o)
    .filter(([w]) => !w.endsWith('s') || o[w.slice(0, -1)] == null)
    .map(([w, v]) => `${w} ${signed(v, v % 1 ? 1 : 0)}`)
    .join(', ');

function News({ d, now }: { d: NewsData; now: number }) {
  return (
    <>
      <p className="qzb-big-line qzb-in qzb-about">{newsAbout(d.themes)}</p>
      <div className="qzb-news">
        <div className="qzb-heads">
          {d.reads.map((h, i) => {
            const r = readOf(h.score);
            return (
              <a className="qzb-head-row qzb-in" key={h.url} href={h.url} target="_blank" rel="noopener noreferrer" style={vars({ '--i': i })}>
                <span className={`qzb-read ${r === 'good news' ? 'qzb-up' : r === 'bad news' ? 'qzb-down' : 'qzb-flat'}`}>{r}</span>
                <span className="qzb-head-t">{h.title}</span>
                <span className="qzb-head-m">
                  {why(h)}. {h.source}
                  {h.also.length ? ` and ${h.also.length} more` : ''}, {ago(h.at, now)}
                </span>
              </a>
            );
          })}
        </div>
      </div>
      <details className="qzb-how">
        <summary>how we read the headlines</summary>
        <div className="qzb-how-body">
          <ol>
            {RULE.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
          <div className="qzb-words">
            <div>
              <div className="qzb-label">good words</div>
              <p>{words(TONE_UP)}</p>
            </div>
            <div>
              <div className="qzb-label">bad words</div>
              <p>{words(TONE_DOWN)}</p>
            </div>
            <div>
              <div className="qzb-label">move words</div>
              <p>{words(MOVES)}</p>
              <div className="qzb-label qzb-gap">bad when they go up</div>
              <p>{BAD_WHEN_UP.join(', ')}</p>
              <div className="qzb-label qzb-gap">flip words, strong words</div>
              <p>
                {NEGATORS.join(', ')}; {BOOSTERS.join(', ')}
              </p>
            </div>
          </div>
          <p className="qzb-fine">it is a word counter. it misses sarcasm and context, but you can check every score by hand. above +0.15 is good news, below -0.15 is bad news, the rest is mixed.</p>
        </div>
      </details>
      <p className="qzb-fine qzb-note">
        from{' '}
        {d.feeds.map((f, i) => (
          <span key={f.id}>
            {i ? ', ' : ''}
            <a className="qzb-link" href={f.home} target="_blank" rel="noopener noreferrer">
              {f.name}
            </a>
            {f.ok ? '' : <span className="qzb-down"> (down)</span>}
          </span>
        ))}
        . {d.counted} stories from the last 3 days.
      </p>
    </>
  );
}

function History({ d }: { d: HistoryData }) {
  const s = d.snapshots.filter((x) => x.gauge != null);
  if (s.length < 2) return <p className="qzb-fine">{s.length ? `first reading saved ${niceDay(s[0].date)}.` : 'no readings saved yet.'} one gets saved every weekday after the close, and the line starts once there are two.</p>;
  const vals = s.map((x) => x.gauge as number);
  return (
    <div className="qzb-hist qzb-in">
      <Spark values={vals} h={72} w={1000} baseline={0} tone="ink" />
      <div className="qzb-hist-ends">
        <span>{niceDay(s[0].date)}</span>
        <span>above the dotted line is calmer, below is more scared</span>
        <span>{niceDay(s[s.length - 1].date)}</span>
      </div>
    </div>
  );
}

export default function MarketBoard() {
  const { tape, odds, news, history, every } = useBoard();
  const now = useNow();
  const stamps = [tape, odds, news].map((s) => (s.data ? Date.parse((s.data as { fetchedAt: string }).fetchedAt) : 0)).filter(Boolean);
  const oldest = stamps.length ? Math.min(...stamps) : 0;
  return (
    <div className="qzb qzb-anim">
      <style>{BOARD_CSS}</style>
      <header className="qzb-top">
        <h2 className="qzb-title">what's going on</h2>
        <p className="qzb-status" aria-live="polite">
          updated {ago(oldest, now)}, checks again every {every / 60000} min. just a notebook, not advice.
        </p>
      </header>

      <Block title="the mood">
        <Pending slot={tape} name="the price feed">
          {(d) => <MoodBlock d={d} now={now} />}
        </Pending>
      </Block>

      <Block title="the big markets" sub={tape.data?.asOf ? `last close ${niceDay(tape.data.asOf)}` : undefined}>
        <Pending slot={tape} name="the price feed">
          {(d) => <Markets d={d} now={now} />}
        </Pending>
      </Block>

      <Block title="what traders are betting on" sub="biggest moves first">
        <Pending slot={odds} name="the betting markets">
          {(d) => <Odds d={d} />}
        </Pending>
      </Block>

      <Block title="the headlines" sub="the stories with the strongest words">
        <Pending slot={news} name="the news feeds">
          {(d) => <News d={d} now={now} />}
        </Pending>
      </Block>

      {(history.data?.snapshots.filter((x) => x.gauge != null).length ?? 0) > 1 ? (
      <Block title="the mood over time">
        <Pending slot={history} name="the daily log">
          {(d) => <History d={d} />}
        </Pending>
      </Block>
      ) : null}

      <footer className="qzb-foot">
        <p>prices from yahoo finance, can run 15 minutes behind. odds from polymarket and kalshi, each linked to its market. headlines from each publisher's public feed, linked to the original story.</p>
        <p>a research notebook, not financial advice. nothing here says buy or sell, and none of it is anyone's real positions.</p>
      </footer>
    </div>
  );
}
