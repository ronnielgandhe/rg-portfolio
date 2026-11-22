export const LAB_CSS = `
.lab {
  --lab-accent: #007aff;
  --line: rgba(0, 0, 0, 0.1);
  --line-strong: rgba(0, 0, 0, 0.28);
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  width: 100%;
  font-variant-numeric: tabular-nums;
}
.site-dark .lab {
  --lab-accent: #0a84ff;
  --line: rgba(255, 255, 255, 0.16);
  --line-strong: rgba(255, 255, 255, 0.36);
}
.site-app .site-col.lab > * { max-width: none; }
.lab button:disabled, .lab select:disabled { opacity: 0.4; cursor: default; }
.lab .lab-label { font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
.lab-note { font-size: 13px; line-height: 18px; color: var(--faint); }
.lab-grow { flex: 1; }
.lab a:not(.lab-btn) { color: inherit; }

.site-app .site-col.lab.lab-intro > * { max-width: 640px; }

.lab-kicker { font-size: 14px; line-height: 20px; color: var(--half); margin-bottom: 12px; }
.lab-title { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
.lab-lede { margin: 12px 0 0; font-size: 18px; line-height: 28px; color: var(--text); }
.lab-intro-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
.lab-intro .lab-btn { text-decoration: none; }
@media (max-width: 560px) { .lab-title { font-size: 30px; } }
.lab-sec { margin-top: 88px; scroll-margin-top: 88px; }
.lab-sec-first { margin-top: 40px; }
.lab-sec-head { padding-top: 14px; border-top: 1px solid var(--rule); margin-bottom: 24px; }
.lab-sec-first .lab-sec-head { border-top: 0; padding-top: 0; }
.lab .lab-sec-label { margin: 0; }
.lab-sec-lede { margin: 8px 0 0; max-width: 640px; font-size: 15px; line-height: 24px; color: var(--text); }
.lab-pre { display: inline-block; margin-left: 12px; vertical-align: 0; font-size: 11px; line-height: 16px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--half); border: 1px solid var(--line); padding: 1px 6px; }
.lab-empty { border: 1px solid var(--rule); padding: 22px 24px; font-size: 14px; line-height: 22px; color: var(--faint); }

.lab-btn { display: inline-flex; align-items: center; justify-content: center; height: 38px; padding: 0 22px; border: 1px solid var(--line); font-size: 13px; font-weight: 500; color: var(--ink); white-space: nowrap; transition: background 0.2s, border-color 0.2s, opacity 0.2s; }
.lab-btn:hover:not(:disabled) { background: var(--hover); }
.lab-btn-primary { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.lab-btn-primary:hover:not(:disabled) { background: var(--ink); opacity: 0.86; }
.lab-seg { display: inline-flex; border: 1px solid var(--line); }
.lab-seg button { height: 32px; padding: 0 14px; font-size: 12px; font-weight: 500; letter-spacing: 0.02em; color: var(--text); border-left: 1px solid var(--line); transition: background 0.2s, color 0.2s; }
.lab-seg button:first-child { border-left: 0; }
.lab-seg button:hover { color: var(--ink); }
.lab-seg .lab-seg-on, .lab-seg .lab-seg-on:hover { background: var(--ink); color: var(--bg); }
.lab :focus-visible { outline: 1px solid var(--ink); outline-offset: 2px; }

.lab-controls { border: 1px solid var(--rule); padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.lab-presets { display: flex; flex-wrap: wrap; gap: 6px; }
.lab-preset { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border: 1px solid var(--line); font-size: 12px; color: var(--text); transition: border-color 0.2s, color 0.2s, background 0.2s; }
.lab-preset svg { color: var(--faint); }
.lab-preset:hover:not(:disabled) { border-color: var(--line-strong); color: var(--ink); }
.lab-preset-on, .lab-preset-on:hover:not(:disabled) { border-color: var(--ink); color: var(--ink); }
.lab-pair { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 14px; align-items: end; }
.lab-pair-arrow { height: 52px; display: inline-flex; align-items: center; color: var(--half); }
.lab-go-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

.lab-verdict { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-bottom: 1px solid var(--rule); margin-top: 28px; min-height: 76px; }
.lab-verdict-cell { padding: 14px 24px 16px 0; animation: labFade 0.4s var(--ease) both; }
.lab-verdict-cell + .lab-verdict-cell { padding-left: 24px; border-left: 1px solid var(--rule); }
.lab-verdict-text { margin-top: 6px; font-size: 20px; line-height: 28px; font-weight: 300; letter-spacing: -0.01em; color: var(--ink); }
.lab-verdict-quiet { color: var(--faint); }

.lab-lanes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; }
.lab-lane { min-width: 0; padding: 24px 24px 8px 0; display: flex; flex-direction: column; }
.lab-lane + .lab-lane { padding-left: 24px; padding-right: 0; border-left: 1px solid var(--rule); }
.lab-lane-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 18px; }
.lab-tags { display: flex; gap: 12px; }
.lab-tag { font-size: 11px; line-height: 16px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); border-bottom: 1px solid var(--ink); animation: labFade 0.4s var(--ease) both; }
.lab-select { margin-top: 10px; width: 100%; height: 48px; padding: 0 40px 0 0; border: 0; border-bottom: 1px solid var(--line); border-radius: 0; background: transparent no-repeat right 4px center / 12px 12px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%23888' stroke-width='1.2'%3E%3Cpath d='M2 4.5l4 4 4-4'/%3E%3C/svg%3E"); color: var(--ink); font: inherit; font-size: 26px; font-weight: 300; letter-spacing: -0.02em; -webkit-appearance: none; appearance: none; cursor: pointer; transition: border-color 0.2s; }
.lab .lab-select:disabled { opacity: 1; color: var(--text); }
.lab-select:hover:not(:disabled), .lab-select:focus { border-color: var(--ink); outline: none; }
.lab-select option { font-size: 15px; color: #1a1a1a; background: #fff; }
.lab-lane-blurb { margin: 10px 0 0; min-height: 40px; font-size: 13px; line-height: 20px; color: var(--faint); }
.lab-graph { position: relative; margin-top: 16px; height: 260px; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.lab-canvas { display: block; width: 100%; height: 100%; color: var(--ink); }
.lab-graph-empty { position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 14px; font-size: 12px; color: var(--faint); pointer-events: none; }
.lab-status { margin-top: 12px; height: 20px; font-size: 13px; line-height: 20px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lab-stats { display: flex; flex-wrap: wrap; margin-top: 8px; border-top: 1px solid var(--rule); }
.lab-stat { flex: 1 1 0; min-width: 96px; padding: 14px 12px 14px 0; }
.lab-stat-num { margin-top: 6px; font-size: 28px; line-height: 32px; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); white-space: nowrap; }
.lab-stat-sub { font-size: 13px; letter-spacing: 0; color: var(--faint); }
.lab-path { list-style: none; margin: 4px 0 0; padding: 0; border-top: 1px solid var(--rule); }
.lab-path-step { display: grid; grid-template-columns: 20px 24px minmax(0, 1fr); align-items: center; gap: 10px; height: 40px; border-bottom: 1px solid var(--rule); animation: labIn 0.35s var(--ease) both; }
.lab-path-i { font-size: 12px; color: var(--faint); }
.lab-path-t { font-size: 14px; line-height: 20px; color: var(--ink); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lab-path-t:hover { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.lab-miss { margin: 4px 0 0; padding: 12px 0; border-top: 1px solid var(--rule); font-size: 14px; line-height: 22px; color: var(--text); }

@keyframes labFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes labIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

.lab-foot { margin-top: 96px; padding: 20px 0 8px; border-top: 1px solid var(--rule); font-size: 13px; line-height: 20px; color: var(--faint); }
.lab-foot a { color: var(--text); text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 3px; text-decoration-thickness: 1px; }

@media (max-width: 760px) {
  .lab-lanes { grid-template-columns: minmax(0, 1fr); }
  .lab-lane, .lab-lane + .lab-lane { padding: 24px 0 8px; border-left: 0; }
  .lab-lane + .lab-lane { border-top: 1px solid var(--rule); margin-top: 16px; }
  .lab-verdict { grid-template-columns: minmax(0, 1fr); }
  .lab-verdict-cell + .lab-verdict-cell { padding-left: 0; border-left: 0; border-top: 1px solid var(--rule); }
  .lab-pair { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .lab-pair-arrow { display: none; }
  .lab-controls { padding: 18px; }
  .lab-sec { margin-top: 72px; }
}
@media (prefers-reduced-motion: reduce) {
  .lab *, .lab *::before, .lab *::after { animation: none !important; transition: none !important; }
}
`;

