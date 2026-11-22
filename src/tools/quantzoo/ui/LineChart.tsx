import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { drawdownSeries } from '../engine/metrics.ts';
import { niceDate, niceDateTime, pct, usd } from './format.ts';

export interface ChartLine {
  key: string;
  label: string;
  dates: string[];
  values: number[];
  tone: 'ink' | 'grey' | 'ghost' | 'bench' | 'up' | 'down';
}

export type RangeId = '1m' | '3m' | 'ytd' | '1y' | '5y' | 'max';

interface Props {
  lines: ChartLine[];
  focus: string;
  view?: 'equity' | 'drawdown';
  log?: boolean;
  height?: number;
  strip?: boolean;
  hero?: boolean;
  heroLabel?: string;
  ranges?: RangeId[];
  range?: RangeId;
  onRange?: (r: RangeId) => void;
  oos?: string;
  synthUntil?: string;
  markers?: { date: string; label: string }[];
  intraday?: boolean;
  legend?: boolean;
  ariaLabel: string;
  startWord?: string;
}

const N = 640;
const STRIP = 56;
const PAD_L = 0;
const PAD_R = 0;
const PAD_T = 14;
const AXIS_B = 22;

const toMs = (d: string) => Date.parse(d.length === 10 ? d + 'T00:00:00Z' : d);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function reducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function rangeStart(r: RangeId, last: number, first: number): number {
  const d = new Date(last);
  if (r === 'max') return first;
  if (r === 'ytd') return Math.max(first, Date.UTC(d.getUTCFullYear(), 0, 1));
  const days = { '1m': 30.4, '3m': 91.3, '1y': 365.25, '5y': 1826 }[r];
  return Math.max(first, last - days * 86400000);
}

function sample(ms: number[], values: number[], times: number[]): Float64Array {
  const out = new Float64Array(times.length);
  let j = 0;
  for (let k = 0; k < times.length; k++) {
    while (j + 1 < ms.length && ms[j + 1] <= times[k]) j++;
    out[k] = ms.length && ms[0] <= times[k] + 1 ? values[j] : NaN;
  }
  return out;
}

function niceTicks(lo: number, hi: number, count: number, log: boolean): number[] {
  if (log && lo > 0) {
    const out: number[] = [];
    for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) {
      for (const m of [1, 2, 5]) {
        const v = m * 10 ** e;
        if (v >= lo && v <= hi) out.push(v);
      }
    }
    return out.length > 6 ? out.filter((v) => String(v).startsWith('1')) : out;
  }
  const span = hi - lo || 1;
  const raw = span / count;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Number(v.toPrecision(10)));
  return out;
}

function timeTicks(t0: number, t1: number, intraday: boolean): { t: number; label: string }[] {
  const span = t1 - t0;
  const day = 86400000;
  const out: { t: number; label: string }[] = [];
  const a = new Date(t0);
  if (span > 3 * 365 * day) {
    const yrs = span / (365.25 * day);
    const step = yrs > 16 ? 5 : yrs > 8 ? 2 : 1;
    for (let y = a.getUTCFullYear() + 1; ; y++) {
      const t = Date.UTC(y, 0, 1);
      if (t > t1) break;
      if (y % step === 0) out.push({ t, label: String(y) });
    }
  } else if (span > 75 * day && !intraday) {
    const months = span / (30.4 * day);
    const step = months > 24 ? 6 : months > 10 ? 3 : 1;
    for (let m = a.getUTCMonth() + 1, y = a.getUTCFullYear(); ; m++) {
      const t = Date.UTC(y + Math.floor(m / 12), m % 12, 1);
      if (t > t1) break;
      if ((m % 12) % step === 0) out.push({ t, label: niceDate(new Date(t).toISOString().slice(0, 10), m % 12 === 0).replace(' 1', '') });
    }
  } else {
    const step = Math.max(1, Math.round(span / day / 6));
    for (let t = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate() + 1); t <= t1; t += step * day) out.push({ t, label: niceDate(new Date(t).toISOString().slice(0, 10), false) });
  }
  return out;
}

