import { BootScript, EASE, SPRING, on } from './kit';
import { accentCss } from './brand';

const ID = 'leanfetch';
const F = on(ID, 'full');

const CSS = `
${accentCss(ID, 'lfh')}
.site-app .lfh.site-col>*{max-width:none}
.site-col .lfh.site-col{margin-left:0;margin-right:0;max-width:none}
.lfh{padding-top:28px}
.lfh-t{margin:0;font-size:68px;line-height:1.05;font-weight:300;color:var(--ink)}
.lfh-lock{display:inline-flex;align-items:center;gap:.16em;white-space:nowrap;max-width:100%}
.lfh-mark{width:1.1em;height:1.1em;flex:none;overflow:visible;color:var(--acc)}
.lfh-word{display:inline-block;letter-spacing:-0.035em}
.lfh-rule{position:absolute;left:0;right:0;bottom:-6px;height:1px;background:var(--acc);transform-origin:left;transform:scaleX(0);opacity:0}
.lfh-wrap{position:relative;display:inline-block}
.lfh-lede{margin:20px 0 0;font-size:18px;line-height:28px;color:var(--text)}
@keyframes lfhDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes lfhHead{from{stroke-dashoffset:1;opacity:0}30%{opacity:1}to{stroke-dashoffset:0;opacity:1}}
@keyframes lfhTrim{0%{letter-spacing:.09em;opacity:0}35%{opacity:1}100%{letter-spacing:-0.035em;opacity:1}}
@keyframes lfhRule{0%{transform:scaleX(0);opacity:1}70%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
@keyframes lfhLede{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
${F} .lfh-mark path{stroke-dasharray:1;animation:lfhDraw 620ms ${EASE} 80ms both}
${F} .lfh-mark polyline{stroke-dasharray:1;animation:lfhHead 260ms ${EASE} 560ms both}
${F} .lfh-word{animation:lfhTrim 900ms ${SPRING} 300ms both}
${F} .lfh-rule{animation:lfhRule 1100ms ${EASE} 500ms both}
${F} .lfh-lede{animation:lfhLede 420ms ${SPRING} 1000ms both}
@media (max-width:640px){.lfh{padding-top:24px}.lfh-t{font-size:clamp(34px,11vw,52px)}.lfh-lede{font-size:17px;line-height:26px}}
@media (prefers-reduced-motion:reduce){.lfh *{animation:none!important}}
`;

export function LeanFetchMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path pathLength={1} d="M7 13h16c4 0 6 3 6 6s-2 6-6 6H13" />
      <polyline pathLength={1} points="17 21 13 25 17 29" />
    </svg>
  );
}

export default function LeanFetchHero({ className }: { className?: string }) {
  return (
    <div className={`site-col pi lfh${className ? ` ${className}` : ''}`}>
      <BootScript id={ID} />
      <style>{CSS}</style>
      <h1 className="lfh-t">
        <span className="lfh-wrap">
          <span className="lfh-lock" aria-label="LeanFetch">
            <LeanFetchMark className="lfh-mark" />
            <span className="lfh-word" aria-hidden="true">LeanFetch</span>
          </span>
          <i className="lfh-rule" aria-hidden="true" />
        </span>
      </h1>
      <p className="lfh-lede">the first time i cared what a model call costs.</p>
    </div>
  );
}
