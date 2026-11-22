import { useEffect, useRef } from 'react';
import { Actions, ACTIONS_CSS, BootScript, on, since, useOpening, type HeroAction } from './kit';
import { accentCss } from './brand';
import { ProjectLogo } from '../covers/brand';

const ID = 'harvey';
const DIAL = 260;
const SPEAK = 820;
const RESOLVE = 1240;
const LAND = 1180;
const DONE = 1500;

const F = on(ID, 'full');
const Q = on(ID, 'quick');

const CSS = `
${accentCss(ID, 'hvh')}
.site-app .hvh.site-col>*{max-width:none}
.site-col .hvh.site-col{margin-left:0;margin-right:0;max-width:none}
.site-app .hvh.site-col>.hvh-lede{max-width:520px}
.hvh-id{display:flex;align-items:center;gap:10px;height:20px;font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--half);font-variant-numeric:tabular-nums}
.hvh-logo{flex:none;color:var(--acc);overflow:visible}
.hvh-logo .pl-w{transform-box:fill-box;transform-origin:center;animation:hvhTalk 1.8s ease-in-out infinite}
.hvh-logo .pl-w2{animation-delay:-.6s}.hvh-logo .pl-w3{animation-delay:-1.2s}
${F} .hvh-logo .pl-w{animation:hvhTalk .42s ease-in-out 3,hvhTalk 1.8s ease-in-out 1.3s infinite}
.hvh-sw{position:relative;display:inline-grid}
.hvh-sw>span{grid-area:1/1}
.hvh-sw0{opacity:0}
.hvh-sep{width:18px;height:1px;background:var(--rule)}
.hvh-stage{position:relative;display:inline-block;margin-top:18px}
.hvh-t{position:relative;margin:0;font-size:112px;line-height:1;font-weight:300;letter-spacing:-0.055em;color:var(--ink);padding-bottom:22px}
.hvh-cv{position:absolute;left:-8px;top:0;width:calc(100% + 48px);height:100%;pointer-events:none}
.hvh-line{position:absolute;left:0;right:0;top:56%;height:1px;background:var(--ink);opacity:0;transform-origin:left}
.hvh-lede{margin:10px 0 0;max-width:520px;font-size:18px;line-height:28px;color:var(--text)}
.hvh-acts{margin-top:24px}
${ACTIONS_CSS('hvh')}
@keyframes hvhTalk{0%,100%{transform:none}50%{transform:scaleY(.45)}}
@keyframes hvhIn{from{opacity:0}to{opacity:1}}
@keyframes hvhOut{from{opacity:1}to{opacity:0}}
@keyframes hvhDial{0%{opacity:1;transform:scaleX(0)}100%{opacity:1;transform:none}}
@keyframes hvhLine{0%{opacity:1}100%{opacity:0}}
${F} .hvh-t{animation:hvhIn 320ms ease ${LAND}ms both}
${F} .hvh-line{animation:hvhDial ${DIAL}ms cubic-bezier(.6,0,.2,1) both,hvhLine 260ms linear ${DIAL + 80}ms forwards}
${F} .hvh-sw0{animation:hvhOut 1ms linear ${LAND}ms both}
${F} .hvh-sw1{animation:hvhIn 240ms ease ${LAND}ms both}
${Q} .hvh-t{animation:hvhIn 300ms ease both}
.hvh-stage:not([data-js]) .hvh-cv{display:none}
@media (max-width:560px){.hvh-t{font-size:76px;padding-bottom:18px}.hvh-lede{font-size:17px;line-height:26px}}
@media (prefers-reduced-motion:reduce){.hvh *{animation:none!important}}
`;

