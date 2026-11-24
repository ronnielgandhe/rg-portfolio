import { useEffect, useRef, useState } from 'react';

interface Box { id: string; x: number; y: number; w: number; h: number; title: string; sub: string; small?: boolean }
interface Seg { id: string; d: string; label?: string; lx?: number; ly?: number; anchor?: 'start' | 'middle' | 'end' }
interface Layout { w: number; h: number; frame: [number, number, number, number]; frameLabel: [number, number]; boxes: Box[]; segs: Seg[]; bus: string[]; notes: { x: number; y: number; text: string }[] }

const TOOLS: [string, string][] = [
  ['cite_statute', 'chroma, rag'],
  ['current_events', 'google news rss'],
  ['stock_ticker', 'yahoo finance'],
  ['check_the_hill', 'quiverquant'],
  ['manage_screen', 'moves cards'],
  ['end_call', 'hangs up'],
];

const CORE = {
  browser: ['browser', 'this page'],
  livekit: ['livekit cloud', 'webrtc + data channel'],
  stt: ['speech to text', 'deepgram nova-2'],
  llm: ['llm + tool calls', 'claude'],
  tts: ['text to speech', 'elevenlabs turbo v2.5'],
} as const;

function core(id: keyof typeof CORE, x: number, y: number, w: number, h: number): Box {
  return { id, x, y, w, h, title: CORE[id][0], sub: CORE[id][1] };
}

const WIDE: Layout = (() => {
  const tw = (630 - 50) / 6;
  const tx = (k: number) => 390 + k * (tw + 10);
  const tc = (k: number) => tx(k) + tw / 2;
  return {
    w: 1040,
    h: 320,
    frame: [370, 0, 670, 320],
    frameLabel: [388, 304],
    boxes: [
      core('browser', 0, 40, 130, 60),
      core('livekit', 180, 40, 140, 60),
      core('stt', 390, 40, 190, 60),
      core('llm', 610, 40, 190, 60),
      core('tts', 830, 40, 190, 60),
      ...TOOLS.map(([t, s], k) => ({ id: `tool${k}`, x: tx(k), y: 200, w: tw, h: 60, title: t, sub: s, small: true })),
    ],
    segs: [
      { id: 's1', d: 'M130 58 H180', label: 'webrtc', lx: 155, ly: 51, anchor: 'middle' },
      { id: 's2', d: 'M320 70 H390', label: 'dispatch', lx: 355, ly: 63, anchor: 'middle' },
      { id: 's3', d: 'M580 70 H610' },
      { id: 's4', d: `M705 100 V165 H${tc(0)} V200` },
      { id: 's5', d: 'M390 238 H250 V100', label: 'json events', lx: 262, ly: 230, anchor: 'start' },
      { id: 's6', d: 'M180 82 H130' },
      { id: 's7', d: `M${tc(0)} 200 V165 H705 V100` },
      { id: 's8', d: 'M800 70 H830' },
      { id: 's9', d: 'M925 40 V18 H250 V40', label: 'his voice, streamed back', lx: 590, ly: 12, anchor: 'middle' },
    ],
    bus: [`M705 100 V165`, `M${tc(0)} 165 H${tc(5)}`, ...TOOLS.map((_, k) => `M${tc(k)} 165 V200`)],
    notes: [{ x: 390, y: 122, text: 'silero vad + turn detection decide when you are done' }],
  };
})();

const NARROW: Layout = {
  w: 358,
  h: 600,
  frame: [0, 188, 358, 412],
  frameLabel: [16, 586],
  boxes: [
    core('browser', 24, 0, 310, 52),
    core('livekit', 24, 96, 310, 52),
    core('stt', 16, 224, 155, 56),
    core('tts', 187, 224, 155, 56),
    core('llm', 16, 312, 326, 56),
    ...TOOLS.map(([t, s], k) => ({ id: `tool${k}`, x: k % 2 ? 184 : 16, y: 400 + Math.floor(k / 2) * 56, w: 158, h: 48, title: t, sub: s, small: true })),
  ],
  segs: [
    { id: 's1', d: 'M110 52 V96', label: 'webrtc', lx: 118, ly: 78, anchor: 'start' },
    { id: 's2', d: 'M93 148 V224', label: 'dispatch', lx: 101, ly: 172, anchor: 'start' },
    { id: 's3', d: 'M93 280 V312' },
    { id: 's4', d: 'M179 368 V384 H95 V400' },
    { id: 's5', d: 'M16 424 H8 V122 H24' },
    { id: 's6', d: 'M248 96 V52' },
    { id: 's7', d: 'M95 400 V384 H179 V368' },
    { id: 's8', d: 'M265 312 V280' },
    { id: 's9', d: 'M265 224 V148', label: 'his voice', lx: 257, ly: 172, anchor: 'end' },
  ],
  bus: ['M179 368 V384', 'M95 384 H263', 'M95 384 V400', 'M263 384 V400'],
  notes: [],
};

