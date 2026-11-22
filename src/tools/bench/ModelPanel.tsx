import { useEffect, useRef } from 'react';
import { MODEL_BY_ID, SOURCES, blended, fmtDate, fmtPrice, fmtScore, fmtTokens, modelBenches } from './data';

export default function ModelPanel({ id, onClose }: { id: string | null; onClose: () => void }) {
  const m = id ? MODEL_BY_ID.get(id) : undefined;
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!m) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.({ preventScroll: true }); };
  }, [m, onClose]);
  if (!m) return null;
  const rows = modelBenches(m.id);
  const srcName = (sid: string) => SOURCES.find((s) => s.id === sid)?.name ?? sid;

  return (
    <div className="bx-panel-wrap" role="dialog" aria-modal="true" aria-label={`${m.name} details`}>
      <button className="bx-scrim" aria-label="close" tabIndex={-1} onClick={onClose} />
      <aside className="bx-panel">
        <div className="bx-panel-head">
          <span className="bx-label">{m.provider}</span>
          <button ref={closeRef} className="bx-x" onClick={onClose} aria-label="close">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
        </div>
        <h3 className="bx-panel-title">{m.name}</h3>
        <p className="bx-panel-id">{m.id}</p>

        <div className="bx-stats">
          <div><span className="bx-stat">{fmtPrice(m.inPrice)}</span><span className="bx-label">input / 1M</span></div>
          <div><span className="bx-stat">{fmtPrice(m.outPrice)}</span><span className="bx-label">output / 1M</span></div>
          <div><span className="bx-stat">{fmtPrice(blended(m))}</span><span className="bx-label">blended 3:1</span></div>
          <div><span className="bx-stat">{m.context ? fmtTokens(m.context) : 'n/a'}</span><span className="bx-label">context</span></div>
        </div>
        <p className="bx-fine">{m.released ? `released ${fmtDate(m.released)}` : `on openrouter since ${fmtDate(m.added)}`}{m.open ? ' · open weights' : ''}</p>

        <span className="bx-label bx-gap">benchmarks</span>
        {rows.length ? (
          <div className="bx-panel-rows">
            {rows.map(({ bench, row, of }, i) => {
              const pos = of > 1 ? 1 - (row.rank - 1) / (of - 1) : 1;
              return (
                <div key={bench.id} className="bx-panel-row">
                  <div className="bx-panel-row-top">
                    <a href={bench.url} target="_blank" rel="noopener noreferrer" className="bx-panel-bench">{bench.name}</a>
                    <span className="bx-score">{fmtScore(bench, row.score)}</span>
                  </div>
                  <div className="bx-rankbar" aria-hidden="true" style={{ animationDelay: `${i * 60}ms` }}><span className="bx-rankbar-tick" style={{ '--x': `${pos * 100}%`, animationDelay: `${120 + i * 60}ms` } as React.CSSProperties} /></div>
                  <div className="bx-panel-row-sub">
                    <span>rank {row.rank} of {of}</span>
                    <span>{row.variant ? `${row.variant} · ` : ''}{srcName(row.src)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="bx-empty">no public benchmark rows matched this model yet.</p>}

        <div className="bx-panel-links">
          <a className="bx-link" href={`https://openrouter.ai/${m.id}`} target="_blank" rel="noopener noreferrer">pricing on openrouter</a>
        </div>
      </aside>
    </div>
  );
}
