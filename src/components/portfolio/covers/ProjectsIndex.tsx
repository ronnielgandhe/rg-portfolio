import { PROJECTS } from './projects';
import { PROJECT_BRAND, ProjectLogo } from './brand';

const CSS = `
.pt { container: pt / inline-size; width: 100%; }
.pt-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-rows: minmax(112px, auto); gap: 12px; margin: 0; padding: 0; list-style: none; }
.pt-cell { display: flex; min-width: 0; }
.pt-leanfetch { grid-column: span 4; grid-row: span 3; }
.pt-harvey { grid-column: span 2; grid-row: span 3; }
.pt-game-solver-suite, .pt-how-many-clicks, .pt-wallstreetbets { grid-column: span 2; grid-row: span 2; }
.pt-ronnielos { grid-column: span 6; grid-row: span 2; }
.pt-compact .pt-grid { grid-auto-rows: minmax(92px, auto); gap: 10px; }
.pt-compact .pt-leanfetch, .pt-compact .pt-harvey { grid-column: span 3; grid-row: span 3; }

.pt-tile { --c: #888; --cd: #666; --k: #fff; position: relative; display: flex; flex-direction: column; flex: 1; min-width: 0; overflow: hidden; border-radius: 0; background: var(--c); color: var(--k); text-decoration: none; isolation: isolate; }
.site-dark .pt-tile, .rg-dark .pt-tile { background: var(--cd); }
.pt-tile::after { content: ''; position: absolute; inset: 0; z-index: 0; background: var(--ov, #000); opacity: 0; pointer-events: none; transition: opacity 0.35s ease; }
.pt-tile:hover::after, .pt-tile:focus-visible::after { opacity: var(--ovo, 0.08); }
.pt-tile:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
.pt-text { flex: none; display: block; position: relative; z-index: 3; padding: 20px 48px 0 22px; max-width: calc(34ch + 70px); }
.pt-tile h3 { margin: 0; font-size: 19px; line-height: 24px; font-weight: 500; letter-spacing: -0.015em; color: inherit; overflow-wrap: anywhere; }
.pt-tile p { margin: 6px 0 0; font-size: 14px; line-height: 20px; color: inherit; opacity: 0.86; overflow-wrap: anywhere; }
.pt-go { position: absolute; z-index: 3; right: 18px; top: 22px; width: 16px; height: 16px; opacity: 0; transform: translateX(-4px); transition: opacity 0.3s, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
.pt-tile:hover .pt-go, .pt-tile:focus-visible .pt-go { opacity: 1; transform: none; }
.pt-zone { position: relative; z-index: 1; display: block; flex: 1 0 76px; margin-top: 12px; container-type: size; }
.pt-mark { --s: min(100cqh, 60cqw); --crop: 0cqh; position: absolute; display: block; width: var(--s); height: var(--s); right: 7cqw; bottom: calc(-1 * var(--crop)); max-height: calc(100cqh + var(--crop)); max-width: calc(100cqh + var(--crop)); transform-origin: 100% 100%; transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.pt-mark .pl { display: block; width: 100%; height: 100%; overflow: visible; }
.pt-mark .pl * { transform-box: fill-box; transform-origin: center; }

.pt-leanfetch .pt-mark { --crop: 22cqh; --s: min(122cqh, 70cqw); right: -3cqw; }
.pt-harvey .pt-mark { --s: min(92cqh, 72cqw); right: calc(50cqw - var(--s) / 2); bottom: 6cqh; max-height: 94cqh; transform-origin: 50% 100%; }
.pt-game-solver-suite .pt-mark { --s: min(96cqh, 55cqw); bottom: 6cqh; max-height: 94cqh; }
.pt-how-many-clicks .pt-mark { --crop: 12cqh; --s: min(112cqh, 62cqw); right: -2cqw; }
.pt-wallstreetbets .pt-mark { --s: min(98cqh, 55cqw); bottom: 4cqh; max-height: 96cqh; }
.pt-ronnielos .pt-tile { flex-direction: row; }
.pt-ronnielos .pt-text { flex: 0 1 50%; padding-bottom: 20px; }
.pt-ronnielos .pt-zone { margin-top: 0; }
.pt-ronnielos .pt-mark { --crop: 10cqh; --s: min(115cqh, 70cqw); right: 8cqw; }
.pt-tile:hover .pt-mark, .pt-tile:focus-visible .pt-mark { transform: scale(1.03); }

.pt-tile:hover .pl-a, .pt-tile:focus-visible .pl-a { stroke-dasharray: 1 1; animation: ptDraw 1.8s cubic-bezier(0.6, 0, 0.2, 1) infinite; }
.pt-tile:hover .pl-b, .pt-tile:focus-visible .pl-b { animation: ptHead 1.8s ease infinite; }
@keyframes ptDraw { 0% { stroke-dashoffset: 1; } 55%, 100% { stroke-dashoffset: 0; } }
@keyframes ptHead { 0%, 45% { opacity: 0; transform: translateX(3px); } 62%, 100% { opacity: 1; transform: none; } }

.pt-tile:hover .pl-w, .pt-tile:focus-visible .pl-w { animation: ptSpeak 0.9s ease-in-out infinite; }
.pt-tile .pl-w2 { animation-delay: 0.15s !important; }
.pt-tile .pl-w3 { animation-delay: 0.3s !important; }
@keyframes ptSpeak { 0%, 100% { transform: scaleY(1); } 30% { transform: scaleY(0.35); } 65% { transform: scaleY(1.45); } }

.pt-tile:hover .pl-crown, .pt-tile:focus-visible .pl-crown { animation: ptCrown 1.4s cubic-bezier(0.3, 0, 0.2, 1) infinite; }
.pt-tile:hover .pl-base, .pt-tile:focus-visible .pl-base { stroke-dasharray: 1 1; animation: ptBase 1.4s ease infinite; }
@keyframes ptCrown { 0%, 100% { transform: none; } 25% { transform: translateY(-10%); } 45% { transform: translateY(2%); } 60% { transform: none; } }
@keyframes ptBase { 0%, 20% { stroke-dashoffset: 1; } 55%, 100% { stroke-dashoffset: 0; } }

.pt-tile:hover .pl-hop, .pt-tile:focus-visible .pl-hop { stroke-dasharray: 1 1; animation: ptHop 1.6s cubic-bezier(0.5, 0, 0.3, 1) infinite; }
.pt-tile:hover .pl-n2, .pt-tile:focus-visible .pl-n2 { animation: ptLand 1.6s ease infinite; }
@keyframes ptHop { 0% { stroke-dashoffset: 1; } 50%, 100% { stroke-dashoffset: 0; } }
@keyframes ptLand { 0%, 45% { transform: none; } 58% { transform: scale(1.45); } 75%, 100% { transform: none; } }

.pt-tile:hover .pl-c, .pt-tile:focus-visible .pl-c { animation: ptTick 1.5s cubic-bezier(0.3, 0, 0.2, 1) infinite; }
.pt-tile .pl-c2 { animation-delay: 0.12s !important; }
.pt-tile .pl-c3 { animation-delay: 0.24s !important; }
@keyframes ptTick { 0%, 100% { transform: none; } 35% { transform: translateY(-12%); } 60% { transform: translateY(-4%); } }

.pt-tile:hover .pl-win, .pt-tile:focus-visible .pl-win { animation: ptOpen 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite; }
.pt-tile:hover .pl-cur, .pt-tile:focus-visible .pl-cur { animation: ptCur 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
@keyframes ptCur { 0% { transform: translate(30%, 40%); } 30%, 100% { transform: none; } }
@keyframes ptOpen { 0% { transform: translate(-22%, -22%) scale(0.6); opacity: 0; } 35%, 100% { transform: none; opacity: 1; } }

@container pt (max-width: 640px) {
  .pt-grid, .pt-compact .pt-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(176px, auto); gap: 10px; }
  .pt-cell { grid-column: span 1 !important; grid-row: span 1 !important; }
  .pt-cell.pt-leanfetch, .pt-cell.pt-ronnielos { grid-column: span 2 !important; }
  .pt-text { padding: 14px 16px 0; }
  .pt-tile h3 { font-size: 16px; line-height: 21px; }
  .pt-tile p { font-size: 13px; line-height: 18px; }
  .pt-zone { flex-basis: 72px; margin-top: 8px; }
  .pt-go { right: 12px; top: 16px; }
  .pt-ronnielos .pt-text { flex-basis: 58%; padding-bottom: 16px; }
}
@media (prefers-reduced-motion: reduce) { .pt-tile *, .pt-tile::after { animation: none !important; transition: none !important; } }
`;

export default function ProjectsIndex({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'pt pt-compact' : 'pt'}>
      <style>{CSS}</style>
      <ul className="pt-grid">
        {PROJECTS.map((p) => {
          const b = PROJECT_BRAND[p.id];
          return (
            <li key={p.id} className={`pt-cell pt-${p.id}`}>
              <a
                href={p.href}
                className="pt-tile hf-shot"
                style={{ '--c': b.color, '--cd': b.colorDark, '--k': b.ink, '--ov': b.ink === '#FFFFFF' ? '#000' : '#fff', '--ovo': b.ink === '#FFFFFF' ? 0.08 : 0.22, viewTransitionName: `cover-${p.id}` } as React.CSSProperties}
              >
                <span className="pt-text">
                  <h3>{p.name}</h3>
                  <p>{p.line}</p>
                </span>
                <svg className="pt-go" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                <span className="pt-zone"><span className="pt-mark"><ProjectLogo id={p.id} /></span></span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
