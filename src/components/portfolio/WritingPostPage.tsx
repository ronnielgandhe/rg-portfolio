import PageShell, { useTheme, themeColors } from './PageShell';
import { contentMap } from './contentData';

function processInline(text: string, t: ReturnType<typeof themeColors>) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) => {
    if (j % 2 === 1) {
      return <strong key={j} style={{ color: t.textStrong, fontWeight: 500 }}>{part}</strong>;
    }
    return part;
  });
}

function renderMarkdown(markdown: string, t: ReturnType<typeof themeColors>) {
  const paragraphs = markdown.split('\n\n');
  return paragraphs.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // H2 heading
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      return (
        <h2 key={i} style={{
          fontSize: 18,
          fontWeight: 500,
          color: t.textStrong,
          margin: '32px 0 16px',
          lineHeight: 1.4,
        }}>
          {text}
        </h2>
      );
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const text = trimmed.slice(2);
      return (
        <blockquote key={i} style={{
          borderLeft: `3px solid ${t.textMuted}`,
          paddingLeft: 16,
          fontStyle: 'italic',
          color: t.textMuted,
          margin: '20px 0',
          fontSize: 16,
          lineHeight: 1.8,
        }}>
          {text}
        </blockquote>
      );
    }

    // List block (lines starting with - )
    if (trimmed.split('\n').every(line => line.trim().startsWith('- ') || line.trim() === '')) {
      const items = trimmed.split('\n').filter(line => line.trim().startsWith('- '));
      return (
        <ul key={i} style={{
          fontSize: 16,
          lineHeight: 1.8,
          color: t.text,
          marginBottom: 20,
          paddingLeft: 24,
        }}>
          {items.map((item, j) => (
            <li key={j} style={{ marginBottom: 8 }}>{processInline(item.trim().slice(2), t)}</li>
          ))}
        </ul>
      );
    }

    // Regular paragraph, process inline bold
    return (
      <p key={i} style={{
        fontSize: 16,
        lineHeight: 1.8,
        color: t.text,
        marginBottom: 20,
      }}>
        {processInline(trimmed, t)}
      </p>
    );
  });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function PostContent({ slug }: { slug: string }) {
  const { dark } = useTheme();
  const t = themeColors(dark);
  const post = contentMap[slug];

  if (!post) {
    return (
      <div style={{ color: t.text, padding: '40px 0' }}>
        Post not found.
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 60px' }}>
      <h1 style={{
        fontSize: 28,
        fontWeight: 500,
        letterSpacing: '-0.02em',
        color: t.textStrong,
        lineHeight: 1.3,
        marginBottom: 12,
      }}>
        {post.title}
      </h1>
      <div style={{
        fontSize: 14,
        color: t.textMuted,
        marginBottom: 40,
      }}>
        {formatDate(post.publishedAt)}
      </div>
      <div>
        {renderMarkdown(post.markdown, t)}
      </div>
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
