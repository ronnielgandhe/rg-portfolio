import PageShell from './PageShell';
import CardFeed, { type FeedItem } from './CardFeed';

const NONE: [string, string, string] = ['#f5f5f5', '#e5e5e5', '#d4d4d4'];

const PROJECTS: FeedItem[] = [
  {
    id: 'leanfetch', nav: 'LeanFetch',
    label: 'LeanFetch', sub: 'scans your repo and tells you where your llm bill is leaking',
    href: 'https://github.com/ronnielgandhe/leanfetch', external: true,
    image: '/projects/leanfetch.png', colors: NONE,
  },
  {
    id: 'harvey', nav: 'Harvey',
    label: 'Harvey', sub: 'a lawyer that picks up. built solo in 3 days',
    href: '/harvey',
    image: '/projects/harvey.png', colors: NONE,
  },
  {
    id: 'game-solver-suite', nav: 'Game Solver Suite',
    label: 'Game Solver Suite', sub: 'one chrome extension that solves the linkedin and nyt daily games',
    href: 'https://github.com/ronnielgandhe/linkedin-games-solver', external: true,
    image: '/projects/solver.png', colors: NONE,
  },
  {
    id: 'how-many-clicks', nav: 'How Many Clicks',
    label: 'How Many Clicks', sub: 'the wikipedia game. a bot goes first, then you try to beat it',
    href: '/how-many-clicks',
    image: '/projects/how-many-clicks.png', colors: NONE,
  },
  {
    id: 'ronnielos', nav: 'RonnielOS',
    label: 'RonnielOS', sub: 'my old portfolio. a whole mac desktop in the browser',
    href: '/desktop',
    image: '/projects/ronnielos.png', colors: NONE,
  },
];

export default function ProjectsPage() {
  return (
    <PageShell activePage="projects" wide>
      <div className="site-col site-enter">
        <h1 className="site-h1">projects</h1>
        <p className="site-p" style={{ lineHeight: '24px' }}>the stuff i actually finished.</p>
      </div>
      <CardFeed items={PROJECTS} />
    </PageShell>
  );
}
