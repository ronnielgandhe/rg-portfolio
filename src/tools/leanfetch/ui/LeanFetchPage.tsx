import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import PageShell from '../../../components/portfolio/PageShell';
import LeanFetchHero from '../../../components/portfolio/heroes/LeanFetchHero';
import BenchHub from '../../../components/portfolio/BenchHubSlot';
import App from './App';

type View = 'scan' | 'benchmarks';
const TABS: { id: View; label: string }[] = [
  { id: 'scan', label: 'scan a repo' },
  { id: 'benchmarks', label: 'benchmarks' },
];
const FADE = 320;
const useIsoLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const CSS = `
.lfp .site-col { max-width: none; }
.lfp-edge { padding: 0; }
@media (min-width: 768px) { .lfp-edge { padding: 0 24px; } }
.lfp-tabs { display: flex; margin-top: 40px; border-bottom: 1px solid var(--rule); }
.lfp-tab { padding: 10px 20px; margin-bottom: -1px; font-size: 13px; line-height: 20px; font-weight: 500; color: var(--faint); border-bottom: 2px solid transparent; transition: color 0.2s, border-color 0.2s; }
.lfp-tab:first-child { padding-left: 0; }
.lfp-tab:hover { color: var(--text); }
.lfp-tab-on, .lfp-tab-on:hover { color: var(--ink); border-bottom-color: var(--ink); }
.lfp-wrap { position: relative; transition: height ${FADE}ms cubic-bezier(0.2, 0.8, 0.2, 1); }
.lfp-wrap[data-moving] { overflow: clip; }
.lfp-panel { transition: opacity ${FADE}ms ease; }
.lfp-wrap[data-moving] .lfp-panel[data-state='in'] { animation: lfpIn ${FADE}ms ease both; }
.lfp-panel[data-state='out'] { position: absolute; top: 0; left: 0; right: 0; opacity: 0; pointer-events: none; }
.lfp-panel[data-state='off'] { display: none; }
@keyframes lfpIn { from { opacity: 0; } to { opacity: 1; } }
.lfp-panel.lfp-edge { padding-top: 48px; }
.lfp-bd { max-width: 640px; margin: 72px 0 0; padding: 20px 0 0; border-top: 1px solid var(--rule); }
.lfp-bd p { margin: 0; font-size: 15px; line-height: 24px; color: var(--text); }
.lfp-bd a { display: inline-block; margin-top: 12px; font-size: 13px; line-height: 20px; color: var(--ink); text-decoration: underline; text-decoration-color: var(--rule); text-underline-offset: 3px; text-decoration-thickness: 1px; }
.lfp-bd a:hover { text-decoration-color: var(--ink); }
.lfp-end { height: 96px; }
.lfp-wait { height: 1px; margin-top: 48px; background: var(--rule); }
@media (prefers-reduced-motion: reduce) { .lfp-wrap, .lfp-panel { transition: none; animation: none; } }
`;

function readUrl(): View {
  try { return new URLSearchParams(location.search).get('view') === 'benchmarks' ? 'benchmarks' : 'scan'; } catch { return 'scan'; }
}

function writeUrl(to: View) {
  try {
    const url = new URL(location.href);
    if (to === 'benchmarks') url.searchParams.set('view', 'benchmarks'); else url.searchParams.delete('view');
    url.searchParams.delete('at');
    history.replaceState(history.state, '', url);
  } catch { /* noop */ }
}

export default function LeanFetchPage({ initial = 'scan' }: { initial?: View }) {
  const [view, setView] = useState<View | null>(initial);
  const [prev, setPrev] = useState<View | null>(null);
  const [seen, setSeen] = useState<Record<View, boolean>>({ scan: initial === 'scan', benchmarks: initial === 'benchmarks' });
  const wrap = useRef<HTMLDivElement>(null);
  const panels = useRef<Record<View, HTMLDivElement | null>>({ scan: null, benchmarks: null });
  const timer = useRef(0);
  useEffect(() => {
    const v = readUrl();
    setView(v);
    setSeen((s) => ({ ...s, [v]: true }));
    return () => window.clearTimeout(timer.current);
  }, []);

  const go = (to: View, scroll = false) => {
    if (scroll) document.getElementById('lfp-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (view) writeUrl(to);
    if (!view || to === view) return;
    const w = wrap.current;
    if (w) { w.style.height = `${w.offsetHeight}px`; w.setAttribute('data-moving', ''); }
    setPrev(view);
    setView(to);
    setSeen((s) => ({ ...s, [to]: true }));
  };

  useIsoLayout(() => {
    const w = wrap.current;
    const p = view && panels.current[view];
    if (!prev || !w || !p) return;
    w.style.height = `${p.offsetHeight}px`;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      w.style.height = '';
      w.removeAttribute('data-moving');
      setPrev(null);
    }, FADE + 20);
  }, [view, prev]);

  const state = (id: View) => (id === view ? 'in' : id === prev ? 'out' : 'off');
  const tabLink = (to: View) => (e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); go(to, true); };

  return (
    <PageShell activePage="projects" crumb="leanfetch" wide>
      <style>{CSS}</style>
      <div className="lfp">
        <div className="lfp-edge">
          <LeanFetchHero />
          <div id="lfp-tabs" className="lfp-tabs" role="tablist" style={{ scrollMarginTop: 96 }}>
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={view === t.id} className={view === t.id ? 'lfp-tab lfp-tab-on' : 'lfp-tab'} onClick={() => go(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={wrap} className="lfp-wrap">
          <div ref={(el) => { panels.current.scan = el; }} className="lfp-panel" data-state={state('scan')} role="tabpanel">
            <div className="lf-root bg-white text-[#1A1A1A]">
              {seen.scan && <App />}
            </div>
          </div>
          <div ref={(el) => { panels.current.benchmarks = el; }} className="lfp-panel lfp-edge" data-state={state('benchmarks')} role="tabpanel">
            {seen.benchmarks && (
              <Suspense fallback={<div className="lfp-wait" />}>
                <BenchHub />
              </Suspense>
            )}
          </div>
        </div>
        <div className="lfp-edge">
          <div className="lfp-bd">
            <p>{view === 'benchmarks'
              ? 'public benchmark scores joined to what each model costs per token, so you can pick a job, see who is good at it, and find the cheapest model that clears your bar. every number links back to its source.'
              : 'the scanner reads your code without running it. static analysis finds every llm call site, flags waste patterns like a call inside a loop, no output cap, or a top-tier model on a simple task, and puts a monthly dollar figure on each one. nothing is stored.'}</p>
            <a href="https://github.com/ronnielgandhe/leanfetch" target="_blank" rel="noopener noreferrer">read the code</a>
          </div>
          <div className="lfp-end" />
        </div>
      </div>
    </PageShell>
  );
}
