import { useEffect, useRef, useState } from 'react';

export interface FeedItem {
  id: string;
  nav: string;
  label: string;
  sub: string;
  href: string;
  external?: boolean;
  image?: string;
  colors: [string, string, string];
}

const FRAG = `
precision mediump float;
uniform vec2 r; uniform float t; uniform float seed;
uniform vec3 c1; uniform vec3 c2; uniform vec3 c3;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main(){
  vec2 uv = gl_FragCoord.xy / r;
  vec2 p = uv * vec2(1.6, 1.0) + seed;
  float tt = t * 0.05;
  vec2 q = vec2(n(p * 1.15 + tt), n(p * 1.15 - tt + 5.2));
  vec2 w = vec2(n(p + 2.3 * q + vec2(1.7, 9.2) + tt * 0.7), n(p + 2.3 * q + vec2(8.3, 2.8) - tt * 0.5));
  float f = n(p * 0.85 + 2.7 * w);
  vec3 col = mix(c1, c2, smoothstep(0.18, 0.82, f));
  col = mix(col, c3, smoothstep(0.42, 0.98, w.x * w.y * 2.1 + uv.x * 0.22));
  col += 0.09 * (q.y - 0.5);
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';
const GL_W = 288;
const GL_H = 180;

const hex = (c: string): [number, number, number] => [
  parseInt(c.slice(1, 3), 16) / 255,
  parseInt(c.slice(3, 5), 16) / 255,
  parseInt(c.slice(5, 7), 16) / 255,
];

function createRenderer() {
  const canvas = document.createElement('canvas');
  canvas.width = GL_W;
  canvas.height = GL_H;
  const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const loc = { r: u('r'), t: u('t'), seed: u('seed'), c1: u('c1'), c2: u('c2'), c3: u('c3') };
  gl.uniform2f(loc.r, GL_W, GL_H);
  return {
    canvas,
    draw(colors: [string, string, string], seed: number, time: number) {
      gl.uniform1f(loc.t, time);
      gl.uniform1f(loc.seed, seed);
      gl.uniform3fv(loc.c1, hex(colors[0]));
      gl.uniform3fv(loc.c2, hex(colors[1]));
      gl.uniform3fv(loc.c3, hex(colors[2]));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
}

function useGradientCanvases(colors: [string, string, string][]) {
  const count = colors.length;
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    const renderer = createRenderer();
    if (!renderer) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const visible = new Set<number>();
    const painted = new Set<number>();
    const paint = (i: number, time: number) => {
      const target = refs.current[i];
      const ctx = target?.getContext('2d');
      if (!target || !ctx) return;
      renderer.draw(colors[i], i * 7.31 + 1.7, time);
      ctx.drawImage(renderer.canvas, 0, 0, target.width, target.height);
      painted.add(i);
      target.style.opacity = '1';
    };
    for (let i = 0; i < count; i++) if (refs.current[i]) paint(i, i * 13);

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const i = Number((e.target as HTMLElement).dataset.i);
        if (e.isIntersecting) visible.add(i); else visible.delete(i);
      }
    }, { rootMargin: '80px' });
    refs.current.forEach((c) => c && io.observe(c));

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (still || now - last < 33) return;
      last = now;
      visible.forEach((i) => paint(i, now / 1000 + i * 13));
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [count]);

  return refs;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.38;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [ids.join('|')]);
  return active;
}

export default function CardFeed({ items }: { items: FeedItem[] }) {
  const canvases = useGradientCanvases(items.map((f) => f.colors));
  const active = useActiveSection(items.map((f) => f.id));
  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="hf-grid">
      <aside className="hf-aside">
        <nav className="hf-toc">
          <ul>
            {items.map((f) => (
              <li key={f.id}>
                <button className={active === f.id ? 'hf-toc-item hf-toc-on' : 'hf-toc-item'} onClick={() => jump(f.id)}>
                  <span className="hf-toc-mark" />
                  {f.nav}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="site-col hf-feed site-enter hf-enter-late">
        {items.map((f, i) => (
          <div key={f.id} id={f.id} className="hf-anchor">
            <a href={f.href} target={f.external ? '_blank' : undefined} rel={f.external ? 'noopener noreferrer' : undefined} className={f.image ? 'hf-shot' : 'hf-card'}>
              {f.image ? (
                <>
                  <div className="hf-shot-media"><img src={f.image} alt={f.label} loading="lazy" /></div>
                  <div className="hf-shot-caption">
                    <h3>{f.label}</h3>
                    <p>{f.sub}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="hf-card-art" style={{ backgroundImage: `linear-gradient(135deg, ${f.colors[0]}, ${f.colors[1]}, ${f.colors[2]})` }}>
                    <canvas
                      ref={(el) => { canvases.current[i] = el; }}
                      data-i={i}
                      width={GL_W}
                      height={GL_H}
                    />
                  </div>
                  <div className="hf-card-text">
                    <h3>{f.label}</h3>
                    <p>{f.sub}</p>
                  </div>
                </>
              )}
            </a>
          </div>
        ))}
      </main>
      <div className="hf-spacer" />

      <style>{`
        .hf-grid { display: block; }
        .hf-aside, .hf-spacer { display: none; }
        .hf-feed { margin-top: 32px; display: flex; flex-direction: column; gap: 32px; }
        .hf-anchor { scroll-margin-top: 112px; }
        .hf-card { position: relative; display: block; width: 100%; aspect-ratio: 16 / 10; border-radius: 0; overflow: hidden; text-decoration: none; background: #000; transform: translateZ(0); }
        .hf-card-art { position: absolute; inset: 0; background-size: cover; }
        .hf-card-art canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; opacity: 0; transition: opacity 0.6s ease, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .hf-card:hover .hf-card-art canvas { transform: scale(1.04); }
        .hf-card-text { position: absolute; left: 0; right: 0; bottom: 0; padding: 16px 20px; }
        .hf-card-text h3 { margin: 0; font-size: 14px; line-height: 20px; font-weight: 500; color: #fff; filter: drop-shadow(0 1px 10px rgba(0, 0, 0, 0.4)); }
        .hf-card-text p { margin: 4px 0 0; font-size: 14px; line-height: 20px; color: rgba(255, 255, 255, 0.85); filter: drop-shadow(0 1px 8px rgba(0, 0, 0, 0.35)); }

        .hf-shot { display: block; text-decoration: none; }
        .hf-shot-media { aspect-ratio: 16 / 10; border-radius: 0; overflow: hidden; border: 1px solid var(--rule); background: var(--hover); transition: border-color 0.2s; }
        .hf-shot:hover .hf-shot-media { border-color: rgba(0, 0, 0, 0.25); }
        .hf-shot-media img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .hf-shot:hover .hf-shot-media img { transform: scale(1.025); }
        .hf-shot-caption { padding: 14px 2px 0; }
        .hf-shot-caption h3 { margin: 0; font-size: 14px; line-height: 20px; font-weight: 500; color: var(--ink); }
        .hf-shot-caption p { margin: 2px 0 0; font-size: 14px; line-height: 20px; color: var(--text); }
        .hf-toc { position: sticky; top: 128px; height: fit-content; width: 180px; }
        .hf-toc ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; border-left: 1px solid var(--rule); }
        .hf-toc-item { position: relative; display: block; width: 100%; padding: 7px 0 7px 16px; text-align: left; font-size: 13px; line-height: 1.375; color: var(--faint); transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .hf-toc-item:hover, .hf-toc-on { color: var(--ink); }
        .hf-toc-mark { position: absolute; left: -1px; top: 50%; width: 1px; height: 14px; transform: translateY(-50%); border-radius: 1px; background: var(--ink); opacity: 0; transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .hf-toc-on .hf-toc-mark { opacity: 1; }

        .hf-enter-late { animation-delay: 80ms; }

        @media (min-width: 1024px) {
          .hf-grid { display: grid; grid-template-columns: 1fr minmax(0, 576px) 1fr; column-gap: 40px; }
          .hf-aside { display: flex; justify-content: flex-end; margin-top: 32px; }
          .hf-spacer { display: block; }
        }
      `}</style>
    </div>
  );
}
