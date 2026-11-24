export const QZ_CSS = `
.site { --qz-loss: #b3402f; --qz-loss-fill: rgba(179, 64, 47, 0.12); --qz-up: #2b7a4b; --qz-up-fill: rgba(43, 122, 75, 0.1); }
.site-dark { --qz-loss: #e0705f; --qz-loss-fill: rgba(224, 112, 95, 0.14); --qz-up: #5fbf87; --qz-up-fill: rgba(95, 191, 135, 0.12); }
.qz { font-variant-numeric: tabular-nums; }
.site-app .site-col > .qz-wide, .site-app .site-col > .qz-full { max-width: 1040px; }
.qz-kicker { font-size: 14px; line-height: 20px; color: var(--half); margin-bottom: 12px; }
.qz-title { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
.qz-lede { margin: 12px 0 0; font-size: 18px; line-height: 28px; color: var(--text); }
.qz-fine { margin: 0; font-size: 13px; line-height: 20px; color: var(--faint); }
.qz-label { font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
.qz-loss { color: var(--qz-loss); }
.qz-gain { color: var(--qz-up); }
.qz-muted { color: var(--half); }
.qz-link { color: var(--ink); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; text-decoration-color: var(--rule); transition: text-decoration-color 0.2s; }
.qz-link:hover { text-decoration-color: var(--ink); }
.qz-section { margin-top: 64px; }
.qz-section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding-bottom: 12px; border-bottom: 1px solid var(--rule); margin-bottom: 20px; }
.qz-section-head .qz-fine { max-width: 520px; }
.qz-h2 { margin: 0; font-size: 22px; line-height: 1.25; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); }
.qz-enter { animation: qzIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
@keyframes qzIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .qz-enter { animation: none; } }

.qz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 14px; border: 1px solid var(--rule); font-size: 13px; color: var(--ink); background: var(--bg); transition: background 0.2s, border-color 0.2s; white-space: nowrap; }
.qz-btn:hover { background: var(--hover); }
.qz-btn-primary { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.qz-btn-primary:hover { background: var(--ink); opacity: 0.86; }
.qz-btn:disabled { opacity: 0.5; cursor: default; }

.qz-chart { width: 100%; }
.qz-hero { margin-bottom: 8px; }
.qz-hero-num { margin-top: 8px; font-size: 48px; line-height: 1.05; font-weight: 300; letter-spacing: -0.035em; color: var(--ink); }
.qz-hero-sub { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 8px; font-size: 14px; line-height: 20px; }
.qz-hero-when { color: var(--half); }
.qz-chips { display: flex; gap: 0; margin: 16px 0 8px; border-bottom: 1px solid var(--rule); }
.qz-chip { position: relative; height: 32px; padding: 0 12px; font-size: 13px; color: var(--half); transition: color 0.2s; }
.qz-chip:hover { color: var(--ink); }
.qz-chip-on { color: var(--ink); }
.qz-chip-on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px; background: var(--ink); }
.qz-plot { position: relative; width: 100%; outline: none; touch-action: pan-y; cursor: crosshair; }
.qz-plot:focus-visible { outline: 1px solid var(--ink); outline-offset: 4px; }
.qz-plot svg { display: block; overflow: visible; }
.qz-grid { stroke: var(--rule); stroke-width: 1; shape-rendering: crispEdges; }
.qz-axis { stroke: var(--rule); stroke-width: 1; shape-rendering: crispEdges; }
.qz-tick { font-size: 11px; fill: var(--faint); font-family: inherit; font-variant-numeric: tabular-nums; }
.qz-line-ink { fill: none; stroke: var(--ink); stroke-width: 1.5; stroke-linejoin: round; }
.qz-line-grey { fill: none; stroke: var(--half); stroke-width: 1; stroke-linejoin: round; opacity: 0.7; }
.qz-line-bench { fill: none; stroke: var(--faint); stroke-width: 1; stroke-dasharray: 3 3; }
.qz-line-ghost { fill: none; stroke: var(--ink); stroke-width: 1; opacity: 0.1; }
.qz-line-up { fill: none; stroke: var(--qz-up); stroke-width: 1.75; stroke-linejoin: round; }
.qz-line-down { fill: none; stroke: var(--qz-loss); stroke-width: 1.75; stroke-linejoin: round; }
.qz-line-loss { fill: none; stroke: var(--qz-loss); stroke-width: 1.25; stroke-linejoin: round; }
.qz-dd-area { fill: var(--qz-loss-fill); stroke: none; }
.qz-tick-bg { paint-order: stroke; stroke: var(--bg); stroke-width: 3px; stroke-linejoin: round; }
.qz-leg-ink.qz-leg-dd i { border-top-color: var(--qz-loss); }
.qz-synth { fill: var(--hover); }
.qz-synth-note { margin: 8px 0 0; font-size: 12px; line-height: 17px; color: var(--faint); }
.qz-split { stroke: var(--half); stroke-width: 1; stroke-dasharray: 2 3; shape-rendering: crispEdges; }
.qz-marker { stroke: var(--ink); stroke-width: 1; shape-rendering: crispEdges; }
.qz-dd { fill: var(--qz-loss-fill); stroke: var(--qz-loss); stroke-width: 1; }
.qz-cross { stroke: var(--ink); stroke-width: 1; opacity: 0.35; shape-rendering: crispEdges; }
.qz-dot { fill: var(--bg); stroke: var(--ink); stroke-width: 1.5; }
.qz-readout { position: absolute; top: -6px; transform: translate(-50%, -100%); display: flex; gap: 8px; padding: 4px 8px; background: var(--bg); border: 1px solid var(--rule); font-size: 12px; line-height: 16px; color: var(--half); white-space: nowrap; pointer-events: none; }
.qz-readout b { font-weight: 500; color: var(--ink); }
.qz-legend { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 10px; font-size: 12px; line-height: 16px; color: var(--half); }
.qz-leg { display: inline-flex; align-items: center; gap: 8px; }
.qz-leg i { display: inline-block; width: 16px; height: 0; border-top: 1px solid var(--half); }
.qz-leg-ink { color: var(--ink); }
.qz-leg-ink i { border-top: 1.5px solid var(--ink); }
.qz-leg-bench i { border-top: 1px dashed var(--faint); }

.qz-head { max-width: 640px; }
.qz-meta { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 16px; font-size: 13px; line-height: 20px; color: var(--half); }
.qz-top { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 48px; margin-top: 48px; align-items: start; }
.qz-side { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--rule); }
.qz-stat { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 12px; padding: 12px 0; border-bottom: 1px solid var(--rule); }
.qz-stat-k { font-size: 13px; line-height: 20px; color: var(--text); }
.qz-stat-v { font-size: 15px; line-height: 20px; color: var(--ink); text-align: right; transition: color 0.3s; }
.qz-stat-why { grid-column: 1 / -1; font-size: 12px; line-height: 17px; color: var(--faint); }
.qz-stat-v.qz-loss { color: var(--qz-loss); }
.qz-stat-big .qz-stat-v { font-size: 22px; font-weight: 300; letter-spacing: -0.02em; }
.qz-scrub { margin-top: 20px; }
.qz-scrub-row { display: flex; align-items: center; gap: 12px; }
.qz-steps { flex: 1; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); border: 1px solid var(--rule); }
.qz-step { position: relative; height: 34px; font-size: 13px; color: var(--half); border-right: 1px solid var(--rule); transition: color 0.2s, background 0.2s; }
.qz-step:last-child { border-right: 0; }
.qz-step:hover { color: var(--ink); background: var(--hover); }
.qz-step-on, .qz-step-on:hover { color: var(--ink); background: var(--hover); }
.qz-step-on::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--ink); }
.qz-play { width: 34px; padding: 0; }
.qz-note { margin-top: 14px; display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 12px; font-size: 15px; line-height: 24px; color: var(--text); min-height: 72px; }
.qz-note b { font-weight: 500; color: var(--ink); }
.qz-warn { margin-top: 12px; padding-left: 12px; border-left: 1px solid var(--qz-loss); font-size: 13px; line-height: 20px; color: var(--text); }
.qz-toggles { display: flex; gap: 16px; margin-top: 10px; font-size: 13px; color: var(--half); flex-wrap: wrap; }
.qz-toggle { display: inline-flex; align-items: center; gap: 6px; color: var(--half); transition: color 0.2s; }
.qz-toggle:hover, .qz-toggle-on { color: var(--ink); }
.qz-toggle i { width: 9px; height: 9px; border: 1px solid currentColor; display: inline-block; }
.qz-toggle-on i { background: var(--ink); border-color: var(--ink); }

.qz-progress { margin-top: 56px; }
.qz-progress-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.qz-prog svg { display: block; width: 100%; overflow: visible; }
.qz-prog-line { fill: none; stroke: var(--ink); stroke-width: 1; }
.qz-prog-dot { fill: var(--bg); stroke: var(--ink); stroke-width: 1; cursor: pointer; }
.qz-prog-dot-on { fill: var(--ink); }
.qz-prog-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.qz-prog-val { font-size: 15px; color: var(--ink); }

.qz-read { margin-top: 72px; display: flex; flex-direction: column; gap: 0; }
.qz-md { max-width: 640px; }
.qz-md h2 { margin: 48px 0 12px; font-size: 22px; line-height: 1.25; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); }
.qz-md p, .qz-md li { font-size: 16px; line-height: 27px; color: var(--text); }
.qz-md p { margin: 0 0 16px; }
.qz-md ul { margin: 0 0 16px; padding-left: 18px; }
.qz-md li { margin-bottom: 6px; }
.qz-md li::marker { color: var(--faint); }
.qz-md strong { font-weight: 500; color: var(--ink); }
.qz-md code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; color: var(--ink); }
.qz-md pre { margin: 0 0 16px; padding: 16px; border: 1px solid var(--rule); overflow-x: auto; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; line-height: 20px; color: var(--ink); }
.qz-fig { margin: 8px 0 32px; padding: 20px 0 0; border-top: 1px solid var(--rule); max-width: 1040px; }
.qz-fig-grid { display: grid; grid-template-columns: minmax(0, 1fr) 220px; gap: 32px; align-items: start; }
.qz-fig-cap { margin-top: 10px; font-size: 13px; line-height: 20px; color: var(--half); }
.qz-fig-side { display: flex; flex-direction: column; border-top: 1px solid var(--rule); }
.qz-fig-side .qz-stat { padding: 9px 0; }
.qz-fig-side .qz-stat-v { font-size: 14px; }

.qz-log { margin-top: 72px; }
.qz-log-row { display: grid; grid-template-columns: 48px 120px minmax(0, 1fr) 280px; gap: 20px; padding: 18px 0; border-bottom: 1px solid var(--rule); text-align: left; width: 100%; transition: background 0.2s; }
.qz-log-row:hover { background: var(--hover); }
.qz-log-id { font-size: 14px; color: var(--ink); }
.qz-log-date { font-size: 13px; color: var(--half); }
.qz-log-note { font-size: 14px; line-height: 22px; color: var(--text); }
.qz-log-nums { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px 12px; font-size: 13px; line-height: 18px; color: var(--ink); text-align: right; }
.qz-log-nums span { display: block; font-size: 11px; color: var(--faint); }
.qz-log-on .qz-log-id { text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px; }

.qz-score { margin-top: 72px; }
.qz-score-row { display: grid; grid-template-columns: 48px 140px minmax(0, 1fr) 120px 120px; gap: 20px; padding: 14px 0; border-bottom: 1px solid var(--rule); font-size: 14px; line-height: 20px; align-items: baseline; }
.qz-score-row .qz-r { text-align: right; }

.qz-tune { margin-top: 72px; border: 1px solid var(--rule); }
.qz-tune-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--rule); flex-wrap: wrap; }
.qz-tune-body { display: grid; grid-template-columns: 320px minmax(0, 1fr); }
.qz-tune-controls { padding: 20px; border-right: 1px solid var(--rule); display: flex; flex-direction: column; gap: 18px; }
.qz-tune-out { padding: 20px; min-width: 0; }
.qz-field { display: flex; flex-direction: column; gap: 8px; }
.qz-field-top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; font-size: 13px; color: var(--text); }
.qz-field-top b { font-weight: 400; color: var(--ink); }
.qz-range { -webkit-appearance: none; appearance: none; width: 100%; height: 18px; background: transparent; cursor: pointer; }
.qz-range::-webkit-slider-runnable-track { height: 1px; background: var(--rule); }
.qz-range::-moz-range-track { height: 1px; background: var(--rule); }
.qz-range::-webkit-slider-thumb { -webkit-appearance: none; width: 11px; height: 11px; margin-top: -5px; background: var(--bg); border: 1px solid var(--ink); }
.qz-range::-moz-range-thumb { width: 10px; height: 10px; border-radius: 0; background: var(--bg); border: 1px solid var(--ink); }
.qz-range:focus-visible { outline: 1px solid var(--ink); outline-offset: 2px; }
.qz-seg { display: flex; border: 1px solid var(--rule); }
.qz-seg button { flex: 1; height: 30px; font-size: 12px; color: var(--half); border-right: 1px solid var(--rule); transition: color 0.2s, background 0.2s; }
.qz-seg button:last-child { border-right: 0; }
.qz-seg button:hover { color: var(--ink); }
.qz-seg .qz-seg-on { color: var(--ink); background: var(--hover); }
.qz-diff { margin-top: 16px; font-size: 13px; line-height: 20px; color: var(--text); }
.qz-diff li { list-style: none; display: flex; gap: 8px; padding: 4px 0; border-bottom: 1px solid var(--rule); }
.qz-diff ul { margin: 8px 0 0; padding: 0; }
.qz-diff s { color: var(--faint); }
.qz-input { width: 100%; height: 34px; padding: 0 10px; border: 1px solid var(--rule); background: var(--bg); color: var(--ink); font: inherit; font-size: 13px; outline: none; }
.qz-input:focus { border-color: var(--ink); }
.qz-save { display: flex; gap: 8px; margin-top: 12px; }
.qz-mini { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--rule); border-left: 1px solid var(--rule); margin-top: 16px; }
.qz-mini div { padding: 10px 12px; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.qz-mini b { display: block; margin-top: 4px; font-size: 18px; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); }

.qz-disclaimer { margin-top: 72px; padding-top: 16px; border-top: 1px solid var(--rule); }

.qz-board-top { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
.qz-live { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--half); }
.qz-live i { width: 6px; height: 6px; background: var(--ink); display: inline-block; animation: qzPulse 2s ease-in-out infinite; }
@keyframes qzPulse { 50% { opacity: 0.25; } }
@media (prefers-reduced-motion: reduce) { .qz-live i { animation: none; } }
.qz-gauge { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 48px; align-items: start; }
.qz-gauge-num { font-size: 64px; line-height: 1; font-weight: 300; letter-spacing: -0.04em; color: var(--ink); }
.qz-gauge-word { margin-top: 10px; font-size: 18px; line-height: 26px; color: var(--ink); }
.qz-gauge-bar { position: relative; height: 24px; margin-top: 20px; border-top: 1px solid var(--rule); }
.qz-gauge-bar::before { content: ''; position: absolute; left: 50%; top: -5px; height: 9px; border-left: 1px solid var(--rule); }
.qz-gauge-mark { position: absolute; top: -6px; width: 1px; height: 11px; background: var(--ink); transition: left 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.qz-gauge-ends { display: flex; justify-content: space-between; font-size: 11px; color: var(--faint); }
.qz-recipe-row { display: grid; grid-template-columns: minmax(0, 1fr) 150px 44px; gap: 16px; padding: 11px 0; border-bottom: 1px solid var(--rule); font-size: 14px; line-height: 20px; align-items: baseline; }
.qz-recipe-row:first-child { border-top: 1px solid var(--rule); }
.qz-recipe-why { display: block; font-size: 12px; line-height: 17px; color: var(--faint); margin-top: 2px; }
.qz-recipe-read { color: var(--ink); text-align: right; }
.qz-recipe-pts { text-align: right; color: var(--ink); }

.qz-tiles { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border-top: 1px solid var(--rule); border-left: 1px solid var(--rule); }
.qz-tile { padding: 14px 16px 12px; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); min-width: 0; }
.qz-tile-name { font-size: 13px; line-height: 18px; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.qz-tile-sym { font-size: 11px; color: var(--faint); margin-left: 6px; }
.qz-tile-px { margin-top: 8px; font-size: 22px; line-height: 1.1; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); }
.qz-tile-ch { margin-top: 4px; font-size: 12px; line-height: 16px; }
.qz-tile-spark { display: block; width: 100%; height: 28px; margin-top: 8px; }
.qz-tile-spark path { fill: none; stroke: var(--ink); stroke-width: 1; }
.qz-tile-spark .qz-spark-base { stroke: var(--rule); stroke-dasharray: 2 2; }
.qz-tile-trend { margin-top: 6px; font-size: 11px; line-height: 15px; color: var(--faint); }
.qz-tile-down { font-size: 13px; color: var(--faint); margin-top: 8px; }

.qz-sectors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 48px; }
.qz-bar-row { display: grid; grid-template-columns: 150px minmax(0, 1fr) 56px; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--rule); font-size: 13px; line-height: 18px; align-items: center; }
.qz-bar-track { position: relative; height: 10px; }
.qz-bar-track::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; border-left: 1px solid var(--rule); }
.qz-bar { position: absolute; top: 2px; height: 6px; background: var(--ink); transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), left 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.qz-bar-neg { background: var(--qz-loss); }

.qz-odds { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 48px; }
.qz-odd { padding: 16px 0; border-bottom: 1px solid var(--rule); min-width: 0; }
.qz-odd-q { display: flex; justify-content: space-between; gap: 12px; font-size: 15px; line-height: 22px; color: var(--ink); }
.qz-odd-src { font-size: 11px; color: var(--faint); white-space: nowrap; letter-spacing: 0.06em; text-transform: uppercase; padding-top: 3px; }
.qz-out { display: grid; grid-template-columns: minmax(0, 1fr) 72px 48px 48px 64px; gap: 10px; align-items: center; padding: 6px 0 0; font-size: 13px; line-height: 18px; }
.qz-out-name { color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.qz-out-p { color: var(--ink); text-align: right; font-size: 15px; }
.qz-out-ch { text-align: right; font-size: 12px; color: var(--half); }
.qz-out svg { display: block; width: 64px; height: 18px; }
.qz-out svg path { fill: none; stroke: var(--ink); stroke-width: 1; }
.qz-odd-head { display: grid; grid-template-columns: minmax(0, 1fr) 72px 48px 48px 64px; gap: 10px; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--faint); padding-top: 8px; }
.qz-odd-head span { text-align: right; }

.qz-themes { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--rule); border-left: 1px solid var(--rule); }
.qz-theme { padding: 14px 16px; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); text-align: left; transition: background 0.2s; }
.qz-theme:hover, .qz-theme-on { background: var(--hover); }
.qz-theme-name { font-size: 13px; color: var(--ink); }
.qz-theme-score { margin-top: 6px; font-size: 22px; font-weight: 300; letter-spacing: -0.02em; }
.qz-theme-n { font-size: 11px; color: var(--faint); margin-top: 2px; }
.qz-meter { position: relative; height: 1px; background: var(--rule); margin-top: 10px; }
.qz-meter i { position: absolute; top: -3px; width: 1px; height: 7px; background: var(--ink); }
.qz-news { margin-top: 20px; }
.qz-news-row { display: grid; grid-template-columns: 56px minmax(0, 1fr) 150px; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--rule); align-items: baseline; }
.qz-news-score { font-size: 14px; text-align: right; }
.qz-news-title { font-size: 14px; line-height: 21px; color: var(--ink); text-decoration: none; }
.qz-news-title:hover { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.qz-news-why { display: block; margin-top: 3px; font-size: 12px; line-height: 17px; color: var(--faint); }
.qz-news-meta { font-size: 12px; line-height: 17px; color: var(--half); text-align: right; }

.qz-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.qz-card { display: flex; flex-direction: column; border: 1px solid var(--rule); padding: 20px; text-decoration: none; transition: border-color 0.2s; min-width: 0; }
.qz-card:hover { border-color: var(--half); }
.qz-card-kind { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
.qz-card-title { margin-top: 10px; font-size: 18px; line-height: 24px; font-weight: 400; letter-spacing: -0.01em; color: var(--ink); }
.qz-card-sum { margin-top: 8px; font-size: 13px; line-height: 20px; color: var(--text); flex: 1; }
.qz-card-spark { display: block; width: 100%; height: 48px; margin-top: 16px; }
.qz-card-spark path { fill: none; stroke: var(--ink); stroke-width: 1; }
.qz-card-spark .qz-card-ghost { opacity: 0.15; }
.qz-card-nums { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--rule); font-size: 13px; color: var(--ink); }
.qz-card-nums span { display: block; font-size: 11px; color: var(--faint); margin-bottom: 2px; }
.qz-card-now { margin-top: 12px; font-size: 12px; line-height: 18px; color: var(--half); }
.qz-down { padding: 20px 0; font-size: 13px; color: var(--faint); border-bottom: 1px solid var(--rule); }
.qz-skel { height: 120px; background: var(--hover); }
.qz-model { border-left: 1px solid var(--ink); padding-left: 16px; }
.qz-model p { margin: 8px 0 0; font-size: 15px; line-height: 25px; color: var(--text); }
.qz-sources { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 48px; font-size: 13px; line-height: 20px; color: var(--text); }

@media (max-width: 1000px) {
  .qz-top { grid-template-columns: 1fr; gap: 32px; }
  .qz-tiles { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .qz-themes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .qz-cards { grid-template-columns: 1fr 1fr; }
  .qz-log-row { grid-template-columns: 40px minmax(0, 1fr); }
  .qz-log-date { display: none; }
  .qz-log-nums { grid-column: 2; text-align: left; }
  .qz-tune-body { grid-template-columns: 1fr; }
  .qz-tune-controls { border-right: 0; border-bottom: 1px solid var(--rule); }
  .qz-fig-grid { grid-template-columns: 1fr; gap: 16px; }
}
@media (max-width: 760px) {
  .qz-title { font-size: 30px; }
  .qz-hero-num { font-size: 40px; }
  .qz-gauge { grid-template-columns: 1fr; gap: 28px; }
  .qz-odds, .qz-sectors, .qz-sources { grid-template-columns: 1fr; }
  .qz-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .qz-cards { grid-template-columns: 1fr; }
  .qz-progress-grid { grid-template-columns: 1fr; gap: 20px; }
  .qz-news-row { grid-template-columns: 44px minmax(0, 1fr); }
  .qz-news-meta { grid-column: 2; text-align: left; }
  .qz-score-row { grid-template-columns: 36px minmax(0, 1fr) 84px; }
  .qz-score-row .qz-hide-s { display: none; }
  .qz-recipe-row { grid-template-columns: minmax(0, 1fr) 96px 36px; }
  .qz-bar-row { grid-template-columns: 110px minmax(0, 1fr) 50px; }
  .qz-mini { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .qz-out, .qz-odd-head { grid-template-columns: minmax(0, 1fr) 56px 40px 40px; }
  .qz-out svg, .qz-odd-head .qz-hide-s { display: none; }
}
`;

