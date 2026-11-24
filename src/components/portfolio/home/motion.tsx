import { useEffect, type MouseEvent, type RefObject } from 'react';

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const secs = Array.from(el.querySelectorAll<HTMLElement>('.hm-sec'));
    const vh = window.innerHeight;
    for (const s of secs) {
      const r = s.getBoundingClientRect();
      if (r.top < vh * 0.5 && r.bottom > vh * 0.5) s.classList.add('is-on');
    }
    if (!secs.some((s) => s.classList.contains('is-on'))) secs[0]?.classList.add('is-on');
    requestAnimationFrame(() => el.classList.add('hm-anim'));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle('is-on', e.intersectionRatio >= 0.5);
    }, { threshold: [0, 0.5, 1] });
    for (const s of secs) io.observe(s);
    return () => io.disconnect();
  }, [root]);
}

export function jumpTo(e: MouseEvent<HTMLElement>) {
  const a = (e.target as HTMLElement).closest('a');
  const href = a?.getAttribute('href');
  if (!href || !href.startsWith('#') || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  if (href === '#contact') window.dispatchEvent(new Event('hm-book'));
  const target = href === '#top' ? null : document.getElementById(href.slice(1));
  if (href !== '#top' && !target) return;
  e.preventDefault();
  const behavior = reduced() ? 'auto' : 'smooth';
  if (target) target.scrollIntoView({ behavior, block: 'start' });
  else window.scrollTo({ top: 0, behavior });
  history.replaceState(null, '', target ? href : location.pathname);
}
