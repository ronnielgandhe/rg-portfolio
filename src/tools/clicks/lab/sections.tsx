import { DifficultySwitch, Leaderboard, Tradeoff } from './charts';
import Writeup from './Writeup';
import { BENCH, LLM, WRITEUP, splitWriteup } from './data.ts';
import { LlmTable, MoneyChart, PriorWork, Replays } from './llm';

const LLM_MD = splitWriteup(WRITEUP).llm;

export function Section({ id, label, lede, tag, children }: { id: string; label: string; lede?: string; tag?: string | null; children: React.ReactNode }) {
  return (
    <section id={id} className="lab-sec" aria-labelledby={`${id}-t`}>
      <div className="lab-sec-head">
        <h2 id={`${id}-t`} className="lab-label lab-sec-label">{label}{tag && <span className="lab-pre">{tag}</span>}</h2>
        {lede && <p className="lab-sec-lede">{lede}</p>}
      </div>
      {children}
    </section>
  );
}

export function Numbers({ diff, setDiff }: { diff: string; setDiff: (d: string) => void }) {
  if (!BENCH) return <div className="lab-empty">numbers land here when the benchmark finishes.</div>;
  const d = BENCH.dataset;
  return (
    <>
      <div className="lab-bar-row">
        <DifficultySwitch bench={BENCH} value={diff} onChange={setDiff} />
        <span className="lab-note">{d.pairs} races between held-out wikispeedia articles, the same races for every strategy.</span>
      </div>
      <Leaderboard bench={BENCH} diff={diff} />
      <div className="lab-sub">
        <div className="lab-label">the tradeoff</div>
        <p className="lab-sub-lede">every strategy pays in one of two currencies: a longer path, or more pages opened to find a short one. the bottom left corner is where you want to be. anything past 8 clicks is pinned to the top edge.</p>
      </div>
      <Tradeoff bench={BENCH} diff={diff} />
    </>
  );
}

export function Llms({ diff, setDiff }: { diff: string; setDiff: (d: string) => void }) {
  if (!LLM) return <div className="lab-empty">the llm numbers land here when their runs finish.</div>;
  return (
    <>
      {BENCH && (
        <div className="lab-bar-row">
          <DifficultySwitch bench={BENCH} value={diff} onChange={setDiff} />
          <span className="lab-note">{LLM.protocol.pairs} races, up to {LLM.protocol.maxSteps} clicks each, temperature {LLM.protocol.temperature}. each model sees {LLM.protocol.sees}.</span>
        </div>
      )}
      <MoneyChart llm={LLM} diff={diff} />
      <LlmTable llm={LLM} diff={diff} />
      {LLM.replays?.length > 0 && (
        <>
          <div className="lab-sub">
            <div className="lab-label">replays</div>
            <p className="lab-sub-lede">recorded games, played back one click at a time: what page it was on, how many links it was offered, and which one it picked.</p>
          </div>
          <Replays llm={LLM} />
        </>
      )}
      {LLM_MD && <Writeup md={LLM_MD} charts={{}} />}
      <PriorWork llm={LLM} />
    </>
  );
}
