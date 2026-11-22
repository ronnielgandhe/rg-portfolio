export const CLICKS_CSS = `
.clk {
  --line: rgba(0, 0, 0, 0.1);
  --line-strong: rgba(0, 0, 0, 0.28);
  --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  width: 100%;
  font-variant-numeric: tabular-nums;
}
.site-dark .clk {
  --line: rgba(255, 255, 255, 0.16);
  --line-strong: rgba(255, 255, 255, 0.36);
}
.clk button:disabled { opacity: 0.4; cursor: default; }
.clk .st-btn { display: inline-flex; align-items: center; justify-content: center; height: 38px; padding: 0 20px; border: 1px solid var(--line); font-size: 13px; font-weight: 500; color: var(--ink); text-decoration: none; white-space: nowrap; transition: background 0.2s, border-color 0.2s, opacity 0.2s; }
.clk .st-btn:hover:not(:disabled) { background: var(--hover); }
.clk .st-btn-primary { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.clk .st-btn-primary:hover:not(:disabled) { background: var(--ink); opacity: 0.86; }

.site-app .site-col.clk > .clk-view { max-width: none; }
.clk-view { animation: clkIn 0.3s var(--ease) both; }
.clk-head { max-width: 760px; }
.clk-kicker { font-size: 14px; line-height: 20px; color: var(--half); margin-bottom: 12px; }
.clk-title { margin: 0; font-size: 40px; line-height: 1.12; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); overflow-wrap: anywhere; }
.clk-title-pair svg { display: inline-block; vertical-align: -0.06em; margin: 0 0.12em; color: var(--half); }
.clk-lede { margin: 14px 0 0; font-size: 18px; line-height: 28px; color: var(--text); max-width: 640px; }
.clk-label { font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
.clk-small { margin: 0; font-size: 13px; line-height: 1.6; color: var(--faint); }
.clk-note { font-size: 13px; line-height: 18px; color: var(--faint); }
.clk-grow { flex: 1; }
.clk-section { margin-top: 64px; display: flex; flex-direction: column; gap: 16px; }
.clk-error { margin: 0; font-size: 14px; line-height: 22px; color: var(--ink); border-left: 1px solid var(--ink); padding-left: 12px; }
.clk-out { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; line-height: 18px; color: var(--text); text-decoration: none; transition: color 0.2s; }
.clk-out:hover { color: var(--ink); }

.clk-thumb { display: block; flex-shrink: 0; object-fit: cover; background: var(--hover); border: 1px solid var(--rule); }
img.clk-thumb { opacity: 0; transition: opacity 0.2s var(--ease); }
img.clk-thumb.clk-thumb-on { opacity: 1; }
.clk-thumb-empty { display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 300; color: var(--faint); }
.clk-chip { display: flex; align-items: center; gap: 10px; width: 184px; min-height: 54px; padding: 10px 12px 10px 10px; border: 1px solid var(--rule); background: var(--bg); transition: border-color 0.25s, opacity 0.25s; }
.clk-chip-text { min-width: 0; }
.clk-chip-label { font-size: 11px; line-height: 14px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--faint); }
.clk-chip-title { font-size: 13px; line-height: 17px; font-weight: 500; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.clk-chip-current { border-color: var(--ink); }
.clk-chip-ghost { border-style: dashed; border-color: var(--line-strong); opacity: 0.7; }
.clk-chip-target { border-color: var(--line-strong); }

.clk-form { margin-top: 40px; border: 1px solid var(--rule); padding: 28px; display: flex; flex-direction: column; gap: 22px; }
.clk-pair { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 16px; align-items: end; }
.clk-pair-arrow { height: 52px; display: inline-flex; align-items: center; color: var(--half); }
.clk-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.clk-combo { position: relative; }
.clk-input { width: 100%; height: 52px; padding: 0 16px; border: 1px solid var(--line); border-radius: 0; background: var(--bg); color: var(--ink); font: inherit; font-size: 20px; font-weight: 300; letter-spacing: -0.01em; outline: none; transition: border-color 0.2s; -webkit-appearance: none; appearance: none; }
.clk-input::placeholder { color: var(--faint); opacity: 0.6; }
.clk-input:focus { border-color: var(--ink); }
.site .clk-input:focus-visible { outline: none; }
.clk-input-sm { height: 38px; font-size: 14px; font-weight: 400; padding: 0 12px; }
.clk-drop { position: absolute; z-index: 30; top: calc(100% - 1px); left: 0; right: 0; margin: 0; padding: 0; list-style: none; background: var(--bg); border: 1px solid var(--ink); animation: clkIn 0.15s var(--ease) both; }
.clk-opt { display: flex; align-items: center; gap: 12px; padding: 9px 12px; cursor: pointer; border-top: 1px solid var(--rule); }
.clk-opt:first-child { border-top: 0; }
.clk-opt-on { background: var(--hover); }
.clk-opt-text { display: flex; flex-direction: column; min-width: 0; }
.clk-opt-title { font-size: 15px; line-height: 20px; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.clk-opt-desc { font-size: 12px; line-height: 16px; color: var(--faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.clk-form-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.clk-seg { display: inline-flex; border: 1px solid var(--line); }
.clk-seg button { height: 36px; padding: 0 16px; font-size: 13px; font-weight: 500; color: var(--text); border-left: 1px solid var(--line); transition: background 0.2s, color 0.2s; }
.clk-seg button:first-child { border-left: 0; }
.clk-seg button:hover { color: var(--ink); }
.clk-seg .clk-seg-on { background: var(--ink); color: var(--bg); }
.clk-seg .clk-seg-on:hover { color: var(--bg); }
.clk-strats { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
.clk-strat { display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; border: 1px solid var(--line); text-align: left; transition: border-color 0.2s, background 0.2s; }
.clk-strat:hover { border-color: var(--line-strong); }
.clk-strat-on, .clk-strat-on:hover { border-color: var(--ink); }
.clk-strat-name { display: flex; align-items: center; gap: 8px; font-size: 14px; line-height: 20px; font-weight: 500; color: var(--ink); }
.clk-strat-name::before { content: ''; width: 7px; height: 7px; border: 1px solid var(--line-strong); flex-shrink: 0; transition: background 0.2s, border-color 0.2s; }
.clk-strat-on .clk-strat-name::before { background: var(--ink); border-color: var(--ink); }
.clk-strat-blurb { padding-left: 15px; }
.clk-strat-blurb { display: block; font-size: 12px; line-height: 18px; color: var(--faint); }
.clk-quiet { font-size: 13px; line-height: 18px; color: var(--text); text-decoration: underline; text-decoration-color: var(--line-strong); text-decoration-thickness: 1px; text-underline-offset: 3px; transition: color 0.2s, text-decoration-color 0.2s; }
.clk-quiet:hover { color: var(--ink); text-decoration-color: var(--ink); }
.clk-examples { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.clk-example { display: flex; flex-direction: column; gap: 18px; padding: 20px; border: 1px solid var(--rule); text-align: left; transition: border-color 0.2s, background 0.2s; }
.clk-example:hover { border-color: var(--line-strong); }
.clk-example-thumbs { display: flex; align-items: center; }
.clk-example-line { flex: 1; height: 1px; background: var(--line); }
.clk-example-title { font-size: 14px; line-height: 20px; font-weight: 500; color: var(--ink); }
.clk-example-title svg { display: inline-block; vertical-align: -1px; color: var(--half); margin: 0 2px; }
.clk-how { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.clk-how-item { border-top: 1px solid var(--rule); padding-top: 16px; }
.clk-how-n { font-size: 28px; line-height: 1; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 14px; }
.clk-how-title { font-size: 15px; line-height: 20px; font-weight: 500; color: var(--ink); }
.clk-how-text { margin: 6px 0 0; font-size: 13px; line-height: 1.6; color: var(--text); }

.clk-blurb { margin: 10px 0 0; font-size: 14px; line-height: 22px; color: var(--faint); }
.clk-status { margin: 14px 0 0; min-height: 28px; font-size: 16px; line-height: 28px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.clk-bar { margin-top: 32px; display: flex; align-items: stretch; justify-content: space-between; gap: 24px; flex-wrap: wrap; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.clk-stats { display: flex; flex-wrap: wrap; }
.clk-stat { display: flex; flex-direction: column; gap: 6px; padding: 18px 32px 16px 0; min-width: 120px; }
.clk-stat-num { font-size: 32px; line-height: 36px; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
.clk-ticks { display: inline-flex; align-items: center; gap: 5px; height: 36px; }
.clk-ticks i { display: block; width: 1px; height: 24px; background: var(--ink); animation: clkTick 0.3s var(--ease) both; transform-origin: bottom; }
.clk-controls { display: flex; align-items: center; gap: 8px; }
.clk-trail { margin-top: 28px; display: flex; align-items: center; overflow-x: auto; scrollbar-width: none; padding: 2px 0; }
.clk-trail::-webkit-scrollbar { display: none; }
.clk-trail-fwd, .clk-trail-back { display: flex; align-items: center; flex-shrink: 0; }
.clk-trail-step { display: flex; align-items: center; flex-shrink: 0; }
.clk-trail-gap { flex: 1 0 40px; height: 0; border-top: 1px dashed var(--line-strong); }
.clk-link-line { display: block; width: 28px; height: 1px; background: var(--line-strong); flex-shrink: 0; }
.clk-link-line-dash { background: none; border-top: 1px dashed var(--line-strong); }
.clk-backtrack { margin-top: 12px; height: 18px; font-size: 13px; line-height: 18px; color: var(--half); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.clk-race-grid { margin-top: 28px; display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 24px; align-items: start; }
.clk-article { border: 1px solid var(--rule); padding: 24px; min-height: 318px; }
.clk-article-wait { display: flex; align-items: center; justify-content: center; }
.clk-article-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.clk-article-depth { font-size: 13px; color: var(--faint); }
.clk-article-body { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 24px; align-items: start; }
.clk-article-img { width: 220px; height: 220px; object-fit: cover; font-size: 56px; }
.clk-article-text { display: flex; flex-direction: column; gap: 6px; }
.clk-article-title { margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 30px; line-height: 1.15; font-weight: 300; letter-spacing: -0.025em; color: var(--ink); }
.clk-article-desc { font-size: 14px; line-height: 20px; color: var(--half); }
.clk-article-extract { min-height: 125px; margin: 8px 0 6px; font-size: 15px; line-height: 25px; color: var(--text); display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
.clk-links { border: 1px solid var(--rule); padding: 20px 20px 18px; display: flex; flex-direction: column; gap: 14px; }
.clk-links-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.clk-links-count { font-size: 13px; color: var(--faint); }
.clk-links-note { font-size: 13px; line-height: 18px; color: var(--ink); border-left: 1px solid var(--ink); padding-left: 10px; }
.clk-rank { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--rule); }
.clk-rank-row { position: relative; display: grid; grid-template-columns: 22px minmax(0, 1fr) 56px 40px; align-items: center; gap: 10px; height: 34px; padding: 0 8px 0 6px; border-bottom: 1px solid var(--rule); font-size: 13px; line-height: 18px; color: var(--ink); animation: clkFade 0.18s var(--ease) both; transition: opacity 0.25s var(--ease), background 0.2s var(--ease), color 0.2s var(--ease); }
.clk-rank-i { color: var(--faint); font-size: 12px; }
.clk-rank-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.clk-rank-bar { height: 1px; background: var(--rule); position: relative; }
.clk-rank-bar i { position: absolute; left: 0; top: -1px; height: 3px; background: currentColor; transition: width 0.3s var(--ease); }
.clk-rank-score { text-align: right; font-size: 12px; color: var(--text); }
.clk-rank-out { opacity: 0.32; }
.clk-rank-look { background: var(--hover); opacity: 1; }
.clk-rank-look::before { content: ''; position: absolute; left: 0; top: -1px; bottom: -1px; width: 2px; background: var(--ink); }
.clk-rank-chosen { background: var(--ink); color: var(--bg); opacity: 1; }
.clk-rank-chosen .clk-rank-i, .clk-rank-chosen .clk-rank-score { color: var(--bg); opacity: 0.7; }
.clk-rank-chosen .clk-rank-bar { background: transparent; }
.clk-rank-target .clk-rank-title { font-weight: 600; }
.clk-rank-ph { animation: none; }
.clk-rank { transition: opacity 0.2s var(--ease); }
.clk-rank-stale { opacity: 0.4; }
.clk-fade { animation: clkFade 0.22s var(--ease) both; }
.clk-links-found { padding: 8px 0 4px; display: flex; flex-direction: column; gap: 8px; }
.clk-links-found .clk-big-num { font-size: 72px; margin: 0; }
.clk-rank-ph .clk-rank-title { height: 8px; background: var(--hover); width: 70%; }

.clk-big { margin-top: 40px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.clk-big-cell { display: flex; flex-direction: column; gap: 6px; padding: 28px 24px 26px 0; }
.clk-big-cell + .clk-big-cell { padding-left: 24px; border-left: 1px solid var(--rule); }
.clk-big-num { font-size: 88px; line-height: 0.95; font-weight: 300; letter-spacing: -0.05em; color: var(--ink); margin-bottom: 12px; }
.clk-big-minor .clk-big-num { font-size: 40px; line-height: 1; margin: 48px 0 12px; letter-spacing: -0.03em; }
.clk-big-sub { font-size: 13px; line-height: 18px; color: var(--faint); }
.clk-path { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(176px, 1fr); gap: 24px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
.clk-path-step { position: relative; display: flex; min-width: 0; }
.clk-path-line { position: absolute; left: -24px; top: 75px; width: 24px; height: 1px; background: var(--line-strong); }
.clk-pcard { flex: 1; align-self: stretch; display: flex; flex-direction: column; border: 1px solid var(--rule); text-decoration: none; transition: border-color 0.2s; min-width: 0; }
.clk-pcard:hover { border-color: var(--line-strong); }
.clk-pcard-img { width: 100%; height: 150px; border: 0; border-bottom: 1px solid var(--rule); font-size: 40px; }
.clk-pcard-body { display: flex; flex-direction: column; gap: 4px; padding: 16px 16px 14px; flex: 1; }
.clk-pcard-label { font-size: 11px; line-height: 14px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--faint); }
.clk-pcard-title { font-size: 16px; line-height: 21px; font-weight: 500; color: var(--ink); }
.clk-pcard-desc { font-size: 13px; line-height: 19px; color: var(--text); flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px; }
.clk-actions { margin-top: 40px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.clk-strategy-line { margin: 18px 0 0; font-size: 14px; line-height: 22px; color: var(--faint); }
.clk-strategy-line .clk-label { margin-right: 8px; }

.clk-play { animation-name: clkFade; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 56px; align-items: start; }
.clk-play-main { max-width: 700px; min-width: 0; }
.clk-read-desc { margin-top: 10px; font-size: 16px; line-height: 24px; color: var(--half); }
.clk-read-lead { margin: 28px 0 0; border: 1px solid var(--rule); background: var(--hover); }
.clk-read-lead img { display: block; width: 100%; max-height: 360px; object-fit: contain; }
.clk-read { margin-top: 28px; font-size: 16px; line-height: 28px; color: var(--text); overflow-wrap: break-word; }
.clk-read p { margin: 0 0 18px; }
.clk-read h2 { margin: 44px 0 14px; padding-top: 18px; border-top: 1px solid var(--rule); font-size: 24px; line-height: 1.25; font-weight: 300; letter-spacing: -0.02em; color: var(--ink); }
.clk-read h3 { margin: 30px 0 10px; font-size: 18px; line-height: 1.3; font-weight: 500; color: var(--ink); }
.clk-read h4 { margin: 24px 0 8px; font-size: 15px; line-height: 1.3; font-weight: 500; color: var(--ink); }
.clk-read ul, .clk-read ol { margin: 0 0 18px; padding-left: 20px; }
.clk-read li { margin: 4px 0; }
.clk-read li::marker { color: var(--faint); }
.clk-read b, .clk-read strong { font-weight: 600; color: var(--ink); }
.clk-read blockquote { margin: 0 0 18px; padding-left: 16px; border-left: 1px solid var(--line-strong); }
.clk-read figure { margin: 8px 0 22px; display: flex; flex-direction: column; gap: 8px; }
.clk-read img { display: block; max-width: 100%; height: auto; border: 1px solid var(--rule); background: var(--hover); }
.clk-read figure img { max-height: 380px; width: auto; object-fit: contain; }
.clk-read figcaption { font-size: 13px; line-height: 19px; color: var(--faint); }
.clk-read dl { margin: 0 0 18px; }
.clk-read dt { font-weight: 500; color: var(--ink); }
.clk-read dd { margin: 0 0 6px 16px; }
.clk-read sup, .clk-read sub { font-size: 0.7em; line-height: 0; }
.clk-wl { color: var(--ink); text-decoration: underline; text-decoration-color: var(--line-strong); text-decoration-thickness: 1px; text-underline-offset: 3px; transition: text-decoration-color 0.15s, background 0.15s; }
.clk-wl:hover { text-decoration-color: var(--ink); background: var(--hover); }
.clk-wl-target { background: var(--ink); color: var(--bg); text-decoration: none; padding: 1px 4px; }
.clk-wl-target:hover { background: var(--ink); opacity: 0.86; }
.clk-doc { transition: opacity 0.2s var(--ease); }
.clk-doc-wait { opacity: 0.4; pointer-events: none; }
.clk-read-skel { margin-top: 28px; display: flex; flex-direction: column; gap: 14px; }
.clk-read-skel i { display: block; height: 10px; background: var(--hover); animation: clkPulse 1.2s ease-in-out infinite alternate; }
.clk-read-error { margin-top: 28px; display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.clk-attr { margin: 40px 0 0; padding-top: 16px; border-top: 1px solid var(--rule); font-size: 12px; line-height: 18px; color: var(--faint); }
.clk-attr a, .clk-foot a { color: var(--text); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 2px; }
.clk-side { position: sticky; top: 132px; display: flex; flex-direction: column; gap: 20px; max-height: calc(100vh - 160px); overflow-y: auto; scrollbar-width: none; }
.clk-side::-webkit-scrollbar { display: none; }
.clk-target { border: 1px solid var(--ink); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.clk-target-row { display: flex; gap: 12px; align-items: center; }
.clk-target-title { font-size: 17px; line-height: 22px; font-weight: 500; color: var(--ink); }
.clk-target-desc { font-size: 12px; line-height: 17px; color: var(--faint); }
.clk-side-stats { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.clk-side-stats .clk-stat { padding: 14px 0 12px; min-width: 0; }
.clk-side-stats .clk-stat + .clk-stat { padding-left: 16px; border-left: 1px solid var(--rule); }
.clk-hint { font-size: 13px; line-height: 18px; color: var(--ink); border-left: 1px solid var(--ink); padding-left: 10px; animation: clkIn 0.25s var(--ease) both; }
.clk-find { display: flex; flex-direction: column; gap: 8px; }
.clk-find-list { list-style: none; margin: 0; padding: 0; border: 1px solid var(--rule); }
.clk-find-list li + li { border-top: 1px solid var(--rule); }
.clk-find-list button { width: 100%; text-align: left; padding: 8px 12px; font-size: 13px; line-height: 18px; color: var(--ink); }
.clk-find-list button:hover { background: var(--hover); }
.clk-yourpath { list-style: none; margin: 0; padding: 0; }
.clk-yourpath li { display: flex; gap: 10px; padding: 7px 0; font-size: 13px; line-height: 18px; color: var(--text); border-bottom: 1px solid var(--rule); }
.clk-yourpath li span { width: 16px; flex-shrink: 0; color: var(--faint); font-size: 12px; }
.clk-yourpath .clk-yp-on { color: var(--ink); font-weight: 500; }
.clk-side-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.clk-side-actions .clk-out { margin-left: 4px; }
.clk-dock { display: none; }

.clk-foot { margin-top: 96px; padding-top: 16px; border-top: 1px solid var(--rule); font-size: 12px; line-height: 18px; color: var(--faint); max-width: 640px; }

.clk-in { animation: clkIn 0.24s var(--ease) both; }
.clk-flash { animation: clkFlash 2.4s ease both; }
@keyframes clkIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes clkFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes clkTick { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes clkPulse { from { opacity: 1; } to { opacity: 0.45; } }
@keyframes clkFlash { 0% { opacity: 0; } 10% { opacity: 1; } 75% { opacity: 1; } 100% { opacity: 0.5; } }

@media (max-width: 1000px) {
  .clk-examples { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .clk-race-grid { grid-template-columns: 1fr; }
  .clk-play { grid-template-columns: 1fr; gap: 32px; }
  .clk-side { position: static; max-height: none; order: -1; }
  .clk-yourpath, .clk-side-actions { display: none; }
  .clk-dock { position: fixed; z-index: 15; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: var(--bg); border-top: 1px solid var(--rule); font-size: 13px; line-height: 18px; color: var(--text); }
  .clk-dock-to { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .clk-dock-to b { font-weight: 500; color: var(--ink); }
  .clk-dock .st-btn { height: 32px; padding: 0 14px; }
}
@media (max-width: 640px) {
  .clk-title { font-size: 30px; }
  .clk-lede { font-size: 16px; line-height: 26px; }
  .clk-form { padding: 18px; margin-top: 28px; }
  .clk-pair { grid-template-columns: 1fr; gap: 14px; }
  .clk-pair-arrow { display: none; }
  .clk-strats { grid-template-columns: 1fr 1fr; grid-auto-flow: row dense; }
  .clk-strat { padding: 12px; }
  .clk-strat .clk-strat-blurb { display: none; }
  .clk-strat-on { grid-column: 1 / -1; }
  .clk-strat-on .clk-strat-blurb { display: block; }
  .clk-form-row .clk-note { order: 1; width: 100%; }
  .clk-form-row .clk-grow { display: none; }
  .clk-form-row .st-btn { flex: 1; }
  .clk-examples { grid-template-columns: 1fr; gap: 10px; }
  .clk-example { flex-direction: row; align-items: center; gap: 14px; padding: 14px; }
  .clk-example-thumbs { width: 96px; flex-shrink: 0; }
  .clk-how { grid-template-columns: 1fr; }
  .clk-section { margin-top: 48px; }
  .clk-blurb { margin: 10px 0 0; font-size: 14px; line-height: 22px; color: var(--faint); }
.clk-status { white-space: normal; font-size: 14px; line-height: 22px; }
  .clk-bar { gap: 0; }
  .clk-stats { display: grid; grid-template-columns: 1fr 1fr; width: 100%; }
  .clk-stat { padding: 14px 0 12px; min-width: 0; }
  .clk-stat-num { font-size: 26px; line-height: 30px; }
  .clk-controls { width: 100%; padding: 12px 0; border-top: 1px solid var(--rule); }
  .clk-controls .clk-seg { flex: 1; }
  .clk-controls .clk-seg button { flex: 1; padding: 0 8px; }
  .clk-chip { width: 156px; }
  .clk-article { padding: 16px; min-height: 0; }
  .clk-article-body { grid-template-columns: 1fr; gap: 16px; }
  .clk-article-img { width: 100%; height: 180px; }
  .clk-article-title { font-size: 24px; }
  .clk-links { padding: 14px; }
  .clk-big { grid-template-columns: 1fr 1fr; }
  .clk-big-minor { grid-column: 1 / -1; border-left: 0 !important; padding-left: 0 !important; border-top: 1px solid var(--rule); }
  .clk-big-minor .clk-big-num { margin-top: 0; font-size: 32px; }
  .clk-big-num { font-size: 64px; }
  .clk-path { grid-auto-flow: row; grid-auto-columns: auto; gap: 16px; overflow: visible; }
  .clk-path-line { left: 48px; top: -16px; width: 1px; height: 16px; }
  .clk-pcard { flex-direction: row; }
  .clk-pcard-img { width: 96px; height: auto; min-height: 96px; border-bottom: 0; border-right: 1px solid var(--rule); font-size: 28px; }
  .clk-read { font-size: 16px; line-height: 27px; }
  .clk-side-stats .clk-stat-num { font-size: 26px; }
  .clk-foot { margin-top: 64px; margin-bottom: 40px; }
  .clk-play ~ .clk-foot { margin-bottom: 72px; }
}
@media (prefers-reduced-motion: reduce) {
  .clk *, .clk *::before, .clk *::after { animation: none !important; transition: none !important; }
}
`;
