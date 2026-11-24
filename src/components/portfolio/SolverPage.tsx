import { useCallback, useRef, useState } from 'react';
import PageShell from './PageShell';
import SolverHero from './heroes/SolverHero';
import Demo, { type Game } from '../../tools/solver/Demo';
import Arcs, { type ArcTrack } from '../../tools/solver/Arcs';

const REPO = 'https://github.com/ronnielgandhe/linkedin-games-solver';

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

export default function SolverPage() {
  const [game, setGame] = useState<Game>('queens');
  const demoRef = useRef<HTMLDivElement>(null);
  const pick = useCallback((g: Game) => {
    setGame(g);
    const el = demoRef.current;
    if (el && el.getBoundingClientRect().top < 40) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  return (
    <PageShell activePage="projects" crumb="game solver suite" back={{ href: '/projects', label: 'projects' }} wide>
      <div className="sx">
        <div className="site-col">
          <SolverHero />
        </div>

        <section className="sx-section sx-wide sx-demo" ref={demoRef} style={{ scrollMarginTop: 80 }}>
          <Demo game={game} />
        </section>

        <section className="sx-wide sx-arcs">
          <div className="sx-pick">
            <span className="sx-label">pick a game</span>
            <span className="sx-pick-note">click a card to load it above.</span>
          </div>
          <div className="sx-bleed"><Arcs top={LINKEDIN} bottom={NYT} onPick={pick} active={game} /></div>
        </section>

        <div className="site-col">
          <section className="sx-section sx-how" aria-label="how it works">
            <div className="sx-label">how it works</div>
            <p className="sx-p">the solvers find the game's react state and read the board straight out of it, because class names change every deploy and the shape of the state almost never does. then real algorithms do the solving: constraint search for queens, sudoku, tango and zip, exact cover for patches and strands, a word list for wordle. every solver keeps several ways to read its game and remembers the one that worked, so a site change costs one slow solve. no ai, no server.</p>
            <p className="sx-p">to run it in chrome: clone the repo, open chrome://extensions, turn on developer mode and load unpacked.</p>
            <a className="sx-btn sx-btn-primary" href={REPO} target="_blank" rel="noopener noreferrer">read the code</a>
          </section>
        </div>
      </div>
      <style>{PAGE_CSS}</style>
    </PageShell>
  );
}

const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

const PAGE_CSS = `
  .sx-wide { margin-left: auto; margin-right: auto; width: 100%; max-width: 1040px; }
  .sx-btn { display: inline-flex; align-items: center; height: 38px; padding: 0 20px; border: 1px solid var(--rule); font-size: 13px; font-weight: 500; color: var(--ink); text-decoration: none; transition: background 0.2s ${EASE}, opacity 0.2s ${EASE}; }
  .sx-btn:hover { background: var(--hover); }
  .sx-btn-primary { background: var(--ink); border-color: var(--ink); color: var(--bg); }
  .sx-btn-primary:hover { background: var(--ink); opacity: 0.86; }
  .sx-section { margin-top: 72px; }
  .sx-demo { margin-top: 56px; }
  .sx-how { margin-top: 96px; max-width: 640px; display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
  .sx-label { font-size: 13px; line-height: 18px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
  .sx-p { margin: 0; font-size: 15px; line-height: 25px; color: var(--text); }
  .sx-arcs { margin-top: 40px; }
  .sx-pick { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
  .sx-pick-note { font-size: 13px; color: var(--half); }
  .sx-bleed { width: 100vw; max-width: 1680px; margin-left: 50%; transform: translateX(-50%); }
  @media (max-width: 640px) { .sx-section { margin-top: 56px; } .sx-how { margin-top: 72px; } }
`;
