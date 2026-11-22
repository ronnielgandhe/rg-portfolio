export const BOARD_CSS = `
.qzb { --up: #2e7d57; --down: #c2453a; --qzb-ease: cubic-bezier(0.2, 0.8, 0.2, 1); width: 100%; max-width: 1040px; margin: 0 auto; color: var(--ink); font-variant-numeric: tabular-nums; }
.site-dark .qzb, .rg-dark .qzb { --up: #5cbf8a; --down: #e5786a; }
.qzb a { color: inherit; text-decoration: none; }
.qzb-label { font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
.qzb-fine { margin: 0; font-size: 13px; line-height: 20px; color: var(--faint); }
.qzb-up { color: var(--up); }
.qzb-down { color: var(--down); }
.qzb-flat { color: var(--half); }
.qzb-link { color: var(--text); text-decoration: underline !important; text-decoration-thickness: 1px !important; text-underline-offset: 3px; text-decoration-color: var(--rule) !important; transition: color 0.2s; }
.qzb-link:hover { color: var(--ink); }
.qzb-gap { margin-top: 14px; }
.qzb-note { margin-top: 14px; }

.qzb-top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px 32px; padding-bottom: 16px; border-bottom: 1px solid var(--rule); }
.qzb-title { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
.qzb-status { margin: 0; font-size: 13px; line-height: 20px; color: var(--half); }

.qzb-sec { margin-top: 64px; }
.qzb-sec-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 16px; padding-bottom: 12px; border-bottom: 1px solid var(--rule); margin-bottom: 24px; }
.qzb-h3 { margin: 0; font-size: 22px; line-height: 1.25; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); }
.qzb-asof { font-size: 13px; color: var(--faint); }
.qzb-out { padding: 20px 0; border-bottom: 1px solid var(--rule); font-size: 14px; color: var(--half); }
.qzb-out b { color: var(--down); font-weight: 500; }
.qzb-skel { height: 120px; border-bottom: 1px solid var(--rule); display: flex; align-items: center; font-size: 14px; color: var(--faint); }

.qzb-mood { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 24px 64px; align-items: center; }
.qzb-mood-word { margin-top: 4px; font-size: 88px; line-height: 1; font-weight: 300; letter-spacing: -0.05em; transition: color 0.4s; }
.qzb-mood-calm { color: var(--up); }
.qzb-mood-nervous { color: var(--ink); }
.qzb-mood-scared { color: var(--down); }
.qzb-mood-line { margin: 16px 0 0; max-width: 520px; font-size: 18px; line-height: 28px; color: var(--text); }
.qzb-mood-how { grid-column: 1 / -1; margin-top: 8px; }
.qzb-dial { display: block; width: 100%; overflow: visible; }
.qzb-dial path { fill: none; stroke-width: 6; }
.qzb-dial-down { stroke: var(--down); }
.qzb-dial-mid { stroke: var(--rule); }
.qzb-dial-up { stroke: var(--up); }
.qzb-needle { transform-box: view-box; transform-origin: 100px 96px; transition: transform 0.9s var(--qzb-ease); }
.qzb-needle line { stroke: var(--ink); stroke-width: 1.5; }
.qzb-dial-hub { fill: var(--ink); }
.qzb-dial-t { font-size: 10px; fill: var(--faint); font-family: inherit; letter-spacing: 0.06em; }
.qzb-recipe { margin-top: 12px; border-top: 1px solid var(--rule); }
.qzb-recipe-row { display: grid; grid-template-columns: minmax(0, 1fr) 80px 44px; gap: 2px 16px; padding: 9px 0; border-bottom: 1px solid var(--rule); font-size: 13px; line-height: 20px; }
.qzb-recipe-row span:first-child { color: var(--text); }
.qzb-recipe-row i { grid-column: 1 / -1; font-style: normal; font-size: 12px; line-height: 16px; color: var(--faint); }
.qzb-recipe-v { text-align: right; color: var(--half); }
.qzb-recipe-p { text-align: right; font-weight: 500; }

.qzb-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--rule); border-left: 1px solid var(--rule); }
.qzb-tile { padding: 20px 20px 22px; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); min-width: 0; transition: background 0.2s; }
.qzb-tile:hover { background: var(--hover); }
.qzb-tile-row { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-top: 10px; }
.qzb-tile-p { font-size: 30px; line-height: 1.1; font-weight: 300; letter-spacing: -0.035em; color: var(--ink); white-space: nowrap; }
.qzb-tile-ch { font-size: 15px; font-weight: 500; white-space: nowrap; }
.qzb-tile .qzb-spark { margin-top: 14px; }
.qzb-tile-what { margin: 14px 0 0; font-size: 14px; line-height: 21px; color: var(--ink); }
.qzb-tile-mean { margin: 4px 0 0; font-size: 13px; line-height: 20px; color: var(--half); }

.qzb-sectors { margin-top: 40px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 24px 64px; align-items: start; }
.qzb-big-line { margin: 0; font-size: 22px; line-height: 32px; font-weight: 300; letter-spacing: -0.015em; color: var(--ink); }
.qzb-bars { border-top: 1px solid var(--rule); }
.qzb-bar { display: grid; grid-template-columns: 150px minmax(0, 1fr) 60px; gap: 12px; align-items: center; height: 30px; border-bottom: 1px solid var(--rule); font-size: 13px; }
.qzb-bar-name { color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.qzb-bar-track { position: relative; height: 10px; display: block; }
.qzb-bar-track::before { content: ''; position: absolute; left: 50%; top: -3px; bottom: -3px; border-left: 1px solid var(--rule); }
.qzb-bar-fill { position: absolute; top: 2px; height: 6px; transform-origin: left; transition: left 0.5s var(--qzb-ease), width 0.5s var(--qzb-ease); }
.qzb-pos { background: var(--up); }
.qzb-neg { background: var(--down); transform-origin: right; }
.qzb-bar-v { text-align: right; font-weight: 500; }

.qzb-spark { display: block; width: 100%; overflow: visible; }
.qzb-spark path { fill: none; stroke-width: 1.25; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.qzb-spark .qzb-s-up { stroke: var(--up); }
.qzb-spark .qzb-s-down { stroke: var(--down); }
.qzb-spark .qzb-s-ink { stroke: var(--ink); }
.qzb-spark .qzb-s-base { stroke: var(--faint); stroke-width: 1; stroke-dasharray: 2 4; }

.qzb-odds { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 48px; border-top: 1px solid var(--rule); }
.qzb-odd { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px 16px; align-items: start; padding: 18px 0; border-bottom: 1px solid var(--rule); background: var(--bg); transition: background 0.2s; }
.qzb-odd:hover { background: var(--hover); }
.qzb-odd-q { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.qzb-odd-title { font-size: 16px; line-height: 23px; color: var(--ink); }
.qzb-odd-out { font-size: 13px; line-height: 19px; color: var(--half); }
.qzb-odd-p { font-size: 36px; line-height: 1; font-weight: 300; letter-spacing: -0.04em; color: var(--ink); text-align: right; }
.qzb-odd-bar { grid-column: 1 / -1; position: relative; height: 6px; background: var(--rule); }
.qzb-odd-fill { position: absolute; left: 0; top: 0; bottom: 0; background: var(--ink); transition: width 0.8s var(--qzb-ease); }
.qzb-odd-fill.qzb-up { background: var(--up); }
.qzb-odd-fill.qzb-down { background: var(--down); }
.qzb-odd-fill.qzb-flat { background: var(--half); }
.qzb-odd-line { grid-column: 1 / -1; margin: 0; font-size: 14px; line-height: 21px; }
.qzb-odd-src { color: var(--faint); }

.qzb-news { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 32px 64px; align-items: start; }
.qzb-heads { border-top: 1px solid var(--rule); }
.qzb-head-row { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 4px 16px; padding: 16px 0; border-bottom: 1px solid var(--rule); }
.qzb-head-row:hover .qzb-head-t { text-decoration: underline; text-decoration-color: var(--rule); text-underline-offset: 3px; }
.qzb-read { font-size: 12px; line-height: 23px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }
.qzb-head-t { font-size: 16px; line-height: 23px; color: var(--ink); }
.qzb-head-m { grid-column: 2; font-size: 13px; line-height: 19px; color: var(--half); }
.qzb-topics { margin-top: 12px; border-top: 1px solid var(--rule); }
.qzb-topic { display: grid; grid-template-columns: minmax(0, 1fr) 80px; grid-template-areas: 'n b' 'r r'; gap: 2px 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--rule); }
.qzb-topic-name { grid-area: n; font-size: 15px; color: var(--ink); }
.qzb-topic .qzb-bar-track { grid-area: b; }
.qzb-topic-r { grid-area: r; font-size: 13px; }

.qzb-how { margin-top: 28px; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.qzb-how summary { cursor: pointer; list-style: none; padding: 12px 0; font-size: 14px; color: var(--ink); display: flex; justify-content: space-between; }
.qzb-how summary::-webkit-details-marker { display: none; }
.qzb-how summary::after { content: '+'; color: var(--half); }
.qzb-how[open] summary::after { content: '-'; }
.qzb-how-body { padding: 0 0 20px; display: grid; gap: 16px; }
.qzb-how-body ol { margin: 0; padding-left: 18px; font-size: 13px; line-height: 21px; color: var(--text); }
.qzb-words { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px 24px; }
.qzb-words p { margin: 6px 0 0; font-size: 12px; line-height: 19px; color: var(--text); word-break: break-word; }

.qzb-hist-ends { display: flex; justify-content: space-between; gap: 12px; margin-top: 8px; font-size: 12px; color: var(--faint); }

.qzb-foot { margin-top: 72px; padding-top: 16px; border-top: 1px solid var(--rule); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px 48px; }
.qzb-foot p { margin: 0; font-size: 12px; line-height: 19px; color: var(--faint); }

.qzb-anim .qzb-in { opacity: 0; transform: translateY(8px); }
.qzb-anim .qzb-on .qzb-in { animation: qzbIn 0.5s var(--qzb-ease) both; animation-delay: calc(var(--i, 0) * 50ms); }
.qzb-anim .qzb-spark { clip-path: inset(0 100% 0 0); }
.qzb-anim .qzb-on .qzb-spark { animation: qzbDraw 0.6s var(--qzb-ease) both; animation-delay: calc(var(--i, 0) * 50ms + 150ms); }
.qzb-anim .qzb-bar-fill { transform: scaleX(0); }
.qzb-anim .qzb-on .qzb-bar-fill { animation: qzbGrow 0.5s var(--qzb-ease) both; animation-delay: calc(var(--i, 0) * 35ms + 150ms); }
.qzb-anim .qzb-odd-fill { transform: scaleX(0); transform-origin: left; }
.qzb-anim .qzb-on .qzb-odd-fill { animation: qzbGrow 0.6s var(--qzb-ease) both; animation-delay: calc(var(--i, 0) * 50ms + 150ms); }
@keyframes qzbIn { to { opacity: 1; transform: none; } }
@keyframes qzbDraw { to { clip-path: inset(0 0 0 0); } }
@keyframes qzbGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) {
  .qzb-anim .qzb-in, .qzb-anim .qzb-spark, .qzb-anim .qzb-bar-fill, .qzb-anim .qzb-odd-fill { opacity: 1; transform: none; clip-path: none; animation: none !important; }
  .qzb-needle, .qzb-bar-fill, .qzb-odd-fill, .qzb-mood-word { transition: none; }
}

@media (max-width: 900px) {
  .qzb-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .qzb-news, .qzb-sectors { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 720px) {
  .qzb-title { font-size: 30px; }
  .qzb-sec { margin-top: 52px; }
  .qzb-mood { grid-template-columns: minmax(0, 1fr); }
  .qzb-mood-word { font-size: 64px; }
  .qzb-mood-line { font-size: 16px; line-height: 25px; }
  .qzb-dial { max-width: 280px; }
  .qzb-tiles { grid-template-columns: minmax(0, 1fr); }
  .qzb-odds { grid-template-columns: minmax(0, 1fr); }
  .qzb-bar { grid-template-columns: 124px minmax(0, 1fr) 52px; }
  .qzb-big-line { font-size: 19px; line-height: 28px; }
  .qzb-head-row { grid-template-columns: minmax(0, 1fr); }
  .qzb-head-m { grid-column: 1; }
  .qzb-words, .qzb-foot { grid-template-columns: minmax(0, 1fr); }
  .qzb-hist-ends span:nth-child(2) { display: none; }
}
`;
