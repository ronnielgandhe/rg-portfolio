import { PROJECTS } from './projects';
import { PROJECT_BRAND, ProjectLogo } from './brand';

const CSS = `
.pt { container: pt / inline-size; width: 100%; }
.pt-lead { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-auto-rows: minmax(200px, auto); gap: 12px; margin: 0; padding: 0; list-style: none; }
.pt-cell { display: flex; min-width: 0; }
.pt-item { --c: #888; --cd: #666; color: var(--ink); text-decoration: none; }
.pt-mark, .pt-go { color: var(--c); }
.site-dark .pt-mark, .rg-dark .pt-mark, .site-dark .pt-go, .rg-dark .pt-go { color: var(--cd); }
.pt-item:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
.pt-item h3 { margin: 0; font-size: 18px; line-height: 26px; font-weight: 400; letter-spacing: -0.015em; color: var(--ink); }
.pt-item p { margin: 0; font-size: 14px; line-height: 20px; color: var(--text); }
.pt-go { flex: none; width: 16px; height: 16px; opacity: 0; transform: translateX(-4px); transition: opacity 0.3s, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
.pt-item:hover .pt-go, .pt-item:focus-visible .pt-go { opacity: 1; transform: none; }
.pt-mark .pl { display: block; width: 100%; height: 100%; overflow: visible; }
.pt-mark .pl * { transform-box: fill-box; transform-origin: center; }

.pt-tile { position: relative; display: flex; flex-direction: column; flex: 1; min-width: 0; overflow: hidden; border: 1px solid var(--rule); background: var(--bg); isolation: isolate; transition: border-color 0.3s ease; }
.pt-tile:hover, .pt-tile:focus-visible { border-color: color-mix(in srgb, var(--c) 45%, transparent); }
.site-dark .pt-tile:hover, .rg-dark .pt-tile:hover { border-color: color-mix(in srgb, var(--cd) 45%, transparent); }
.pt-tile::after { content: ''; position: absolute; inset: 0; z-index: 0; background: var(--c); opacity: 0; pointer-events: none; transition: opacity 0.35s ease; }
.pt-tile:hover::after, .pt-tile:focus-visible::after { opacity: 0.06; }
.site-dark .pt-tile::after, .rg-dark .pt-tile::after { background: var(--cd); }
.pt-text { flex: none; display: block; position: relative; z-index: 3; padding: 20px 44px 0 22px; }
.pt-tile p { margin-top: 4px; }
.pt-tile .pt-go { position: absolute; z-index: 3; right: 18px; top: 24px; }
.pt-zone { position: relative; z-index: 1; display: block; flex: 1 0 84px; margin-top: 12px; container-type: size; }
.pt-tile .pt-mark { --s: min(84cqh, 46cqw, 112px); position: absolute; display: block; width: var(--s); height: var(--s); right: 22px; bottom: 18px; transform-origin: 100% 100%; transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.pt-tile:hover .pt-mark, .pt-tile:focus-visible .pt-mark { transform: scale(1.04); }
.pt-tile .pl { stroke-width: 2.4; }

.pt-rows { margin: 12px 0 0; padding: 0; list-style: none; border-top: 1px solid var(--rule); }
.pt-row { display: flex; align-items: center; gap: 14px; min-height: 56px; padding: 8px 22px 8px 22px; border-bottom: 1px solid var(--rule); transition: background 0.2s ease; }
.pt-row:hover, .pt-row:focus-visible { background: var(--hover); }
.pt-row .pt-mark { flex: none; display: block; width: 22px; height: 22px; }
.pt-row .pl { stroke-width: 3; }
.pt-row h3 { flex: none; font-size: 16px; line-height: 24px; }
.pt-row p { flex: 1; min-width: 0; }

.pt-item:hover .pl-a, .pt-item:focus-visible .pl-a { stroke-dasharray: 1 1; animation: ptDraw 1.8s cubic-bezier(0.6, 0, 0.2, 1) infinite; }
.pt-item:hover .pl-b, .pt-item:focus-visible .pl-b { animation: ptHead 1.8s ease infinite; }
@keyframes ptDraw { 0% { stroke-dashoffset: 1; } 55%, 100% { stroke-dashoffset: 0; } }
@keyframes ptHead { 0%, 45% { opacity: 0; transform: translateX(3px); } 62%, 100% { opacity: 1; transform: none; } }

.pt-item:hover .pl-w, .pt-item:focus-visible .pl-w { animation: ptSpeak 0.9s ease-in-out infinite; }
.pt-item .pl-w2 { animation-delay: 0.15s !important; }
.pt-item .pl-w3 { animation-delay: 0.3s !important; }
@keyframes ptSpeak { 0%, 100% { transform: scaleY(1); } 30% { transform: scaleY(0.35); } 65% { transform: scaleY(1.45); } }

.pt-item:hover .pl-crown, .pt-item:focus-visible .pl-crown { animation: ptCrown 1.4s cubic-bezier(0.3, 0, 0.2, 1) infinite; }
.pt-item:hover .pl-base, .pt-item:focus-visible .pl-base { stroke-dasharray: 1 1; animation: ptBase 1.4s ease infinite; }
@keyframes ptCrown { 0%, 100% { transform: none; } 25% { transform: translateY(-10%); } 45% { transform: translateY(2%); } 60% { transform: none; } }
@keyframes ptBase { 0%, 20% { stroke-dashoffset: 1; } 55%, 100% { stroke-dashoffset: 0; } }

.pt-item:hover .pl-hop, .pt-item:focus-visible .pl-hop { stroke-dasharray: 1 1; animation: ptHop 1.6s cubic-bezier(0.5, 0, 0.3, 1) infinite; }
.pt-item:hover .pl-n2, .pt-item:focus-visible .pl-n2 { animation: ptLand 1.6s ease infinite; }
@keyframes ptHop { 0% { stroke-dashoffset: 1; } 50%, 100% { stroke-dashoffset: 0; } }
@keyframes ptLand { 0%, 45% { transform: none; } 58% { transform: scale(1.45); } 75%, 100% { transform: none; } }

.pt-item:hover .pl-c, .pt-item:focus-visible .pl-c { animation: ptTick 1.5s cubic-bezier(0.3, 0, 0.2, 1) infinite; }
.pt-item .pl-c2 { animation-delay: 0.12s !important; }
.pt-item .pl-c3 { animation-delay: 0.24s !important; }
@keyframes ptTick { 0%, 100% { transform: none; } 35% { transform: translateY(-12%); } 60% { transform: translateY(-4%); } }

.pt-item:hover .pl-win, .pt-item:focus-visible .pl-win { animation: ptOpen 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite; }
.pt-item:hover .pl-cur, .pt-item:focus-visible .pl-cur { animation: ptCur 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
@keyframes ptCur { 0% { transform: translate(30%, 40%); } 30%, 100% { transform: none; } }
@keyframes ptOpen { 0% { transform: translate(-22%, -22%) scale(0.6); opacity: 0; } 35%, 100% { transform: none; opacity: 1; } }

@container pt (max-width: 640px) {
  .pt-lead { grid-template-columns: minmax(0, 1fr); grid-auto-rows: minmax(116px, auto); gap: 10px; }
  .pt-tile { flex-direction: row; }
  .pt-text { flex: 1; padding: 16px 0 16px 16px; }
  .pt-zone { flex: 0 0 96px; margin-top: 0; }
  .pt-tile .pt-mark { --s: min(70cqh, 56px); right: 16px; bottom: 16px; }
  .pt-tile .pt-go { display: none; }
  .pt-item h3 { font-size: 16px; line-height: 22px; }
  .pt-item p { font-size: 13px; line-height: 18px; }
  .pt-row { align-items: flex-start; flex-wrap: wrap; column-gap: 12px; row-gap: 0; padding: 12px 16px; }
  .pt-row .pt-mark { margin-top: 1px; }
  .pt-row p { flex: 1 0 100%; padding-left: 34px; }
  .pt-row .pt-go { display: none; }
}
@media (prefers-reduced-motion: reduce) { .pt-item *, .pt-tile::after { animation: none !important; transition: none !important; } }
`;

