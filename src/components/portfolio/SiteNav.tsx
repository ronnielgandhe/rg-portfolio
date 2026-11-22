import { useEffect, useRef, useState } from 'react';

const PAGES = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Writing', href: '/writing' },
  { label: 'RonnielOS', href: '/desktop' },
];

export const SITE_FONT = "'Geist', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

export function readTheme() {
  try { return localStorage.getItem('rg-theme') === 'dark'; } catch { return false; }
}

export function useSiteTheme() {
  const [dark, setDark] = useState(readTheme);
  useEffect(() => {
    document.documentElement.style.backgroundColor = dark ? '#0a0a0a' : '#ffffff';
  }, [dark]);
  const toggle = () => {
    setDark((d) => {
      try { localStorage.setItem('rg-theme', d ? 'light' : 'dark'); } catch {}
      return !d;
    });
  };
  return { dark, toggle };
}

export default function SiteNav({ page, dark, onToggleTheme }: { page: string; dark: boolean; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <>
      <nav className="sn-nav">
        <div className="sn-crumb">
          <span className="sn-dot" />
          <a href="/" className="sn-name">Ronniel Gandhe</a>
          <span className="sn-sep">›</span>
          <span className="sn-menu-wrap" ref={menuRef}>
            <button className="sn-page" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}>{page}</button>
            {menuOpen && (
              <div className="sn-menu">
                {PAGES.map((p) => (
                  <a key={p.href} href={p.href} className={p.label === page ? 'sn-item sn-item-on' : 'sn-item'}>{p.label}</a>
                ))}
                <a href="/Ronniel_Gandhe_Resume.pdf" target="_blank" rel="noopener noreferrer" className="sn-item">Resume</a>
                <div className="sn-rule" />
                <button className="sn-item" onClick={onToggleTheme}>{dark ? 'Light mode' : 'Dark mode'}</button>
              </div>
            )}
          </span>
        </div>
      </nav>
      <div className="sn-fade-top" />
      <div className="sn-fade-bottom" />
      <style>{`
        .site {
          --bg: #ffffff;
          --ink: rgb(38, 38, 38);
          --text: rgb(112, 112, 112);
          --faint: rgba(112, 112, 112, 0.4);
          --half: rgba(112, 112, 112, 0.5);
          --rule: rgba(112, 112, 112, 0.1);
          --strong: rgb(10, 10, 10);
          position: relative;
          min-height: 100vh;
          padding: 144px 24px 96px;
          background: var(--bg);
          color: var(--strong);
          font-family: ${SITE_FONT};
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          transition: background 0.3s ease;
        }
        .site-dark {
          --bg: #0a0a0a;
          --ink: rgb(237, 237, 237);
          --text: rgb(150, 150, 150);
          --faint: rgba(150, 150, 150, 0.45);
          --half: rgba(150, 150, 150, 0.55);
          --rule: rgba(150, 150, 150, 0.16);
          --strong: rgb(250, 250, 250);
        }
        .site *, .site *::before, .site *::after { box-sizing: border-box; }
        .site ::selection { background: rgba(120, 120, 120, 0.25); }
        :where(.site) button { font: inherit; color: inherit; background: none; border: none; padding: 0; cursor: pointer; }

        .sn-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 20;
          display: flex; align-items: center; justify-content: center;
          padding: 20px 0; margin-top: 40px; pointer-events: none;
        }
        .sn-crumb { display: flex; align-items: center; gap: 12px; pointer-events: auto; animation: snCrumb 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .sn-dot { width: 10px; height: 10px; border-radius: 50%; background: #3a3a3a; animation: snDot 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .site-dark .sn-dot { background: #d4d4d4; }
        .sn-name { font-size: 14px; line-height: 20px; color: var(--ink); text-decoration: none; }
        .sn-sep { font-size: 14px; line-height: 20px; color: var(--faint); }
        .sn-menu-wrap { position: relative; display: inline-flex; align-items: center; }
        .sn-page { font-size: 14px; line-height: 20px; color: var(--text); user-select: none; transition: color 0.2s; }
        .sn-page:hover { color: var(--ink); }
        .sn-menu {
          position: absolute; top: 28px; left: -12px; min-width: 148px; padding: 6px;
          background: var(--bg); border: 1px solid var(--rule); border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08); display: flex; flex-direction: column;
          animation: snMenu 0.16s ease-out both;
        }
        .sn-item {
          display: block; width: 100%; text-align: left; padding: 6px 10px; border-radius: 7px;
          font-size: 13px; line-height: 18px; color: var(--text); text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .sn-item:hover { background: var(--rule); color: var(--ink); }
        .sn-item-on { color: var(--ink); }
        .sn-rule { height: 1px; background: var(--rule); margin: 5px 4px; }
        .sn-fade-top { position: fixed; top: 0; left: 0; right: 0; height: 100px; z-index: 10; pointer-events: none; background: linear-gradient(to bottom, var(--bg), transparent); }
        .sn-fade-bottom { position: fixed; bottom: 0; left: 0; right: 0; height: 120px; z-index: 10; pointer-events: none; background: linear-gradient(to top, var(--bg), transparent); }

        .site-col { margin: 0 auto; width: 100%; max-width: 576px; }
        .site-enter { animation: siteEnter 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        @keyframes siteEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes snCrumb { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes snDot { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes snMenu { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) { .site { padding-bottom: 64px; } }
        @media (prefers-reduced-motion: reduce) { .site-enter, .sn-crumb, .sn-dot, .sn-menu { animation: none; } }
      `}</style>
    </>
  );
}
