import { useMemo, useRef, useState } from 'react';
import { Bar, CountUp, useFirstPass, useFlip, useReveal } from './motion';
import { CATEGORIES, LLM_BENCHES, BENCH_BY_ID, MODEL_BY_ID, blended, displayName, rowSub, fmtDate, fmtPrice, fmtScore, rowProvider, type Bench, type CategoryId, type Row } from './data';

type Sort = 'score' | 'price' | 'value';
const TOP = 15;

export function CatTabs({ value, onChange, benches }: { value: CategoryId; onChange: (c: CategoryId) => void; benches: Bench[] }) {
  return (
    <div className="bx-tabs" role="tablist" aria-label="benchmark category">
      {CATEGORIES.filter((c) => benches.some((b) => b.category === c.id)).map((c) => (
        <button key={c.id} role="tab" aria-selected={value === c.id} className={`bx-tab-btn${value === c.id ? ' bx-tab-on' : ''}`} onClick={() => onChange(c.id)}>{c.label}</button>
      ))}
    </div>
  );
}

export function BenchSeg({ value, onChange, benches }: { value: string; onChange: (id: string) => void; benches: Bench[] }) {
  if (benches.length < 2) return null;
  return (
    <div className="bx-seg" role="radiogroup" aria-label="benchmark">
      {benches.map((x) => (
        <button key={x.id} role="radio" aria-checked={x.id === value} className={x.id === value ? 'bx-seg-on' : ''} onClick={() => onChange(x.id)}>{x.short}</button>
      ))}
    </div>
  );
}

export function BenchMeta({ b }: { b: Bench }) {
  return (
    <div className="bx-meta">
      <p className="bx-measures">{b.measures}</p>
      <div className="bx-meta-row">
        <span>{b.metric}, {b.higherIsBetter ? 'higher is better' : 'lower is better'}</span>
        <span>data {fmtDate(b.date)}</span>
        <span>{b.stats.models} models{b.stats.pricedModels !== undefined ? `, ${b.stats.pricedModels} with a price` : ''}</span>
        <a href={b.url} target="_blank" rel="noopener noreferrer" className="bx-link">source</a>
      </div>
    </div>
  );
}

const value = (b: Bench, r: Row) => {
  const m = r.modelId ? MODEL_BY_ID.get(r.modelId) : undefined;
  if (!m || blended(m) <= 0) return null;
  const s = b.higherIsBetter ? r.score : 100 - r.score;
  return s / blended(m);
};

