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
.lfp-logo { display: inline-flex; align-items: center; gap: 0.22em; letter-spacing: -0.03em; }
.lfp-logo svg { width: 1.18em; height: 1.18em; flex-shrink: 0; }
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
.lfp-wait { height: 1px; margin-top: 48px; background: var(--rule); }
.lfp-settle .audit-title, .lfp-settle .lf-root .translate-y-6 { opacity: 1 !important; transform: none !important; transition: none !important; }
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
  const [settle, setSettle] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setSettle(false), 1000);
    return () => window.clearTimeout(t);
  }, []);

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
      <div className={settle ? 'lfp lfp-settle' : 'lfp'}>
        <div className="lfp-edge">
          <LeanFetchHero
            actions={[
              { label: 'scan a repo', href: '/leanfetch', primary: true, onClick: tabLink('scan') },
              { label: 'benchmarks', href: '/leanfetch?view=benchmarks', onClick: tabLink('benchmarks') },
              { label: 'read the code', href: 'https://github.com/ronnielgandhe/leanfetch', external: true },
            ]}
          />
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
      </div>
    </PageShell>
  );
}