const Go = () => <svg className="pt-go" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>;

function vars(id: string) {
  const b = PROJECT_BRAND[id];
  return { '--c': b.color, '--cd': b.colorDark, viewTransitionName: `cover-${id}` } as React.CSSProperties;
}

export default function ProjectsIndex() {
  return (
    <div className="pt">
      <style>{CSS}</style>
      <ul className="pt-lead">
        {PROJECTS.filter((p) => p.lead).map((p) => (
          <li key={p.id} className="pt-cell">
            <a href={p.href} className="pt-item pt-tile hf-shot" style={vars(p.id)}>
              <span className="pt-text">
                <h3>{p.name.toLowerCase()}</h3>
                <p>{p.line}</p>
              </span>
              <Go />
              <span className="pt-zone"><span className="pt-mark"><ProjectLogo id={p.id} /></span></span>
            </a>
          </li>
        ))}
      </ul>
      <ul className="pt-rows">
        {PROJECTS.filter((p) => !p.lead).map((p) => (
          <li key={p.id}>
            <a href={p.href} className="pt-item pt-row" style={vars(p.id)}>
              <span className="pt-mark"><ProjectLogo id={p.id} /></span>
              <h3>{p.name.toLowerCase()}</h3>
              <p>{p.line}</p>
              <Go />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