export default function Leaderboard({ onOpen, selected }: { onOpen: (id: string) => void; selected: string | null }) {
  const [id, setId] = useState('swe_verified');
  const [sort, setSort] = useState<Sort>('score');
  const [prov, setProv] = useState('all');
  const [q, setQ] = useState('');
  const [all, setAll] = useState(false);
  const b = BENCH_BY_ID.get(id) ?? LLM_BENCHES[0];
  const pick = (v: string) => { setId(v); setProv('all'); setAll(false); };

  const providers = useMemo(() => [...new Set(b.rows.map(rowProvider).filter(Boolean))].sort((x, y) => x.localeCompare(y)), [b]);
  const rows = useMemo(() => {
    let r = b.rows.filter((row) => (prov === 'all' || rowProvider(row) === prov) && (!q || `${displayName(row)} ${rowProvider(row)} ${row.raw}`.toLowerCase().includes(q.toLowerCase())));
    if (sort === 'price') r = [...r].sort((x, y) => (pr(x) ?? Infinity) - (pr(y) ?? Infinity));
    if (sort === 'value') r = [...r].sort((x, y) => (value(b, y) ?? -1) - (value(b, x) ?? -1));
    return r;
  }, [b, prov, q, sort]);

  const scores = b.rows.map((r) => r.score);
  const lo = Math.min(...scores);
  const hi = Math.max(...scores);
  const frac = (s: number) => {
    if (b.unit === '%') return b.higherIsBetter ? s / 100 : s / Math.max(hi, 1);
    return 0.08 + ((s - lo) / (hi - lo || 1)) * 0.92;
  };
  const shown = all ? rows : rows.slice(0, TOP);
  const host = useRef<HTMLDivElement>(null);
  const on = useReveal(host, 0.15);
  const first = useFirstPass(on);
  useFlip(host, `${b.id}|${sort}|${prov}|${q}|${shown.map((r) => r.modelId ?? r.raw).join(',')}`);
  const fmt = (v: number) => fmtScore(b, v);

  return (
    <div className="bx-box">
      <CatTabs value={b.category} onChange={(c) => pick(LLM_BENCHES.find((x) => x.category === c)?.id ?? id)} benches={LLM_BENCHES} />
      <div className="bx-box-body">
        <div className="bx-money-head">
          <div className="bx-money-title">
            <h3 className="bx-h3">{b.name}</h3>
            <BenchSeg value={b.id} onChange={pick} benches={LLM_BENCHES.filter((x) => x.category === b.category)} />
          </div>
          <BenchMeta b={b} />
        </div>
        <div className="bx-controls bx-controls-top">
          <input className="bx-input bx-search" placeholder="search models" value={q} onChange={(e) => setQ(e.target.value)} aria-label="search models" />
          <select className="bx-input bx-select" value={prov} onChange={(e) => setProv(e.target.value)} aria-label="filter by provider">
            <option value="all">all providers</option>
            {providers.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="bx-seg" role="radiogroup" aria-label="sort">
            {(['score', 'price', 'value'] as Sort[]).map((s) => (
              <button key={s} role="radio" aria-checked={sort === s} className={sort === s ? 'bx-seg-on' : ''} onClick={() => setSort(s)}>{s === 'value' ? 'value' : s}</button>
            ))}
          </div>
        </div>
        <div className="bx-rows bx-flip-host" ref={host} role="table" aria-label={`${b.name} leaderboard`}>
          <div className="bx-row bx-row-head" role="row">
            <span role="columnheader">#</span>
            <span role="columnheader">model</span>
            <span role="columnheader" className="bx-col-bar" />
            <span role="columnheader" className="bx-num"><span className="bx-hl-long">{b.unit === '%' ? b.metric.split(',')[0] : 'score'}</span><span className="bx-hl-short">score</span></span>
            <span role="columnheader" className="bx-num bx-col-price">{sort === 'value' ? (b.higherIsBetter ? 'points per $' : 'clean points per $') : 'per 1M in / out'}</span>
          </div>
          {shown.map((r, i) => {
            const m = r.modelId ? MODEL_BY_ID.get(r.modelId) : undefined;
            const v = value(b, r);
            const inner = (
              <>
                <span className="bx-rank">{r.rank}</span>
                <span className="bx-name">
                  <span className="bx-name-main">{displayName(r)}</span>
                  <span className="bx-name-sub">{rowSub(r, [!m && 'not priced'])}</span>
                </span>
                <span className="bx-col-bar"><Bar frac={frac(r.score)} on={on} delay={first ? i * 45 : 0} /></span>
                <CountUp className="bx-num bx-score" value={r.score} fmt={fmt} play={on} delay={first ? i * 45 : 0} />
                <span className="bx-num bx-col-price bx-price">
                  {sort === 'value' ? (v === null ? '' : v.toFixed(v < 10 ? 1 : 0)) : m ? `${fmtPrice(m.inPrice)} / ${fmtPrice(m.outPrice)}` : ''}
                </span>
              </>
            );
            return m ? (
              <button key={r.modelId ?? r.raw} data-flip={r.modelId ?? r.raw} role="row" className={`bx-row bx-row-btn${selected === m.id ? ' bx-row-sel' : ''}`} onClick={() => onOpen(m.id)}>{inner}</button>
            ) : (
              <div key={r.raw} data-flip={r.raw} role="row" className="bx-row bx-row-dim">{inner}</div>
            );
          })}
          {!shown.length && <p className="bx-empty">nothing matches that.</p>}
        </div>
        {rows.length > TOP && (
          <button className="bx-more" onClick={() => setAll((a) => !a)}>{all ? 'show top 15' : `show all ${rows.length}`}</button>
        )}
      </div>
    </div>
  );
}

function pr(r: Row) {
  const m = r.modelId ? MODEL_BY_ID.get(r.modelId) : undefined;
  return m ? blended(m) : null;
}
