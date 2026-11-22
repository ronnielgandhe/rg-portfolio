import PageShell from './PageShell';
import CardFeed, { type FeedItem } from './CardFeed';

const PROJECTS: FeedItem[] = [
  {
    id: 'leanfetch', nav: 'LeanFetch',
    label: 'LeanFetch', sub: 'finds the money your code burns on llm api calls',
    href: 'https://github.com/ronnielgandhe/leanfetch', external: true,
    colors: ['#fcd34d', '#f59e0b', '#fb7185'],
  },
  {
    id: 'harvey', nav: 'Harvey',
    label: 'Harvey', sub: 'a lawyer that picks up. built solo in 3 days',
    href: '/harvey',
    colors: ['#a5b4fc', '#6366f1', '#312e81'],
  },
  {
    id: 'linkedin-solver', nav: 'LinkedIn Solver',
    label: 'LinkedIn Games Solver', sub: 'chrome extension that solves all 5 linkedin games in real time',
    href: 'https://github.com/ronnielgandhe/linkedin-games-solver', external: true,
    colors: ['#67e8f9', '#06b6d4', '#0891b2'],
  },
  {
    id: 'nyt-solver', nav: 'NYT Solver',
    label: 'NYT Games Solver', sub: 'wordle, connections, strands, the mini and spelling bee',
    href: 'https://github.com/ronnielgandhe/nyt-games-solver', external: true,
    colors: ['#bef264', '#84cc16', '#65a30d'],
  },
  {
    id: 'ronnielos', nav: 'RonnielOS',
    label: 'RonnielOS', sub: 'my old portfolio, a macos desktop you can click around',
    href: '/desktop',
    colors: ['#f9a8d4', '#ec4899', '#f43f5e'],
  },
  {
    id: 'creatorscope', nav: 'CreatorScope',
    label: 'CreatorScope', sub: 'finds brand-ready tiktok creators in minutes instead of hours of scrolling',
    href: 'https://github.com/ronnielgandhe/creatorscope', external: true,
    colors: ['#6ee7b7', '#34d399', '#10b981'],
  },
  {
    id: 'how-many-clicks', nav: 'How Many Clicks',
    label: 'How Many Clicks', sub: 'the wikipedia game. watch an ai race through links, then try to beat it',
    href: 'https://github.com/ronnielgandhe/how-many-clicks', external: true,
    colors: ['#bfdbfe', '#60a5fa', '#3b82f6'],
  },
  {
    id: 'yournews', nav: 'YourNews',
    label: 'YourNews', sub: 'the news you want, minus the noise',
    href: 'https://github.com/ronnielgandhe/yournews', external: true,
    colors: ['#ddd6fe', '#a78bfa', '#8b5cf6'],
  },
];

export default function ProjectsPage() {
  return (
    <PageShell activePage="projects" wide>
      <div className="site-col site-enter">
        <h1 className="site-h1">projects</h1>
        <p className="site-p" style={{ marginTop: 0 }}>
          small tools i wanted to exist. most of them started because something annoyed me.
        </p>
      </div>
      <CardFeed items={PROJECTS} />
    </PageShell>
  );
}