const TURN = ['browser', 's1', 'livekit', 's2', 'stt', 's3', 'llm', 's4', 'tool0', 's5', 'livekit', 's6', 'browser', 's7', 'llm', 's8', 'tts', 's9', 'livekit', 's6', 'browser'];
const STEP_OF: Record<number, number> = { 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 3, 6: 3, 7: 3, 8: 3, 9: 4, 10: 4, 11: 4, 12: 4 };
const SPEED = 0.32;
const DWELL = 380;
const COMET = 40;

export default function Pipeline({ onStep }: { onStep?: (step: number) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  const L = narrow ? NARROW : WIDE;
  const comets = useRef<Record<string, SVGPathElement | null>>({});
  const boxes = useRef<Record<string, SVGRectElement | null>>({});
  const stepRef = useRef(onStep);
  stepRef.current = onStep;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 620));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lens: Record<string, number> = {};
    for (const [id, p] of Object.entries(comets.current)) if (p) lens[id] = p.getTotalLength();
    const plan = TURN.map((id) => ({ id, dur: id.startsWith('s') ? Math.max(240, (lens[id] ?? 60) / SPEED) : DWELL }));
    const total = plan.reduce((a, b) => a + b.dur, 0) + 1400;
    let raf = 0;
    let visible = false;
    let lastStep = -1;
    let lastActive = '';
    const t0 = performance.now();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '80px' });
    if (wrap.current) io.observe(wrap.current);

    const frame = (now: number) => {
      raf = window.requestAnimationFrame(frame);
      if (!visible) return;
      let t = (now - t0) % total;
      let idx = -1;
      let p = 0;
      for (let i = 0; i < plan.length; i++) {
        if (t < plan[i].dur) { idx = i; p = t / plan[i].dur; break; }
        t -= plan[i].dur;
      }
      const cur = idx >= 0 ? plan[idx].id : '';
      for (const [id, path] of Object.entries(comets.current)) {
        if (!path) continue;
        const len = lens[id] ?? 0;
        if (id === cur) {
          path.style.strokeDasharray = `${COMET} ${len + COMET}`;
          path.style.strokeDashoffset = `${COMET - p * (len + COMET)}`;
          path.style.opacity = '1';
        } else if (path.style.opacity !== '0') {
          path.style.opacity = '0';
        }
      }
      const active = cur.startsWith('s') ? '' : cur;
      if (active !== lastActive) {
        for (const [id, r] of Object.entries(boxes.current)) r?.classList.toggle('hv-pl-on', id === active);
        lastActive = active;
      }
      const step = idx < 0 ? -1 : idx <= 12 ? STEP_OF[idx] ?? -1 : 5;
      if (step !== lastStep) { lastStep = step; stepRef.current?.(step); }
    };
    raf = window.requestAnimationFrame(frame);
    return () => { window.cancelAnimationFrame(raf); io.disconnect(); };
  }, [narrow]);

  const [fx, fy, fw, fh] = L.frame;
  return (
    <div ref={wrap} className="hv-pl">
      <svg viewBox={`0 0 ${L.w} ${L.h}`} width="100%" role="img" aria-label="pipeline: browser to livekit cloud to the agent worker, which runs speech to text, an llm with six tools, and text to speech, then streams his voice back">
        <defs>
          <marker id={`hvArrow${narrow ? 'n' : 'w'}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M1 1 L7 4 L1 7" fill="none" stroke="currentColor" strokeWidth="1" />
          </marker>
        </defs>
        <rect className="hv-pl-frame" x={fx + 0.5} y={fy + 0.5} width={fw - 1} height={fh - 1} />
        <text className="hv-pl-cap" x={L.frameLabel[0]} y={L.frameLabel[1]}>AGENT WORKER, PYTHON ON FLY.IO</text>
        {L.bus.map((d, i) => <path key={i} className="hv-pl-bus" d={d} />)}
        {L.segs.map((s) => (
          <g key={s.id}>
            <path className="hv-pl-line" d={s.d} markerEnd={s.id === 's4' || s.id === 's7' ? undefined : `url(#hvArrow${narrow ? 'n' : 'w'})`} />
            <path ref={(el) => { comets.current[s.id] = el; }} className="hv-pl-comet" d={s.d} style={{ opacity: 0 }} />
            {s.label && <text className="hv-pl-note" x={s.lx} y={s.ly} textAnchor={s.anchor}>{s.label}</text>}
          </g>
        ))}
        {L.boxes.map((b) => (
          <g key={b.id}>
            <rect ref={(el) => { boxes.current[b.id] = el; }} className="hv-pl-box" x={b.x + 0.5} y={b.y + 0.5} width={b.w - 1} height={b.h - 1} />
            <text className={b.small ? 'hv-pl-tool' : 'hv-pl-title'} x={b.x + (b.small ? 10 : 14)} y={b.y + (b.small ? (b.h > 50 ? 25 : 21) : b.h / 2 - 2)}>{b.title}</text>
            <text className="hv-pl-sub" x={b.x + (b.small ? 10 : 14)} y={b.y + (b.small ? (b.h > 50 ? 42 : 37) : b.h / 2 + 15)}>{b.sub}</text>
          </g>
        ))}
        {L.notes.map((n, i) => <text key={i} className="hv-pl-note" x={n.x} y={n.y}>{n.text}</text>)}
      </svg>
    </div>
  );
}
