import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { dayKey, daysIn, monthLabel, parseDay, weekday, type YM } from './lib';

const WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

type Props = {
  ym: YM;
  today: string;
  open: Set<string>;
  selected: string | null;
  loading: boolean;
  dir: number;
  canPrev: boolean;
  canNext: boolean;
  onPage: (n: number) => void;
  onSelect: (day: string) => void;
};

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M7.5 2.5 4 6l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export default function MonthGrid({ ym, today, open, selected, loading, dir, canPrev, canNext, onPage, onSelect }: Props) {
  const n = daysIn(ym);
  const lead = weekday(ym.y, ym.m, 1);
  const first = [...Array(n)].map((_, i) => dayKey(ym.y, ym.m, i + 1)).find((k) => open.has(k));
  const [focus, setFocus] = useState<string | null>(null);
  const kbd = useRef(false);
  const grid = useRef<HTMLDivElement>(null);

  const inMonth = focus && focus.startsWith(dayKey(ym.y, ym.m, 1).slice(0, 7));
  const tabDay = (inMonth && focus) || (selected?.startsWith(dayKey(ym.y, ym.m, 1).slice(0, 7)) && selected) || first || (today.startsWith(dayKey(ym.y, ym.m, 1).slice(0, 7)) ? today : dayKey(ym.y, ym.m, 1));

  useEffect(() => {
    if (!kbd.current || !focus) return;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${focus}"]`)?.focus();
  }, [focus, ym.y, ym.m]);

  function move(e: KeyboardEvent) {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const cur = parseDay(tabDay);
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const d = e.key === 'PageUp' ? -1 : 1;
      if (d < 0 ? canPrev : canNext) onPage(d);
      return;
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      kbd.current = true;
      setFocus(dayKey(ym.y, ym.m, e.key === 'Home' ? 1 : n));
      return;
    }
    if (!(e.key in step)) return;
    e.preventDefault();
    const t = new Date(Date.UTC(cur.y, cur.m - 1, cur.d + step[e.key]));
    const next = { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
    const delta = (next.y - ym.y) * 12 + (next.m - ym.m);
    if (delta !== 0) {
      if (delta < 0 ? !canPrev : !canNext) return;
      onPage(delta);
    }
    kbd.current = true;
    setFocus(dayKey(next.y, next.m, next.d));
  }

  return (
    <div className="bk-cal">
      <div className="bk-head">
        <span className="bk-month" aria-live="polite">{monthLabel(ym)}</span>
        <span className="bk-pager">
          <button type="button" className="bk-icon" onClick={() => onPage(-1)} disabled={!canPrev} aria-label="previous month"><Chevron /></button>
          <button type="button" className="bk-icon" onClick={() => onPage(1)} disabled={!canNext} aria-label="next month"><Chevron flip /></button>
        </span>
      </div>
      <div className="bk-week" aria-hidden="true">{WEEK.map((w) => <span key={w}>{w.slice(0, 2)}</span>)}</div>
      <div className="bk-clip">
        <div
          key={`${ym.y}-${ym.m}`}
          ref={grid}
          className="bk-days"
          data-dir={dir > 0 ? 'next' : dir < 0 ? 'prev' : undefined}
          role="grid"
          aria-label={monthLabel(ym)}
          aria-busy={loading || undefined}
          onKeyDown={move}
          onPointerDown={() => { kbd.current = false; }}
        >
          {[...Array(lead)].map((_, i) => <span key={`l${i}`} className="bk-pad" />)}
          {[...Array(n)].map((_, i) => {
            const k = dayKey(ym.y, ym.m, i + 1);
            const ok = !loading && open.has(k);
            return (
              <button
                key={k}
                type="button"
                data-day={k}
                className="bk-day"
                data-open={ok || undefined}
                data-skel={loading || undefined}
                data-today={k === today || undefined}
                aria-pressed={selected === k}
                aria-disabled={!ok}
                aria-label={`${k}${ok ? ', times available' : ', no times'}${k === today ? ', today' : ''}`}
                tabIndex={k === tabDay ? 0 : -1}
                onFocus={() => setFocus(k)}
                onClick={() => ok && onSelect(k)}
                onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && ok) { e.preventDefault(); onSelect(k); } }}
              >
                <span>{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
