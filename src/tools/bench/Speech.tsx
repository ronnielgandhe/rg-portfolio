import { useRef, useState } from 'react';
import { Bar, CountUp, useFirstPass, useReveal } from './motion';
import { BENCH_BY_ID, fmtDate, fmtScore, rowProvider, type Bench, type Row } from './data';

const TOP = 12;

function List({ b, sub, frac }: { b: Bench; sub: (r: Row) => string; frac: (r: Row) => number }) {
  const [all, setAll] = useState(false);
  const rows = all ? b.rows : b.rows.slice(0, TOP);
  const host = useRef<HTMLDivElement>(null);
  const on = useReveal(host, 0.15);
  const first = useFirstPass(on);
  const fmt = (v: number) => fmtScore(b, v);
  const name = (r: Row) => { const n = r.name ?? r.raw; return n.includes('/') ? n.split('/').slice(1).join('/') : n; };
  return (
    <div className="bx-box bx-speech-col">
      <div className="bx-box-body">
        <span className="bx-label">{b.id === 'tts_arena' ? 'text to speech' : 'speech to text'}</span>
        <h3 className="bx-h3">{b.name}</h3>
        <p className="bx-measures">{b.measures}</p>
        <div className="bx-meta-row">
          <span>{b.metric}, {b.higherIsBetter ? 'higher is better' : 'lower is better'}</span>
          <span>data {fmtDate(b.date)}</span>
          <a href={b.url} target="_blank" rel="noopener noreferrer" className="bx-link">source</a>
        </div>
        <div className="bx-rows bx-rows-speech" ref={host}>
          {rows.map((r, i) => (
            <div key={r.raw} className="bx-row bx-row-speech">
              <span className="bx-rank">{r.rank}</span>
              <span className="bx-name">
                <span className="bx-name-main">{name(r)}</span>
                <span className="bx-name-sub">{sub(r)}</span>
              </span>
              <span className="bx-col-bar"><Bar frac={frac(r)} on={on} delay={first ? i * 45 : 0} /></span>
              <CountUp className="bx-num bx-score" value={r.score} fmt={fmt} play={on} delay={first ? i * 45 : 0} />
            </div>
          ))}
        </div>
        {b.rows.length > TOP && <button className="bx-more" onClick={() => setAll((a) => !a)}>{all ? `show top ${TOP}` : `show all ${b.rows.length}`}</button>}
      </div>
    </div>
  );
}

export default function Speech() {
  const asr = BENCH_BY_ID.get('asr_en');
  const tts = BENCH_BY_ID.get('tts_arena');
  if (!asr && !tts) return null;
  const ex = (r: Row) => (r.extra ?? {}) as Record<string, number | boolean | string | null>;
  const asrHi = asr ? Math.max(...asr.rows.map((r) => r.score)) : 1;
  const ttsLo = tts ? Math.min(...tts.rows.map((r) => r.score)) : 0;
  const ttsHi = tts ? Math.max(...tts.rows.map((r) => r.score)) : 1;
  return (
    <div className="bx-speech">
      {asr && (
        <List
          b={asr}
          frac={(r) => r.score / asrHi}
          sub={(r) => [rowProvider(r), ex(r).open ? 'open weights' : 'api', typeof ex(r).rtfx === 'number' ? `${Math.round(ex(r).rtfx as number).toLocaleString('en-US')}x speed` : null].filter(Boolean).join(' · ')}
        />
      )}
      {tts && (
        <List
          b={tts}
          frac={(r) => 0.08 + ((r.score - ttsLo) / (ttsHi - ttsLo || 1)) * 0.92}
          sub={(r) => [r.org ?? 'no public page', `±${ex(r).ci}`, `${Number(ex(r).votes).toLocaleString('en-US')} votes`, ex(r).preliminary ? 'preliminary' : null, ex(r).open ? 'open weights' : null].filter(Boolean).join(' · ')}
        />
      )}
    </div>
  );
}
