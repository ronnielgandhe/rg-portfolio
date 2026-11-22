import { Actions, ACTIONS_CSS, BootScript, SPRING, on, rng, type HeroAction } from './kit';
import { accentCss } from './brand';

const ID = 'leanfetch';
const N = 25;
const ROW = 14;
const VIEW_ROWS = 9;
const BEAM = 63;
const TRAVEL = 210;
const WASTE = 111.87;
const WARN = new Set([6, 9, 13, 19, 21]);
const CRIT = 17;

const ROWS = (() => {
  const r = rng(41);
  let depth = 0;
  return Array.from({ length: N }, (_, i) => {
    depth = Math.max(0, Math.min(3, depth + (r() < 0.3 ? 1 : r() < 0.45 ? -1 : 0)));
    const segs = Array.from({ length: 1 + Math.floor(r() * 4) }, () => 10 + Math.round(r() * 46));
    return { i, depth, segs, flag: i === CRIT ? 'c' : WARN.has(i) ? 'w' : '' };
  });
})();

const F = on(ID, 'full');
const Q = on(ID, 'quick');

const CSS = `
${accentCss(ID, 'lfh')}
.site-app .lfh.site-col>*{max-width:none}
.site-col .lfh.site-col{margin-left:0;margin-right:0;max-width:none}
.lfh{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:32px 56px;align-items:start}
.lfh-t{margin:0;font-size:68px;line-height:1.05;font-weight:300;letter-spacing:-0.035em;color:var(--ink)}
.lfh-lock{display:inline-flex;align-items:center;gap:.16em;white-space:nowrap}
.lfh-mark{width:1.1em;height:1.1em;flex:none;overflow:visible;color:var(--acc)}
.lfh-mark *{stroke-dasharray:1 0}
.lfh-w{display:inline-block}
.lfh-lede{margin:20px 0 0;max-width:480px;font-size:18px;line-height:28px;color:var(--text)}
.lfh-acts{margin-top:28px}
${ACTIONS_CSS('lfh')}
.lfh-panel{border:1px solid var(--rule);font-variant-numeric:tabular-nums}
.lfh-hd{display:flex;align-items:center;gap:10px;height:36px;padding:0 14px;border-bottom:1px solid var(--rule);font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--half);white-space:nowrap;overflow:hidden}
.lfh-state{position:relative;display:inline-grid}
.lfh-state>span{grid-area:1/1}
.lfh-s0{opacity:0}
.lfh-repo{margin-left:auto;letter-spacing:.02em;text-transform:none;font-size:12px;color:var(--ink);overflow:hidden;text-overflow:ellipsis}
.lfh-caret{display:inline-block;width:6px;height:12px;margin-left:3px;vertical-align:-2px;background:var(--acc);animation:lfhBlink 1.1s steps(1) 1.2s infinite}
.lfh-win{position:relative;height:${VIEW_ROWS * ROW}px;margin:12px 0;overflow:hidden;-webkit-mask:linear-gradient(transparent,#000 10%,#000 90%,transparent);mask:linear-gradient(transparent,#000 10%,#000 90%,transparent)}
.lfh-col{transform:translateY(-${TRAVEL}px)}
.lfh-row{position:relative;display:flex;align-items:center;height:${ROW}px;padding:0 14px;gap:12px}
.lfh-n{width:16px;font-size:10px;color:var(--faint);text-align:right}
.lfh-code{display:flex;gap:5px;flex:1;min-width:0;overflow:hidden}
.lfh-row[data-f=c] .lfh-code{margin-right:84px}
.lfh-bar{height:3px;flex:none;background:color-mix(in srgb,var(--ink) 16%,transparent)}
.lfh-bar:first-child{background:color-mix(in srgb,var(--ink) 30%,transparent)}
.lfh-row[data-f] .lfh-bar{background:var(--ink)}
.lfh-row[data-f=c]::before{content:'';position:absolute;inset:0;background:color-mix(in srgb,var(--acc) 8%,transparent)}
.lfh-tag{position:absolute;right:30px;top:50%;transform:translateY(-50%);font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--ink)}
.lfh-flag{position:absolute;right:14px;top:50%;width:7px;height:7px;margin-top:-3.5px;border:1px solid var(--ink)}
.lfh-flag-c{background:var(--ink)}
.lfh-beam{position:absolute;left:0;right:0;top:${BEAM}px;height:1px;background:var(--acc);box-shadow:0 0 0 .5px var(--acc);opacity:0}
.lfh-ft{padding:16px 14px 14px;border-top:1px solid var(--rule)}
.lfh-k{font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--half)}
.lfh-num{display:flex;align-items:baseline;gap:10px;margin-top:8px;white-space:nowrap}
.lfh-v{font-size:40px;line-height:1;font-weight:300;letter-spacing:-0.03em;color:var(--ink)}
.lfh-to{font-size:18px;font-weight:300;color:var(--half)}
.lfh-meta{display:flex;gap:14px;margin-top:12px;font-size:11px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--half)}
.lfh-meta b{font-weight:500;color:var(--ink)}
@keyframes lfhBlink{0%{opacity:1}50%{opacity:0}}
@keyframes lfhFade{from{opacity:0}to{opacity:1}}
@keyframes lfhDraw{from{stroke-dashoffset:1;opacity:0;transform:scale(.7)}12%{opacity:1}to{stroke-dashoffset:0;opacity:1;transform:none}}
${F} .lfh-mark *{stroke-dasharray:1;animation:lfhDraw 560ms ${SPRING} 120ms both;transform-origin:center;transform-box:fill-box}
${F} .lfh-panel{animation:lfhFade 420ms ease 240ms both}
${Q} .lfh-mark *{stroke-dasharray:1;animation:lfhDraw 300ms ${SPRING} both;transform-origin:center;transform-box:fill-box}
@media (max-width:860px){.lfh{grid-template-columns:minmax(0,1fr)}.lfh-panel{max-width:520px}}
@media (max-width:560px){.lfh-t{font-size:46px}.lfh-lede{font-size:17px;line-height:26px}.lfh-v{font-size:34px}}
@media (prefers-reduced-motion:reduce){.lfh *{animation:none!important}}
`;

