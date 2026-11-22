export const HOME_CSS = `
.hm { --ease: cubic-bezier(0.2, 0.8, 0.2, 1); --top: clamp(112px, 22svh, 200px); container-type: inline-size; }
html:has(.hm) { scroll-snap-type: y proximity; scroll-padding-top: 0; }
.hm-body { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.site:has(.hm) { padding-top: 0; padding-bottom: 0; }

.hm-reach { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 24px; margin-top: 8px; }
.hm-btn { display: inline-flex; align-items: center; height: 36px; padding: 0 16px; background: var(--ink); color: var(--bg); font-size: 14px; line-height: 1; font-weight: 500; text-decoration: none; transition: opacity 0.2s; }
.hm-btn:hover { opacity: 0.8; }

.hm-sec { position: relative; display: flex; flex-direction: column; min-height: 100vh; min-height: 100svh; padding: var(--top) 0 64px; scroll-snap-align: start; scroll-margin-top: 0; }
.hm-anchor { position: absolute; top: 0; left: 0; width: 1px; height: 1px; }
:is(#contact) { padding-bottom: 32px; }
.hm-label { margin: 0 0 20px; font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--half); }
.hm-line { margin-bottom: 24px; }

.hm-wide { --w: min(1040px, 100cqw); width: var(--w); margin-left: calc((100% - var(--w)) / 2); }
.hm-sec-wide .hm-label { width: min(1040px, 100cqw); margin-left: calc((100% - min(1040px, 100cqw)) / 2); }

.hm-posts { border-top: 1px solid var(--rule); }
.hm-post { position: relative; display: flex; align-items: baseline; justify-content: space-between; gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--rule); text-decoration: none; color: inherit; }
.hm-post-t { min-width: 0; font-size: 16px; line-height: 24px; color: var(--ink); transition: opacity 0.2s; }
.hm-post:hover .hm-post-t { opacity: 0.6; }
.hm-post-m { flex-shrink: 0; font-size: 13px; line-height: 24px; color: var(--faint); font-variant-numeric: tabular-nums; }

.hm-cal { position: relative; height: 680px; border: 1px solid var(--rule); background: var(--bg); overflow: hidden; }
.hm-cal-ph { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--faint); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.hm-cal iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #fff; opacity: 0; transition: opacity 0.5s var(--ease); }
.hm-cal[data-ready] iframe { opacity: 1; }
.hm-alt { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; margin: 16px 0 64px; font-size: 14px; line-height: 20px; color: var(--faint); }
.hm-alt a { color: var(--text); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; text-decoration-color: var(--rule); transition: color 0.2s, text-decoration-color 0.2s; }
.hm-alt a:hover { color: var(--ink); text-decoration-color: currentColor; }

.hm-foot { display: flex; justify-content: space-between; gap: 16px; margin-top: auto; padding-top: 16px; border-top: 1px solid var(--rule); font-size: 12px; line-height: 16px; color: var(--faint); }
.hm-foot a { color: var(--faint); text-decoration: none; transition: color 0.2s; }
.hm-foot a:hover { color: var(--ink); }

@media (min-width: 720px) and (min-height: 640px) {
  html:has(.hm) { scroll-snap-type: y mandatory; }
  .hm { --top: clamp(84px, 12svh, 140px); --bot: clamp(40px, 5svh, 64px); --avail: calc(100svh - var(--top) - var(--bot) - 36px); }
  .hm-sec { height: 100vh; height: 100svh; min-height: 0; padding: var(--top) 0 var(--bot); overflow: visible clip; scroll-snap-stop: always; }
  .hm-intro { justify-content: center; padding-bottom: calc(var(--bot) + 6svh); }
  .hm .hm-proj .pt-compact .pt-grid { grid-auto-rows: clamp(48px, calc((var(--avail) - 60px) / 7), 112px); }
  .hm-slot { flex: none; max-height: min(720px, calc(var(--avail) - 135px)); overflow: hidden; }
  .hm-slot > .hm-cal { height: 100%; }
  .hm-alt { margin-bottom: 16px; }
  @media (prefers-reduced-motion: no-preference) {
    .hm-anim .hm-sec > * { opacity: 0; transform: translate3d(0, 8px, 0); }
    .hm-anim .hm-sec.is-on > * { opacity: 1; transform: none; transition: opacity 0.22s var(--ease), transform 0.22s var(--ease); }
  }
}
@media (min-width: 720px) and (min-height: 640px) and (max-height: 759px) {
  .hm-work .wt-else { display: none; }
  .hm-work .wt-brief { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
}

.hm-idx { display: none; }
@media (min-width: 1240px) and (min-height: 560px) {
  .hm-idx { position: fixed; z-index: 5; left: 28px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; padding-left: 14px; border-left: 1px solid var(--rule); }
}
.hm-idx-mark { position: absolute; left: -1px; top: 6px; width: 1px; height: 16px; background: var(--ink); transform: translateY(var(--y, 0)); transition: transform 0.4s var(--ease); }
.hm-idx-a { display: block; height: 28px; font-size: 12px; line-height: 28px; color: var(--faint); text-decoration: none; transition: color 0.2s; }
.hm-idx-a:hover, .hm-idx-a[aria-current] { color: var(--ink); }
.hm-idx-a:focus-visible { outline: 1px solid var(--ink); outline-offset: 2px; }

@media (max-width: 640px) {
  .hm { --top: 108px; }
  .hm-post { flex-direction: column; gap: 2px; padding: 14px 0; }
  .hm-post-m { font-size: 12px; line-height: 16px; }
  .hm-cal { height: 620px; }
  .hm .site-socials { gap: 4px 18px; }
  .hm .site-bar { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hm *, .hm *::before, .hm *::after { transition-duration: 0.01ms !important; transition-delay: 0s !important; }
}
`;
