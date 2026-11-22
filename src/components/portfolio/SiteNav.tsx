import { useEffect, useLayoutEffect, useState } from 'react';

export const SITE_FONT = "'Manrope', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif";

export function readTheme() {
  try { return localStorage.getItem('rg-theme') === 'dark'; } catch { return false; }
}

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle('rg-dark', dark);
  root.style.backgroundColor = dark ? '#0e0e0e' : '#ffffff';
  const meta = document.querySelector<HTMLMetaElement>('meta[name=theme-color]');
  if (meta) meta.content = dark ? '#0e0e0e' : '#ffffff';
}

export function useSiteTheme() {
  const [dark, setDark] = useState(false);
  useLayoutEffect(() => {
    const sync = () => setDark(readTheme());
    sync();
    window.addEventListener('rg-theme', sync);
    window.addEventListener('pageshow', sync);
    return () => { window.removeEventListener('rg-theme', sync); window.removeEventListener('pageshow', sync); };
  }, []);
  const toggle = () => {
    const next = !readTheme();
    try { localStorage.setItem('rg-theme', next ? 'dark' : 'light'); } catch {}
    applyTheme(next);
    setDark(next);
  };
  return { dark, toggle };
}

export default function SiteNav({ crumb, back, wide, dark, onToggleTheme }: { active?: string; crumb?: string; back?: { href: string; label: string }; wide?: boolean; dark: boolean; onToggleTheme: () => void }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.hash || url.search !== location.search) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      <nav className={wide ? 'sn-nav sn-wide' : 'sn-nav'}>
        <div className="sn-in">
          {back && (
            <a href={back.href} className="sn-back" aria-label={`back to ${back.label}`} title={`back to ${back.label}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
            </a>
          )}
          <a href="/" className="sn-name">Ronniel Gandhe</a>
          {crumb && (
            <>
              <span className="sn-sep" aria-hidden="true">/</span>
              <span className="sn-here">{crumb}</span>
            </>
          )}
          <span className="sn-gap" />
          <span className="sn-right">
            <button className="sn-theme" onClick={onToggleTheme} aria-label={dark ? 'switch to light mode' : 'switch to dark mode'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2.2v15.6a7.8 7.8 0 010-15.6z" /></svg>
            </button>
          </span>
        </div>
      </nav>
      <div className="sn-fade-bottom" />
    </>
  );
}
