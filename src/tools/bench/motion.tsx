import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

export const EASE_CSS = 'cubic-bezier(0.33, 1, 0.68, 1)';
export const ease = (t: number) => 1 - (1 - t) ** 3;

export function prefersReduced() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function useReveal<T extends Element>(ref: RefObject<T | null>, threshold = 0.2) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced() || typeof IntersectionObserver === 'undefined') { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return on;
}

export function useFlip(ref: RefObject<HTMLElement | null>, signature: string) {
  const prev = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = new Map<string, number>();
    const still = prefersReduced();
    const seen = prev.current.size > 0;
    el.querySelectorAll<HTMLElement>('[data-flip]').forEach((k) => {
      const id = k.dataset.flip!;
      const top = k.offsetTop;
      next.set(id, top);
      if (still) return;
      const p = prev.current.get(id);
      if (p !== undefined && Math.abs(p - top) > 1) {
        k.animate([{ transform: `translateY(${p - top}px)` }, { transform: 'translateY(0)' }], { duration: 480, easing: EASE_CSS });
      } else if (p === undefined && seen) {
        k.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, easing: EASE_CSS });
      }
    });
    prev.current = next;
  }, [ref, signature]);
}

export function CountUp({ value, fmt, play, delay = 0, className }: { value: number; fmt: (v: number) => string; play: boolean; delay?: number; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const shown = useRef<number | null>(null);
  const f = useRef(fmt);
  f.current = fmt;
  useEffect(() => {
    const fmt = f.current;
    const node = el.current;
    if (!node || !play) return;
    const from = shown.current ?? 0;
    shown.current = value;
    if (prefersReduced() || from === value) { node.textContent = fmt(value); return; }
    let raf = 0;
    const start = performance.now() + (from === 0 ? delay : 0);
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / 600));
      node.textContent = fmt(from + (value - from) * ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    node.textContent = fmt(from);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); node.textContent = fmt(value); };
  }, [value, play, delay]);
  return <span ref={el} className={className}>{fmt(value)}</span>;
}

export function Bar({ frac, on, delay = 0 }: { frac: number; on: boolean; delay?: number }) {
  const f = Math.max(0.02, Math.min(1, frac));
  return (
    <span className="bx-bar">
      <span className="bx-bar-fill" style={{ transform: `scaleX(${on ? f : 0})`, transitionDelay: `${delay}ms` }} />
    </span>
  );
}

export function useFirstPass(on: boolean, ms = 1400) {
  const [first, setFirst] = useState(true);
  useEffect(() => {
    if (!on) return;
    const t = window.setTimeout(() => setFirst(false), ms);
    return () => window.clearTimeout(t);
  }, [on, ms]);
  return first;
}
