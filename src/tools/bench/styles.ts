export const BENCH_CSS = `
.bx { --accent: #2f5bd3; --ease: cubic-bezier(0.33, 1, 0.68, 1); width: 100%; max-width: 1104px; margin: 0 auto; padding: 0 0 96px; font-variant-numeric: tabular-nums; color: var(--text); }
.site-dark .bx { --accent: #7c9cff; }
.bx a { color: inherit; text-decoration: none; }
.bx code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--ink); }

.bx-lede { margin: 18px 0 0; max-width: 640px; font-size: 17px; line-height: 28px; color: var(--text); }
.bx-label { display: block; font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
.bx-intro .bx-lede { margin-top: 0; }
.bx-small { font-size: 12px; }
.bx-section-first { margin-top: 64px; }
.bx-hero-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 28px; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.bx-hero-stats > div { padding: 22px 0 20px; display: flex; flex-direction: column; gap: 8px; }
.bx-hero-stats > div + div { padding-left: 24px; border-left: 1px solid var(--rule); }
.bx-big { font-size: 34px; line-height: 1; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
.bx-big-sub { font-size: 20px; color: var(--half); letter-spacing: -0.01em; }
.bx-hero-foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 24px; }
.bx-synced { font-size: 12px; color: var(--faint); }

.bx-section { margin-top: 96px; }
.bx-h2 { margin: 10px 0 24px; font-size: 30px; line-height: 1.15; font-weight: 300; letter-spacing: -0.025em; color: var(--ink); }
.bx-section-lede { margin: -12px 0 24px; max-width: 620px; font-size: 14px; line-height: 22px; color: var(--text); }
.bx-h3 { margin: 0; font-size: 20px; line-height: 28px; font-weight: 400; letter-spacing: -0.015em; color: var(--ink); }

.bx-box { border: 1px solid var(--rule); background: var(--bg); }
.bx-box-body { padding: 28px 32px 32px; }
.bx-tabs { display: flex; justify-content: center; border-bottom: 1px solid var(--rule); overflow-x: auto; scrollbar-width: none; }
.bx-tabs::-webkit-scrollbar { display: none; }
.bx-tab-btn { position: relative; flex-shrink: 0; height: 50px; padding: 0 20px; font-size: 14px; color: var(--half); white-space: nowrap; transition: color 0.2s; }
.bx-tab-btn:hover { color: var(--ink); }
.bx-tab-on, .bx-tab-on:hover { color: var(--ink); }
.bx-tab-on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--ink); }

.bx-seg { display: inline-flex; border: 1px solid var(--rule); flex-shrink: 0; }
.bx-seg button { position: relative; height: 30px; padding: 0 12px; font-size: 12px; color: var(--half); border-right: 1px solid var(--rule); transition: color 0.2s, background 0.2s; white-space: nowrap; }
.bx-seg button:last-child { border-right: 0; }
.bx-seg button:hover { color: var(--ink); background: var(--hover); }
.bx-seg .bx-seg-on, .bx-seg .bx-seg-on:hover { color: var(--ink); background: var(--hover); }
.bx-seg .bx-seg-on::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--ink); }
.bx-seg-wrap { flex-wrap: wrap; }

.bx-meta { margin-top: 6px; }
.bx-measures { margin: 6px 0 0; max-width: 780px; font-size: 14px; line-height: 22px; color: var(--text); }
.bx-meta-row { display: flex; flex-wrap: wrap; gap: 4px 18px; margin-top: 8px; font-size: 12px; line-height: 18px; color: var(--half); }
.bx-link { color: var(--ink); text-decoration: underline !important; text-decoration-thickness: 1px !important; text-underline-offset: 3px; text-decoration-color: var(--faint) !important; transition: text-decoration-color 0.2s; }
.bx-link:hover { text-decoration-color: var(--ink) !important; }
.bx-fine { margin: 10px 0 0; font-size: 12px; line-height: 18px; color: var(--faint); }
.bx-faint { color: var(--faint); }
.bx-empty { margin: 16px 0 0; font-size: 13px; color: var(--faint); }
.bx-gap { margin-top: 28px; }

.bx-money-head { display: flex; flex-direction: column; gap: 2px; margin-bottom: 20px; }
.bx-money-title { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.bx-money-grid { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 32px; align-items: start; }
.bx-plot { position: relative; min-width: 0; width: 100%; }
.bx-plot svg { display: block; overflow: visible; font-family: inherit; }
.bx-grid { stroke: var(--rule); stroke-width: 1; stroke-dasharray: 1; stroke-dashoffset: 1; }
.bx-axis { stroke: var(--half); stroke-width: 1; opacity: 0.6; stroke-dasharray: 1; stroke-dashoffset: 1; }
.bx-tick, .bx-axis-label { opacity: 0; }
.bx-on .bx-axis { animation: bxDraw 0.6s var(--ease) forwards; }
.bx-on .bx-grid { animation: bxDraw 0.6s var(--ease) 0.12s forwards; }
.bx-on .bx-tick, .bx-on .bx-axis-label { animation: bxFade 0.4s var(--ease) 0.3s forwards; }
@keyframes bxDraw { to { stroke-dashoffset: 0; } }
.bx-pt-off { pointer-events: none; }
.bx-labels { opacity: 0; animation: bxFade 0.35s var(--ease) forwards; }
.bx-tick { font-size: 11px; fill: var(--half); font-variant-numeric: tabular-nums; }
.bx-axis-label { font-size: 11px; fill: var(--half); letter-spacing: 0.02em; }
.bx-front { fill: none; stroke: var(--ink); stroke-width: 1; stroke-linejoin: miter; stroke-dasharray: 1; stroke-dashoffset: 1; animation: bxDraw 0.7s var(--ease) forwards; }
.bx-pt { cursor: pointer; outline: none; }
.bx-hit { fill: transparent; }
.bx-dot { fill: var(--bg); stroke: var(--half); stroke-width: 1; transition: r 0.15s, fill 0.15s, stroke 0.15s; }
.bx-pt-front .bx-dot { fill: var(--ink); stroke: var(--ink); }
.bx-pt-hot .bx-dot, .bx-pt:focus-visible .bx-dot { stroke: var(--ink); stroke-width: 1.5; r: 5.5; }
.bx-pt:focus-visible .bx-hit { stroke: var(--ink); stroke-width: 1; stroke-dasharray: 2 2; }
.bx-pt-sel .bx-dot { fill: var(--accent); stroke: var(--accent); r: 5.5; }
.bx-plabel { font-size: 11px; fill: var(--ink); letter-spacing: 0; text-transform: none; font-weight: 400; paint-order: stroke; stroke: var(--bg); stroke-width: 3px; stroke-linejoin: round; pointer-events: none; }
@keyframes bxIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.bx-card { position: absolute; z-index: 5; width: 236px; padding: 12px 14px; border: 1px solid var(--rule); background: var(--bg); display: flex; flex-direction: column; gap: 5px; pointer-events: none; animation: bxFade 0.15s ease both; }
@keyframes bxFade { from { opacity: 0; } to { opacity: 1; } }
.bx-card-name { font-size: 15px; line-height: 20px; font-weight: 500; color: var(--ink); margin-bottom: 2px; }
.bx-card-line { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; line-height: 18px; color: var(--half); }
.bx-card-line span:last-child { color: var(--ink); }
.bx-card-hint { margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--rule); font-size: 11px; color: var(--faint); }
.bx-chart-note { margin-top: 14px; }

.bx-front-list { border-left: 1px solid var(--rule); padding-left: 24px; min-width: 0; }
.bx-front-list ol { list-style: none; margin: 14px 0 0; padding: 0; }
.bx-front-list li + li { border-top: 1px solid var(--rule); }
.bx-front-list li { background: var(--bg); }
.bx-front-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 9px 0; text-align: left; }
.bx-front-row .bx-num { display: flex; flex-direction: column; align-items: flex-end; }

.bx-name { display: flex; flex-direction: column; min-width: 0; }
.bx-name-main { font-size: 14px; line-height: 20px; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bx-name-sub { font-size: 12px; line-height: 17px; color: var(--half); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bx-num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bx-score { font-size: 14px; color: var(--ink); font-variant-numeric: tabular-nums; }
.bx-price { font-size: 12px; color: var(--half); }
.bx-rank { font-size: 12px; color: var(--half); }
.bx-row-btn { width: 100%; text-align: left; cursor: pointer; transition: background 0.15s; }
.bx-row-btn:hover { background: var(--hover); }
.bx-row-sel { box-shadow: inset 2px 0 0 var(--accent); }
.bx-row-dim .bx-name-main, .bx-row-dim .bx-score { color: var(--half); }

.bx-controls { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 8px; }
.bx-input { height: 34px; padding: 0 12px; border: 1px solid var(--rule); border-radius: 0; background: var(--bg); color: var(--ink); font: inherit; font-size: 13px; outline: none; transition: border-color 0.2s; }
.bx-input:focus { border-color: var(--half); }
.bx-input::placeholder { color: var(--faint); }
.bx-search { flex: 1 1 200px; min-width: 0; }
.bx-select { appearance: none; -webkit-appearance: none; padding-right: 30px; background-image: linear-gradient(45deg, transparent 50%, var(--half) 50%), linear-gradient(135deg, var(--half) 50%, transparent 50%); background-position: calc(100% - 15px) 15px, calc(100% - 11px) 15px; background-size: 4px 4px; background-repeat: no-repeat; cursor: pointer; max-width: 100%; }
.bx-full { width: 100%; }
.bx-controls .bx-seg button { height: 34px; }

.bx-rows { margin-top: 6px; }
.bx-row { background: var(--bg); display: grid; grid-template-columns: 36px minmax(0, 1.3fr) minmax(0, 1fr) 72px 132px; align-items: center; gap: 16px; padding: 9px 8px; border-top: 1px solid var(--rule); }
.bx-row-head { padding-top: 10px; padding-bottom: 10px; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--faint); border-top: 0; }
.bx-hl-short { display: none; }
.bx-bar { position: relative; display: block; height: 6px; background: var(--rule); }
.bx-bar-fill { position: absolute; inset: 0; background: var(--ink); transform-origin: left center; transition: transform 0.6s var(--ease); will-change: transform; }
.bx-flip-host { position: relative; }
.bx-row-dim .bx-bar-fill { background: var(--half); opacity: 0.5; }
.bx-more { display: block; width: 100%; height: 40px; margin-top: 0; border-top: 1px solid var(--rule); font-size: 13px; color: var(--half); transition: color 0.2s, background 0.2s; }
.bx-more:hover { color: var(--ink); background: var(--hover); }

.bx-calc { display: grid; grid-template-columns: 320px minmax(0, 1fr); }
.bx-calc-in { padding: 28px 28px 32px; display: flex; flex-direction: column; align-self: start; position: sticky; top: 72px; }
.bx-presets { display: grid; grid-template-columns: 1fr 1fr; margin-top: 12px; border-top: 1px solid var(--rule); border-left: 1px solid var(--rule); }
.bx-presets button { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 10px 12px; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); font-size: 13px; line-height: 18px; color: var(--half); text-align: left; transition: color 0.2s, background 0.2s; }
.bx-presets button:hover { color: var(--ink); background: var(--hover); }
.bx-presets .bx-preset-on, .bx-presets .bx-preset-on:hover { color: var(--ink); background: var(--hover); }
.bx-presets .bx-preset-on::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px; background: var(--ink); }
.bx-preset-sub { font-size: 11px; color: var(--faint); font-variant-numeric: tabular-nums; }
.bx-fields { display: flex; flex-direction: column; gap: 14px; margin-top: 20px; }
.bx-field { display: flex; flex-direction: column; gap: 8px; }
.bx-num-input { width: 100%; font-variant-numeric: tabular-nums; }
.bx-calc-in > .bx-select { margin-top: 12px; }
.bx-slider { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.bx-slider input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 18px; background: transparent; cursor: pointer; }
.bx-slider input[type=range]::-webkit-slider-runnable-track { height: 1px; background: var(--half); }
.bx-slider input[type=range]::-moz-range-track { height: 1px; background: var(--half); }
.bx-slider input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; margin-top: -6px; background: var(--ink); border: 0; border-radius: 0; }
.bx-slider input[type=range]::-moz-range-thumb { width: 12px; height: 12px; background: var(--ink); border: 0; border-radius: 0; }
.bx-slider-val { font-size: 14px; color: var(--ink); }
.bx-calc-out { padding: 28px 32px 0; min-width: 0; display: flex; flex-direction: column; border-left: 1px solid var(--rule); }
.bx-answer { padding-bottom: 24px; border-bottom: 1px solid var(--rule); }
.bx-answer-name { display: block; margin-top: 10px; font-size: 26px; line-height: 1.2; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); text-align: left; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 5px; text-decoration-color: var(--rule); transition: text-decoration-color 0.2s; }
.bx-answer-name:hover { text-decoration-color: var(--ink); }
.bx-answer-nums { display: flex; flex-wrap: wrap; gap: 0; margin-top: 18px; }
.bx-answer-nums > div { display: flex; flex-direction: column; gap: 8px; padding-right: 28px; }
.bx-answer-nums > div + div { padding-left: 28px; border-left: 1px solid var(--rule); }
.bx-cost-rows { margin-top: 8px; }
.bx-cost-row { background: var(--bg); display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) 76px 64px; align-items: center; gap: 16px; padding: 9px 8px; border-top: 1px solid var(--rule); }
.bx-cost-row.bx-row-head { border-top: 0; }
.bx-pick-mark { position: absolute; left: 0; top: 0; width: 2px; background: var(--ink); z-index: 1; pointer-events: none; transition: transform 0.48s var(--ease), height 0.48s var(--ease); }
.bx-pick-mark span { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); white-space: nowrap; display: none; }
.bx-field-row { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 12px; align-items: center; }
.bx-range { -webkit-appearance: none; appearance: none; width: 100%; height: 18px; background: transparent; cursor: pointer; }
.bx-range::-webkit-slider-runnable-track { height: 1px; background: var(--half); }
.bx-range::-moz-range-track { height: 1px; background: var(--half); }
.bx-range::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; margin-top: -5px; background: var(--ink); border: 0; border-radius: 0; }
.bx-range::-moz-range-thumb { width: 10px; height: 10px; background: var(--ink); border: 0; border-radius: 0; }
.bx-calc-out .bx-more { margin: 0 -32px; width: calc(100% + 64px); }

.bx-speech { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.bx-speech-col { min-width: 0; }
.bx-speech-col .bx-h3 { margin-top: 8px; }
.bx-speech-col .bx-more { margin: 0 -32px -32px; width: calc(100% + 64px); }
.bx-rows-speech { margin-top: 18px; }
.bx-row-speech { grid-template-columns: 28px minmax(0, 1.4fr) minmax(0, 0.8fr) 56px; gap: 14px; padding-left: 0; padding-right: 0; }

.bx-src-table { border-top: 1px solid var(--rule); }
.bx-src-row { display: grid; grid-template-columns: 220px minmax(0, 1fr) 100px 120px 200px; gap: 20px; padding: 14px 0; border-bottom: 1px solid var(--rule); font-size: 13px; line-height: 20px; color: var(--text); }
.bx-src-row.bx-row-head { padding: 10px 0; }
.bx-src-name { display: flex; flex-direction: column; gap: 2px; }
.bx-tab { font-variant-numeric: tabular-nums; color: var(--ink); }
.bx-method { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 40px; }
.bx-method p { margin: 12px 0 0; font-size: 14px; line-height: 23px; color: var(--text); }
.bx-missing { list-style: none; margin: 12px 0 0; padding: 0; }
.bx-missing li { padding: 10px 0; border-top: 1px solid var(--rule); font-size: 13px; line-height: 20px; color: var(--text); }
.bx-missing li:last-child { border-bottom: 1px solid var(--rule); }

.bx-foot { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 72px; padding-top: 20px; border-top: 1px solid var(--rule); font-size: 12px; line-height: 18px; color: var(--faint); }
.bx-foot p { margin: 0; max-width: 620px; }

.bx-panel-wrap { position: fixed; inset: 0; z-index: 80; display: flex; justify-content: flex-end; }
.bx-scrim { position: absolute; inset: 0; background: color-mix(in srgb, var(--bg) 55%, transparent); cursor: default; animation: bxFade 0.2s ease both; }
.bx-panel { position: relative; width: 440px; max-width: 100%; height: 100%; overflow-y: auto; background: var(--bg); border-left: 1px solid var(--rule); padding: 24px 32px 40px; animation: bxSlide 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both; font-variant-numeric: tabular-nums; color: var(--text); }
@keyframes bxSlide { from { transform: translateX(24px); opacity: 0; } to { transform: none; opacity: 1; } }
.bx-panel-head { display: flex; align-items: center; justify-content: space-between; height: 32px; }
.bx-x { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; margin-right: -8px; color: var(--half); transition: color 0.2s; }
.bx-x:hover { color: var(--ink); }
.bx-panel-title { margin: 10px 0 0; font-size: 30px; line-height: 1.15; font-weight: 300; letter-spacing: -0.025em; color: var(--ink); }
.bx-panel-id { margin: 6px 0 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--faint); }
.bx-stats { display: grid; grid-template-columns: 1fr 1fr; margin-top: 24px; border-top: 1px solid var(--rule); }
.bx-stats > div { display: flex; flex-direction: column; gap: 6px; padding: 16px 0; border-bottom: 1px solid var(--rule); }
.bx-stats > div:nth-child(even) { padding-left: 20px; border-left: 1px solid var(--rule); }
.bx-stat { font-size: 24px; line-height: 1; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); }
.bx-panel-rows { margin-top: 10px; }
.bx-panel-row { padding: 12px 0; border-top: 1px solid var(--rule); }
.bx-panel-row:last-child { border-bottom: 1px solid var(--rule); }
.bx-panel-row-top { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
.bx-panel-bench { font-size: 14px; line-height: 20px; color: var(--ink); }
.bx-panel-bench:hover { text-decoration: underline; text-underline-offset: 3px; }
.bx-rankbar { position: relative; height: 1px; margin: 10px 0 8px; }
.bx-rankbar::before { content: ''; position: absolute; inset: 0; background: var(--rule); transform-origin: left center; animation: bxGrow 0.5s var(--ease) both; animation-delay: inherit; }
.bx-rankbar-tick { position: absolute; left: 0; right: 0; top: -4px; height: 9px; transform: translateX(var(--x)); animation: bxTick 0.6s var(--ease) both; }
.bx-rankbar-tick::after { content: ''; position: absolute; left: -1px; top: 0; width: 2px; height: 100%; background: var(--ink); }
@keyframes bxGrow { from { transform: scaleX(0); } }
@keyframes bxTick { from { transform: translateX(0); opacity: 0; } 30% { opacity: 1; } }
.bx-panel-row-sub { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; line-height: 17px; color: var(--half); }
.bx-panel-row-sub span:last-child { text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bx-panel-links { margin-top: 24px; font-size: 13px; }

@media (max-width: 960px) {
  .bx-money-grid { grid-template-columns: 1fr; }
  .bx-front-list { border-left: 0; padding-left: 0; border-top: 1px solid var(--rule); padding-top: 20px; }
  .bx-calc { grid-template-columns: 1fr; }
  .bx-calc-in { position: static; border-bottom: 1px solid var(--rule); }
  .bx-calc-out { border-left: 0; }
  .bx-speech { grid-template-columns: 1fr; }
  .bx-src-row { grid-template-columns: 180px minmax(0, 1fr) 96px; }
  .bx-src-row > :nth-child(4), .bx-src-row > :nth-child(5) { display: none; }
  .bx-method { grid-template-columns: 1fr; gap: 32px; }
}

@media (max-width: 640px) {
  .bx { padding: 0 0 72px; }
  .bx-lede { font-size: 15px; line-height: 24px; }
  .bx-hero-stats { grid-template-columns: 1fr 1fr; margin-top: 32px; }
  .bx-hero-stats > div:nth-child(3) { padding-left: 0; border-left: 0; }
  .bx-hero-stats > div:nth-child(n+3) { border-top: 1px solid var(--rule); }
  .bx-big { font-size: 28px; }
  .bx-section { margin-top: 72px; }
  .bx-h2 { font-size: 24px; }
  .bx-box-body { padding: 20px 16px 24px; }
  .bx-tabs { justify-content: flex-start; }
  .bx-tab-btn { padding: 0 14px; }
  .bx-row { grid-template-columns: 26px minmax(0, 1fr) 64px; gap: 10px; padding: 9px 4px; }
  .bx-row .bx-col-bar, .bx-row .bx-col-price { display: none; }
  .bx-hl-long { display: none; }
  .bx-hl-short { display: inline; }
  .bx-row-speech { grid-template-columns: 24px minmax(0, 1fr) 54px; }
  .bx-cost-row { grid-template-columns: minmax(0, 1fr) 70px 56px; gap: 10px; padding: 9px 4px; }
  .bx-cost-row .bx-col-bar { display: none; }
  .bx-calc-in { padding: 20px 16px 24px; }
  .bx-calc-out { padding: 20px 16px 0; }
  .bx-calc-out .bx-more { margin: 0 -16px; width: calc(100% + 32px); }
  .bx-speech-col .bx-more { margin: 0 -16px -24px; width: calc(100% + 32px); }
  .bx-answer-name { font-size: 22px; }
  .bx-answer-nums > div { padding-right: 16px; }
  .bx-answer-nums > div + div { padding-left: 16px; }
  .bx-src-row { grid-template-columns: 1fr; gap: 6px; }
  .bx-src-row > :nth-child(3) { display: block; }
  .bx-src-row.bx-row-head { display: none; }
  .bx-panel { padding: 18px 16px 32px; }
  .bx-money-title .bx-seg { max-width: 100%; overflow-x: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .bx-card, .bx-panel, .bx-scrim, .bx-labels, .bx-front, .bx-axis, .bx-grid, .bx-tick, .bx-axis-label, .bx-rankbar::before, .bx-rankbar-tick { animation: none !important; }
  .bx-front, .bx-axis, .bx-grid { stroke-dashoffset: 0 !important; }
  .bx-labels, .bx-tick, .bx-axis-label { opacity: 1 !important; }
  .bx-bar-fill, .bx-dot, .bx-pick-mark { transition: none !important; }
}
`;
