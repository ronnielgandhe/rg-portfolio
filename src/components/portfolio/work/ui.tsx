import { useEffect, useRef, useState } from 'react';
import type { Highlight, Stat } from './data';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function CountUp({ stat }: { stat: Stat }) {
  const d = stat.decimals ?? 0;
  const [v, setV] = useState(stat.value);
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current || reduced()) return;
    ran.current = true;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setV(stat.value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [stat.value]);
  return <>{v.toFixed(d)}{stat.suffix ?? ''}</>;
}

export function Arrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2.5 7.5l5-5M3.5 2.5h4v4" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function splitHead(text: string) {
  const at = text.indexOf(': ');
  return at > 0 && at < 60 ? [text.slice(0, at), text.slice(at + 2)] : ['', text];
}

export function HighlightRow({ h, i }: { h: Highlight; i: number }) {
  const [head, rest] = splitHead(h.text);
  return (
    <li className={`wk-row${h.draft ? ' wk-draft' : ''}`} style={{ ['--i' as string]: Math.min(i, 14) }}>
      <span className="wk-text">{head ? <><span className="wk-head">{head}</span>{' '}{rest}</> : h.text}</span>
      {h.links && (
        <span className="wk-links">
          {h.links.map((l) => (
            <a key={l.href} className="wk-out" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}<Arrow /></a>
          ))}
        </span>
      )}
    </li>
  );
}

export function useDraft() {
  const [draft, setDraft] = useState(false);
  useEffect(() => {
    setDraft(new URLSearchParams(window.location.search).get('draft') === '1');
  }, []);
  return draft;
}

export const WORK_CSS = `
  .wk { font-variant-numeric: tabular-nums; }
  .wk-label { font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
  .wk-kicker { font-size: 14px; line-height: 20px; color: var(--half); margin-bottom: 12px; }
  .wk-title { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
  .wk-lede { margin: 12px 0 0; font-size: 18px; line-height: 28px; color: var(--text); }
  @media (max-width: 520px) { .wk-title { font-size: 30px; } }
  .wk-rule { height: 1px; background: var(--rule); transform-origin: left; animation: wkDraw 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .wk-rise { animation: wkRise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; animation-delay: calc(var(--i, 0) * 40ms + 80ms); }
  .wk-rows { list-style: none; margin: 0; padding: 0; }
  .wk-row { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 14px 0; border-top: 1px solid var(--rule); animation: wkRise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; animation-delay: calc(var(--i, 0) * 35ms + 120ms); }
  .wk-text { font-size: 15px; line-height: 24px; color: var(--text); }
  .wk-head { color: var(--ink); font-weight: 500; }
  .wk-head::after { content: ' ·'; color: var(--faint); font-weight: 400; }
  .wk-links { display: flex; flex-wrap: wrap; gap: 6px 16px; }
  .wk-out { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; line-height: 18px; color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--rule); transition: border-color 0.2s; }
  .wk-out:hover { border-color: var(--ink); }
  .wk-draft .wk-text { color: var(--faint); font-style: italic; }
  .wk-draft { border-top-style: dashed; }
  @keyframes wkRise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes wkDraw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @media (prefers-reduced-motion: reduce) { .wk-rule, .wk-rise, .wk-row { animation: none; } }
`;
