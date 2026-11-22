import PageShell from './PageShell';

const REPO = 'https://github.com/ronnielgandhe/game-solver-suite';

const SITES = [
  {
    label: 'linkedin',
    games: [
      { icon: 'sudoku', name: 'Mini Sudoku', how: 'backtracking on a 6x6 grid' },
      { icon: 'tango', name: 'Tango', how: 'constraint propagation, then backtracking' },
      { icon: 'queens', name: 'Queens', how: 'backtracking with region pruning' },
      { icon: 'zip', name: 'Zip', how: 'path search, then a real mouse drag' },
      { icon: 'patches', name: 'Patches', how: 'reads the solution out of react state' },
    ],
  },
  {
    label: 'nyt',
    games: [
      { icon: 'wordle', name: 'Wordle', how: 'finds the word in the page state' },
      { icon: 'connections', name: 'Connections', how: 'reads the four groups, clicks them in' },
      { icon: 'strands', name: 'Strands', how: 'traces every word with dfs, drags it' },
      { icon: 'crossword', name: 'Mini Crossword', how: 'fills the grid cell by cell' },
      { icon: 'spellingbee', name: 'Spelling Bee', how: 'types the whole word list' },
    ],
  },
];

const STEPS = [
  { n: '1', title: 'open a game', text: 'any of the ten, on linkedin or nyt.' },
  { n: '2', title: 'click the extension', text: 'it sees which game you are on and starts.' },
  { n: '3', title: 'watch it finish', text: 'solved and filled in, usually in under a second.' },
];

const HOOD = [
  { title: 'it reads the game, it does not guess', text: 'the solvers walk react\'s internal fiber tree to pull the board (or the answer) straight out of the page, instead of scraping class names that change every week.' },
  { title: 'real mouse events', text: 'zip, patches and strands ignore fake input from a content script. so the background worker attaches with chrome.debugger and sends trusted mouse events. to the page it looks like a hand on a mouse.' },
  { title: 'every frame', text: 'the games live inside iframes. each solver is injected into all of them, and the popup takes the answer from whichever frame finds the board.' },
];

const INSTALL = [
  'clone the repo',
  'open chrome://extensions and turn on developer mode',
  'click load unpacked and pick the folder',
  'open a game and click the icon',
];

export default function SolverPage() {
  return (
    <PageShell activePage="projects" crumb="game solver suite" wide>
      <div className="site-col site-enter">
        <div className="st-kicker">project</div>
        <h1 className="st-title">game solver suite</h1>
        <p className="st-lede">one chrome extension that solves the linkedin and nyt daily games in real time. no ai, no server, just vanilla js.</p>
        <div className="st-actions">
          <a href={REPO} target="_blank" rel="noopener noreferrer" className="st-btn st-btn-primary">get it on github</a>
          <a href="#install" className="st-btn">how to install</a>
        </div>
      </div>

      <div className="sv-wide site-enter">
        {SITES.map((site) => (
          <section key={site.label} className="sv-group">
            <div className="sv-label">{site.label}</div>
            <div className="sv-grid">
              {site.games.map((g) => (
                <div key={g.name} className="sv-card">
                  <img src={`/solver/${g.icon}.png`} alt="" className="sv-icon" />
                  <div className="sv-name">{g.name}</div>
                  <div className="sv-how">{g.how}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="site-col">
        <section className="st-section">
          <h2>three steps</h2>
          <div className="sv-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="sv-step">
                <div className="sv-step-n">{s.n}</div>
                <div className="sv-name">{s.title}</div>
                <div className="sv-how">{s.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="st-section">
          <h2>how it actually works</h2>
          {HOOD.map((h) => (
            <div key={h.title}>
              <div className="sv-name" style={{ marginBottom: 4 }}>{h.title}</div>
              <p className="site-p">{h.text}</p>
            </div>
          ))}
        </section>

        <section className="st-section" id="install" style={{ scrollMarginTop: 120 }}>
          <h2>install</h2>
          <ol className="sv-install">
            {INSTALL.map((line, i) => (
              <li key={i}><span>{i + 1}</span>{line}</li>
            ))}
          </ol>
          <p className="site-p">chrome shows a "debugging this browser" bar while zip, patches or strands are being solved. that is the real mouse events doing their thing. the mini crossword and spelling bee need an nyt games subscription to load at all.</p>
        </section>

        <div className="st-image" style={{ aspectRatio: 'auto' }}>
          <img src="/solver/popup.png" alt="the extension popup, one tab per site" style={{ objectFit: 'contain' }} />
        </div>
      </div>

      <style>{`
        .st-kicker { font-size: 14px; line-height: 20px; color: var(--half); margin-bottom: 12px; }
        .st-title { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
        .st-lede { margin: 12px 0 0; font-size: 18px; line-height: 28px; color: var(--text); }
        .st-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
        .st-btn { display: inline-flex; align-items: center; height: 38px; padding: 0 20px; border: 1px solid rgba(0, 0, 0, 0.1); font-size: 13px; font-weight: 500; color: var(--ink); text-decoration: none; transition: background 0.2s, border-color 0.2s; }
        .site-dark .st-btn { border-color: rgba(255, 255, 255, 0.16); }
        .st-btn:hover { background: var(--hover); }
        .st-btn-primary { background: var(--ink); border-color: var(--ink); color: var(--bg); }
        .st-btn-primary:hover { background: var(--ink); opacity: 0.86; }
        .st-section { margin-top: 56px; display: flex; flex-direction: column; gap: 16px; }
        .st-section h2 { margin: 0; font-size: 16px; line-height: 24px; font-weight: 500; color: var(--ink); }
        .st-image { margin-top: 48px; overflow: hidden; border: 1px solid var(--rule); background: var(--hover); }
        .st-image img { width: 100%; display: block; }

        .sv-wide { margin: 56px auto 0; width: 100%; max-width: 1040px; display: flex; flex-direction: column; gap: 32px; }
        .sv-label { font-size: 13px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); margin-bottom: 14px; }
        .sv-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
        .sv-card { border: 1px solid var(--rule); background: var(--bg); padding: 22px 20px 20px; transition: border-color 0.2s; }
        .sv-card:hover { border-color: rgba(0, 0, 0, 0.25); }
        .site-dark .sv-card:hover { border-color: rgba(255, 255, 255, 0.3); }
        .sv-icon { width: 28px; height: 28px; object-fit: contain; display: block; margin-bottom: 16px; }
        .sv-name { font-size: 15px; line-height: 20px; font-weight: 500; color: var(--ink); }
        .sv-how { margin-top: 6px; font-size: 13px; line-height: 1.6; color: var(--text); }
        .sv-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .sv-step { border-top: 1px solid var(--rule); padding-top: 16px; }
        .sv-step-n { font-size: 28px; line-height: 1; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 14px; }
        .sv-install { list-style: none; margin: 0; padding: 0; border: 1px solid var(--rule); }
        .sv-install li { display: flex; align-items: center; gap: 14px; padding: 12px 16px; font-size: 14px; line-height: 20px; color: var(--ink); border-bottom: 1px solid var(--rule); }
        .sv-install li:last-child { border-bottom: 0; }
        .sv-install span { width: 18px; font-size: 12px; color: var(--half); font-variant-numeric: tabular-nums; }
        @media (max-width: 1000px) { .sv-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .sv-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .sv-steps { grid-template-columns: 1fr; } .st-title { font-size: 30px; } }
      `}</style>
    </PageShell>
  );
}
