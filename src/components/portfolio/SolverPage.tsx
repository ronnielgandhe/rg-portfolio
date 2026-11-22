import { useCallback, useEffect, useRef, useState } from 'react';
import PageShell from './PageShell';
import SolverHero from './heroes/SolverHero';
import Demo, { type Game } from '../../tools/solver/Demo';
import Arcs, { type ArcTrack } from '../../tools/solver/Arcs';
import { DIAGRAM_CSS, FlowDiagram } from '../../tools/solver/Diagrams';

const REPO = 'https://github.com/ronnielgandhe/game-solver-suite';

const LEDE = 'one chrome extension that solves the linkedin and nyt daily games in real time. seven puzzles solved by real algorithms, one pure core shared by the extension and this page, and a read layer that repairs itself when the sites change. no ai, no server, just vanilla js.';

const LINKEDIN: ArcTrack = {
  label: 'linkedin',
  games: [
    { id: 'queens', name: 'Queens', how: '', plays: 'double click per queen' },
    { id: 'tango', name: 'Tango', how: '', plays: 'one click sun, two clicks moon' },
    { id: 'zip', name: 'Zip', how: '', plays: 'trusted drag via chrome.debugger' },
    { id: 'sudoku', name: 'Mini Sudoku', how: '', plays: 'clicks the cell, then the digit' },
    { id: 'patches', name: 'Patches', how: '', plays: 'one trusted drag per rectangle' },
  ],
};

const NYT: ArcTrack = {
  label: 'nyt',
  games: [
    { id: 'strands', name: 'Strands', how: '', plays: 'trusted drag through each word' },
    { id: 'wordle', name: 'Wordle', how: '', plays: 'five keydowns and enter' },
  ],
};

const INSTALL = [
  'clone the repo',
  'open chrome://extensions and turn on developer mode',
  'click load unpacked and pick the folder',
  'open a game and click the icon',
];

const CODE = {
  fiber: `let st = fiber.memoizedState;
for (let i = 0; i < 20 && st; i++) {
  const val = st.memoizedState ?? st.queue?.lastRenderedState;
  if (val && predicate(val)) return val;
  st = st.next;
}
if (fiber.memoizedProps && predicate(fiber.memoizedProps)) return fiber.memoizedProps;`,
  runner: `value = await s.run();
if (value == null || value === false) error = 'nothing found';
else if ((s.validate || validate)(value) === true) ok = true;
else error = 'failed sanity check';`,
};

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll('.sx-r');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('sx-in')); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('sx-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return ref;
}

function Code({ file, children }: { file: string; children: string }) {
  return (
    <figure className="sx-code">
      <figcaption>{file}</figcaption>
      <pre><code>{children}</code></pre>
    </figure>
  );
}

function Head({ label, title, lede }: { label?: string; title?: string; lede?: string }) {
  return (
    <div className="sx-head sx-r">
      {label && <div className="sx-label">{label}</div>}
      {title && <h2 className="sx-h2">{title}</h2>}
      {lede && <p className="sx-lede">{lede}</p>}
    </div>
  );
}

