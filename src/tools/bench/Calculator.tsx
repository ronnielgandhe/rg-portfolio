import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Bar, CountUp, useFirstPass, useFlip, useReveal } from './motion';
import { BENCH_BY_ID, LLM_BENCHES, MODEL_BY_ID, fmtMoney, fmtScore, fmtTokens, priced, type Model, type Row } from './data';

const PRESETS = [
  { id: 'chat', label: 'chat turn', input: 1500, output: 300 },
  { id: 'rag', label: 'rag answer', input: 6000, output: 400 },
  { id: 'agent', label: 'agent step', input: 12000, output: 800 },
  { id: 'doc', label: 'summarize a doc', input: 20000, output: 600 },
];
const TOP = 12;

const monthly = (m: Model, input: number, output: number, perDay: number) => (perDay * 30 * (input * m.inPrice + output * m.outPrice)) / 1e6;

function Num({ label, value, onChange, step, min, max }: { label: string; value: number; onChange: (v: number) => void; step: number; min: number; max: number }) {
  const toSlider = (v: number) => Math.round(((Math.log10(Math.max(min, Math.min(max, v || min))) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 1000);
  const fromSlider = (t: number) => {
    const raw = 10 ** (Math.log10(min) + (t / 1000) * (Math.log10(max) - Math.log10(min)));
    const mag = 10 ** Math.max(0, Math.floor(Math.log10(raw)) - 1);
    return Math.round(raw / mag) * mag;
  };
  return (
    <label className="bx-field">
      <span className="bx-label">{label}</span>
      <div className="bx-field-row">
        <input className="bx-input bx-num-input" type="number" min={0} step={step} value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} />
        <input className="bx-range" type="range" min={0} max={1000} value={toSlider(value)} onChange={(e) => onChange(fromSlider(Number(e.target.value)))} aria-label={`${label} slider`} />
      </div>
    </label>
  );
}

function defaultBar(rows: Row[], higher: boolean) {
  const s = rows.filter((r) => priced(r.modelId ? MODEL_BY_ID.get(r.modelId) : undefined)).map((r) => r.score).sort((a, b) => (higher ? b - a : a - b));
  const v = s[Math.min(9, s.length - 1)] ?? 0;
  return higher ? Math.floor(v) : Math.ceil(v);
}

export default function Calculator({ onOpen, selected }: { onOpen: (id: string) => void; selected: string | null }) {
  const [preset, setPreset] = useState('rag');
  const [input, setInput] = useState(6000);
  const [output, setOutput] = useState(400);
  const [perDay, setPerDay] = useState(5000);
  const [benchId, setBenchId] = useState('eci');
  const b = BENCH_BY_ID.get(benchId) ?? LLM_BENCHES[0];
  const [bar, setBar] = useState(() => defaultBar(b.rows, b.higherIsBetter));
  const [all, setAll] = useState(false);

  const scored = useMemo(() => b.rows
    .map((r) => ({ r, m: r.modelId ? MODEL_BY_ID.get(r.modelId) : undefined }))
    .filter((x): x is { r: Row; m: Model } => priced(x.m)), [b]);
  const range = useMemo(() => {
    const s = scored.map((x) => x.r.score);
    return { lo: Math.floor(Math.min(...s)), hi: Math.ceil(Math.max(...s)) };
  }, [scored]);

  const list = useMemo(() => scored
    .map((x) => ({ ...x, cost: monthly(x.m, input, output, perDay), ok: b.higherIsBetter ? x.r.score >= bar : x.r.score <= bar }))
    .sort((p, q) => p.cost - q.cost), [scored, input, output, perDay, bar, b]);

  const cheapest = list.find((x) => x.ok);
  const top = [...list].sort((p, q) => (b.higherIsBetter ? q.r.score - p.r.score : p.r.score - q.r.score))[0];
  const clearing = list.filter((x) => x.ok).length;
  const shown = all ? list : list.filter((x) => x.ok).slice(0, TOP).concat(list.filter((x) => !x.ok).slice(0, 3)).sort((p, q) => p.cost - q.cost);
  const w = (c: number) => (c <= 0 ? 0 : Math.max(0.02, Math.min(1, (Math.log10(Math.max(c, 1)) + 0.3) / 6.3)));
  const host = useRef<HTMLDivElement>(null);
  const on = useReveal(host, 0.15);
  const first = useFirstPass(on);
  const sig = shown.map((x) => x.m.id).join(',');
  useFlip(host, sig);
  const [mark, setMark] = useState<{ y: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const row = cheapest ? host.current?.querySelector<HTMLElement>(`[data-flip="${CSS.escape(cheapest.m.id)}"]`) : null;
    setMark(row ? { y: row.offsetTop, h: row.offsetHeight } : null);
  }, [sig, cheapest?.m.id]);
  const perCall = (m: Model) => (input * m.inPrice + output * m.outPrice) / 1e6;

  const pickBench = (id: string) => {
    const nb = BENCH_BY_ID.get(id);
    if (!nb) return;
    setBenchId(id);
    setBar(defaultBar(nb.rows, nb.higherIsBetter));
    setAll(false);
  };

  return (
    <div className="bx-box bx-calc">
      <div className="bx-calc-in">
        <span className="bx-label">workload</span>
        <div className="bx-presets" role="radiogroup" aria-label="presets">
          {PRESETS.map((p) => (
            <button key={p.id} role="radio" aria-checked={preset === p.id} className={preset === p.id ? 'bx-preset-on' : ''} onClick={() => { setPreset(p.id); setInput(p.input); setOutput(p.output); }}><span>{p.label}</span><span className="bx-preset-sub">{fmtTokens(p.input)} in · {fmtTokens(p.output)} out</span></button>
          ))}
        </div>
        <div className="bx-fields">
          <Num label="input tokens per call" value={input} step={500} min={100} max={200000} onChange={(v) => { setInput(v); setPreset(''); }} />
          <Num label="output tokens per call" value={output} step={100} min={20} max={20000} onChange={(v) => { setOutput(v); setPreset(''); }} />
          <Num label="calls per day" value={perDay} step={1000} min={10} max={1000000} onChange={setPerDay} />
        </div>
        <p className="bx-fine">{fmtTokens(perDay * 30 * input)} input and {fmtTokens(perDay * 30 * output)} output tokens a month. list prices, no caching or batch discounts.</p>

        <span className="bx-label bx-gap">quality bar</span>
        <select className="bx-input bx-select bx-full" value={b.id} onChange={(e) => pickBench(e.target.value)} aria-label="quality benchmark">
          {LLM_BENCHES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <div className="bx-slider">
          <input type="range" min={range.lo} max={range.hi} step={b.unit === '%' ? 0.5 : 1} value={bar} onChange={(e) => setBar(Number(e.target.value))} aria-label="minimum score" />
          <span className="bx-slider-val">{b.higherIsBetter ? 'at least' : 'at most'} {fmtScore(b, bar)}</span>
        </div>
        <p className="bx-fine">{clearing} of {list.length} priced models clear it.</p>
      </div>

      <div className="bx-calc-out">
        <div className="bx-answer">
          <span className="bx-label">cheapest that clears the bar</span>
          {cheapest ? (
            <>
              <button className="bx-answer-name" onClick={() => onOpen(cheapest.m.id)}>{cheapest.m.name}</button>
              <div className="bx-answer-nums">
                <div><CountUp className="bx-big" value={cheapest.cost} fmt={fmtMoney} play={on} /><span className="bx-label">a month</span></div>
                <div><span className="bx-big">{fmtScore(b, cheapest.r.score)}</span><span className="bx-label">{b.short}</span></div>
                {top && top.m.id !== cheapest.m.id && (
                  <div><span className="bx-big">{cheapest.cost > 0 ? `${Math.max(1, Math.round(top.cost / cheapest.cost))}x` : 'n/a'}</span><span className="bx-label">cheaper than the top scorer</span></div>
                )}
              </div>
              {top && top.m.id !== cheapest.m.id && (
                <p className="bx-fine">top scorer here is {top.m.name} at {fmtScore(b, top.r.score)}, which would run {fmtMoney(top.cost)} a month.</p>
              )}
            </>
          ) : <p className="bx-empty">nothing clears that bar. lower it.</p>}
        </div>

        <div className="bx-cost-rows bx-flip-host" ref={host} role="table" aria-label="monthly cost by model">
          {mark && <span className="bx-pick-mark" style={{ transform: `translateY(${mark.y}px)`, height: mark.h }} aria-hidden="true"><span>cheapest</span></span>}
          <div className="bx-cost-row bx-row-head" role="row">
            <span role="columnheader">model</span>
            <span role="columnheader" className="bx-col-bar">a month, log scale $1 to $1m</span>
            <span role="columnheader" className="bx-num">a month</span>
            <span role="columnheader" className="bx-num">{b.short}</span>
          </div>
          {shown.map((x, i) => (
            <button key={x.m.id} data-flip={x.m.id} role="row" className={`bx-cost-row bx-row-btn${x.ok ? '' : ' bx-row-dim'}${selected === x.m.id ? ' bx-row-sel' : ''}`} onClick={() => onOpen(x.m.id)}>
              <span className="bx-name">
                <span className="bx-name-main">{x.m.name}</span>
                <span className="bx-name-sub">{x.m.provider} · {fmtMoney(perCall(x.m) * 1000)} per 1k calls{x.ok ? '' : ' · below bar'}</span>
              </span>
              <span className="bx-col-bar"><Bar frac={w(x.cost)} on={on} delay={first ? i * 40 : 0} /></span>
              <CountUp className="bx-num bx-score" value={x.cost} fmt={fmtMoney} play={on} delay={first ? i * 40 : 0} />
              <span className="bx-num bx-price">{fmtScore(b, x.r.score)}</span>
            </button>
          ))}
        </div>
        {list.length > shown.length || all ? (
          <button className="bx-more" onClick={() => setAll((a) => !a)}>{all ? 'show fewer' : `show all ${list.length}`}</button>
        ) : null}
      </div>
    </div>
  );
}
