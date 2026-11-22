import { useEffect, useMemo, useRef, useState } from 'react';
import { SYSTEM_FONT } from './chrome';

interface Quote {
  symbol: string;
  name: string;
  price: number;
  prevClose: number;
  change: number;
  pct: number;
  history: number[];
}

interface Detail {
  volume?: string;
  fiftyTwoWeekHigh?: string;
  fiftyTwoWeekLow?: string;
  dayHigh?: string;
  dayLow?: string;
  chart?: { timestamps: number[]; closes: number[] };
  news?: { title: string; source: string; url: string; pubDate?: string }[];
}

interface Series { values: number[]; times: number[] | null; baseline: number | null }

const WATCHLIST = ['NVDA', 'TSLA', 'PLTR', 'AMD', 'META', 'COIN', 'BTC', 'NFLX', 'CRWD', 'AAPL', 'SNAP', 'SPY'];
const CRYPTO = new Set(['BTC', 'ETH', 'SOL', 'DOGE', 'XRP']);
const RANGES = [
  { id: '1D', api: null }, { id: '1W', api: null }, { id: '1M', api: '1mo' }, { id: '3M', api: '3mo' },
  { id: '6M', api: '6mo' }, { id: 'YTD', api: 'ytd' }, { id: '1Y', api: '1y' }, { id: '2Y', api: '2y' },
  { id: '5Y', api: '5y' }, { id: 'ALL', api: 'max' },
] as const;
type RangeId = typeof RANGES[number]['id'];

const GREEN = '#30d158';
const RED = '#ff453a';
const LABEL = 'rgba(235, 235, 245, 0.6)';
const FAINT = 'rgba(235, 235, 245, 0.3)';
const RULE = 'rgba(84, 84, 88, 0.6)';

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = (n: number) => `${n >= 0 ? '+' : '−'}${money(Math.abs(n))}`;
const pctText = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(2)}%`;

function decode(text: string) {
  if (typeof document === 'undefined') return text;
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

function marketState(symbol: string) {
  if (CRYPTO.has(symbol)) return { open: true, label: 'Trades 24 hours' };
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const minutes = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
  const weekday = !['Sat', 'Sun'].includes(get('weekday'));
  const open = weekday && minutes >= 570 && minutes < 960;
  return { open, label: open ? 'Market Open' : 'At Close' };
}

function ago(date?: string) {
  if (!date) return '';
  const mins = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

function Spark({ values, baseline, up }: { values: number[]; baseline: number; up: boolean }) {
  const w = 58, h = 26;
  if (values.length < 2) return <svg width={w} height={h} />;
  const lo = Math.min(...values, baseline), hi = Math.max(...values, baseline);
  const y = (v: number) => h - 2 - ((v - lo) / (hi - lo || 1)) * (h - 4);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${((i / (values.length - 1)) * w).toFixed(1)},${y(v).toFixed(1)}`).join('');
  return (
    <svg width={w} height={h} style={{ display: 'block', flexShrink: 0 }}>
      <line x1="0" x2={w} y1={y(baseline)} y2={y(baseline)} stroke={FAINT} strokeWidth="1" strokeDasharray="1 3" />
      <path d={d} fill="none" stroke={up ? GREEN : RED} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Chart({ series, up, range, onScrub }: { series: Series; up: boolean; range: RangeId; onScrub: (i: number | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(240, e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const h = 250, padR = 48, padB = 22, plotW = width - padR, plotH = h - padB;
  const { values, times, baseline } = series;
  const lo = Math.min(...values, baseline ?? Infinity), hi = Math.max(...values, baseline ?? -Infinity);
  const span = hi - lo || 1;
  const x = (i: number) => (i / Math.max(1, values.length - 1)) * plotW;
  const y = (v: number) => 8 + (1 - (v - lo) / span) * (plotH - 16);
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const color = up ? GREEN : RED;
  const ticks = [0, 1 / 3, 2 / 3, 1].map((t) => lo + span * t);
  const fmtTime = (t: number) => {
    const d = new Date(t * 1000);
    if (range === '1D') return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (range === '1W') return d.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric' });
    if (['2Y', '5Y', 'ALL'].includes(range)) return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const labels = times ? [0, 0.25, 0.5, 0.75].map((t) => Math.round(t * (times.length - 1))) : [];
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const i = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / plotW)) * (values.length - 1));
    setHover(i);
    onScrub(i);
  };
  const leave = () => { setHover(null); onScrub(null); };
  const gid = `g-${color.slice(1)}`;
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} style={{ position: 'relative', height: h, cursor: 'crosshair' }}>
      <svg width={width} height={h} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1="0" x2={plotW} y1={y(t)} y2={y(t)} stroke={RULE} strokeWidth="0.5" />
            <text x={plotW + 8} y={y(t) + 4} fontSize="11" fill={LABEL} style={{ fontVariantNumeric: 'tabular-nums' }}>{t >= 1000 ? Math.round(t).toLocaleString('en-US') : t.toFixed(2)}</text>
          </g>
        ))}
        {baseline !== null && (
          <line x1="0" x2={plotW} y1={y(baseline)} y2={y(baseline)} stroke={LABEL} strokeWidth="1" strokeDasharray="1 4" />
        )}
        <path d={`${line}L${plotW},${plotH}L0,${plotH}Z`} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {times && labels.map((i) => (
          <text key={i} x={x(i)} y={h - 6} fontSize="11" fill={LABEL} textAnchor={i === 0 ? 'start' : 'middle'}>{fmtTime(times[i])}</text>
        ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1="0" y2={plotH} stroke="rgba(235,235,245,0.6)" strokeWidth="1" />
            <circle cx={x(hover)} cy={y(values[hover])} r="4.5" fill={color} stroke="#000" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover !== null && times && (
        <div style={{ position: 'absolute', top: -18, left: Math.min(Math.max(x(hover) - 60, 0), plotW - 120), width: 120, textAlign: 'center', fontSize: 11, color: LABEL }}>
          {fmtTime(times[hover])}
        </div>
      )}
    </div>
  );
}

