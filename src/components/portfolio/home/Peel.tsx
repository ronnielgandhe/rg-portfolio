import { useEffect, useRef, type MouseEvent } from 'react';
import { reduced } from './motion';

const SWATCH = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABQAFADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDlJ+x9TV6IYt4h6jNULjiJT71pMNpRP7qgV83L4D6ypskSpUlRLUgrlZyscKcDTRSjnikQzoLFdtpGPbNSmkjG1FX0AFBr6ynHlgo9keLJ3k2eU/E//kYF/wCuQqVv+Pa2H/TMfypnxQXGuRt6xCnnm3t/+uY/lRh9cTT9X+prX0w1b0j+hp7fNmt4/VufpV3dvkZvU1VtfvyTH+Fdi/U9f0q1EMCvnamkUj6GoTLThTBTxXOc7HCp7VfMuYl9WFVxV/SU3XJbsi1pQhz1Yx8zGq+WDZs5pDRmkr6k8c8z+KSYv7d/VcUxebO1P/TMfyq/8UYd0cMoH3cf1rPtju0y0b/pmP5VhRly16f+Jr7zqqQ5sPVX9xP7v+GNtFUBY05RO/8AePc1YWq0U0W4Juw3YHvVkV89Ubbuz2p36jxThTBThWTMmPFbGkx7Lcuern9BWREhkdUXqxwK6KNBHGqL0UYr0stpc1RzfQ4cZO0eXuPpKSg17Z55y3j21+06eQBk7Dj6jmuY0o79Ftz/AHRj8jXea/H5lmDj7rfzrkILZbeB4UGFDEgfWvMrVPZ1fmmethaSq0vk0/mZttOZ7Pdn5o2A/A1v6ZcGeAbjll4NcpoxIs5c93A/StnSZxFPtY4VuKwxNPRpdD06adXDKT3N+nKKaK1LDTy+JZxhOynq3/1q4aVKdWXLFHDUqRpq7JdLtto89xyR8g/rWhQTim5r6ShRjRgoo8epN1JczFopM0VqSV79PMtJV/2ciuSYZY+9dm/KkVyVxH5czr/dY15eYxs4y+R6eXT+KJyOk4ayCrgsHOR37Vv6doGo3rKyQmKP/npJ8o/+vXa6fouk6Zg2dlEjj+Mjc35mrjzV1/Vk5XbCOazhSVOEduv/AADN0zRILABpZGuJR0LfdX6CtFnFRNITTC2a3hTjBWijzalWdSXNN3Y8tmgGowaXNWSSZozTM0u6gYrHiuc1Rdt2/wDtAGugduKwtX/16n/Zrhx6vRv2Z2YJ2rWP/9k=';
const SHOT = '/projects/ronnielos.png';

export const PEEL_CSS = `
@property --f { syntax: '<length>'; inherits: true; initial-value: 14px; }
.hm-peel { --f: 14px; --back: #f1f1ef; --edge: rgba(0, 0, 0, 0.14); position: fixed; inset: 0; z-index: 20; overflow: hidden; pointer-events: none; transition: --f 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
.site-dark .hm-peel, .rg-dark .hm-peel { --back: #262624; --edge: rgba(0, 0, 0, 0.5); }
.hm-peel:has(.hm-peel-hit:hover), .hm-peel:has(.hm-peel-hit:focus-visible) { --f: 60px; }
.hm-peel-under, .hm-peel-shade, .hm-peel-flap { position: absolute; inset: 0; }
.hm-peel-under { background: url("${SWATCH}") left bottom / 120px 120px no-repeat; clip-path: polygon(0 calc(100% - var(--f)), var(--f) 100%, 0 100%); }
.hm-peel-full { position: absolute; inset: 0; background: #fff center / cover no-repeat; opacity: 0; }
.hm-peel.is-warm .hm-peel-full { background-image: url("${SHOT}"); }
.hm-peel-shade { background: var(--edge); clip-path: polygon(0 calc(100% - var(--f) - 1px), calc(var(--f) + 1px) 100%, calc(var(--f) + 1.5px) calc(100% - var(--f) - 1.5px)); }
.hm-peel-flap { background: var(--back); clip-path: polygon(0 calc(100% - var(--f)), var(--f) 100%, var(--f) calc(100% - var(--f))); }
.hm-peel-label { position: absolute; left: calc(var(--f) * 0.62); bottom: calc(var(--f) * 0.62); transform: translate(-50%, 50%) rotate(45deg); font-size: 10px; line-height: 12px; letter-spacing: 0.04em; color: var(--half); white-space: nowrap; opacity: 0; transition: opacity 0.25s ease; }
.hm-peel:has(.hm-peel-hit:hover) .hm-peel-label, .hm-peel:has(.hm-peel-hit:focus-visible) .hm-peel-label { opacity: 1; transition-delay: 0.15s; }
.hm-peel-hit { position: absolute; left: 0; bottom: 0; width: 60px; height: 60px; clip-path: polygon(0 0, 0 100%, 100% 100%); pointer-events: auto; outline: none; }
.hm-peel.is-peeling { transition: --f 0.65s cubic-bezier(0.55, 0, 0.25, 1); }
.hm-peel.is-peeling .hm-peel-label { opacity: 0 !important; transition-delay: 0s !important; }
.hm-peel.is-peeling .hm-peel-full { opacity: 1; transition: opacity 0.25s ease; }
@media (max-width: 719px) { .hm-peel { display: none; } }
@media (prefers-reduced-motion: reduce) {
  .hm-peel, .hm-peel * { transition: none !important; }
  .hm-peel:has(.hm-peel-hit:hover), .hm-peel:has(.hm-peel-hit:focus-visible) { --f: 14px; }
}
`;

export default function Peel() {
  const root = useRef<HTMLDivElement>(null);
  const warmed = useRef(false);

  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      const el = root.current;
      if (!e.persisted || !el) return;
      el.classList.remove('is-peeling');
      el.style.removeProperty('--f');
      el.querySelector<HTMLElement>('.hm-peel-full')?.style.removeProperty('view-transition-name');
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const warm = () => {
    if (warmed.current) return;
    warmed.current = true;
    root.current?.classList.add('is-warm');
  };

  const peel = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const el = root.current;
    if (!el || reduced()) return;
    e.preventDefault();
    warm();
    const href = e.currentTarget.href;
    const full = el.querySelector<HTMLElement>('.hm-peel-full');
    if (full) full.style.setProperty('view-transition-name', 'rg-desktop');
    el.classList.add('is-peeling');
    el.style.setProperty('--f', `${Math.ceil((window.innerWidth + window.innerHeight) * 1.05)}px`);
    window.setTimeout(() => location.assign(href), 680);
  };

  return (
    <div ref={root} className="hm-peel">
      <a href="/desktop" className="hm-peel-hit" aria-label="open ronnielos" onClick={peel} onPointerEnter={warm} onFocus={warm} />
      <div className="hm-peel-under"><div className="hm-peel-full" /></div>
      <div className="hm-peel-shade" />
      <div className="hm-peel-flap" />
      <span className="hm-peel-label" aria-hidden="true">ronnielos</span>
    </div>
  );
}
