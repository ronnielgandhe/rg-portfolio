import { useEffect, useLayoutEffect, useState } from 'react';

export type Play = 'full' | 'quick' | 'still';
export interface Opening { m: Play; t: number }

export interface HeroAction {
  label: string;
  href?: string;
  primary?: boolean;
  external?: boolean;
  onClick?(e: React.MouseEvent<HTMLElement>): void;
}

declare global {
  interface Window { __rgh?: Record<string, Opening> }
}

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function bootFn(k: string): Opening {
  try {
    const w = window;
    const g = (w.__rgh = w.__rgh || {});
    if (g[k]) return g[k];
    const r = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let q = false;
    try { q = !!sessionStorage.getItem('rg-hero:' + k); sessionStorage.setItem('rg-hero:' + k, '1'); } catch { q = false; }
    const o: Opening = { m: r ? 'still' : q ? 'quick' : 'full', t: performance.now() };
    g[k] = o;
    document.documentElement.setAttribute('data-rgh-' + k, o.m);
    return o;
  } catch {
    return { m: 'still', t: 0 };
  }
}

const boot = bootFn;

export function BootScript({ id }: { id: string }) {
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(${String(bootFn)})(${JSON.stringify(id)})` }} />;
}

export function useOpening(id: string) {
  const [o, setO] = useState<Opening | null>(null);
  useIso(() => setO(boot(id)), [id]);
  return o;
}

export const since = (o: Opening) => performance.now() - o.t;

export const on = (id: string, m: Play) => `:root[data-rgh-${id}=${m}]`;

export function useIdle(active: boolean, every: number, fn: () => void) {
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => { if (document.visibilityState === 'visible') fn(); }, every);
    return () => window.clearInterval(id);
  }, [active, every, fn]);
}

export const EASE = 'cubic-bezier(0.2,0.8,0.2,1)';
export const SPRING = 'cubic-bezier(0.22,1,0.36,1)';

export const ACTIONS_CSS = (p: string) => `
.${p}-acts{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.${p}-btn{display:inline-flex;align-items:center;justify-content:center;height:38px;padding:0 20px;border:1px solid rgba(0,0,0,.1);border-radius:0;font:inherit;font-size:13px;font-weight:500;color:var(--ink);background:transparent;text-decoration:none;cursor:pointer;white-space:nowrap;transition:background .2s,border-color .2s,opacity .2s}
.site-dark .${p}-btn{border-color:rgba(255,255,255,.16)}
.${p}-btn:hover{background:var(--hover)}
.${p}-btn-p,.site-dark .${p}-btn-p{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.${p}-btn-p:hover{background:var(--ink);opacity:.86}
`;

export function Actions({ p, actions }: { p: string; actions: HeroAction[] }) {
  return (
    <div className={`${p}-acts`}>
      {actions.map((a) => {
        const cls = a.primary ? `${p}-btn ${p}-btn-p` : `${p}-btn`;
        if (!a.href) return <button key={a.label} type="button" className={cls} onClick={a.onClick}>{a.label}</button>;
        return (
          <a key={a.label} href={a.href} onClick={a.onClick} className={cls} target={a.external ? '_blank' : undefined} rel={a.external ? 'noopener noreferrer' : undefined}>
            {a.label}
          </a>
        );
      })}
    </div>
  );
}

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