export default function StocksWindow() {
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState('NVDA');
  const [query, setQuery] = useState('');
  const [showPct, setShowPct] = useState(true);
  const [range, setRange] = useState<RangeId>('1D');
  const [detail, setDetail] = useState<Record<string, Detail>>({});
  const [history, setHistory] = useState<Record<string, { closes: number[]; timestamps: number[] }>>({});
  const [scrub, setScrub] = useState<number | null>(null);

  useEffect(() => {
    const load = () => fetch('/api/stocks')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Quote[]) => { if (Array.isArray(d) && d.length) { setQuotes(d); setFailed(false); } else setFailed(true); })
      .catch(() => setFailed(true));
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (detail[selected]) return;
    fetch(`/api/stock-detail?symbol=${selected}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && !d.error) setDetail((prev) => ({ ...prev, [selected]: d })); })
      .catch(() => {});
  }, [selected, detail]);

  const api = RANGES.find((r) => r.id === range)!.api;
  const key = `${selected}:${api}`;
  useEffect(() => {
    if (!api || history[key]) return;
    fetch(`/api/stock-history?symbols=${selected}&range=${api}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { const s = d?.data?.[selected]; if (s?.closes?.length) setHistory((prev) => ({ ...prev, [key]: s })); })
      .catch(() => {});
  }, [api, key, selected, history]);

  const bySymbol = useMemo(() => new Map((quotes ?? []).map((q) => [q.symbol, q])), [quotes]);
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (x: Quote) => !q || x.symbol.toLowerCase().includes(q) || x.name.toLowerCase().includes(q);
    const mine = WATCHLIST.map((s) => bySymbol.get(s)).filter((x): x is Quote => !!x && match(x));
    const rest = (quotes ?? []).filter((x) => !WATCHLIST.includes(x.symbol) && match(x)).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
    return [{ title: 'My Watchlist', items: mine }, { title: 'Also Watching', items: rest }].filter((g) => g.items.length);
  }, [quotes, bySymbol, query]);

  const quote = bySymbol.get(selected);
  const info = detail[selected];
  const state = marketState(selected);

  const series: Series | null = useMemo(() => {
    if (!quote) return null;
    if (range === '1D') return { values: quote.history, times: null, baseline: quote.prevClose };
    if (range === '1W') return info?.chart?.closes?.length ? { values: info.chart.closes, times: info.chart.timestamps, baseline: null } : null;
    const h = history[key];
    return h ? { values: h.closes, times: h.timestamps, baseline: null } : null;
  }, [quote, range, info, history, key]);

  const first = series ? (series.baseline ?? series.values[0]) : 0;
  const last = series ? series.values[scrub ?? series.values.length - 1] : 0;
  const delta = range === '1D' && scrub === null && quote ? quote.change : last - first;
  const deltaPct = range === '1D' && scrub === null && quote ? quote.pct : first ? ((last - first) / first) * 100 : 0;
  const up = delta >= 0;
  const shown = scrub !== null && series ? series.values[scrub] : quote?.price ?? 0;

  const stats = quote ? [
    ['Prev Close', money(quote.prevClose)],
    ['Day High', info?.dayHigh],
    ['Day Low', info?.dayLow],
    ['Volume', info?.volume],
    ['52W High', info?.fiftyTwoWeekHigh],
    ['52W Low', info?.fiftyTwoWeekLow],
  ].filter(([, v]) => v && v !== '—') as [string, string][] : [];

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="stk" style={{ display: 'flex', height: '100%', background: '#000', color: '#fff', fontFamily: SYSTEM_FONT, fontSize: 13, lineHeight: 1.35 }}>
      <aside style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#1c1c1e', borderRight: `0.5px solid ${RULE}` }}>
        <div style={{ padding: '14px 16px 10px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>Stocks</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: LABEL }}>{today}</div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, height: 28, padding: '0 8px', borderRadius: 7, background: 'rgba(118, 118, 128, 0.24)' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="5.8" cy="5.8" r="4.3" stroke={LABEL} strokeWidth="1.5" /><path d="M9.1 9.1l3.4 3.4" stroke={LABEL} strokeWidth="1.5" strokeLinecap="round" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" spellCheck={false} className="stk-search" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', color: '#fff', font: 'inherit' }} />
          </div>
        </div>
        <div className="stk-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          {failed && !quotes && <div style={{ padding: '24px 8px', color: LABEL }}>Quotes are unavailable right now.</div>}
          {!failed && !quotes && <div style={{ padding: '24px 8px', color: LABEL }}>Loading quotes…</div>}
          {groups.map((g) => (
            <div key={g.title}>
              <div style={{ padding: '10px 8px 4px', fontSize: 12, fontWeight: 600, color: LABEL }}>{g.title}</div>
              {g.items.map((s, i) => {
                const active = s.symbol === selected;
                const rise = s.change >= 0;
                return (
                  <div key={s.symbol}>
                    <div
                      onClick={() => { setSelected(s.symbol); setScrub(null); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, height: 58, padding: '0 8px', borderRadius: 8, background: active ? 'rgba(255,255,255,0.12)' : 'transparent', cursor: 'default' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{s.symbol}</div>
                        <div style={{ fontSize: 12, color: LABEL, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      </div>
                      <Spark values={s.history} baseline={s.prevClose} up={rise} />
                      <div style={{ width: 78, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{money(s.price)}</div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowPct((v) => !v); }}
                          style={{ marginTop: 2, minWidth: 66, height: 20, padding: '0 6px', border: 0, borderRadius: 5, background: rise ? GREEN : RED, color: '#fff', font: 'inherit', fontSize: 12, fontWeight: 600, textAlign: 'right', cursor: 'default', fontVariantNumeric: 'tabular-nums' }}
                        >{showPct ? pctText(s.pct) : signed(s.change)}</button>
                      </div>
                    </div>
                    {i < g.items.length - 1 && <div style={{ height: 0.5, background: RULE, margin: '0 8px' }} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 16px 10px', borderTop: `0.5px solid ${RULE}`, fontSize: 11, color: FAINT }}>
          Ronniel's watchlist. Quotes from Yahoo Finance, delayed.
        </div>
      </aside>

      <main className="stk-scroll" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '20px 28px 28px' }}>
        {!quote ? (
          <div style={{ color: LABEL, paddingTop: 40 }}>{failed ? 'Quotes are unavailable right now.' : 'Loading…'}</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{quote.symbol}</span>
              <span style={{ fontSize: 17, color: LABEL, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quote.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: LABEL, whiteSpace: 'nowrap' }}>{state.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }}>{money(shown)}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: up ? GREEN : RED }}>{signed(delta)} ({pctText(deltaPct)})</span>
              <span style={{ fontSize: 12, color: LABEL }}>{range === '1D' ? 'today' : `past ${range.toLowerCase()}`}</span>
            </div>

            <div style={{ display: 'flex', gap: 2, margin: '18px 0 26px -8px' }}>
              {RANGES.map((r) => (
                <button key={r.id} onClick={() => { setRange(r.id); setScrub(null); }} style={{ height: 24, padding: '0 9px', border: 0, borderRadius: 6, background: r.id === range ? 'rgba(255,255,255,0.16)' : 'transparent', color: r.id === range ? '#fff' : LABEL, font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'default' }}>{r.id}</button>
              ))}
            </div>

            {series && series.values.length > 1
              ? <Chart series={series} up={up} range={range} onScrub={setScrub} />
              : <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: LABEL }}>Loading chart…</div>}

            {stats.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: 28, marginTop: 22, borderTop: `0.5px solid ${RULE}` }}>
                {stats.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `0.5px solid ${RULE}`, fontSize: 12 }}>
                    <span style={{ color: LABEL }}>{k}</span>
                    <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {info?.news && info.news.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>News</div>
                {info.news.slice(0, 6).map((n) => (
                  <a key={n.url} href={n.url} target="_blank" rel="noopener noreferrer" className="stk-news" style={{ display: 'block', padding: '12px 0', borderBottom: `0.5px solid ${RULE}`, color: 'inherit', textDecoration: 'none' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: LABEL }}>{decode(n.source)}{n.pubDate ? ` · ${ago(n.pubDate)}` : ''}</div>
                    <div style={{ marginTop: 3, fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{decode(n.title)}</div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <style>{`
        .stk-search::placeholder { color: ${LABEL}; }
        .stk-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.3) transparent; }
        .stk-scroll::-webkit-scrollbar { width: 7px; }
        .stk-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
        .stk-scroll::-webkit-scrollbar-track { background: transparent; }
        .stk-news:hover > div:last-child { text-decoration: underline; text-decoration-color: rgba(255,255,255,0.4); text-underline-offset: 3px; }
      `}</style>
    </div>
  );
}
