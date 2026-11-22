import PageShell from './PageShell';

export const POSTS = [
  { slug: 'my-time-at-bluejay', title: 'My Time at Bluejay', date: '2026-11-22' },
  {
    slug: 'prestige-is-a-strong-drug',
    title: 'Prestige Is a Strong Drug',
    date: '2026-02-20',
  },
  {
    slug: 'trading-rabbit-hole',
    title: 'What Going Down the Trading Rabbit Hole Taught Me About Finance',
    date: '2026-01-28',
  },
];

export const WRITING_CSS = `
  .wt { --wt-text: var(--text); --wt-strong: var(--ink); --wt-muted: var(--faint); --wt-border: var(--rule); --wt-row-hover: var(--hover); }
`;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function WritingContent() {
  return (
    <div className="wt">
      <div className="wp-kicker">writing</div>
      <h1 className="wp-h1">things i wrote down</h1>
      <p className="wp-lede">a few essays, newest first.</p>
      <div className="wp-list">
      {POSTS.map(post => (
        <a key={post.slug} href={`/writing/${post.slug}`} className="wp-row">
          <span className="wp-title">{post.title}</span>
          <span className="wp-date">{formatDate(post.date)}</span>
        </a>
      ))}
      </div>
      <style>{`
        ${WRITING_CSS}
        .wp-kicker { font-size: 14px; line-height: 20px; color: var(--half); margin-bottom: 12px; }
        .wp-h1 { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
        .wp-lede { margin: 12px 0 0; font-size: 18px; line-height: 28px; color: var(--text); }
        .wp-list { display: flex; flex-direction: column; margin-top: 48px; border-top: 1px solid var(--wt-border); }
        .wp-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--wt-border); transition: background 0.2s; text-decoration: none; color: inherit; }
        .wp-row:hover { background: var(--wt-row-hover); }
        .wp-title { color: var(--wt-strong); font-weight: 400; font-size: 15px; line-height: 22px; transition: opacity 0.2s; }
        .wp-row:hover .wp-title { opacity: 0.6; }
        .wp-date { font-size: 13px; line-height: 22px; color: var(--wt-muted); white-space: nowrap; flex-shrink: 0; font-variant-numeric: tabular-nums; text-transform: lowercase; }
        @media (max-width: 560px) { .wp-h1 { font-size: 30px; } .wp-row { flex-direction: column; gap: 2px; } }
      `}</style>
    </div>
  );
}

export default function WritingPage() {
  return (
    <PageShell activePage="writing">
      <WritingContent />
    </PageShell>
  );
}