type Run = [number, number];
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function HarveyHero({
  title = 'harvey',
  lede = 'a lawyer that picks up. ask him anything, out loud.',
  incoming = 'incoming call',
  connected = 'on the line',
  region = 'ontario + federal law',
  actions,
  children,
  className,
}: {
  title?: string;
  lede?: string;
  incoming?: string;
  connected?: string;
  region?: string;
  actions?: HeroAction[];
  children?: React.ReactNode;
  className?: string;
}) {
  const o = useOpening(ID);
  const stage = useRef<HTMLDivElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const st = stage.current;
    const t = h1.current;
    const c = cv.current;
    const ctx = c?.getContext('2d');
    if (!o || !st || !t || !c || !ctx || o.m === 'still') return;
    st.setAttribute('data-js', '');
    let raf = 0;
    let alive = true;
    let visible = true;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let step = 4;
    let cols: { x: number; runs: Run[] }[] = [];
    let mid = 0;
    let gh = 0;
    let base = 0;
    let x0 = 0;
    let x1 = 0;
    let ink = '#1a1a1a';
    let acc = '#7c2d2d';
    const pad = 8;

    const sample = () => {
      const r = c.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      step = W < 420 ? 3 : 4;
      const cs = getComputedStyle(t);
      ink = cs.color;
      acc = getComputedStyle(st).getPropertyValue('--acc').trim() || acc;
      const size = parseFloat(cs.fontSize);
      const lh = size * (parseFloat(cs.lineHeight) / size || 1);
      const off = document.createElement('canvas');
      off.width = Math.ceil(W);
      off.height = Math.ceil(H);
      const g = off.getContext('2d', { willReadFrequently: true });
      if (!g) return;
      g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = cs.letterSpacing;
      g.textBaseline = 'alphabetic';
      const m = g.measureText(title);
      const asc = m.fontBoundingBoxAscent ?? size * 0.9;
      const desc = m.fontBoundingBoxDescent ?? size * 0.25;
      const y = (lh - (asc + desc)) / 2 + asc;
      g.fillStyle = '#000';
      g.fillText(title, pad, y);
      const data = g.getImageData(0, 0, off.width, off.height).data;
      cols = [];
      let top = H;
      let bot = 0;
      x0 = W;
      x1 = 0;
      for (let x = pad; x < off.width - pad; x += step) {
        const runs: Run[] = [];
        let s = -1;
        for (let yy = 0; yy < off.height; yy++) {
          const a = data[(yy * off.width + x) * 4 + 3] > 110;
          if (a && s < 0) s = yy;
          if (!a && s >= 0) { if (yy - s > 1) runs.push([s, yy]); s = -1; }
        }
        if (runs.length) {
          top = Math.min(top, runs[0][0]);
          bot = Math.max(bot, runs[runs.length - 1][1]);
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x);
        }
        cols.push({ x, runs: runs.slice(0, 3) });
      }
      gh = bot - top;
      mid = (top + bot) / 2 + gh * 0.12;
      base = Math.min(H - 6, bot + 14);
    };

    const noise = (i: number, tt: number) =>
      0.5 + 0.28 * Math.sin(i * 0.37 + tt * 0.011) + 0.22 * Math.sin(i * 1.31 - tt * 0.023) * Math.sin(tt * 0.004 + i * 0.07);

    const bar = (x: number, a: number, b: number) => {
      if (b - a < 0.5) return;
      ctx.fillRect(x - 1, a, 2, b - a);
    };

    const opening = (e: number) => {
      ctx.globalAlpha = e > LAND ? clamp(1 - (e - LAND) / (DONE - LAND)) : 1;
      ctx.fillStyle = ink;
      const span = x1 - x0 || 1;
      const amp = gh * 1.05;
      for (let i = 0; i < cols.length; i++) {
        const { x, runs } = cols[i];
        if (x < x0 - step * 2 || x > x1 + step * 2) continue;
        const u = (x - x0) / span;
        const env = Math.pow(Math.sin(Math.PI * clamp(u * 0.96 + 0.02)), 0.6);
        const grow = clamp((e - DIAL) / 260);
        if (grow <= 0) continue;
        const h = Math.max(1, amp * env * noise(i, e) * grow);
        const wa = mid - h / 2;
        const wb = mid + h / 2;
        const k = ease(clamp((e - SPEAK - u * 120) / (RESOLVE - SPEAK)));
        if (!runs.length) { bar(x, wa + (mid - wa) * k, wb + (mid - wb) * k); continue; }
        for (const [ra, rb] of runs) bar(x, wa + (ra - wa) * k, wb + (rb - wb) * k);
      }
    };

    const breath = (e: number) => {
      const fade = clamp((e - DONE + 200) / 600);
      ctx.fillStyle = ink;
      const span = x1 - x0 || 1;
      for (let i = 0; i < cols.length; i++) {
        const x = cols[i].x;
        if (x < x0 || x > x1) continue;
        const u = (x - x0) / span;
        const env = Math.pow(Math.sin(Math.PI * u), 1.4);
        const h = 1 + 5 * env * fade * (0.35 + 0.65 * noise(i, e * 0.35));
        ctx.globalAlpha = 0.18 + 0.32 * env;
        ctx.fillRect(x - 1, base - h / 2, 2, h);
      }
      ctx.globalAlpha = fade;
      ctx.fillStyle = acc;
      const lead = x0 + ((e * 0.06) % (span + 80)) - 40;
      if (lead > x0 && lead < x1) ctx.fillRect(lead - 1, base - 5, 2, 10);
      ctx.globalAlpha = 1;
    };

    let lastPaint = 0;
    const frame = () => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const e = o.m === 'full' ? since(o) : DONE + since(o);
      if (e > DONE + 600 && (!visible || performance.now() - lastPaint < 40)) return;
      lastPaint = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (e < DONE) opening(e);
      if (e > DONE - 200) breath(e);
    };

    const start = () => { if (!alive) return; sample(); frame(); };
    const fonts = document.fonts?.ready;
    if (fonts && o.m === 'full' && since(o) < 200) fonts.then(start, start); else start();
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(c);
    const ro = new ResizeObserver(() => { if (cols.length) sample(); });
    ro.observe(t);
    const theme = () => requestAnimationFrame(() => { ink = getComputedStyle(t).color; acc = getComputedStyle(st).getPropertyValue('--acc').trim() || acc; });
    window.addEventListener('rg-theme', theme);
    const mo = new MutationObserver(theme);
    const site = st.closest('.site');
    if (site) mo.observe(site, { attributes: true, attributeFilter: ['class'] });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('rg-theme', theme);
    };
  }, [o, title]);

  return (
    <header className={`site-col pi hvh${className ? ` ${className}` : ''}`}>
      <BootScript id={ID} />
      <style>{CSS}</style>
      <div className="hvh-id">
        <ProjectLogo id="harvey" size={20} className="hvh-logo" />
        <span className="hvh-sw"><span className="hvh-sw0">{incoming}</span><span className="hvh-sw1">{connected}</span></span>
        <span className="hvh-sep" aria-hidden="true" />
        <span>{region}</span>
      </div>
      <div className="hvh-stage" ref={stage}>
        <h1 className="hvh-t" ref={h1}>{title}</h1>
        <span className="hvh-line" aria-hidden="true" />
        <canvas className="hvh-cv" ref={cv} aria-hidden="true" />
      </div>
      <p className="hvh-lede">{lede}</p>
      {actions && <div className="hvh-acts"><Actions p="hvh" actions={actions} /></div>}
      {children}
    </header>
  );
}
