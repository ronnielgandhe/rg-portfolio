import PageShell from './PageShell';
import { contentMap } from './contentData';
import { WRITING_CSS } from './WritingPage';

function processInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) => (j % 2 === 1 ? <strong key={j} className="wpp-strong">{part}</strong> : part));
}

function renderMarkdown(markdown: string) {
  const paragraphs = markdown.split('\n\n');
  return paragraphs.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('## ')) return <h2 key={i} className="wpp-h2">{trimmed.slice(3)}</h2>;
    if (trimmed.startsWith('> ')) return <blockquote key={i} className="wpp-quote">{trimmed.slice(2)}</blockquote>;
    if (trimmed.split('\n').every(line => line.trim().startsWith('- ') || line.trim() === '')) {
      const items = trimmed.split('\n').filter(line => line.trim().startsWith('- '));
      return (
        <ul key={i} className="wpp-ul">
          {items.map((item, j) => <li key={j}>{processInline(item.trim().slice(2))}</li>)}
        </ul>
      );
    }
    return <p key={i} className="wpp-p">{processInline(trimmed)}</p>;
  });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const POST_CSS = `
  ${WRITING_CSS}
  .wpp-missing { color: var(--wt-text); padding: 40px 0; }
  .wpp-kicker { font-size: 14px; line-height: 20px; color: var(--half); margin-bottom: 12px; }
  .wp-post-title { margin: 0; font-size: 36px; font-weight: 300; letter-spacing: -0.03em; color: var(--wt-strong); line-height: 1.15; }
  .wpp-date { margin: 12px 0 0; padding-bottom: 40px; margin-bottom: 40px; border-bottom: 1px solid var(--wt-border); font-size: 13px; line-height: 20px; color: var(--wt-muted); text-transform: lowercase; }
  @media (max-width: 560px) { .wp-post-title { font-size: 30px; } }
  .wpp-h2 { font-size: 18px; font-weight: 500; color: var(--wt-strong); margin: 32px 0 16px; line-height: 1.4; }
  .wpp-quote { border-left: 1px solid var(--wt-strong); padding-left: 16px; color: var(--wt-text); margin: 20px 0; font-size: 16px; line-height: 1.8; }
  .wpp-ul { font-size: 16px; line-height: 1.8; color: var(--wt-text); margin-bottom: 20px; padding-left: 24px; }
  .wpp-ul li { margin-bottom: 8px; }
  .wpp-p { font-size: 16px; line-height: 1.8; color: var(--wt-text); margin-bottom: 20px; }
  .wpp-strong { color: var(--wt-strong); font-weight: 500; }
`;

function PostContent({ slug }: { slug: string }) {
  const post = contentMap[slug];
  return (
    <div className="wt" style={post ? { padding: '0 0 60px' } : undefined}>
      {post ? (
        <>
          <div className="wpp-kicker">writing</div>
          <h1 className="wp-post-title">{post.title}</h1>
          <div className="wpp-date">{formatDate(post.publishedAt)}</div>
          <div>{renderMarkdown(post.markdown)}</div>
        </>
      ) : (
        <div className="wpp-missing">that post isn't here.</div>
      )}
      <style>{POST_CSS}</style>
    </div>
  );
}

export default function WritingPostPage({ slug }: { slug: string }) {
  return (
    <PageShell activePage="writing" back={{ href: '/writing', label: 'writing' }}>
      <PostContent slug={slug} />
    </PageShell>
  );
}
