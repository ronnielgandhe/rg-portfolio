import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Scatter from './Scatter';
import Leaderboard, { BenchMeta, BenchSeg, CatTabs } from './Leaderboard';
import Calculator from './Calculator';
import ModelPanel from './ModelPanel';
import Speech from './Speech';
import Sources from './Sources';
import { BENCHES, MODELS, MODEL_BY_ID, SOURCES, SYNCED, blended, fmtDate, fmtPrice, fmtScore, frontier, priced, type Bench, type CategoryId, type Pt } from './data';
import { BENCH_CSS } from './styles';
import { useFlip } from './motion';

const chartBenches = BENCHES.filter((x) => x.category !== 'speech' || x.id === 'asr_en');

const DEFAULT_FOR: Record<CategoryId, string> = {
  general: 'eci', coding: 'swe_verified', agentic: 'terminal_bench', tools: 'bfcl', hallucination: 'vectara', reasoning: 'gpqa', speech: 'asr_en',
};

function pointsFor(b: Bench): Pt[] {
  if (b.id === 'asr_en') {
    return b.rows.filter((r) => typeof r.extra?.rtfx === 'number' && (r.extra.rtfx as number) > 0).map((r) => {
      const n = r.name ?? r.raw;
      return { id: r.raw, label: n.includes('/') ? n.split('/').slice(1).join('/') : n, sub: r.org ?? '', x: r.extra!.rtfx as number, y: r.score, modelId: null };
    });
  }
  return b.rows.flatMap((r) => {
    const m = r.modelId ? MODEL_BY_ID.get(r.modelId) : undefined;
    if (!priced(m)) return [];
    return [{ id: m.id, label: m.name, sub: m.provider, x: blended(m), y: r.score, modelId: m.id }];
  });
}

function MoneyChart({ selected, onOpen }: { selected: string | null; onOpen: (id: string) => void }) {
  const [cat, setCat] = useState<CategoryId>('coding');
  const [benchId, setBenchId] = useState(DEFAULT_FOR.coding);
  const inCat = chartBenches.filter((x) => x.category === cat);
  const b = BENCHES.find((x) => x.id === benchId) ?? inCat[0];
  const speech = b.id === 'asr_en';
  const pts = useMemo(() => pointsFor(b), [b]);
  const front = useMemo(() => frontier(pts, !speech, b.higherIsBetter).sort((p, q) => (speech ? q.x - p.x : p.x - q.x)), [pts, speech, b]);
  const listRef = useRef<HTMLOListElement>(null);
  useFlip(listRef, `${b.id}:${front.map((p) => p.id).join(',')}`);
  const rankOf = useMemo(() => new Map(b.rows.map((r) => [r.modelId ?? r.raw, r.rank])), [b]);

  const card = (p: Pt) => {
    const m = p.modelId ? MODEL_BY_ID.get(p.modelId) : undefined;
    return (
      <>
        <span className="bx-label">{p.sub}</span>
        <span className="bx-card-name">{p.label}</span>
        <span className="bx-card-line"><span>{b.short}</span><span>{fmtScore(b, p.y)} · rank {rankOf.get(p.modelId ?? p.id)} of {b.rows.length}</span></span>
        {m ? (
          <>
            <span className="bx-card-line"><span>per 1M in / out</span><span>{fmtPrice(m.inPrice)} / {fmtPrice(m.outPrice)}</span></span>
            <span className="bx-card-line"><span>context</span><span>{m.context ? `${Math.round(m.context / 1000)}k` : 'n/a'}</span></span>
            <span className="bx-card-hint">click for every benchmark</span>
          </>
        ) : (
          <span className="bx-card-line"><span>speed</span><span>{Math.round(p.x).toLocaleString('en-US')}x realtime</span></span>
        )}
      </>
    );
  };

  return (
    <div className="bx-box bx-money">
      <CatTabs value={cat} onChange={(c) => { setCat(c); setBenchId(DEFAULT_FOR[c]); }} benches={chartBenches} />
      <div className="bx-box-body">
        <div className="bx-money-head">
          <div className="bx-money-title">
            <h3 className="bx-h3">{b.name}</h3>
            <BenchSeg value={b.id} onChange={setBenchId} benches={inCat} />
          </div>
          <BenchMeta b={b} />
        </div>
        <div className="bx-money-grid">
          <Scatter
            pts={pts}
            animKey={b.id}
            xLabel={speech ? 'speed, times faster than realtime (log)' : 'price per 1M tokens, 3 in : 1 out (log)'}
            yLabel={speech ? 'word error rate, lower is better (axis flipped)' : `${b.metric.split(',')[0]}${b.higherIsBetter ? '' : ', lower is better (axis flipped)'}`}
            xBetterLow={!speech}
            yBetterHigh={b.higherIsBetter}
            fmtX={(v) => (speech ? (v >= 1000 ? `${v / 1000}k` : `${v}x`) : `$${v < 1 ? +v.toFixed(2) : v}`)}
            fmtY={(v) => (b.unit === '%' ? `${+v.toFixed(1)}%` : String(+v.toFixed(0)))}
            selected={selected}
            onPick={(p) => p.modelId && onOpen(p.modelId)}
            card={card}
          />
          <div className="bx-front-list">
            <span className="bx-label">{speech ? 'best word error rate at each speed' : 'best score at each price'}</span>
            <p className="bx-fine">{speech ? 'open models with a published speed. api systems have no speed number, so they are in the speech section below.' : `the line on the chart. nothing to the left of a model beats it on ${b.short}.`}</p>
            <ol ref={listRef} className="bx-flip-host">
              {front.map((p) => {
                const inner = (
                  <>
                    <span className="bx-name">
                      <span className="bx-name-main">{p.label}</span>
                      <span className="bx-name-sub">{p.sub}</span>
                    </span>
                    <span className="bx-num">
                      <span className="bx-score">{fmtScore(b, p.y)}</span>
                      <span className="bx-name-sub">{speech ? `${Math.round(p.x).toLocaleString('en-US')}x` : fmtPrice(p.x)}</span>
                    </span>
                  </>
                );
                return <li key={p.id} data-flip={p.id}>{p.modelId ? <button className={`bx-front-row bx-row-btn${selected === p.modelId ? ' bx-row-sel' : ''}`} onClick={() => onOpen(p.modelId!)}>{inner}</button> : <div className="bx-front-row">{inner}</div>}</li>;
              })}
            </ol>
          </div>
        </div>
        <p className="bx-fine bx-chart-note">{pts.length} of {b.rows.length} {speech ? 'systems have a speed number' : 'models have an openrouter price and show up here'}. {speech ? 'hover or tab to a point for its numbers.' : 'the rest are in the leaderboard below. hover or tab to a point, click to see every benchmark it is in.'}</p>
      </div>
    </div>
  );
}

