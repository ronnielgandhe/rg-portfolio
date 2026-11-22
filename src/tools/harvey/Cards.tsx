import { useEffect, useRef, useState } from 'react';
import type { NewsItem, Pane, SeeAlso, StockData, Trade } from './events';

const fmt = (n?: number, d = 2) => (n === undefined ? '' : n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));

function when(s: string) {
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T12:00:00` : s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase();
}

function Head({ label, onDismiss }: { label: string; onDismiss: () => void }) {
  return (
    <div className="hv-card-head">
      <span className="hv-label">{label}</span>
      <button className="hv-x" onClick={onDismiss} aria-label="remove card">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  );
}

function StatuteCard({ pane, onDismiss, onSeeAlso }: { pane: Extract<Pane, { kind: 'statute' }>; onDismiss: () => void; onSeeAlso: (s: SeeAlso) => void }) {
  const [full, setFull] = useState(false);
  const [fr, setFr] = useState(false);
  const longer = pane.fullText && pane.fullText.length > pane.quote.length + 10;
  const body = fr && pane.frenchQuote ? pane.frenchQuote : full && pane.fullText ? pane.fullText : pane.quote;
  return (
    <>
      <Head label={['statute', pane.jurisdiction.toLowerCase()].filter(Boolean).join(' · ')} onDismiss={onDismiss} />
      <div className="hv-section">{pane.section}</div>
      <div className="hv-title">{pane.title}</div>
      <blockquote className="hv-quote">{body}</blockquote>
      <div className="hv-foot">
        {pane.source && <span>{pane.source.toLowerCase()}</span>}
        {pane.confidence !== undefined && pane.confidence > 0 && <span>{Math.round(pane.confidence * 100)}% match</span>}
        {longer && !fr && <button className="hv-textbtn" onClick={() => setFull((v) => !v)}>{full ? 'less' : 'full text'}</button>}
        {pane.frenchQuote && <button className="hv-textbtn" onClick={() => setFr((v) => !v)}>{fr ? 'english' : 'français'}</button>}
      </div>
      {pane.seeAlso.length > 0 && (
        <div className="hv-see">
          <div className="hv-label">see also</div>
          {pane.seeAlso.map((s, i) => (
            <button key={i} className="hv-see-row" onClick={() => onSeeAlso(s)}>
              <span className="hv-see-sec">{s.section}</span>
              <span className="hv-see-title">{s.title}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function NewsCard({ query, items, onDismiss }: { query: string; items: NewsItem[]; onDismiss: () => void }) {
  return (
    <>
      <Head label={`news${query ? ` · ${query.toLowerCase()}` : ''}`} onDismiss={onDismiss} />
      {items.length === 0 ? (
        <p className="hv-empty">nothing came back for that one.</p>
      ) : (
        <ul className="hv-news">
          {items.map((it, i) => (
            <li key={i}>
              <a href={it.link || undefined} target="_blank" rel="noopener noreferrer" className="hv-news-title">{it.title}</a>
              {i === 0 && it.summary && it.summary !== it.title && <p className="hv-news-sum">{it.summary}</p>}
              <div className="hv-news-meta">{[it.source, when(it.published)].filter(Boolean).join(' · ').toLowerCase()}</div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Spark({ closes }: { closes: number[] }) {
  if (closes.length < 2) return null;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const pts = closes.map((c, i) => `${((i / (closes.length - 1)) * 300).toFixed(1)},${(56 - ((c - min) / span) * 52).toFixed(1)}`).join(' ');
  return (
    <svg className="hv-spark" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function StockCard({ d, onDismiss }: { d: StockData; onDismiss: () => void }) {
  const label = ['stock', d.symbol, d.exchange?.toLowerCase()].filter(Boolean).join(' · ');
  if (d.error) {
    return (
      <>
        <Head label={label} onDismiss={onDismiss} />
        <div className="hv-title">{d.query}</div>
        <p className="hv-empty">{d.error === 'not_public' ? 'not on a public exchange, so no ticker to show.' : 'could not pull a live quote right now.'}</p>
      </>
    );
  }
  const up = (d.change ?? 0) >= 0;
  return (
    <>
      <Head label={label} onDismiss={onDismiss} />
      <div className="hv-title">{d.shortName}</div>
      <div className="hv-price">
        <span>{fmt(d.price)}</span>
        <span className="hv-ccy">{d.currency?.toLowerCase()}</span>
      </div>
      <div className="hv-change">{up ? '+' : '-'}{fmt(Math.abs(d.change ?? 0))} ({up ? '+' : '-'}{fmt(Math.abs(d.changePct ?? 0))}%) today</div>
      {d.closes && <Spark closes={d.closes} />}
      <div className="hv-stats">
        <div><div className="hv-label">day</div><div>{fmt(d.dayLow)} to {fmt(d.dayHigh)}</div></div>
        <div><div className="hv-label">52 week</div><div>{fmt(d.fiftyTwoWeekLow)} to {fmt(d.fiftyTwoWeekHigh)}</div></div>
      </div>
    </>
  );
}

function HillCard({ ticker, trades, source, onDismiss }: { ticker: string; trades: Trade[]; source?: string; onDismiss: () => void }) {
  return (
    <>
      <Head label={`congress · ${ticker}`} onDismiss={onDismiss} />
      {trades.length === 0 ? (
        <p className="hv-empty">no recent filings on {ticker}.</p>
      ) : (
        <ul className="hv-trades">
          {trades.map((t, i) => (
            <li key={i}>
              <div>
                <div className="hv-trade-who">{t.member}</div>
                <div className="hv-news-meta">{[t.party && t.state ? `${t.party}-${t.state}` : t.party || t.state, t.chamber.toLowerCase(), t.traded && `traded ${when(t.traded)}`].filter(Boolean).join(' · ')}</div>
              </div>
              <div className="hv-trade-side">
                <div>{t.side.toLowerCase()}</div>
                <div className="hv-news-meta">{t.size}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="hv-foot"><span>{source === 'quiver' ? 'live stock act filings' : 'stock act filings, curated'}</span></div>
    </>
  );
}

export default function Card({ pane, focused, scroll, onDismiss, onSeeAlso }: { pane: Pane; focused: boolean; scroll: boolean; onDismiss: () => void; onSeeAlso: (s: SeeAlso) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroll) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [scroll]);
  return (
    <div ref={ref} className={`hv-card${focused ? ' hv-card-on' : ''}`}>
      {pane.kind === 'statute' && <StatuteCard pane={pane} onDismiss={onDismiss} onSeeAlso={onSeeAlso} />}
      {pane.kind === 'news' && <NewsCard query={pane.query} items={pane.items} onDismiss={onDismiss} />}
      {pane.kind === 'stock' && <StockCard d={pane.data} onDismiss={onDismiss} />}
      {pane.kind === 'hill' && <HillCard ticker={pane.ticker} trades={pane.trades} source={pane.source} onDismiss={onDismiss} />}
    </div>
  );
}