export const WSB_CSS = `
.wsb-ideas { display: flex; flex-direction: column; }
.wsb-idea { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 48px; padding: 40px 0; border-bottom: 1px solid var(--rule); }
.wsb-idea:first-child { padding-top: 8px; }
.wsb-top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 13px; color: var(--half); }
.wsb-status { display: inline-flex; align-items: center; gap: 6px; height: 22px; padding: 0 8px; border: 1px solid currentColor; font-size: 12px; letter-spacing: 0.04em; animation: wsbPop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; animation-delay: 0.5s; }
.wsb-status i { width: 6px; height: 6px; background: currentColor; display: inline-block; }
.wsb-working { color: var(--qz-up); }
.wsb-wrong { color: var(--qz-loss); }
.wsb-notyet { color: var(--half); }
.wsb-draft { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--faint); border: 1px dashed var(--rule); padding: 2px 6px; }
.wsb-title { margin: 12px 0 0; font-size: 26px; line-height: 1.2; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); }
.wsb-title a { text-decoration: none; color: inherit; }
.wsb-title a:hover { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 5px; }
.wsb-sec { margin-top: 20px; }
.wsb-sec h3 { margin: 0 0 4px; font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
.wsb-sec p { margin: 0; font-size: 15px; line-height: 24px; color: var(--text); }
.wsb-sec-play p { color: var(--ink); }
.wsb-tk { font-size: 11px; letter-spacing: 0.06em; color: var(--half); border: 1px solid var(--rule); padding: 1px 5px; margin: 0 2px; white-space: nowrap; }
.wsb-open { display: inline-block; margin-top: 24px; font-size: 13px; color: var(--ink); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; text-decoration-color: var(--rule); }
.wsb-open:hover { text-decoration-color: var(--ink); }
.wsb-cap { margin: 10px 0 0; font-size: 13px; line-height: 20px; color: var(--half); }
.wsb-empty-num { margin-top: 8px; font-size: 48px; line-height: 1.05; font-weight: 300; letter-spacing: -0.035em; color: var(--ink); }
.wsb-big { margin-top: 40px; }
.wsb-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 48px; margin-top: 40px; }
.wsb-cols .wsb-sec { margin-top: 24px; }
.wsb-cols .wsb-sec p { font-size: 16px; line-height: 26px; }
.wsb-more { margin-top: 20px; border-top: 1px solid var(--rule); }
.wsb-more summary { cursor: pointer; list-style: none; padding: 14px 0; font-size: 13px; color: var(--half); }
.wsb-more summary::-webkit-details-marker { display: none; }
.wsb-more summary::before { content: '+ '; }
.wsb-more[open] summary::before { content: '- '; }
.wsb-more-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 32px; padding-bottom: 12px; }
.wsb-foot { margin-top: 72px; padding-top: 16px; border-top: 1px solid var(--rule); font-size: 13px; line-height: 20px; color: var(--faint); }
@keyframes wsbPop { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .wsb-status { animation: none; } }
@media (max-width: 900px) {
  .wsb-idea { grid-template-columns: 1fr; gap: 28px; }
  .wsb-cols { grid-template-columns: 1fr; }
  .wsb-more-grid { grid-template-columns: 1fr; }
  .wsb-title { font-size: 22px; }
}
`;
