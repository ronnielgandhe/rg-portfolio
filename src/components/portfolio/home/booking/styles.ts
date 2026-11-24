export const BOOK_CSS = `
.bk { --bk-ease: cubic-bezier(0.2, 0.8, 0.2, 1); position: relative; border: 1px solid var(--rule); background: var(--bg); overflow: hidden; transition: height 0.45s var(--bk-ease), border-color 0.3s; container-type: inline-size; }
.bk-in { padding: 24px; }
.bk-step { animation: bk-in 0.4s var(--bk-ease) both; }
.bk-tag { display: block; margin: 0 0 16px; font-size: 11px; line-height: 16px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--half); }
.bk-tag b { font-weight: 500; color: var(--ink); }
.bk-split { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; }
@container (min-width: 520px) { .bk-split { grid-template-columns: minmax(0, 1fr) 168px; gap: 32px; } .bk-side { border-left: 1px solid var(--rule); padding-left: 32px; } }

.bk-head { display: flex; align-items: center; justify-content: space-between; height: 28px; margin-bottom: 12px; }
.bk-month { font-size: 15px; line-height: 20px; font-weight: 500; color: var(--ink); letter-spacing: -0.01em; }
.bk-pager { display: flex; gap: 4px; }
.bk-icon { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1px solid var(--rule); color: var(--text); transition: color 0.2s, background 0.2s, border-color 0.2s; }
.bk-icon:hover:not(:disabled) { color: var(--ink); background: var(--hover); border-color: var(--faint); }
.bk-icon:disabled { opacity: 0.35; cursor: default; }
.bk-week, .bk-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.bk-week span { padding-bottom: 8px; text-align: center; font-size: 11px; line-height: 16px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--faint); }
.bk-clip { overflow: hidden; }
.bk-days { gap: 2px; }
.bk-days[data-dir=next] { animation: bk-from-r 0.38s var(--bk-ease) both; }
.bk-days[data-dir=prev] { animation: bk-from-l 0.38s var(--bk-ease) both; }
.bk-pad { aspect-ratio: 1; }
.bk-day { position: relative; display: flex; align-items: center; justify-content: center; aspect-ratio: 1; min-width: 0; font-size: 14px; line-height: 1; font-variant-numeric: tabular-nums; color: var(--faint); opacity: 0.55; cursor: default; transition: background 0.18s, color 0.18s, opacity 0.18s; border: 1px solid transparent; }
.bk-day[data-open] { opacity: 1; color: var(--ink); font-weight: 500; cursor: pointer; background: color-mix(in srgb, var(--ink) 4%, transparent); }
.bk-day[data-open]:hover { border-color: var(--ink); }
.bk-day[aria-pressed=true] { background: var(--ink); color: var(--bg); }
.bk-day[data-today]::after { content: ''; position: absolute; left: 50%; bottom: 18%; width: 4px; height: 1px; margin-left: -2px; background: currentColor; }
.bk-day[data-skel] span { visibility: hidden; }
.bk-day[data-skel]::before { content: ''; position: absolute; inset: 30%; background: var(--rule); animation: bk-pulse 1.2s ease-in-out infinite; }
.bk-day:focus-visible { outline: 1px solid var(--ink); outline-offset: -1px; }

.bk-side { min-width: 0; display: flex; flex-direction: column; }
.bk-done .bk-tag { margin: 0; }
.bk-daylabel { height: 28px; margin-bottom: 12px; display: flex; align-items: center; font-size: 15px; line-height: 20px; font-weight: 500; color: var(--ink); }
.bk-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 6px; align-content: start; }
@container (min-width: 520px) { .bk-slots { grid-template-columns: minmax(0, 1fr); flex: 1 1 0; min-height: 0; overflow-y: auto; padding: 0 2px 24px 0; scrollbar-width: thin; -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 32px), transparent); mask-image: linear-gradient(to bottom, #000 calc(100% - 32px), transparent); } }
.bk-slots[data-in] > * { animation: bk-in 0.35s var(--bk-ease) both; animation-delay: calc(var(--i, 0) * 18ms); }
.bk-slot { height: 40px; border: 1px solid var(--rule); font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums; color: var(--ink); transition: border-color 0.18s, background 0.18s, color 0.18s; }
.bk-slot:hover { border-color: var(--ink); }
.bk-slot:active { background: var(--ink); color: var(--bg); }
.bk-hint { font-size: 14px; line-height: 22px; color: var(--faint); }
.bk-nw { white-space: nowrap; }
@container (min-width: 520px) { .bk-side > .bk-hint:first-child { margin-top: 4px; } }

.bk-tz { display: flex; align-items: center; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--rule); min-width: 0; }
.bk-tz label { flex-shrink: 0; font-size: 11px; line-height: 16px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--faint); }
.bk-select { position: relative; min-width: 0; flex: 1; }
.bk-select select { appearance: none; -webkit-appearance: none; width: 100%; height: 32px; padding: 0 28px 0 10px; border: 1px solid var(--rule); border-radius: 0; background: var(--bg); color: var(--text); font: inherit; font-size: 13px; text-overflow: ellipsis; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
.bk-select select:hover, .bk-select select:focus { border-color: var(--faint); color: var(--ink); outline: none; }
.bk-select::after { content: ''; position: absolute; right: 12px; top: 13px; width: 5px; height: 5px; border-right: 1px solid var(--faint); border-bottom: 1px solid var(--faint); transform: rotate(45deg); pointer-events: none; }

.bk-sum { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 20px; margin-bottom: 24px; border-bottom: 1px solid var(--rule); }
.bk-when { font-size: 18px; line-height: 26px; font-weight: 500; color: var(--ink); letter-spacing: -0.01em; }
.bk-when small { display: block; margin-top: 2px; font-size: 14px; line-height: 20px; font-weight: 400; color: var(--text); letter-spacing: 0; }
.bk-link { flex-shrink: 0; font-size: 13px; line-height: 26px; color: var(--text); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; text-decoration-color: var(--rule); transition: color 0.2s, text-decoration-color 0.2s; }
.bk-link:hover { color: var(--ink); text-decoration-color: currentColor; }
.bk-form { display: grid; gap: 16px; }
.bk-row2 { display: grid; gap: 16px; }
@container (min-width: 520px) { .bk-row2 { grid-template-columns: 1fr 1fr; } }
.bk-field { display: grid; gap: 6px; min-width: 0; }
.bk-field > span { font-size: 11px; line-height: 16px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--half); }
.bk-field > span em { font-style: normal; color: var(--faint); letter-spacing: 0.04em; text-transform: none; font-weight: 400; }
.bk-field input, .bk-field textarea { width: 100%; min-width: 0; height: 40px; padding: 0 12px; border: 1px solid var(--rule); border-radius: 0; background: var(--bg); color: var(--ink); font: inherit; font-size: 15px; transition: border-color 0.2s; }
.bk-field textarea { height: 84px; padding: 10px 12px; resize: vertical; line-height: 22px; }
.bk-field input:focus, .bk-field textarea:focus { outline: none; border-color: var(--ink); }
.bk-field[data-bad] input, .bk-field[data-bad] textarea { border-color: #c2412d; }
.bk-field small { font-size: 12px; line-height: 16px; color: #c2412d; }
.bk-hp { position: absolute !important; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.bk-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 20px; margin-top: 4px; }
.bk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; padding: 0 18px; background: var(--ink); color: var(--bg); font-size: 14px; font-weight: 500; text-decoration: none; transition: opacity 0.2s; }
.bk-btn:hover { opacity: 0.82; }
.bk-btn:disabled { opacity: 0.55; cursor: progress; }
.bk-btn-2 { background: transparent; color: var(--ink); border: 1px solid var(--rule); }
.bk-btn-2:hover { opacity: 1; border-color: var(--ink); }
.bk-fine { font-size: 13px; line-height: 20px; color: var(--faint); }
.bk-err { padding: 12px 14px; border: 1px solid color-mix(in srgb, #c2412d 40%, var(--rule)); font-size: 14px; line-height: 22px; color: var(--ink); }
.bk-err button { margin-left: 6px; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.bk-spin { width: 12px; height: 12px; border: 1px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: bk-rot 0.7s linear infinite; }

.bk-done { display: grid; gap: 20px; }
.bk-check { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid var(--ink); color: var(--ink); }
.bk-check path { stroke-dasharray: 20; stroke-dashoffset: 20; animation: bk-draw 0.5s 0.15s var(--bk-ease) forwards; }
.bk-big { margin: 0; font-size: 22px; line-height: 30px; font-weight: 500; letter-spacing: -0.02em; color: var(--ink); }
.bk-p { margin: 0; font-size: 15px; line-height: 24px; color: var(--text); }
.bk-mock { position: absolute; bottom: 6px; right: 10px; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--faint); }

@keyframes bk-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes bk-from-r { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
@keyframes bk-from-l { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: none; } }
@keyframes bk-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
@keyframes bk-rot { to { transform: rotate(360deg); } }
@keyframes bk-draw { to { stroke-dashoffset: 0; } }
@media (max-width: 480px) { .bk-in { padding: 16px; } }
@media (prefers-reduced-motion: reduce) { .bk, .bk *, .bk *::before { animation: none !important; transition: none !important; } .bk-check path { stroke-dashoffset: 0; } }
`;
