export const HOME_CSS = `
.hm { --ease: cubic-bezier(0.2, 0.8, 0.2, 1); --gap: 144px; container-type: inline-size; }

.hm-reach { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 24px; margin-top: 8px; }
.hm-btn { display: inline-flex; align-items: center; height: 36px; padding: 0 16px; background: var(--ink); color: var(--bg); font-size: 14px; line-height: 1; font-weight: 500; text-decoration: none; transition: opacity 0.2s; }
.hm-btn:hover { opacity: 0.8; }

.hm-sec { margin-top: var(--gap); scroll-margin-top: 84px; }
.hm-label { margin: 0 0 20px; font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--half); }
.hm-line { margin-bottom: 24px; }

.hm-wide { --w: min(1040px, 100cqw); width: var(--w); margin-left: calc((100% - var(--w)) / 2); }
.hm-sec-wide .hm-label { width: min(1040px, 100cqw); margin-left: calc((100% - min(1040px, 100cqw)) / 2); }

.hm-posts { border-top: 1px solid var(--rule); }
.hm-post { position: relative; display: flex; align-items: baseline; justify-content: space-between; gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--rule); text-decoration: none; color: inherit; }
.hm-post-t { min-width: 0; font-size: 16px; line-height: 24px; color: var(--ink); transition: opacity 0.2s; }
.hm-post:hover .hm-post-t { opacity: 0.6; }
.hm-post-m { flex-shrink: 0; font-size: 13px; line-height: 24px; color: var(--faint); font-variant-numeric: tabular-nums; }

.hm-os { display: block; border: 1px solid rgba(0, 0, 0, 0.1); background: #fff; text-decoration: none; color: #1a1a1a; transition: border-color 0.3s; }
.site-dark .hm-os, .rg-dark .hm-os { border-color: #fff; }
.hm-os:hover { border-color: rgba(0, 0, 0, 0.3); }
.hm-os-bar { display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-bottom: 1px solid rgba(0, 0, 0, 0.08); font-size: 12px; color: rgba(26, 26, 26, 0.5); }
.hm-os-bar i { display: block; width: 9px; height: 9px; border: 1px solid rgba(26, 26, 26, 0.28); border-radius: 50%; }
.hm-os-bar span { flex: 1; margin-right: 39px; text-align: center; }
.hm-os-screen { display: block; overflow: hidden; aspect-ratio: 16 / 10; background: #fff; }
.hm-os-screen img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform 0.6s var(--ease); }
.hm-os:hover .hm-os-screen img { transform: scale(1.015); }

.hm-veil { position: fixed; inset: 0; z-index: 9998; background: #fff; pointer-events: none; }
.hm-zoom { position: fixed; z-index: 9999; box-sizing: border-box; overflow: hidden; background: #fff; pointer-events: none; }
.hm-zoom img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }

.hm-cal { position: relative; height: 680px; border: 1px solid var(--rule); background: var(--bg); overflow: hidden; }
.hm-cal-ph { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--faint); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.hm-cal iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #fff; opacity: 0; transition: opacity 0.5s var(--ease); }
.hm-cal[data-ready] iframe { opacity: 1; }
.hm-alt { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; margin: 16px 0 0; font-size: 14px; line-height: 20px; color: var(--faint); }
.hm-alt a { color: var(--text); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; text-decoration-color: var(--rule); transition: color 0.2s, text-decoration-color 0.2s; }
.hm-alt a:hover { color: var(--ink); text-decoration-color: currentColor; }

.hm-foot { display: flex; justify-content: space-between; gap: 16px; margin-top: var(--gap); padding-top: 16px; border-top: 1px solid var(--rule); font-size: 12px; line-height: 16px; color: var(--faint); }
.hm-foot a { color: var(--faint); text-decoration: none; transition: color 0.2s; }
.hm-foot a:hover { color: var(--ink); }

.hm-anim [data-reveal] { opacity: 0; transform: translate3d(0, 12px, 0); transition: opacity 0.5s var(--ease), transform 0.5s var(--ease); transition-delay: calc(var(--i, 0) * 60ms); }
.hm-anim [data-reveal].is-in { opacity: 1; transform: none; }
.hm-anim .hm-post[data-reveal] { transform: none; }
.hm-anim .hm-proj[data-reveal] { opacity: 1; transform: none; clip-path: inset(0 0 100% 0); transition: clip-path 0.6s var(--ease); }
.hm-anim .hm-proj[data-reveal].is-in { clip-path: inset(0 0 0 0); }
.hm-anim .hm-post::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px; background: var(--ink); opacity: 0.12; transform: scaleX(0); transform-origin: left; transition: transform 0.6s var(--ease); transition-delay: inherit; }
.hm-anim .hm-post.is-in::after { transform: scaleX(1); opacity: 0; transition: transform 0.6s var(--ease), opacity 0.4s var(--ease) 0.6s; }

.hm-idx { display: none; }
@media (min-width: 1240px) and (min-height: 560px) {
  .hm-idx { position: fixed; z-index: 5; left: 28px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; padding-left: 14px; border-left: 1px solid var(--rule); }
}
.hm-idx-mark { position: absolute; left: -1px; top: 6px; width: 1px; height: 16px; background: var(--ink); transform: translateY(var(--y, 0)); transition: transform 0.4s var(--ease); }
.hm-idx-a { display: block; height: 28px; font-size: 12px; line-height: 28px; color: var(--faint); text-decoration: none; transition: color 0.2s; }
.hm-idx-a:hover, .hm-idx-a[aria-current] { color: var(--ink); }
.hm-idx-a:focus-visible { outline: 1px solid var(--ink); outline-offset: 2px; }

@media (max-width: 640px) {
  .hm { --gap: 112px; }
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
