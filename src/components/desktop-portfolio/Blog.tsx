import { useState, useRef } from 'react';
import type { ReactNode } from 'react';
import type { ContentViewData } from './ContentViewer';
import { contentMap } from './contentData';
import MarkdownRenderer from './MarkdownRenderer';
import { SYS_FONT, LABEL, LABEL_2, Icon, MacStyles } from './mac';

interface BlogProps {
  onContentClick?: (content: ContentViewData) => void;
  windowMode?: boolean;
}

const NOTES_YELLOW = '#E5AE00';
const SIDEBAR_W = 180;
const LIST_W = 240;

const blogPosts = [
  {
    slug: "prestige-is-a-strong-drug",
    title: "Prestige Is a Strong Drug",
    summary: "What dropping out of one of Canada's best programs taught me about borrowed momentum and real growth.",
    publishedAt: "2026-02-20",
    folder: "Personal"
  },
  {
    slug: "trading-rabbit-hole",
    title: "What Going Down the Trading Rabbit Hole Taught Me About Finance",
    summary: "Anyone who gets interested in markets eventually falls into the same rabbit hole. Here is what I found at the bottom.",
    publishedAt: "2026-01-28",
    folder: "Finance"
  },
];

type Post = typeof blogPosts[number];

function parseLocalDate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const shortDate = (s: string) => parseLocalDate(s).toLocaleDateString('en-US', { year: '2-digit', month: 'numeric', day: 'numeric' });
const longDate = (s: string) => parseLocalDate(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

function groupByDate(posts: Post[]) {
  const now = new Date();
  const groups: { label: string; posts: Post[] }[] = [];
  for (const post of posts) {
    const d = parseLocalDate(post.publishedAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const label = diffDays <= 7 ? 'Previous 7 Days'
      : diffDays <= 30 ? 'Previous 30 Days'
      : d.getFullYear() === now.getFullYear() ? d.toLocaleString('en-US', { month: 'long' })
      : String(d.getFullYear());
    const g = groups.find(x => x.label === label);
    if (g) g.posts.push(post); else groups.push({ label, posts: [post] });
  }
  return groups;
}

const folders = [
  { name: 'All Notes', count: blogPosts.length },
  ...Array.from(new Set(blogPosts.map(p => p.folder))).map(name => ({
    name,
    count: blogPosts.filter(p => p.folder === name).length,
  })),
];

const byNewest = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const Blog = (_props: BlogProps) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(byNewest[0].slug);
  const [activeFolder, setActiveFolder] = useState('All Notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  const q = searchQuery.toLowerCase();
  const visiblePosts = byNewest.filter(p =>
    (activeFolder === 'All Notes' || p.folder === activeFolder) &&
    (!q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q))
  );
  const grouped = groupByDate(visiblePosts);
  const selectedPost = blogPosts.find(p => p.slug === selectedSlug);
  const selectedContent = selectedPost ? contentMap[selectedPost.slug] : null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: SYS_FONT,
      color: LABEL,
      fontSize: '13px',
      lineHeight: 1.35,
      background: '#ffffff',
    }}>
      <MacStyles />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '52px',
        flexShrink: 0,
        boxSizing: 'border-box',
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        background: '#f6f6f6',
      }}>
        <div style={{ width: showSidebar ? SIDEBAR_W : 124, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', padding: '0 8px', boxSizing: 'border-box' }}>
          <ToolBtn onClick={() => setShowSidebar(s => !s)} tooltip={showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}>
            <Icon.Sidebar size={18} />
          </ToolBtn>
        </div>
        <div style={{ width: LIST_W, display: 'flex', justifyContent: 'flex-end', padding: '0 8px', boxSizing: 'border-box' }}>
          <ToolBtn disabled tooltip="Delete"><Icon.Trash size={18} /></ToolBtn>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px', padding: '0 10px', minWidth: 0 }}>
          <ToolBtn disabled tooltip="New Note"><Icon.Compose size={18} /></ToolBtn>
          <div style={{ width: 10 }} />
          <ToolBtn disabled tooltip="Format"><Icon.Format size={18} /></ToolBtn>
          <ToolBtn disabled tooltip="Checklist"><Icon.Checklist size={18} /></ToolBtn>
          <ToolBtn disabled tooltip="Table"><Icon.Table size={18} /></ToolBtn>
          <ToolBtn disabled tooltip="Media"><Icon.Photo size={18} /></ToolBtn>
          <div style={{ flex: 1 }} />
          <ToolBtn disabled tooltip="Lock"><Icon.Lock size={18} /></ToolBtn>
          <ToolBtn disabled tooltip="Share"><Icon.Share size={18} /></ToolBtn>
          <div style={{ position: 'relative', marginLeft: '6px', width: '150px', flexShrink: 1 }}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '28px',
                padding: '0 8px 0 26px',
                fontSize: '13px',
                border: 'none',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.06)',
                color: LABEL,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                caretColor: NOTES_YELLOW,
              }}
            />
            <Icon.Search size={14} color="rgba(0,0,0,0.45)" style={{ position: 'absolute', left: '8px', top: '7px' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {showSidebar && (
          <div className="mac-scroll" style={{
            width: SIDEBAR_W,
            minWidth: SIDEBAR_W,
            borderRight: '0.5px solid rgba(0,0,0,0.1)',
            background: '#f0f0f0',
            padding: '10px 0',
            boxSizing: 'border-box',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: LABEL_2, padding: '4px 18px 4px' }}>iCloud</div>
            {folders.map(folder => {
              const isActive = activeFolder === folder.name;
              return (
                <div
                  key={folder.name}
                  onClick={() => setActiveFolder(folder.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    height: '28px',
                    padding: '0 10px',
                    margin: '0 8px',
                    borderRadius: '6px',
                    cursor: 'default',
                    background: isActive ? 'rgba(0,0,0,0.08)' : 'transparent',
                    color: LABEL,
                  }}
                >
                  <Icon.Folder size={16} color={NOTES_YELLOW} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{folder.name}</span>
                  <span style={{ color: LABEL_2 }}>{folder.count}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mac-scroll" style={{
          width: LIST_W,
          minWidth: LIST_W,
          borderRight: '0.5px solid rgba(0,0,0,0.1)',
          background: '#ffffff',
          padding: '0 8px 8px',
          boxSizing: 'border-box',
        }}>
          {grouped.map(group => (
            <div key={group.label}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: LABEL_2, padding: '12px 10px 4px' }}>
                {group.label}
              </div>
              {group.posts.map((post, i) => {
                const isSelected = post.slug === selectedSlug;
                const nextSelected = group.posts[i + 1]?.slug === selectedSlug;
                const showRule = !isSelected && !nextSelected && i < group.posts.length - 1;
                return (
                  <div
                    key={post.slug}
                    onClick={() => setSelectedSlug(post.slug)}
                    style={{
                      position: 'relative',
                      padding: '8px 10px',
                      cursor: 'default',
                      borderRadius: '6px',
                      background: isSelected ? '#F7D86A' : 'transparent',
                    }}
                  >
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.title}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '1px', color: isSelected ? 'rgba(0,0,0,0.6)' : LABEL_2, minWidth: 0 }}>
                      <span style={{ flexShrink: 0 }}>{shortDate(post.publishedAt)}</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{post.summary}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontSize: '11px', color: 'rgba(0,0,0,0.35)' }}>
                      <Icon.Folder size={11} color="rgba(0,0,0,0.35)" />
                      <span>{post.folder}</span>
                    </div>
                    {showRule && (
                      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 0, height: '0.5px', background: 'rgba(0,0,0,0.1)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {visiblePosts.length === 0 && (
            <div style={{ padding: '40px 10px', textAlign: 'center', color: LABEL_2 }}>No Results</div>
          )}
        </div>

        <div className="mac-scroll" style={{ flex: 1, padding: '14px 32px 32px', background: '#ffffff', minWidth: 0 }}>
          {selectedPost && selectedContent && (
            <div style={{ maxWidth: '620px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(0,0,0,0.4)', marginBottom: '18px' }}>
                {longDate(selectedPost.publishedAt)}
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: LABEL, lineHeight: 1.25, margin: '0 0 12px', fontFamily: SYS_FONT }}>
                {selectedPost.title}
              </h1>
              <div className="notes-content">
                <MarkdownRenderer content={selectedContent.markdown} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .notes-content, .notes-content * { font-family: ${SYS_FONT} !important; }
        .notes-content { font-size: 14px; line-height: 1.4; color: ${LABEL}; }
        .notes-content p {
          margin: 0 0 0.6em !important;
          font-size: 14px !important;
          color: ${LABEL} !important;
          line-height: 1.4 !important;
          font-weight: 400 !important;
        }
        .notes-content h2 {
          font-size: 18px !important;
          font-weight: 700 !important;
          color: ${LABEL} !important;
          margin: 1.1em 0 0.4em !important;
          padding: 0 !important;
          border: none !important;
          line-height: 1.3 !important;
        }
        .notes-content h3 {
          font-size: 15px !important;
          font-weight: 600 !important;
          color: ${LABEL} !important;
          margin: 1em 0 0.3em !important;
          line-height: 1.3 !important;
          border: none !important;
          padding: 0 !important;
        }
        .notes-content strong { font-weight: 600 !important; color: ${LABEL} !important; }
        .notes-content em { color: ${LABEL} !important; }
        .notes-content blockquote {
          border-left: 2px solid rgba(0,0,0,0.15) !important;
          padding-left: 12px !important;
          margin: 0.8em 0 !important;
          color: rgba(0,0,0,0.6) !important;
          font-style: normal !important;
          line-height: 1.4 !important;
        }
        .notes-content blockquote * { color: rgba(0,0,0,0.6) !important; font-style: normal !important; }
        .notes-content code {
          background: rgba(0,0,0,0.05) !important;
          color: ${LABEL} !important;
          padding: 1px 4px !important;
          border-radius: 4px !important;
          font-size: 0.9em !important;
        }
        .notes-content pre {
          background: rgba(0,0,0,0.04) !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 10px 12px !important;
          margin: 0.8em 0 !important;
        }
        .notes-content pre code { background: none !important; padding: 0 !important; }
        .notes-content hr { border: none !important; border-top: 0.5px solid rgba(0,0,0,0.15) !important; margin: 1em 0 !important; }
        .notes-content a { color: #007AFF !important; text-decoration: none !important; }
        .notes-content ul, .notes-content ol {
          color: ${LABEL} !important;
          line-height: 1.4 !important;
          margin: 0 0 0.6em !important;
          padding-left: 1.4em !important;
          font-size: 14px !important;
        }
        .notes-content li { color: ${LABEL} !important; margin-bottom: 0.2em !important; font-size: 14px !important; }
        .notes-content table th { color: ${LABEL} !important; border-bottom-color: rgba(0,0,0,0.15) !important; }
        .notes-content table td { color: ${LABEL} !important; border-bottom-color: rgba(0,0,0,0.08) !important; }
      `}</style>
    </div>
  );
};

function ToolBtn({ children, onClick, tooltip, disabled }: {
  children: ReactNode;
  onClick?: () => void;
  tooltip?: string;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={disabled ? undefined : onClick}
      title={tooltip}
      aria-disabled={disabled || undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        cursor: 'default',
        color: 'rgba(0,0,0,0.6)',
        opacity: disabled ? 0.35 : 1,
        background: hovered && !disabled ? 'rgba(0,0,0,0.06)' : 'transparent',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

export default Blog;
