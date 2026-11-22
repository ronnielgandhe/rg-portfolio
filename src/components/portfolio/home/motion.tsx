import { useEffect, type MouseEvent, type RefObject } from 'react';

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || reduced() || !('IntersectionObserver' in window)) return;
    const target = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;
    if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    const vh = window.innerHeight;
    for (const it of items) if (it.getBoundingClientRect().top < vh) it.classList.add('is-in');
    el.classList.add('hm-anim');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -64px 0px' });
    for (const it of items) if (!it.classList.contains('is-in')) io.observe(it);
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
