import { useEffect, useRef, type MutableRefObject } from 'react';

export type WaveMode = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'ended';

export interface WaveFeed {
  agent: AnalyserNode | null;
  mic: AnalyserNode | null;
  fake: ((who: 'agent' | 'mic') => number) | null;
}

const MODES: WaveMode[] = ['idle', 'connecting', 'listening', 'thinking', 'speaking', 'ended'];
const ALPHA: Record<WaveMode, number> = { idle: 0.55, connecting: 0.72, listening: 0.4, thinking: 0.7, speaking: 1, ended: 0.34 };
const LO_HZ = 85;
const HI_HZ = 5200;

const bell = (d: number, w: number) => Math.exp(-(d / w) * (d / w));

export default function Waveform({ mode, feed, label }: { mode: WaveMode; feed: MutableRefObject<WaveFeed>; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let N = 0;
    let step = 4;
    let pos = new Float32Array(0);
    let vel = new Float32Array(0);
    let half = 0;
    let specA = new Float32Array(0);
    let specM = new Float32Array(0);
    let bins = new Uint8Array(1024);
    const weight: Record<WaveMode, number> = { idle: 0, connecting: 0, listening: 0, thinking: 0, speaking: 0, ended: 0 };
    weight[modeRef.current] = 1;
    let rgb = '26, 26, 26';
    let colorAt = 0;
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    let visible = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const resize = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = Math.max(1, Math.round(W * dpr));
      cv.height = Math.max(1, Math.round(H * dpr));
      step = W < 560 ? 3 : 4;
      const n = Math.max(8, Math.floor(W / step));
      if (n !== N) {
        N = n;
        pos = new Float32Array(N);
        vel = new Float32Array(N);
        half = Math.ceil(N / 2);
        specA = new Float32Array(half);
        specM = new Float32Array(half);
      }
    };

    const spectrum = (an: AnalyserNode | null, out: Float32Array) => {
      if (!an) return false;
      if (bins.length !== an.frequencyBinCount) bins = new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(bins);
      const binHz = an.context.sampleRate / an.fftSize;
      let energy = 0;
      for (let j = 0; j < half; j++) {
        const d = j / Math.max(1, half - 1);
        const b = (LO_HZ * Math.pow(HI_HZ / LO_HZ, d)) / binHz;
        const lo = Math.min(bins.length - 2, Math.floor(b));
        const raw = (bins[lo] + (bins[lo + 1] - bins[lo]) * (b - lo)) / 255;
        const v = Math.pow(Math.max(0, (raw - 0.1) / 0.9), 1.35);
        out[j] = v;
        energy += v;
      }
      return energy > 0.002 * half;
    };

    const synth = (level: number, out: Float32Array, t: number, seed: number) => {
      for (let j = 0; j < half; j++) {
        const d = j / Math.max(1, half - 1);
        const grain = 0.62 + 0.22 * Math.sin(j * 0.77 + t * 9 + seed) + 0.16 * Math.sin(j * 0.31 - t * 5.3 + seed * 2);
        out[j] = level * Math.exp(-d * 2.6) * grain;
      }
    };

    const fill = (who: 'agent' | 'mic', out: Float32Array, t: number) => {
      const f = feed.current;
      const ok = spectrum(who === 'agent' ? f.agent : f.mic, out);
      if (!ok && f.fake) synth(f.fake(who), out, t, who === 'agent' ? 0 : 3);
      else if (!ok) out.fill(0);
    };

    const readColor = (now: number) => {
      if (now - colorAt < 400) return;
      colorAt = now;
      const m = getComputedStyle(cv).color.match(/[\d.]+/g);
      if (m && m.length >= 3) rgb = `${m[0]}, ${m[1]}, ${m[2]}`;
    };

    const frame = (now: number) => {
      raf = window.requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = now; return; }
      const still = reduce.matches;
      const dt = Math.min(64, now - last);
      last = now;
      const f = dt / 16.667;
      const t = still ? 1.2 : (now - t0) / 1000;
      readColor(now);

      const cur = modeRef.current;
      const mix = still ? 1 : 1 - Math.exp(-dt / 150);
      for (const m of MODES) weight[m] += ((m === cur ? 1 : 0) - weight[m]) * mix;

      if (weight.speaking > 0.01) fill('agent', specA, t);
      if (weight.listening > 0.01) fill('mic', specM, t);

      const breath = still ? 0.6 : (1 - Math.cos((t * Math.PI * 2) / 4.4)) / 2;
      const pulse = (t % 1.5) / 1.5;
      const center = (N - 1) / 2;

      let alpha = 0;
      for (const m of MODES) alpha += weight[m] * ALPHA[m];

      for (let i = 0; i < N; i++) {
        const d = Math.abs(i - center) / center;
        const j = Math.min(half - 1, Math.round(d * (half - 1)));
        const taper = 0.2 + 0.8 * bell(d, 0.62);
        let target = 0;
        if (weight.idle > 0.001) target += weight.idle * (0.05 + (0.1 + 0.16 * breath) * bell(d, 0.42) + (still ? 0 : 0.07 * (0.5 + 0.5 * Math.sin(d * 13 - t * 1.7)) * bell(d, 0.6)));
        if (weight.connecting > 0.001) target += weight.connecting * (0.02 + (still ? 0.12 * bell(d, 0.3) : 0.3 * bell(d - pulse, 0.07) * (1 - pulse * 0.7)));
        if (weight.thinking > 0.001) target += weight.thinking * (0.04 + 0.15 * (0.5 + 0.5 * Math.sin(d * 30 - t * 7.5)) * bell(d, 0.55));
        if (weight.listening > 0.001) target += weight.listening * (0.012 + (still ? 0.25 * bell(d, 0.4) : 0.78 * specM[j] * taper));
        if (weight.speaking > 0.001) target += weight.speaking * (0.014 + (still ? 0.45 * bell(d, 0.45) : 0.98 * specA[j] * taper * (0.93 + 0.07 * Math.sin(i * 1.7 + t * 4))));
        target = Math.min(1, target);
        if (still) {
          pos[i] = target;
          vel[i] = 0;
        } else {
          vel[i] += (target - pos[i]) * 0.2 * f;
          vel[i] *= Math.pow(0.6, f);
          pos[i] += vel[i] * f;
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const mid = Math.round((H / 2) * dpr) / dpr;
      const px = 1 / dpr;
      ctx.fillStyle = `rgba(${rgb}, 0.2)`;
      ctx.fillRect(0, mid - px / 2, W, px);
      ctx.fillStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
      const room = H / 2 - 2;
      const left = (W - (N - 1) * step) / 2;
      for (let i = 0; i < N; i++) {
        const h = Math.max(0, pos[i]) * room;
        if (h < 1.5) continue;
        const x = Math.round((left + i * step) * dpr) / dpr;
        ctx.fillRect(x, mid - h, 1, h * 2);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    resize();
    raf = window.requestAnimationFrame(frame);
    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [feed]);

  return <canvas ref={ref} className="hv-canvas" role="img" aria-label={label} />;
}
