import { useEffect, useState } from 'react';

const LINKS = [
  { id: 'projects', label: 'projects', href: '/projects' },
  { id: 'writing', label: 'writing', href: '/writing' },
];

export const SITE_FONT = "'Manrope', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

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

function seenBefore() {
  try {
    const seen = sessionStorage.getItem('rg-nav-seen') === '1';
    sessionStorage.setItem('rg-nav-seen', '1');
    return seen;
  } catch { return false; }
}

export default function SiteNav({ active, crumb, dark, onToggleTheme }: { active?: string; crumb?: string; dark: boolean; onToggleTheme: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [settled] = useState(seenBefore);

  useEffect(() => {
    const root = document.querySelector('.site');
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || url.pathname.endsWith('.pdf')) return;
      e.preventDefault();
      root?.classList.add('site-leaving');
      window.setTimeout(() => { location.href = url.href; }, 170);
    };
    const onShow = () => root?.classList.remove('site-leaving');
    document.addEventListener('click', onClick);
    window.addEventListener('pageshow', onShow);
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('pageshow', onShow); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className="sn-nav">
        <div className={`sn-crumb${scrolled ? ' sn-scrolled' : ''}${settled ? ' sn-settled' : ''}`}>
          <span className="sn-dot" />
          <a href="/" className="sn-name">Ronniel Gandhe</a>
          {crumb && (
            <>
              <span className="sn-sep">›</span>
              <span className="sn-here">{crumb}</span>
            </>
          )}
          <span className="sn-gap" />
          {LINKS.map((l) => (
            <a key={l.id} href={l.href} className={active === l.id ? 'sn-link sn-link-on' : 'sn-link'}>{l.label}</a>
          ))}
          <button className="sn-theme" onClick={onToggleTheme} aria-label={dark ? 'switch to light mode' : 'switch to dark mode'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2.2v15.6a7.8 7.8 0 010-15.6z" /></svg>
          </button>
        </div>
      </nav>
      <div className="sn-fade-top" />
      <div className="sn-fade-bottom" />
      <style>{`
        .site {
          --bg: #ffffff;
          --ink: #1a1a1a;
          --text: rgba(26, 26, 26, 0.6);
          --faint: rgba(26, 26, 26, 0.3);
          --half: rgba(26, 26, 26, 0.4);
          --rule: rgba(0, 0, 0, 0.08);
          --hover: #fafaf8;
          --strong: #1a1a1a;
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
          --bg: #0e0e0e;
          --ink: #f2f2f0;
          --text: rgba(242, 242, 240, 0.62);
          --faint: rgba(242, 242, 240, 0.32);
          --half: rgba(242, 242, 240, 0.42);
          --rule: rgba(255, 255, 255, 0.1);
          --hover: #161616;
          --strong: #f2f2f0;
        }
        .site *, .site *::before, .site *::after { box-sizing: border-box; }
        .site ::selection { background: rgba(120, 120, 120, 0.25); }
        :where(.site) button { font: inherit; color: inherit; background: none; border: none; padding: 0; cursor: pointer; }

        .sn-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 20;
          display: flex; align-items: center; justify-content: center;
          padding: 12px 0; margin-top: 40px; pointer-events: none;
        }
        .sn-crumb {
          display: flex; align-items: center; gap: 12px; padding: 8px 16px; pointer-events: auto;
          border: 1px solid transparent; border-radius: 0;
          animation: snCrumb 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease;
        }
        .sn-crumb.sn-scrolled {
          background: color-mix(in srgb, var(--bg) 72%, transparent);
          -webkit-backdrop-filter: saturate(160%) blur(16px); backdrop-filter: saturate(160%) blur(16px);
          border-color: var(--rule);
        }
        .sn-settled, .sn-settled .sn-dot { animation: none; }
        .sn-dot { width: 9px; height: 9px; border-radius: 0; background: #1a1a1a; animation: snDot 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .site-dark .sn-dot { background: #f2f2f0; }
        .sn-name { font-size: 15px; line-height: 20px; font-weight: 400; letter-spacing: -0.01em; color: var(--ink); text-decoration: none; }
        .sn-sep { font-size: 14px; line-height: 20px; color: var(--faint); }
        .sn-here { font-size: 14px; line-height: 20px; color: var(--text); }
        .sn-gap { width: 12px; }
        .sn-link { position: relative; font-size: 14px; line-height: 20px; color: var(--text); text-decoration: none; transition: color 0.2s; }
        .sn-link::after { content: ''; position: absolute; left: 0; right: 0; bottom: -3px; height: 1px; background: var(--ink); transform: scaleX(0); transform-origin: left; transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .sn-link:hover::after, .sn-link-on::after { transform: scaleX(1); }
        .sn-link-on::after { animation: snDraw 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .sn-link:hover, .sn-link-on { color: var(--ink); }
        .sn-theme { display: inline-flex; align-items: center; color: var(--faint); transition: color 0.2s; }
        .sn-theme:hover { color: var(--ink); }
        .sn-fade-top { position: fixed; top: 0; left: 0; right: 0; height: 72px; z-index: 10; pointer-events: none; background: linear-gradient(to bottom, var(--bg), transparent); }
        .sn-fade-bottom { position: fixed; bottom: 0; left: 0; right: 0; height: 120px; z-index: 10; pointer-events: none; background: linear-gradient(to top, var(--bg), transparent); }

        .site-col { margin: 0 auto; width: 100%; max-width: 576px; }
        .site > :not(nav):not(.sn-fade-top):not(.sn-fade-bottom):not(style) { transition: opacity 0.16s ease, transform 0.16s ease; }
        .site-leaving > :not(nav):not(.sn-fade-top):not(.sn-fade-bottom):not(style) { opacity: 0; transform: translateY(6px); }
        .site-meta { display: flex; align-items: center; gap: 6px; height: 16px; margin-bottom: 16px; font-size: 12px; line-height: 16px; color: var(--half); font-variant-numeric: tabular-nums; }
        .site-h1 { margin: 0; font-size: 16px; line-height: 24px; font-weight: 500; color: var(--ink); }
        .site-p { margin: 0; font-size: 16px; line-height: 26px; color: var(--text); }
        .site-body { margin-top: 32px; display: flex; flex-direction: column; gap: 24px; }
        .site-link { color: var(--strong); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; transition: opacity 0.2s; white-space: nowrap; }
        .site-link:hover { opacity: 0.6; }
        .site-ico { display: inline-block; width: 14px; height: 14px; object-fit: contain; vertical-align: -2px; margin-right: 5px; border-radius: 0; }
        .site-socials { display: flex; align-items: center; gap: 8px; line-height: 26px; flex-wrap: wrap; }
        .site-social { position: relative; display: inline-flex; align-items: center; gap: 6px; color: var(--strong); text-decoration: none; }
        .site-social svg { width: 14px; height: 14px; flex-shrink: 0; color: var(--text); transition: color 0.2s; }
        .site-social:hover svg { color: var(--strong); }
        .site-social::after { content: ''; position: absolute; left: 20px; right: 0; bottom: 2px; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .site-social:hover::after { transform: scaleX(1); }
        .site-bar { color: var(--text); }
        .site-enter { animation: siteEnter 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        @keyframes siteEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes snCrumb { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes snDraw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes snDot { from { transform: scale(0); } to { transform: scale(1); } }
        @media (max-width: 640px) { .site { padding-bottom: 64px; } }
        @media (prefers-reduced-motion: reduce) { .site-enter, .sn-crumb, .sn-dot { animation: none; } }
      `}</style>
    </>
  );
}