interface Frame {
  ys: Float64Array[];
  dd: Float64Array;
}

export default function LineChart(props: Props) {
  const { lines, focus, view = 'equity', log = false, height = 300, strip = true, hero = false, ranges, range = 'max', onRange, oos, synthUntil, markers, intraday = false, legend = false } = props;
  const wrap = useRef<HTMLDivElement>(null);
  const clipId = useId().replace(/:/g, '');
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.max(260, Math.round(el.clientWidth))));
    ro.observe(el);
    setWidth(Math.max(260, Math.round(el.clientWidth)));
    return () => ro.disconnect();
  }, []);

  const prepared = useMemo(
    () =>
      lines.map((l) => {
        const ms = l.dates.map(toMs);
        const vals = view === 'drawdown' ? drawdownSeries(l.values) : l.values;
        return { ...l, ms, vals, dd: drawdownSeries(l.values) };
      }),
    [lines, view],
  );
  const focusLine = prepared.find((l) => l.key === focus) ?? prepared[prepared.length - 1];

  const domain = useMemo(() => {
    let first = Infinity;
    let last = -Infinity;
    for (const l of prepared) {
      if (!l.ms.length || l.tone === 'ghost') continue;
      first = Math.min(first, l.ms[0]);
      last = Math.max(last, l.ms[l.ms.length - 1]);
    }
    if (!Number.isFinite(first)) first = last = Date.now();
    const t0 = rangeStart(range, last, first);
    return { t0, t1: last };
  }, [prepared, range]);

  const times = useMemo(() => Array.from({ length: N }, (_, k) => domain.t0 + ((domain.t1 - domain.t0) * k) / (N - 1)), [domain]);

  const target = useMemo(() => {
    const raw = prepared.map((l) => sample(l.ms, l.vals, times));
    const dd = focusLine ? sample(focusLine.ms, focusLine.dd, times) : new Float64Array(N);
    let lo = Infinity;
    let hi = -Infinity;
    raw.forEach((arr, i) => {
      if (prepared[i].tone === 'ghost' && view === 'equity') return;
      for (const v of arr) if (Number.isFinite(v)) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    });
    if (!Number.isFinite(lo)) {
      lo = 0;
      hi = 1;
    }
    if (view === 'drawdown') {
      hi = 0;
      lo = Math.min(lo, -0.05);
    }
    const useLog = log && view === 'equity' && lo > 0;
    if (!useLog) {
      const pad = (hi - lo) * 0.06 || Math.abs(hi) * 0.02 || 1;
      lo -= view === 'drawdown' ? pad : pad;
      hi += view === 'drawdown' ? 0 : pad;
    }
    let ddLo = 0;
    for (const v of dd) if (Number.isFinite(v)) ddLo = Math.min(ddLo, v);
    if (focusLine) for (let i = 0; i < focusLine.ms.length; i++) if (focusLine.ms[i] >= times[0]) ddLo = Math.min(ddLo, focusLine.dd[i]);
    return { raw, dd, lo, hi, useLog, ddLo: Math.min(ddLo, -0.05) };
  }, [prepared, times, focusLine, view, log]);

  const mainH = height - (strip ? STRIP + 10 : 0) - AXIS_B;
  const plotW = width - PAD_L - PAD_R;
  const yOf = (v: number, lo = target.lo, hi = target.hi, useLog = target.useLog) => {
    if (!Number.isFinite(v)) return NaN;
    if (useLog) return PAD_T + (1 - (Math.log(Math.max(v, 1e-9)) - Math.log(lo)) / (Math.log(hi) - Math.log(lo))) * (mainH - PAD_T);
    return PAD_T + (1 - (v - lo) / (hi - lo)) * (mainH - PAD_T);
  };
  const xOfK = (k: number) => PAD_L + (k / (N - 1)) * plotW;
  const xOfT = (t: number) => PAD_L + ((t - domain.t0) / Math.max(1, domain.t1 - domain.t0)) * plotW;

  const targetFrame: Frame = useMemo(() => {
    const ys = target.raw.map((arr) => Float64Array.from(arr, (v) => yOf(v)));
    const dd = Float64Array.from(target.dd, (v) => (Number.isFinite(v) ? (v / target.ddLo) * STRIP : NaN));
    return { ys, dd };
  }, [target, width, height, strip]);

  const flat = (f: Frame): Frame => ({ ys: f.ys.map((ys) => Float64Array.from(ys, (y) => (Number.isFinite(y) ? mainH : NaN))), dd: Float64Array.from(f.dd, (v) => (Number.isFinite(v) ? 0 : NaN)) });
  const [frame, setFrame] = useState<Frame>(() => flat(targetFrame));
  const frameRef = useRef<Frame>(frame);
  const anim = useRef<number>(0);
  const keys = useRef<string[]>(lines.map((l) => l.key));

  useEffect(() => {
    const from = frameRef.current;
    const prevKeys = keys.current;
    keys.current = lines.map((l) => l.key);
    if (reducedMotion() || from.ys.length === 0) {
      frameRef.current = targetFrame;
      setFrame(targetFrame);
      return;
    }
    const start = performance.now();
    const dur = 560;
    const fromYs = targetFrame.ys.map((ty, i) => {
      const pi = prevKeys.indexOf(lines[i].key);
      const src = pi >= 0 ? from.ys[pi] : from.ys[Math.min(i, from.ys.length - 1)];
      return src && src.length === ty.length ? src : ty;
    });
    cancelAnimationFrame(anim.current);
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = ease(p);
      const mix = (a: Float64Array, b: Float64Array) => Float64Array.from(b, (bv, k) => {
        const av = a[k];
        if (!Number.isFinite(av)) return bv;
        if (!Number.isFinite(bv)) return p < 1 ? av : NaN;
        return av + (bv - av) * e;
      });
      const next = { ys: targetFrame.ys.map((ty, i) => mix(fromYs[i], ty)), dd: mix(from.dd.length === targetFrame.dd.length ? from.dd : targetFrame.dd, targetFrame.dd) };
      frameRef.current = next;
      setFrame(next);
      if (p < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(anim.current);
  }, [targetFrame]);

  const pathOf = (ys: Float64Array) => {
    let d = '';
    let pen = false;
    for (let k = 0; k < ys.length; k++) {
      const y = ys[k];
      if (!Number.isFinite(y)) {
        pen = false;
        continue;
      }
      d += `${pen ? 'L' : 'M'}${xOfK(k).toFixed(1)},${y.toFixed(1)}`;
      pen = true;
    }
    return d;
  };
  const ddTop = mainH + 10;
  const ddPath = (() => {
    let d = '';
    let started = -1;
    let lastK = -1;
    for (let k = 0; k < frame.dd.length; k++) {
      const v = frame.dd[k];
      if (!Number.isFinite(v)) continue;
      if (started < 0) {
        started = k;
        d += `M${xOfK(k).toFixed(1)},${ddTop}`;
      }
      d += `L${xOfK(k).toFixed(1)},${(ddTop + v).toFixed(1)}`;
      lastK = k;
    }
    if (started >= 0) d += `L${xOfK(lastK).toFixed(1)},${ddTop}Z`;
    return d;
  })();

  const visibleIdx = useMemo(() => {
    if (!focusLine) return { a: 0, b: -1 };
    let a = focusLine.ms.findIndex((t) => t >= domain.t0);
    if (a < 0) a = focusLine.ms.length - 1;
    return { a: Math.max(0, a > 0 && focusLine.ms[a] > domain.t0 ? a - 1 : a), b: focusLine.ms.length - 1 };
  }, [focusLine, domain]);

  const pickIndex = (clientX: number) => {
    const el = wrap.current;
    if (!el || !focusLine) return;
    const rect = el.getBoundingClientRect();
    const t = domain.t0 + ((clientX - rect.left - PAD_L) / plotW) * (domain.t1 - domain.t0);
    let lo = visibleIdx.a;
    let hi = visibleIdx.b;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (focusLine.ms[mid] <= t) lo = mid;
      else hi = mid - 1;
    }
    setHover(lo);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!focusLine) return;
    const span = visibleIdx.b - visibleIdx.a;
    const stepN = Math.max(1, Math.round(span / (e.shiftKey ? 10 : 60)));
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setHover((h) => Math.min(visibleIdx.b, Math.max(visibleIdx.a, (h ?? visibleIdx.b) + (e.key === 'ArrowLeft' ? -stepN : stepN))));
    } else if (e.key === 'Escape') setHover(null);
  };

  const yTicks = niceTicks(target.lo, target.hi, 4, target.useLog);
  const xTicks = timeTicks(domain.t0, domain.t1, intraday);
  const fmtY = (v: number) => (view === 'drawdown' ? pct(v, 0) : usd(v));

  const hi = hover != null && focusLine ? hover : null;
  const startVal = focusLine ? focusLine.values[visibleIdx.a] : 0;
  const readIdx = hi ?? (focusLine ? focusLine.values.length - 1 : 0);
  const readVal = focusLine ? focusLine.values[readIdx] : 0;
  const readDate = focusLine ? focusLine.dates[readIdx] : '';
  const change = readVal - startVal;
  const changePct = startVal ? readVal / startVal - 1 : 0;
  const readDd = focusLine ? focusLine.dd[readIdx] : 0;
  const fmtDate = (d: string) => (intraday ? niceDateTime(d) : niceDate(d));
  const rangeWord: Record<RangeId, string> = { '1m': 'past month', '3m': 'past 3 months', ytd: 'this year', '1y': 'past year', '5y': 'past 5 years', max: 'since start' };

  const hoverX = hi != null && focusLine ? xOfT(focusLine.ms[hi]) : null;
  const hoverY = hi != null && focusLine ? yOf(view === 'drawdown' ? focusLine.dd[hi] : focusLine.values[hi]) : null;

  return (
    <div className="qz-chart">
      {hero && focusLine && (
        <div className="qz-hero" aria-live="polite">
          <div className="qz-label">{props.heroLabel ?? 'value of $10k'}</div>
          <div className="qz-hero-num">{usd(readVal)}</div>
          <div className="qz-hero-sub">
            <span className={change < 0 ? 'qz-loss' : 'qz-gain'}>
              {change >= 0 ? '+' : '-'}
              {usd(Math.abs(change))} ({pct(changePct, 1, true)})
            </span>
            <span className="qz-hero-when">{hi != null ? `${fmtDate(readDate)}, ${props.startWord ?? rangeWord[range]}` : props.startWord ?? rangeWord[range]}</span>
            {readDd < -0.0005 && <span className="qz-loss">{pct(readDd, 1)} from its high</span>}
          </div>
        </div>
      )}
      {ranges && onRange && (
        <div className="qz-chips" role="tablist" aria-label="time range">
          {ranges.map((r) => (
            <button key={r} role="tab" aria-selected={r === range} className={r === range ? 'qz-chip qz-chip-on' : 'qz-chip'} onClick={() => onRange(r)}>
              {r}
            </button>
          ))}
        </div>
      )}
      <div
        ref={wrap}
        className="qz-plot"
        style={{ height }}
        tabIndex={0}
        role="img"
        aria-label={props.ariaLabel}
        onPointerMove={(e) => pickIndex(e.clientX)}
        onPointerDown={(e) => pickIndex(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <clipPath id={clipId}>
              <rect x={0} y={0} width={width} height={mainH + 1} />
            </clipPath>
          </defs>
          {synthUntil && toMs(synthUntil) > domain.t0 && (
            <g>
              <rect x={PAD_L} y={0} width={Math.max(0, Math.min(plotW, xOfT(toMs(synthUntil)) - PAD_L))} height={mainH} className="qz-synth" />
            </g>
          )}
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={PAD_L} x2={width - PAD_R} y1={yOf(v)} y2={yOf(v)} className="qz-grid" />
              <text x={PAD_L} y={yOf(v) - 4} className="qz-tick qz-tick-bg">
                {fmtY(v)}
              </text>
            </g>
          ))}
          {oos && toMs(oos) > domain.t0 && toMs(oos) < domain.t1 && (
            <g>
              <line x1={xOfT(toMs(oos))} x2={xOfT(toMs(oos))} y1={0} y2={mainH} className="qz-split" />
              <text x={xOfT(toMs(oos)) - 6} y={PAD_T + 2} textAnchor="end" className="qz-tick qz-tick-bg">2020 on, scored separately</text>
            </g>
          )}
          <g clipPath={`url(#${clipId})`}>
          {frame.ys.map((ys, i) => {
            const l = lines[i];
            if (!l) return null;
            const isFocus = l.key === focus;
            const cls = isFocus ? (view === 'drawdown' ? 'qz-line-loss' : l.tone === 'up' || l.tone === 'down' ? `qz-line-${l.tone}` : 'qz-line-ink') : `qz-line-${l.tone}`;
            const d = pathOf(ys);
            if (isFocus && view === 'drawdown' && d) {
              const y0 = yOf(0);
              const firstK = ys.findIndex((y) => Number.isFinite(y));
              let lastK = ys.length - 1;
              while (lastK > 0 && !Number.isFinite(ys[lastK])) lastK--;
              return (
                <g key={l.key}>
                  <path d={`${d}L${xOfK(lastK).toFixed(1)},${y0.toFixed(1)}L${xOfK(firstK).toFixed(1)},${y0.toFixed(1)}Z`} className="qz-dd-area" />
                  <path d={d} className={cls} />
                </g>
              );
            }
            return <path key={l.key} d={d} className={cls} />;
          })}
          </g>
          {markers?.map((m, i) => {
            const t = toMs(m.date);
            if (t < domain.t0 || t > domain.t1 + 86400000 * 7) return null;
            const x = Math.min(width - PAD_R - 1, xOfT(t));
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={mainH - 8} y2={mainH} className="qz-marker" />
              </g>
            );
          })}
          <line x1={PAD_L} x2={width - PAD_R} y1={mainH} y2={mainH} className="qz-axis" />
          {strip && (
            <g>
              <line x1={PAD_L} x2={width - PAD_R} y1={ddTop} y2={ddTop} className="qz-grid" />
              <path d={ddPath} className="qz-dd" />
              <text x={PAD_L} y={ddTop + STRIP - 4} className="qz-tick">
                below its best day, worst {pct(target.ddLo, 0)}
              </text>
            </g>
          )}
          {xTicks.map((t) => {
            const x = xOfT(t.t);
            if (x < 24 || x > width - 24) return null;
            return (
              <text key={t.t} x={x} y={height - 6} textAnchor="middle" className="qz-tick">
                {t.label}
              </text>
            );
          })}
          {hoverX != null && (
            <g>
              <line x1={hoverX} x2={hoverX} y1={0} y2={strip ? ddTop + STRIP : mainH} className="qz-cross" />
              {hoverY != null && Number.isFinite(hoverY) && <circle cx={hoverX} cy={hoverY} r={3} className="qz-dot" />}
            </g>
          )}
        </svg>
        {!hero && hi != null && focusLine && hoverX != null && (
          <div className="qz-readout" style={{ left: Math.min(Math.max(hoverX, 70), width - 70) }}>
            <span>{fmtDate(focusLine.dates[hi])}</span>
            <b>{view === 'drawdown' ? pct(focusLine.dd[hi], 1) : usd(focusLine.values[hi])}</b>
          </div>
        )}
      </div>
      {synthUntil && toMs(synthUntil) > domain.t0 && <p className="qz-synth-note">shaded: synthetic 3x history built from the index, before the real funds launched on {niceDate(synthUntil)}</p>}
      {legend && (
        <div className="qz-legend">
          {lines
            .filter((l) => l.tone !== 'ghost')
            .map((l) => (
              <span key={l.key} className={l.key === focus ? `qz-leg qz-leg-ink${view === 'drawdown' ? ' qz-leg-dd' : ''}` : `qz-leg qz-leg-${l.tone}`}>
                <i />
                {l.label}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
