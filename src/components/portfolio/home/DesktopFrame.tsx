import { useEffect, type MouseEvent } from 'react';
import { reduced } from './motion';

const SHOT = '/projects/ronnielos.png';
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

function nativeTransition() {
  const Rule = (window as unknown as { CSSViewTransitionRule?: new () => CSSRule }).CSSViewTransitionRule;
  if (!Rule) return false;
  const walk = (rules: CSSRuleList): boolean => {
    for (const r of Array.from(rules)) {
      if (r instanceof Rule && (r as CSSRule & { navigation?: string }).navigation === 'auto') return true;
      if (r instanceof CSSMediaRule && !matchMedia(r.conditionText).matches) continue;
      if ('cssRules' in r && walk((r as CSSGroupingRule).cssRules)) return true;
    }
    return false;
  };
  for (const s of Array.from(document.styleSheets)) {
    try { if (walk(s.cssRules)) return true; } catch { /* cross-origin sheet */ }
  }
  return false;
}

function clear() {
  document.querySelectorAll('.hm-zoom, .hm-veil').forEach((n) => n.remove());
}

function expand(e: MouseEvent<HTMLAnchorElement>) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (reduced() || nativeTransition()) return;
  e.preventDefault();
  const a = e.currentTarget;
  const href = a.href;
  const r = a.getBoundingClientRect();
  const bar = a.querySelector<HTMLElement>('.hm-os-bar')?.offsetHeight ?? 0;
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;

  const veil = document.createElement('div');
  veil.className = 'hm-veil';
  const zoom = document.createElement('div');
  zoom.className = 'hm-zoom';
  const img = document.createElement('img');
  img.src = SHOT;
  img.alt = '';
  zoom.appendChild(img);
  document.body.append(veil, zoom);

  const opts = { duration: 450, easing: EASE, fill: 'forwards' as const };
  veil.animate([{ opacity: 0 }, { opacity: 1 }], { ...opts, duration: 300 });
  zoom.animate(
    [
      { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px`, paddingTop: `${bar}px` },
      { top: '0px', left: '0px', width: `${vw}px`, height: `${vh}px`, paddingTop: '0px' },
    ],
    opts,
  ).finished.then(() => location.assign(href), () => location.assign(href));
}

export default function DesktopFrame() {
  useEffect(() => {
    const onShow = (ev: PageTransitionEvent) => { if (ev.persisted) clear(); };
    window.addEventListener('pageshow', onShow);
    return () => { window.removeEventListener('pageshow', onShow); clear(); };
  }, []);

  return (
    <a href="/desktop" className="hm-os" data-reveal onClick={expand} style={{ viewTransitionName: 'rg-desktop' }} aria-label="open ronnielos, the desktop">
      <span className="hm-os-bar" aria-hidden="true">
        <i /><i /><i />
        <span>ronnielos</span>
      </span>
      <span className="hm-os-screen">
        <img src={SHOT} alt="" loading="lazy" decoding="async" width={1440} height={900} />
      </span>
    </a>
  );
}