function readHash() {
  try { return new URLSearchParams(location.hash.slice(1)).get('m'); } catch { return null; }
}

export default function BenchHub() {
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    const m = readHash();
    if (m && MODEL_BY_ID.has(m)) setOpen(m);
  }, []);
  const onOpen = useCallback((id: string) => {
    setOpen(id);
    try { history.replaceState(null, '', `${location.pathname}${location.search}#m=${encodeURIComponent(id)}`); } catch { /* ignore */ }
  }, []);
  const onClose = useCallback(() => {
    setOpen(null);
    try { history.replaceState(null, '', location.pathname + location.search); } catch { /* ignore */ }
  }, []);

  const pricedCount = MODELS.filter(priced).length;
  const scoredCount = MODELS.filter((m) => m.scored && priced(m)).length;
  const llm = BENCHES.filter((b) => b.category !== 'speech').length;
  const speechCount = BENCHES.length - llm;

  return (
    <div className="bx">
      <style>{BENCH_CSS}</style>
      <div className="bx-intro">
        <div className="bx-hero-stats">
          <div><span className="bx-big">{pricedCount}</span><span className="bx-label">models priced</span></div>
          <div><span className="bx-big">{scoredCount}</span><span className="bx-label">with scores</span></div>
          <div><span className="bx-big">{llm}<span className="bx-big-sub"> + {speechCount}</span></span><span className="bx-label">benchmarks + speech</span></div>
          <div><span className="bx-big">{SOURCES.filter((s) => s.ok).length}</span><span className="bx-label">public sources</span></div>
        </div>
        <div className="bx-hero-foot">
          <a className="bx-link bx-small" href="#bx-sources">sources and method</a>
          <span className="bx-synced">synced {fmtDate(SYNCED)}</span>
        </div>
      </div>

      <section className="bx-section bx-section-first" aria-labelledby="bx-money">
        <h2 id="bx-money" className="bx-h2">price against quality</h2>
        <MoneyChart selected={open} onOpen={onOpen} />
      </section>

      <section className="bx-section" aria-labelledby="bx-lb">
        <h2 id="bx-lb" className="bx-h2">leaderboards</h2>
        <Leaderboard onOpen={onOpen} selected={open} />
      </section>

      <section className="bx-section" aria-labelledby="bx-cost">
        <h2 id="bx-cost" className="bx-h2">monthly cost</h2>
        <Calculator onOpen={onOpen} selected={open} />
      </section>

      {speechCount > 0 && (
        <section className="bx-section" aria-labelledby="bx-speech">
            <h2 id="bx-speech" className="bx-h2">voice</h2>
          <Speech />
        </section>
      )}

      <section className="bx-section" id="bx-sources" aria-labelledby="bx-src">
        <h2 id="bx-src" className="bx-h2">sources and method</h2>
        <Sources />
      </section>

      <footer className="bx-foot">
        <p>numbers belong to their sources. epoch ai data is cc by 4.0. prices change.</p>
      </footer>
      <ModelPanel id={open} onClose={onClose} />
    </div>
  );
}