export const LAB_CSS_2 = `
.lab-accent { color: var(--ink); }
.lab-accent-fill { fill: var(--lab-accent); }
.lab-bar-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
.lab-val { font-size: 15px; line-height: 20px; color: var(--ink); white-space: nowrap; }
.lab-val-sub { font-size: 12px; color: var(--faint); }

.lab-board { position: relative; }
.lab-board-head, .lab-row { display: grid; grid-template-columns: minmax(130px, 1.1fr) repeat(3, minmax(0, 1fr)); gap: 28px; }
.lab-board-head { border-bottom: 1px solid var(--ink); }
.lab-th { display: flex; align-items: center; gap: 6px; height: 36px; text-align: left; font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); transition: color 0.2s; }
.lab-th:hover, .lab-th-on { color: var(--ink); }
.lab-th-mark { width: 10px; font-size: 11px; }
.lab-board-body { position: relative; }
.lab-row { position: absolute; left: 0; right: 0; top: 0; height: 60px; align-items: center; border-bottom: 1px solid var(--rule); transition: transform 0.5s var(--ease); }
.lab-cell { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.lab-cell-name { font-size: 16px; line-height: 22px; font-weight: 400; color: var(--ink); }
.lab-bar { position: relative; display: block; height: 1px; background: var(--rule); }
.lab-bar i { position: absolute; left: 0; top: -1px; width: 100%; height: 3px; background: var(--ink); transform-origin: left; transition: transform 0.6s var(--ease); }
.lab-bar i.lab-bar-model { background: var(--lab-accent); }
.lab-bar-clicks b { position: absolute; top: -5px; width: 1px; height: 11px; background: var(--ink); transition: left 0.6s var(--ease), opacity 0.3s; }
.lab-bar-clicks em { position: absolute; right: -2px; top: -4px; width: 5px; height: 9px; background: var(--bg); border-left: 1px solid var(--ink); border-right: 1px solid var(--ink); transform: skewX(-20deg); }
.lab-cell-clicks { position: relative; align-self: stretch; justify-content: center; }
.lab-human { position: absolute; top: 0; bottom: -1px; border-left: 1px dashed var(--line-strong); pointer-events: none; transition: left 0.6s var(--ease); }
.lab-human span { position: absolute; top: 4px; left: 6px; font-size: 11px; line-height: 14px; color: var(--half); white-space: nowrap; }
.lab-board-note { margin: 14px 0 0; max-width: 640px; }

.lab-sub { margin-top: 64px; }
.lab-sub-lede { margin: 8px 0 0; max-width: 640px; font-size: 15px; line-height: 24px; color: var(--text); }
.lab-trade { margin-top: 20px; }
.lab-trade-plot { width: 100%; }
.lab-trade svg, .lab-fig svg { display: block; overflow: visible; font-family: inherit; }
.lab-grid { stroke: var(--rule); stroke-width: 1; shape-rendering: crispEdges; }
.lab-grid-cut { stroke-dasharray: 2 3; }
.lab-tick { font-size: 11px; fill: var(--faint); font-variant-numeric: tabular-nums; }
.lab-axis { font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; fill: var(--half); }
.lab-corner { fill: none; stroke: var(--ink); stroke-width: 1; }
.lab-corner-t { font-size: 12px; fill: var(--ink); }
.lab-trade-human line { stroke: var(--line-strong); stroke-dasharray: 3 3; shape-rendering: crispEdges; }
.lab-trade-human text { font-size: 11px; fill: var(--half); }
.lab-pt { transition: transform 0.6s var(--ease), opacity 0.4s var(--ease); }
.lab-pt rect { fill: var(--ink); }
.lab-pt line { stroke: var(--line-strong); }
.lab-pt text { font-size: 13px; fill: var(--ink); paint-order: stroke; stroke: var(--bg); stroke-width: 4px; stroke-linejoin: round; }
.lab-pt-model rect { fill: var(--lab-accent); }

.lab-dgrid { display: grid; gap: 0 24px; align-items: center; }
.lab-dgrid > .lab-label { padding-bottom: 10px; border-bottom: 1px solid var(--ink); }
.lab-dgrid-name, .lab-dgrid-cell { height: 48px; display: flex; flex-direction: column; justify-content: center; gap: 7px; border-bottom: 1px solid var(--rule); font-size: 14px; color: var(--ink); }

.lab-fig { margin: 0; }
.lab-fig figcaption { margin-top: 10px; max-width: 640px; }
.lab-line { fill: none; stroke-width: 1.25; stroke-dasharray: 1; stroke-dashoffset: 1; }
.lab-line.lab-draw { stroke-dashoffset: 0; transition: stroke-dashoffset 0.6s var(--ease); }
.lab-line-train { stroke: var(--faint); }
.lab-line-val { stroke: var(--lab-accent); }
.lab-abl { border-top: 1px solid var(--rule); }
.lab-abl-row { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) 72px; gap: 20px; align-items: center; height: 44px; border-bottom: 1px solid var(--rule); }
.lab-abl-name { font-size: 14px; line-height: 18px; color: var(--ink); }
.lab-abl-track { position: relative; height: 1px; background: var(--rule); }
.lab-abl-track::after { content: ''; position: absolute; left: 50%; top: -8px; width: 1px; height: 17px; background: var(--ink); }
.lab-abl-track i { position: absolute; top: -1px; height: 3px; width: 100%; transition: transform 0.6s var(--ease); }
.lab-abl-neg { right: 50%; background: var(--ink); transform-origin: right; }
.lab-abl-pos { left: 50%; background: var(--lab-accent); transform-origin: left; }
.lab-abl-row .lab-val { text-align: right; }

.lab-diagrams { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 40px 28px; margin-top: 20px; }
.lab-dia { min-width: 0; border-top: 1px solid var(--rule); padding-top: 20px; }
.lab-toy svg { display: block; width: 100%; height: auto; overflow: visible; }
.lab-toy-e { stroke: var(--rule); stroke-width: 1; vector-effect: non-scaling-stroke; }
.lab-toy-walk { stroke: var(--faint); stroke-width: 1; vector-effect: non-scaling-stroke; animation: labFade 0.3s var(--ease) both; }
.lab-toy-back { stroke-dasharray: 3 2; }
.lab-toy-path { stroke: var(--ink); stroke-width: 1.5; vector-effect: non-scaling-stroke; animation: labFade 0.3s var(--ease) both; }
.lab-toy-model .lab-toy-path { stroke: var(--lab-accent); }
.lab-toy-n { fill: var(--bg); stroke: var(--line-strong); stroke-width: 1; vector-effect: non-scaling-stroke; transition: fill 0.3s var(--ease), stroke 0.3s var(--ease); }
.lab-toy-front { stroke: var(--ink); }
.lab-toy-on { fill: var(--faint); stroke: var(--faint); }
.lab-toy-hot { fill: var(--ink); stroke: var(--ink); }
.lab-toy-model .lab-toy-hot { fill: var(--lab-accent); stroke: var(--lab-accent); }
.lab-toy-cur { fill: none; stroke: var(--ink); stroke-width: 1; vector-effect: non-scaling-stroke; }
.lab-toy-model .lab-toy-cur { stroke: var(--lab-accent); }
.lab-toy-num { font-size: 9px; fill: var(--lab-accent); font-variant-numeric: tabular-nums; }
.lab-toy-lbl { font-size: 10px; fill: var(--half); letter-spacing: 0.06em; }
.lab-dia-name { margin: 14px 0 0; font-size: 16px; line-height: 22px; font-weight: 400; letter-spacing: -0.01em; color: var(--ink); }
.lab-dia-blurb { margin: 4px 0 0; font-size: 13px; line-height: 20px; color: var(--text); }
.lab-dia details { margin-top: 8px; }
.lab-dia summary { list-style: none; cursor: pointer; font-size: 12px; line-height: 18px; color: var(--half); text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 3px; text-decoration-thickness: 1px; }
.lab-dia summary::-webkit-details-marker { display: none; }
.lab-dia summary:hover { color: var(--ink); }
.lab-dia-explain { margin: 10px 0 0; font-size: 13px; line-height: 21px; color: var(--text); }

.lab-facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.lab-fact { padding: 18px 20px 20px 0; min-width: 0; }
.lab-fact + .lab-fact { padding-left: 20px; border-left: 1px solid var(--rule); }
.lab-fact-num { margin-top: 10px; font-size: 36px; line-height: 40px; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
.lab-fact-sub { margin-top: 6px; font-size: 12px; line-height: 18px; color: var(--faint); }
.lab-md { max-width: 640px; margin-top: 40px; }
.lab-md p, .lab-md li { font-size: 16px; line-height: 28px; color: var(--text); }
.lab-md p { margin: 0 0 18px; }
.lab-md ul, .lab-md ol { margin: 0 0 18px; padding-left: 20px; }
.lab-md li { margin: 4px 0; }
.lab-md strong { font-weight: 600; color: var(--ink); }
.lab-md code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.86em; padding: 1px 4px; border: 1px solid var(--rule); color: var(--ink); }
.lab-md a { color: var(--ink); text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 3px; text-decoration-thickness: 1px; }
.lab-md-h2 { margin: 48px 0 14px; font-size: 22px; line-height: 30px; font-weight: 400; letter-spacing: -0.015em; color: var(--ink); }
.lab-md-h3 { margin: 28px 0 10px; font-size: 16px; line-height: 24px; font-weight: 600; color: var(--ink); }
.lab-md-chart { margin: 28px 0 32px; }
.lab-md-wait { color: var(--faint) !important; }
.lab-md-cap { margin: 36px 0 14px; }
.lab-md .lab-ref { display: block; padding: 12px 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); font-size: 13px; line-height: 18px; color: var(--half); text-decoration: none; }
.lab-md .lab-ref::before { content: '\\2191  '; }
.lab-md .lab-ref:hover { color: var(--ink); }
.lab-links { display: flex; flex-wrap: wrap; gap: 8px 24px; margin-top: 40px; }
.lab-links a { font-size: 13px; line-height: 18px; color: var(--text); text-decoration: underline; text-decoration-color: var(--line-strong); text-decoration-thickness: 1px; text-underline-offset: 3px; transition: color 0.2s; }
.lab-links a:hover { color: var(--ink); }

@media (max-width: 1000px) { .lab-diagrams { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) {
  .lab-board-head, .lab-row { grid-template-columns: minmax(96px, 1fr) repeat(3, minmax(0, 1fr)); gap: 12px; }
  .lab-cell-name { font-size: 14px; line-height: 18px; }
  .lab-val { font-size: 13px; }
  .lab-val-sub { display: none; }
  .lab-th { font-size: 10px; letter-spacing: 0.04em; height: 44px; line-height: 13px; }
  .lab-human { display: none; }
  .lab-diagrams { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 20px; }
  .lab-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lab-fact:nth-child(3) { padding-left: 0; border-left: 0; }
  .lab-fact:nth-child(n+3) { border-top: 1px solid var(--rule); }
  .lab-fact-num { font-size: 28px; line-height: 32px; }
  .lab-abl-row { grid-template-columns: minmax(0, 1fr) 70px; height: auto; padding: 10px 0; gap: 8px 12px; }
  .lab-abl-track { grid-column: 1 / -1; grid-row: 2; }
}

.lab-money { margin-bottom: 40px; }
.lab-money svg { display: block; overflow: visible; font-family: inherit; }
.lab-break line { stroke: var(--half); stroke-width: 1; }
.lab-mp { transition: transform 0.6s var(--ease), opacity 0.4s var(--ease); }
.lab-mp rect { fill: var(--ink); stroke: var(--ink); stroke-width: 1; }
.lab-mp-llm rect { fill: var(--bg); }
.lab-mp-accent rect { fill: var(--lab-accent); stroke: var(--lab-accent); }
.lab-mp-ci line { stroke: var(--half); stroke-width: 1; }
.lab-mp-lead { stroke: var(--line-strong); }
.lab-mp text { font-size: 12px; fill: var(--ink); paint-order: stroke; stroke: var(--bg); stroke-width: 4px; stroke-linejoin: round; }
.lab-mp-free text { fill: var(--text); }
.lab-llm-table { margin-top: 8px; }
.lab-llm-row { display: grid; grid-template-columns: minmax(140px, 1.6fr) minmax(0, 1.1fr) repeat(4, minmax(0, 0.8fr)); gap: 20px; align-items: center; }
.lab-llm-head { border-bottom: 1px solid var(--ink); }
.lab-llm-body { position: absolute; left: 0; right: 0; top: 0; height: 56px; border-bottom: 1px solid var(--rule); transition: transform 0.5s var(--ease); }
.lab-llm-name { display: flex; flex-direction: column; font-size: 15px; line-height: 20px; color: var(--ink); min-width: 0; }
.lab-llm-name span { font-size: 12px; line-height: 16px; color: var(--faint); }
.lab-replay { border: 1px solid var(--rule); padding: 20px; }
.lab-replay-bar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.lab-select-sm { flex: 1 1 280px; width: auto; margin-top: 0; height: 40px; font-size: 16px; font-weight: 400; letter-spacing: 0; }
.lab-replay-ctl { display: flex; gap: 6px; }
.lab-replay-ctl .lab-btn { height: 34px; padding: 0 14px; }
.lab-chain { display: flex; flex-wrap: wrap; align-items: center; row-gap: 14px; margin-top: 20px; min-height: 60px; }
.lab-chain-step { display: flex; align-items: center; animation: labIn 0.35s var(--ease) both; }
.lab-chain-line { display: block; width: 24px; height: 1px; background: var(--line-strong); flex-shrink: 0; }
.lab-chain-gap { width: 40px; background: none; border-top: 1px dashed var(--line-strong); }
.lab-card { display: flex; align-items: center; gap: 10px; width: 204px; min-height: 70px; padding: 10px 12px 10px 10px; border: 1px solid var(--rule); background: var(--bg); transition: border-color 0.3s var(--ease), opacity 0.3s var(--ease); }
.lab-card-text { min-width: 0; }
.lab-card-title { display: block; font-size: 13px; line-height: 17px; font-weight: 500; color: var(--ink); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lab-card-cap { margin-top: 2px; font-size: 11px; line-height: 15px; color: var(--faint); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.lab-card-now { border-color: var(--ink); }
.lab-card-goal { border-style: dashed; border-color: var(--line-strong); }
.lab-card-ghost { border-style: dashed; border-color: var(--line-strong); opacity: 0.55; }
.lab-card-hit { border-color: var(--ink); }
.lab-replay-out { display: flex; align-items: baseline; gap: 14px; margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--rule); flex-wrap: wrap; }
.lab-replay-text { font-size: 18px; line-height: 26px; font-weight: 300; color: var(--ink); }
.lab-prior { display: flex; flex-direction: column; gap: 6px; margin: 32px 0 0; max-width: 640px; font-size: 14px; line-height: 22px; color: var(--text); }
.lab-prior a { color: var(--ink); text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 3px; text-decoration-thickness: 1px; }
:is(#llms) .lab-md { margin-top: 32px; }
@media (max-width: 760px) {
  .lab-llm-row { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 0.9fr); gap: 10px; }
  .lab-c-over, .lab-c-invalid, .lab-c-latency { display: none !important; }
  .lab-llm-name { font-size: 13px; line-height: 17px; }
  .lab-replay { padding: 14px; }
  .lab-card { width: 100%; }
  .lab-chain { flex-direction: column; align-items: stretch; }
  .lab-chain-step { flex-direction: column; align-items: stretch; }
  .lab-chain-line, .lab-chain-gap { width: 1px; height: 14px; margin-left: 26px; border-top: 0; }
  .lab-chain-gap { background: none; border-left: 1px dashed var(--line-strong); }
}
`;
