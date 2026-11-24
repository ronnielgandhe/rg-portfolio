export const HARVEY_CSS = `
.hv { --e: cubic-bezier(0.2, 0.8, 0.2, 1); --t1: 180ms; --t2: 260ms; --t3: 350ms; --line: color-mix(in srgb, var(--ink) 16%, transparent); --line2: color-mix(in srgb, var(--ink) 30%, transparent); }
.site-app .site-col.hv > .hv-full { max-width: none; }
.hv-rise { animation: hvRise 0.6s var(--e) both; animation-delay: calc(var(--i, 0) * 70ms); }

.hv-label { font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); margin: 0; }
.hv-empty { margin: 0; font-size: 13px; line-height: 20px; color: var(--faint); }
.hv-fine { margin: 20px 0 0; font-size: 13px; line-height: 20px; color: var(--faint); }

.hv-kicker { margin-bottom: 12px; font-size: 14px; line-height: 20px; color: var(--half); }
.hv-h1 { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
.hv-lede { margin: 12px 0 0; font-size: 18px; line-height: 28px; color: var(--text); }

.hv-actions { display: flex; flex-wrap: wrap; align-items: center; margin-top: 24px; }
.hv-btn { position: relative; display: inline-flex; align-items: center; justify-content: center; height: 38px; padding: 0 20px; border: 1px solid var(--line); font-size: 13px; font-weight: 500; color: var(--ink); white-space: nowrap; transition: background var(--t1) var(--e), border-color var(--t1) var(--e), color var(--t1) var(--e), opacity var(--t1) var(--e); }
.hv-btn { border-color: rgba(0, 0, 0, 0.1); }
.site-dark .hv-btn { border-color: rgba(255, 255, 255, 0.16); }
.hv-btn:hover { background: var(--hover); border-color: var(--line2); }
.hv-btn-primary, .hv-btn-primary:hover { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.hv-btn-primary:hover { opacity: 0.86; }
.hv-btn-on, .hv-btn-on:hover { border-color: var(--ink); background: var(--hover); }
.hv-main { min-width: 128px; }
.hv-slot { display: grid; grid-template-columns: 0fr; opacity: 0; transition: grid-template-columns var(--t3) var(--e), opacity var(--t2) var(--e); }
.hv-slot[data-open="true"] { grid-template-columns: 1fr; opacity: 1; }
.hv-slot-in { min-width: 0; overflow: hidden; padding-left: 8px; margin: -4px 0; padding-top: 4px; padding-bottom: 4px; }
.hv-slot-in .hv-btn { min-width: 92px; }
.hv-code { margin-left: 8px; text-decoration: none; }

.hv-swap { display: inline-grid; }
.hv-swap > span { grid-area: 1 / 1; opacity: 0; transform: translateY(5px); transition: opacity var(--t2) var(--e), transform var(--t2) var(--e); pointer-events: none; white-space: nowrap; }
.hv-swap > span.hv-swap-on { opacity: 1; transform: none; transition-delay: 60ms; pointer-events: auto; }
.hv-main .hv-swap > span { text-align: center; }

.hv-reveal { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows var(--t3) var(--e), opacity var(--t2) var(--e); }
.hv-reveal[data-open="true"] { grid-template-rows: 1fr; opacity: 1; }
.hv-reveal-in { min-height: 0; overflow: hidden; padding: 4px; margin: -4px; }
.hv-error { margin: 16px 0 0; padding-left: 12px; border-left: 1px solid var(--ink); font-size: 14px; line-height: 22px; color: var(--ink); }

.hv-line-panel { margin-top: 48px; }
.hv-status { display: flex; align-items: center; gap: 10px; height: 20px; }
.hv-dot { width: 6px; height: 6px; flex-shrink: 0; background: var(--faint); transition: background var(--t2) var(--e), transform var(--t2) var(--e); }
.hv-dot-speaking, .hv-dot-thinking, .hv-dot-listening, .hv-dot-silent { background: var(--ink); }
.hv-dot-listening, .hv-dot-silent { background: transparent; box-shadow: inset 0 0 0 1px var(--ink); }
.hv-dot-dialing, .hv-dot-connecting { background: var(--ink); animation: hvPulse 1.2s var(--e) infinite; }
.hv-status-label { color: var(--ink); }
.hv-stage-idle .hv-status-label, .hv-stage-ended .hv-status-label { color: var(--half); }
.hv-status-right { margin-left: auto; font-size: 13px; line-height: 20px; color: var(--half); font-variant-numeric: tabular-nums; }
.hv-wave { position: relative; margin-top: 6px; height: 72px; overflow: hidden; transition: height 0.5s var(--e); }
.hv-stage-dialing .hv-wave, .hv-stage-call .hv-wave { height: 232px; }
.hv-canvas { position: absolute; left: 0; top: 50%; width: 100%; height: 232px; transform: translateY(-50%); color: var(--ink); }
.hv-notice { display: flex; align-items: center; gap: 16px; margin-top: 16px; padding: 14px 16px; border: 1px solid var(--line); }
.hv-notice p { margin: 0; font-size: 14px; line-height: 22px; color: var(--ink); }
.hv-after { margin: 16px 0 0; font-size: 14px; line-height: 22px; color: var(--text); }

.hv-call { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 24px; align-items: start; padding-top: 24px; }
.hv-box { border: 1px solid var(--rule); }
.hv-box-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 44px; padding: 0 16px; border-bottom: 1px solid var(--rule); }
.hv-count { font-variant-numeric: tabular-nums; }
.hv-lines { height: 372px; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; scrollbar-width: thin; }
.hv-line { display: grid; grid-template-columns: 40px 50px minmax(0, 1fr); gap: 4px; font-size: 13px; line-height: 20px; }
.hv-line-t { color: var(--faint); font-variant-numeric: tabular-nums; font-size: 12px; }
.hv-line-who { color: var(--half); font-size: 12px; }
.hv-line-text { color: var(--text); }
.hv-line-harvey { color: var(--ink); }

.hv-onscreen { min-width: 0; }
.hv-onscreen-head { border-bottom: 1px solid var(--rule); }
.hv-tool { font-size: 13px; color: var(--text); }
.hv-tool-in { display: inline-flex; align-items: center; gap: 10px; }
.hv-tool-bar { position: relative; width: 28px; height: 1px; background: var(--rule); overflow: hidden; }
.hv-tool-bar::after { content: ''; position: absolute; inset: 0; width: 40%; background: var(--ink); animation: hvSlide 1.1s var(--e) infinite; }
.hv-cards { min-height: 372px; }
.hv-placeholder { border: 1px solid var(--rule); border-top: 0; height: 372px; padding: 32px; display: flex; align-items: center; justify-content: center; text-align: center; }
.hv-placeholder p { max-width: 340px; margin: 0; font-size: 14px; line-height: 22px; color: var(--faint); }
.hv-card-gap { padding-top: 16px; }

.hv-card { border: 1px solid var(--rule); background: var(--bg); padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 10px; transition: border-color var(--t2) var(--e); }
.hv-card-on { border-color: var(--ink); }
.hv-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.hv-x { color: var(--faint); display: inline-flex; padding: 4px; margin: -4px; transition: color var(--t1) var(--e); }
.hv-x:hover { color: var(--ink); }
.hv-section { font-size: 28px; line-height: 1.15; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); }
.hv-title { font-size: 15px; line-height: 22px; font-weight: 500; color: var(--ink); }
.hv-quote { margin: 4px 0 0; padding-left: 16px; border-left: 1px solid var(--ink); font-size: 14px; line-height: 23px; color: var(--text); }
.hv-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 16px; margin-top: 4px; font-size: 12px; line-height: 18px; color: var(--half); }
.hv-textbtn { font-size: 12px; color: var(--ink); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.hv-see { margin-top: 8px; padding-top: 14px; border-top: 1px solid var(--rule); display: flex; flex-direction: column; gap: 2px; }
.hv-see .hv-label { margin-bottom: 6px; }
.hv-see-row { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 12px; text-align: left; padding: 6px 0; font-size: 13px; line-height: 20px; }
.hv-see-sec { color: var(--ink); font-variant-numeric: tabular-nums; }
.hv-see-title { color: var(--text); transition: color var(--t1) var(--e); }
.hv-see-row:hover .hv-see-title { color: var(--ink); }
.hv-news { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.hv-news li { padding: 12px 0; border-top: 1px solid var(--rule); }
.hv-news li:first-child { border-top: 0; padding-top: 0; }
.hv-news li:last-child { padding-bottom: 0; }
.hv-news-title { font-size: 14px; line-height: 21px; font-weight: 500; color: var(--ink); text-decoration: none; }
.hv-news-title:hover { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.hv-news-sum { margin: 6px 0 0; font-size: 13px; line-height: 20px; color: var(--text); }
.hv-news-meta { margin-top: 4px; font-size: 12px; line-height: 16px; color: var(--half); }
.hv-price { display: flex; align-items: baseline; gap: 8px; }
.hv-price span:first-child { font-size: 36px; line-height: 1.1; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); font-variant-numeric: tabular-nums; }
.hv-ccy { font-size: 12px; color: var(--half); }
.hv-change { font-size: 13px; color: var(--text); font-variant-numeric: tabular-nums; }
.hv-spark { width: 100%; height: 64px; margin-top: 6px; color: var(--ink); border-bottom: 1px solid var(--rule); }
.hv-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 6px; font-size: 13px; line-height: 20px; color: var(--ink); font-variant-numeric: tabular-nums; }
.hv-stats .hv-label { margin-bottom: 4px; }
.hv-trades { list-style: none; margin: 0; padding: 0; }
.hv-trades li { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid var(--rule); }
.hv-trades li:first-child { border-top: 0; padding-top: 0; }
.hv-trade-who { font-size: 14px; line-height: 20px; font-weight: 500; color: var(--ink); }
.hv-trade-side { text-align: right; font-size: 13px; line-height: 20px; color: var(--ink); white-space: nowrap; }

.hv-extras { margin-top: 40px; transition: opacity var(--t3) var(--e); }
.hv-dim { opacity: 0.5; }
.hv-dim:hover, .hv-dim:focus-within { opacity: 0.85; }
.hv-asks-label { margin: 0 0 14px; }
.hv-ask-grid { display: flex; flex-direction: column; gap: 6px; }
.hv-ask { display: block; }
.hv-ask-q { font-size: 15px; line-height: 24px; color: var(--text); }
.hv-link { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
.hv-ask-a { font-size: 13px; line-height: 1.6; color: var(--text); }

.hv-write { margin-top: 96px; padding-top: 24px; border-top: 1px solid var(--rule); }
.hv-write-body { max-width: 640px; margin-top: 20px; display: flex; flex-direction: column; gap: 16px; }
.hv-pl-wrap { margin-top: 48px; }
.hv-write .hv-corpus { max-width: 640px; margin-top: 56px; }
.hv-write-head { max-width: 760px; }
.hv-write-title { margin: 14px 0 0; font-size: 36px; line-height: 1.15; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
.hv-part { display: grid; grid-template-columns: 240px minmax(0, 1fr); column-gap: 40px; margin-top: 72px; opacity: 0; transform: translateY(14px); transition: opacity 0.5s var(--e), transform 0.5s var(--e); }
.hv-part.hv-seen { opacity: 1; transform: none; }
.hv-part-side { display: flex; align-items: baseline; gap: 14px; padding-top: 4px; border-top: 1px solid var(--ink); align-self: start; padding-top: 14px; }
.hv-part-n { font-size: 12px; line-height: 16px; color: var(--faint); font-variant-numeric: tabular-nums; }
.hv-part-label { color: var(--ink); }
.hv-part-body { max-width: 680px; padding-top: 10px; display: flex; flex-direction: column; gap: 18px; }
.hv-part-wide { grid-column: 1 / -1; margin-top: 40px; }
.hv-p { margin: 0; font-size: 16px; line-height: 27px; color: var(--text); }
.hv-p-lead { font-size: 20px; line-height: 31px; color: var(--ink); font-weight: 400; letter-spacing: -0.01em; }
.hv-p-after { margin-top: 6px; }
.hv-ink { color: var(--ink); }

.hv-does { margin-top: -16px; }
.hv-does-row { display: grid; grid-template-columns: 110px minmax(0, 1fr) 132px; gap: 20px; padding: 16px 0; border-bottom: 1px solid var(--rule); font-size: 14px; line-height: 22px; transition: background var(--t1) var(--e); }
.hv-does-what { color: var(--ink); font-weight: 500; }
.hv-does-how { color: var(--text); }
.hv-does-tool { font-family: inherit; font-size: 12px; line-height: 22px; color: var(--half); text-align: right; letter-spacing: 0.02em; }

.hv-pl-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; }
.hv-pl-key { display: inline-flex; align-items: center; gap: 10px; text-transform: none; letter-spacing: 0; font-weight: 400; font-size: 13px; }
.hv-pl-swatch { width: 24px; height: 1.5px; background: var(--ink); }
.hv-pl svg { display: block; overflow: visible; color: var(--ink); font-family: inherit; }
.hv-pl-frame { fill: none; stroke: var(--line); stroke-dasharray: 3 4; }
.hv-pl-box { fill: var(--bg); stroke: var(--line2); stroke-width: 1; transition: stroke var(--t2) var(--e); }
.hv-pl-box.hv-pl-on { stroke: var(--ink); }
.hv-pl-line, .hv-pl-bus { fill: none; stroke: var(--line2); stroke-width: 1; color: var(--half); }
.hv-pl-comet { fill: none; stroke: var(--ink); stroke-width: 2; stroke-linecap: square; }
.hv-pl-title { font-size: 13px; font-weight: 500; fill: var(--ink); }
.hv-pl-tool { font-size: 11px; letter-spacing: -0.01em; font-weight: 500; fill: var(--ink); }
.hv-pl-sub { font-size: 11px; fill: var(--half); }
.hv-pl-note { font-size: 11px; fill: var(--faint); }
.hv-pl-cap { font-size: 10.5px; font-weight: 500; letter-spacing: 0.08em; fill: var(--half); }
.hv-steps { list-style: none; margin: 32px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--rule); }
.hv-steps li { display: block; padding: 18px 20px 20px 0; border-bottom: 1px solid var(--rule); font-size: 14px; line-height: 22px; color: var(--text); position: relative; transition: color var(--t2) var(--e); }
.hv-steps li::before { content: ''; position: absolute; left: 0; right: 20px; top: -1px; height: 1px; background: var(--ink); transform: scaleX(0); transform-origin: left; transition: transform var(--t3) var(--e); }
.hv-steps li.hv-step-on { color: var(--ink); }
.hv-steps li.hv-step-on::before { transform: scaleX(1); }
.hv-step-n { font-size: 12px; line-height: 22px; color: var(--faint); font-variant-numeric: tabular-nums; }

.hv-corpus-head { display: flex; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }
.hv-bar { padding: 12px 0 0; }
.hv-bar-row { display: flex; justify-content: space-between; gap: 16px; font-size: 14px; line-height: 20px; color: var(--ink); }
.hv-bar-n { color: var(--half); font-variant-numeric: tabular-nums; }
.hv-bar-track { position: relative; margin-top: 8px; height: 3px; }
.hv-bar-track::before { content: ''; position: absolute; left: 0; right: 0; top: 1px; height: 1px; background: var(--rule); }
.hv-bar-fill { position: relative; height: 3px; background: var(--ink); transform: scaleX(0); transform-origin: left; transition: transform 0.7s var(--e); transition-delay: calc(var(--i, 0) * 60ms + 120ms); }
.hv-corpus.hv-seen .hv-bar-fill { transform: scaleX(1); }
.hv-why { margin-top: 18px; padding: 18px 20px; border-left: 1px solid var(--ink); background: var(--hover); }
.hv-why p { margin: 8px 0 0; font-size: 15px; line-height: 25px; color: var(--text); }
.hv-stages { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; background: var(--rule); border: 1px solid var(--rule); }
.hv-stage-cell { background: var(--bg); padding: 16px 16px 18px; display: flex; flex-direction: column; gap: 10px; }
.hv-stage-cell p { margin: 0; font-size: 13px; line-height: 20px; color: var(--text); }
.hv-stage-cell .hv-stage-q { font-size: 15px; line-height: 22px; color: var(--ink); font-weight: 500; }
.hv-specs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 0; border-bottom: 1px solid var(--rule); }
.hv-specs div { padding: 4px 0 16px; }
.hv-specs dd { margin: 6px 0 0; font-size: 14px; line-height: 20px; color: var(--ink); font-variant-numeric: tabular-nums; }

.hv-trade { list-style: none; margin: -16px 0 0; padding: 0; }
.hv-trade li { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--rule); font-size: 14px; line-height: 22px; }
.hv-trade-t { color: var(--ink); font-weight: 500; }
.hv-trade-d { color: var(--text); }
.hv-stack { display: flex; flex-wrap: wrap; gap: 8px 22px; font-size: 14px; line-height: 22px; color: var(--text); }
.hv-links { display: flex; flex-wrap: wrap; gap: 8px 28px; margin-top: 6px; }
.hv-link { position: relative; font-size: 14px; line-height: 22px; font-weight: 500; color: var(--ink); text-decoration: none; }
.hv-link::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px; background: var(--line2); transition: background var(--t1) var(--e); }
.hv-link:hover::after { background: var(--ink); }
.hv-room { display: contents; }

@keyframes hvRise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes hvPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
@keyframes hvSlide { from { transform: translateX(-100%); } to { transform: translateX(250%); } }

@media (max-width: 1000px) { .hv-ask-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .hv-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 860px) {
  .hv-call { grid-template-columns: 1fr; }
  .hv-lines { height: 280px; }
  .hv-cards, .hv-placeholder { min-height: 0; height: auto; }
  .hv-placeholder { padding: 32px 20px; }
  .hv-part { grid-template-columns: 1fr; row-gap: 18px; margin-top: 56px; }
  .hv-part-body { padding-top: 0; }
  .hv-part-wide { margin-top: 24px; }
  .hv-stages { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 560px) {
  .hv-h1 { font-size: 30px; }
  .hv-lede { font-size: 17px; line-height: 26px; }
  .hv-line-panel { margin-top: 40px; }
  .hv-wave { height: 56px; }
  .hv-stage-dialing .hv-wave, .hv-stage-call .hv-wave { height: 168px; }
  .hv-canvas { height: 168px; }
  .hv-ask-grid { grid-template-columns: 1fr; }
  .hv-card { padding: 18px; }
  .hv-write { margin-top: 96px; padding-top: 36px; }
  .hv-write-title { font-size: 28px; }
  .hv-p-lead { font-size: 18px; line-height: 28px; }
  .hv-does-row { grid-template-columns: 1fr; gap: 4px; }
  .hv-does-tool { text-align: left; }
  .hv-steps { grid-template-columns: 1fr; }
  .hv-stages { grid-template-columns: 1fr; }
  .hv-specs { grid-template-columns: 1fr 1fr; }
  .hv-trade li { grid-template-columns: 1fr; gap: 4px; }
  .hv-pl-head { flex-direction: column; align-items: flex-start; gap: 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .hv-rise, .hv-dot, .hv-tool-bar::after { animation: none; }
  .hv-part { opacity: 1; transform: none; }
  .hv *, .hv *::before, .hv *::after { transition-duration: 1ms !important; }
}
`;