export default function SolverPage() {
  const ref = useReveal();
  const [game, setGame] = useState<Game>('queens');
  const demoRef = useRef<HTMLDivElement>(null);
  const pick = useCallback((g: Game) => {
    setGame(g);
    const el = demoRef.current;
    if (el && el.getBoundingClientRect().top < 40) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  return (
    <PageShell activePage="projects" crumb="game solver suite" back={{ href: '/projects', label: 'projects' }} wide>
      <div className="sx" ref={ref}>
        <div className="site-col">
          <SolverHero lede={LEDE} actions={[{ label: 'get it on github', href: REPO, primary: true, external: true }, { label: 'how to install', href: '#install' }]} />
          <div className="sx-facts site-enter" style={{ animationDelay: '0.08s' }}>
            <div><div className="sx-fact-v">7</div><div className="sx-fact-k">puzzles solved, not read</div></div>
            <div><div className="sx-fact-v">1</div><div className="sx-fact-k">core, shared by the extension and this page</div></div>
            <div><div className="sx-fact-v">0</div><div className="sx-fact-k">dependencies</div></div>
          </div>
        </div>

        <section className="sx-section sx-wide sx-demo" ref={demoRef} style={{ scrollMarginTop: 80 }}>
          <Head lede="hit solve and the real solver runs on a fresh board right there, in the time it shows. watch it think replays every step it took, undo marks included." />
          <div className="sx-r"><Demo game={game} onGame={setGame} /></div>
        </section>

        <section className="sx-wide sx-arcs">
          <div className="sx-pick sx-r">
            <span className="sx-label">pick a game</span>
            <span className="sx-pick-note">click a card to load it in the demo. hover to stop the arcs, drag to scrub.</span>
          </div>
          <div className="sx-r sx-bleed"><Arcs top={LINKEDIN} bottom={NYT} onPick={pick} active={game} /></div>
          <p className="sx-caption sx-r">it also fills in connections, the mini and spelling bee by reading the answer the page already has.</p>
        </section>

        <section className="sx-section sx-wide">
          <Head label="how it works" />
          <div className="sx-how">
            <div className="sx-how-item sx-r">
              <div className="sx-how-k">reading the game</div>
              <p className="sx-p">class names change every deploy. the shape of the game state almost never does. so the solvers find the react fiber attached to a dom node and walk it: hook state, props and class state, breadth first, depth capped, cycle safe. the five linkedin games and strands get solved from the board; wordle reads the answer first and solves from the board only if every read fails.</p>
              <Code file="core/fiber.js">{CODE.fiber}</Code>
            </div>
            <div className="sx-how-item sx-r" style={{ transitionDelay: '60ms' }}>
              <div className="sx-how-k">fixing itself</div>
              <p className="sx-p">every solver lists the ways it can read its game, in order: react state, page data or api, then dom fallbacks. the runner tries each one, sanity checks it and remembers the winner, so when a site change breaks a read it costs one slow solve and the next run goes straight to what works. the brittle selectors live in a json file the extension pulls from github, so a fix ships without a reinstall.</p>
              <Code file="core/strategies.js">{CODE.runner}</Code>
            </div>
          </div>
          <div className="sx-r sx-flow"><FlowDiagram /></div>

        </section>

        <div className="site-col">
          <section className="sx-section" id="install" style={{ scrollMarginTop: 120 }}>
            <Head label="install" />
            <ol className="sx-install sx-r">
              {INSTALL.map((line, i) => <li key={i}><span>{i + 1}</span>{line}</li>)}
            </ol>
            <p className="site-p sx-r">chrome shows a "debugging this browser" bar while zip, patches or strands are being solved. that is the trusted input doing its thing. the mini crossword and spelling bee need an nyt games subscription to load at all.</p>
            <div className="sx-r sx-popup"><img src="/solver/popup.png" alt="the extension popup, linkedin and nyt tabs" /></div>
          </section>
        </div>
      </div>
      <style>{DIAGRAM_CSS + PAGE_CSS}</style>
    </PageShell>
  );
}

const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

const PAGE_CSS = `
  .sx { --mono: ui-monospace, 'SF Mono', Menlo, monospace; }
  .sx code { font-family: var(--mono); font-size: 0.86em; color: var(--ink); }
  .sx-wide { margin-left: auto; margin-right: auto; width: 100%; max-width: 1040px; }
  .sx-kicker { font-size: 14px; line-height: 20px; color: var(--half); margin-bottom: 12px; }
  .sx-title { margin: 0; font-size: 44px; line-height: 1.1; font-weight: 300; letter-spacing: -0.035em; color: var(--ink); }
  .sx-hero-lede { margin: 16px 0 0; font-size: 18px; line-height: 28px; color: var(--text); }
  .sx-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 28px; }
  .sx-btn { display: inline-flex; align-items: center; height: 38px; padding: 0 20px; border: 1px solid var(--rule); font-size: 13px; font-weight: 500; color: var(--ink); text-decoration: none; transition: background 0.2s ${EASE}, opacity 0.2s ${EASE}; }
  .sx-btn:hover { background: var(--hover); }
  .sx-btn-primary { background: var(--ink); border-color: var(--ink); color: var(--bg); }
  .sx-btn-primary:hover { background: var(--ink); opacity: 0.86; }
  .site-app .site-col > .sx-facts { max-width: 1040px; }
  .sx-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 56px; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
  .sx-facts > div { padding: 20px 0 20px 20px; border-left: 1px solid var(--rule); }
  .sx-facts > div:first-child { padding-left: 0; border-left: 0; }
  .sx-fact-v { font-size: 34px; line-height: 1; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); font-variant-numeric: tabular-nums; }
  .sx-fact-k { margin-top: 8px; font-size: 13px; color: var(--text); }

  .sx-section { margin-top: 112px; }
  .sx-demo { margin-top: 72px; }
  .sx-how { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 48px; }
  .sx-how-item { min-width: 0; display: flex; flex-direction: column; gap: 14px; }
  .sx-how-k { font-size: 15px; line-height: 22px; font-weight: 500; color: var(--ink); }
  @media (max-width: 760px) { .sx-how { grid-template-columns: 1fr; gap: 40px; } }
  .sx-head { max-width: 640px; margin-bottom: 32px; }
  .sx-label { font-size: 13px; line-height: 18px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
  .sx-h2 { margin: 10px 0 0; font-size: 28px; line-height: 1.2; font-weight: 300; letter-spacing: -0.025em; color: var(--ink); }
  .sx-lede { margin: 12px 0 0; font-size: 16px; line-height: 26px; color: var(--text); }
  .sx-p { margin: 0; font-size: 14.5px; line-height: 24px; color: var(--text); }
  .sx-caption { margin: 14px 0 0; font-size: 12.5px; line-height: 20px; color: var(--half); max-width: 720px; }

  .sx-r { opacity: 0; transform: translateY(10px); transition: opacity 0.35s ${EASE}, transform 0.35s ${EASE}; }
  .sx-r.sx-in { opacity: 1; transform: none; }



  .sx-code { margin: 0; border: 1px solid var(--rule); background: var(--hover); min-width: 0; }
  .sx-code figcaption { padding: 8px 12px; border-bottom: 1px solid var(--rule); font-size: 11.5px; color: var(--half); font-family: var(--mono); }
  .sx-code pre { margin: 0; padding: 12px; overflow-x: auto; font-size: 12px; line-height: 19px; }
  .sx-code code { font-size: 12px; color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere; }


  .sx-flow { margin-top: 48px; border: 1px solid var(--rule); padding: 28px; overflow-x: auto; }
  .sx-flow svg { min-width: 720px; }


  .sx-install { list-style: none; margin: 0 0 20px; padding: 0; border: 1px solid var(--rule); }
  .sx-install li { display: flex; align-items: center; gap: 14px; padding: 12px 16px; font-size: 14px; line-height: 20px; color: var(--ink); border-bottom: 1px solid var(--rule); }
  .sx-install li:last-child { border-bottom: 0; }
  .sx-install span { width: 18px; font-size: 12px; color: var(--half); font-variant-numeric: tabular-nums; }
  .sx-popup { margin-top: 32px; border: 1px solid var(--rule); background: var(--hover); }
  .sx-popup img { width: 100%; display: block; }

  .sx-arcs { margin-top: 40px; }
  .sx-pick { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
  .sx-pick-note { font-size: 13px; color: var(--half); }
  .sx-arcs .sx-caption { margin-top: 8px; }
  .sx-bleed { width: 100vw; max-width: 1680px; margin-left: 50%; transform: translateX(-50%); }
  .sx-bleed.sx-r { transform: translateX(-50%) translateY(10px); }
  .sx-bleed.sx-r.sx-in { transform: translateX(-50%); }

  @media (max-width: 1000px) {
  }
  @media (max-width: 640px) {
    .sx-title { font-size: 34px; }
    .sx-section { margin-top: 80px; }
    .sx-h2 { font-size: 24px; }
    .sx-facts { grid-template-columns: 1fr; }
    .sx-facts > div { padding-left: 0; border-left: 0; padding: 16px 0; display: flex; align-items: baseline; gap: 14px; }
    .sx-facts > div + div { border-top: 1px solid var(--rule); }
    .sx-facts .sx-fact-k { margin-top: 0; }
    .sx-flow { padding: 16px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .sx-r { opacity: 1; transform: none; transition: none; }
  }
`;
