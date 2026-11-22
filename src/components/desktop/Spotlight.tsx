import { useEffect, useMemo, useRef, useState } from 'react';
import { useDesktop } from './DesktopContext';
import type { WindowId } from './types';
import { SYSTEM_FONT, ACCENT, chromeTokens } from './chrome';

interface Entry {
  id: string;
  title: string;
  subtitle: string;
  group: 'Applications' | 'Projects' | 'Links' | 'System';
  keywords: string;
  icon?: string;
  glyph?: string;
  run: () => void;
}

export default function Spotlight() {
  const { state, dispatch } = useDesktop();
  const c = chromeTokens(state.dark);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const open = state.spotlightOpen;

  const entries = useMemo<Entry[]>(() => {
    const app = (id: WindowId, title: string, subtitle: string, icon: string, keywords = ''): Entry => ({
      id: `app-${id}`, title, subtitle, group: 'Applications', icon, keywords,
      run: () => dispatch({ type: 'OPEN_WINDOW', id }),
    });
    const link = (id: string, title: string, subtitle: string, href: string, group: Entry['group'], glyph: string, keywords = ''): Entry => ({
      id, title, subtitle, group, glyph, keywords,
      run: () => { window.open(href, href.startsWith('mailto:') ? '_self' : '_blank'); },
    });
    return [
      app('terminal', 'Terminal', 'about me', '/usethisTERMIANL.png', 'zsh home about'),
      app('projects', 'Projects', 'what i have been building', '/vscode.png', 'code vscode builds'),
      app('experience', 'Experience', 'where i have worked', '/icons/folder.png', 'work jobs finder bluejay'),
      app('education', 'Education', 'school and certifications', '/icons/folder.png', 'waterloo laurier finder'),
      app('blog', 'My Thoughts', 'notes and writing', '/notes.png', 'notes blog writing'),
      app('stocks', 'Stocks', 'live watchlist', '/usethisonestocks1111.png', 'market trading'),
      app('photos', 'Photos', 'places i have been', '/icons/photos.png', 'pictures gallery'),
      { ...app('calendar', 'Calendar', 'book a meeting', '', 'meeting schedule'), icon: undefined, glyph: String(new Date().getDate()) },
      app('email', 'Mail', 'send me a message', '/usethismailicon.png', 'email contact'),
      link('p-leanfetch', 'LeanFetch', 'finds wasted spend in your llm api calls', 'https://github.com/ronnielgandhe/leanfetch', 'Projects', '◆', 'api cost anthropic'),
      link('p-harvey', 'Harvey', 'voice legal assistant', 'https://github.com/ronnielgandhe/harvey', 'Projects', '◆', 'livekit voice rag'),
      link('p-linkedin', 'LinkedIn Games Solver', 'chrome extension', 'https://github.com/ronnielgandhe/linkedin-games-solver', 'Projects', '◆', 'queens tango zip'),
      link('p-nyt', 'NYT Games Solver', 'chrome extension', 'https://github.com/ronnielgandhe/nyt-games-solver', 'Projects', '◆', 'wordle connections strands'),
      link('l-github', 'GitHub', 'github.com/ronnielgandhe', 'https://github.com/ronnielgandhe', 'Links', '↗', 'code repos'),
      link('l-linkedin', 'LinkedIn', 'linkedin.com/in/ronniel-gandhe', 'https://www.linkedin.com/in/ronniel-gandhe/', 'Links', '↗'),
      link('l-resume', 'Resume', 'pdf', '/Ronniel_Gandhe_Resume.pdf', 'Links', '↗', 'cv'),
      link('l-email', 'Email', 'ronnielgandhe@gmail.com', 'mailto:ronnielgandhe@gmail.com', 'Links', '↗', 'contact'),
      {
        id: 's-appearance', title: state.dark ? 'Light Appearance' : 'Dark Appearance', subtitle: 'switch appearance',
        group: 'System', glyph: '◐', keywords: 'dark light mode theme',
        run: () => dispatch({ type: 'TOGGLE_APPEARANCE' }),
      },
    ];
  }, [dispatch, state.dark]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.filter(e => e.group === 'Applications');
    const scored = entries
      .map(e => {
        const t = e.title.toLowerCase();
        const hay = `${t} ${e.subtitle.toLowerCase()} ${e.keywords}`;
        const score = t.startsWith(q) ? 3 : t.includes(q) ? 2 : hay.includes(q) ? 1 : 0;
        return { e, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
    const order: string[] = [];
    for (const x of scored) if (!order.includes(x.e.group)) order.push(x.e.group);
    return scored
      .map((x, i) => ({ x, i }))
      .sort((a, b) => order.indexOf(a.x.e.group) - order.indexOf(b.x.e.group) || a.i - b.i)
      .map(({ x }) => x.e);
  }, [entries, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const combo = (e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'k' || e.code === 'Space');
      if (combo) {
        e.preventDefault();
        dispatch({ type: 'SET_SPOTLIGHT', open: !open });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch, open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => { setIndex(0); }, [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-row="${index}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  if (!open) return null;

  const close = () => dispatch({ type: 'SET_SPOTLIGHT', open: false });
  const run = (e: Entry | undefined) => {
    if (!e) return;
    close();
    e.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIndex(i => Math.min(results.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(results[index]); }
    else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); close(); }
  };

  let lastGroup = '';

  return (
    <div
      onMouseDown={close}
      style={{ position: 'fixed', inset: 0, zIndex: 10020, fontFamily: SYSTEM_FONT }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '21%',
          left: '50%',
          width: 'min(660px, calc(100vw - 48px))',
          transform: 'translateX(-50%)',
          borderRadius: '16px',
          overflow: 'hidden',
          background: state.dark ? 'rgba(34, 34, 38, 0.72)' : 'rgba(244, 244, 246, 0.72)',
          backdropFilter: 'saturate(190%) blur(48px)',
          WebkitBackdropFilter: 'saturate(190%) blur(48px)',
          border: c.panelBorder,
          boxShadow: '0 0 0 0.5px rgba(0,0,0,0.3), 0 30px 80px rgba(0,0,0,0.42)',
          animation: 'spotlightIn 0.14s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '56px', padding: '0 18px' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="9.2" cy="9.2" r="6.6" stroke={c.textSecondary} strokeWidth="2" />
            <path d="M14.2 14.2l5.2 5.2" stroke={c.textSecondary} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Spotlight Search"
            spellCheck={false}
            autoComplete="off"
            className="spotlight-input"
            style={{
              flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: SYSTEM_FONT, fontSize: '24px', fontWeight: 400, letterSpacing: '-0.01em',
              color: c.text, caretColor: ACCENT,
            }}
          />
        </div>

        {results.length > 0 && (
          <div ref={listRef} style={{ borderTop: `1px solid ${c.separator}`, padding: '6px 8px 8px', maxHeight: '340px', overflowY: 'auto' }}>
            {results.map((e, i) => {
              const header = e.group !== lastGroup ? e.group : null;
              lastGroup = e.group;
              const active = i === index;
              return (
                <div key={e.id}>
                  {header && (
                    <div style={{ fontSize: '11px', fontWeight: 600, color: c.textTertiary, padding: '7px 10px 4px' }}>{header}</div>
                  )}
                  <div
                    data-row={i}
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => run(e)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', height: '34px', padding: '0 10px',
                      borderRadius: '7px', cursor: 'default',
                      background: active ? ACCENT : 'transparent',
                    }}
                  >
                    {e.icon ? (
                      <img src={e.icon} alt="" draggable={false} style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
                        background: active ? 'rgba(255,255,255,0.2)' : c.hover,
                        color: active ? '#fff' : c.textSecondary,
                      }}>{e.glyph}</div>
                    )}
                    <span style={{ fontSize: '14px', color: active ? '#fff' : c.text, whiteSpace: 'nowrap' }}>{e.title}</span>
                    <span style={{
                      fontSize: '13px', color: active ? 'rgba(255,255,255,0.8)' : c.textTertiary,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{e.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {results.length === 0 && (
          <div style={{ borderTop: `1px solid ${c.separator}`, padding: '18px', fontSize: '13px', color: c.textTertiary }}>
            No results
          </div>
        )}
      </div>
      <style>{`
        @keyframes spotlightIn { from { opacity: 0; transform: translateX(-50%) scale(0.985); } to { opacity: 1; transform: translateX(-50%) scale(1); } }
        .spotlight-input::placeholder { color: ${c.textTertiary}; }
      `}</style>
    </div>
  );
}