const DEFAULT_ACTIONS: HeroAction[] = [
  { label: 'scan a repo', href: '/leanfetch', primary: true },
  { label: 'benchmarks', href: '/leanfetch?view=benchmarks' },
  { label: 'read the code', href: 'https://github.com/ronnielgandhe/leanfetch', external: true },
];

export function LeanFetchMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path pathLength={1} d="M7 13h16c4 0 6 3 6 6s-2 6-6 6H13" />
      <polyline pathLength={1} points="17 21 13 25 17 29" />
    </svg>
  );
}

export default function LeanFetchHero({
  lede = 'started as a tool that scans your repo for llm waste. then i kept pulling the thread.',
  actions = DEFAULT_ACTIONS,
  repo = 'openai/openai-quickstart-node',
  className,
}: {
  lede?: string;
  actions?: HeroAction[];
  repo?: string;
  className?: string;
}) {
  return (
    <div className={`site-col pi lfh${className ? ` ${className}` : ''}`}>
      <BootScript id={ID} />
      <style>{CSS}</style>
      <div>
        <h1 className="lfh-t">
          <span className="lfh-lock" aria-label="LeanFetch">
            <LeanFetchMark className="lfh-mark" />
            <span aria-hidden="true"><span className="lfh-w lfh-lean">Lean</span><span className="lfh-w lfh-fetch">Fetch</span></span>
          </span>
        </h1>
        <p className="lfh-lede">{lede}</p>
        <div className="lfh-acts-wrap"><Actions p="lfh" actions={actions} /></div>
      </div>
      <div className="lfh-panel" aria-label={`a real scan of ${repo}: an estimated $111.87 to $133.11 a month in waste, 25 files scanned, 1 critical, 5 warnings`} role="img">
        <div className="lfh-hd" aria-hidden="true">
          <span className="lfh-state"><span className="lfh-s0">scanning</span><span className="lfh-s1">scan complete</span></span>
          <span className="lfh-repo">{repo}<i className="lfh-caret" /></span>
        </div>
        <div className="lfh-win" aria-hidden="true">
          <div className="lfh-col">
            {ROWS.map((r) => (
              <div key={r.i} className="lfh-row" data-i={r.i} data-f={r.flag || undefined}>
                <span className="lfh-n">{String(r.i + 1).padStart(2, '0')}</span>
                <span className="lfh-code" style={{ paddingLeft: r.depth * 12 }}>
                  {r.segs.map((w, k) => <span key={k} className="lfh-bar" style={{ width: w }} />)}
                </span>
                {r.flag === 'c' && <span className="lfh-tag">n+1 calls</span>}
                {r.flag && <span className={`lfh-flag${r.flag === 'c' ? ' lfh-flag-c' : ''}`} />}
              </div>
            ))}
          </div>
          <span className="lfh-beam" />
        </div>
        <div className="lfh-ft" aria-hidden="true">
          <div className="lfh-k">est. monthly waste</div>
          <div className="lfh-num"><span className="lfh-v">${WASTE.toFixed(2)}</span><span className="lfh-to">to $133.11</span></div>
          <div className="lfh-meta"><span>25 files</span><span><b>1 critical</b></span><span>5 warnings</span></div>
        </div>
      </div>
    </div>
  );
}
