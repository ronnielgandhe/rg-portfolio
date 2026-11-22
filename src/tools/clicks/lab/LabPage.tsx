import PageShell from '../../../components/portfolio/PageShell';
import ClicksHero from '../../../components/portfolio/heroes/ClicksHero';
import { CLICKS_CSS } from '../styles';
import { useState } from 'react';
import RaceLab from './RaceLab';
import Diagrams from './Diagrams';
import Writeup from './Writeup';
import { Ablations, DifficultyGrid, DifficultySwitch, Leaderboard, LossChart, ModelFacts, Tradeoff } from './charts';
import { ALL, BENCH, CODE, LLM, WRITEUP, splitWriteup } from './data.ts';
import { LlmTable, MoneyChart, PriorWork, Replays } from './llm';

const MD = splitWriteup(WRITEUP);
import { LAB_CSS, LAB_CSS_2 } from './styles';

function Section({ id, label, lede, tag, first, children }: { id: string; label: string; lede?: string; tag?: string | null; first?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} className={`lab-sec${first ? ' lab-sec-first' : ''}`} aria-labelledby={`${id}-t`}>
      <div className="lab-sec-head">
        <h2 id={`${id}-t`} className="lab-label lab-sec-label">{label}{tag && <span className="lab-pre">{tag}</span>}</h2>
        {lede && <p className="lab-sec-lede">{lede}</p>}
      </div>
      {children}
    </section>
  );
}

function Numbers({ diff, setDiff }: { diff: string; setDiff: (d: string) => void }) {
  if (!BENCH) return <div className="lab-empty">numbers land here when the benchmark finishes.</div>;
  const d = BENCH.dataset;
  return (
    <>
      <div className="lab-bar-row">
        <DifficultySwitch bench={BENCH} value={diff} onChange={setDiff} />
        <span className="lab-note">{d.pairs} pairs from {d.name.toLowerCase()}, same pairs for every strategy, seed {d.seed}.</span>
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

function ModelSection() {
  const m = BENCH?.model;
  const charts = BENCH ? {
    leaderboard: <a className="lab-ref" href="#numbers">the leaderboard, up top</a>,
    tradeoff: <a className="lab-ref" href="#numbers">the tradeoff chart, under the leaderboard</a>,
    difficulty: <DifficultyGrid bench={BENCH} />,
    loss: m ? <LossChart model={m} /> : null,
    ablations: m ? <Ablations model={m} /> : null,
  } : {};
  return (
    <>
      {m && <ModelFacts model={m} />}
      {MD.main ? <Writeup md={MD.main} charts={charts} /> : (
        <div className="lab-md">
          <p className="lab-md-wait">the write-up lands here when the benchmark finishes.</p>
          {m && <><div className="lab-label lab-md-cap">training</div><LossChart model={m} /><div className="lab-label lab-md-cap">what each piece is worth</div><Ablations model={m} /></>}
        </div>
      )}
      <div className="lab-links">
        <a href={CODE.strategies} target="_blank" rel="noopener noreferrer">strategies code</a>
        <a href={CODE.lab} target="_blank" rel="noopener noreferrer">this page's code</a>
        {BENCH && <a href={BENCH.dataset.url} target="_blank" rel="noopener noreferrer">the wikispeedia dataset</a>}
      </div>
    </>
  );
}

function Llms({ diff, setDiff }: { diff: string; setDiff: (d: string) => void }) {
  if (!LLM) return <div className="lab-empty">the llm numbers land here when their runs finish.</div>;
  return (
    <>
      {BENCH && (
        <div className="lab-bar-row">
          <DifficultySwitch bench={BENCH} value={diff} onChange={setDiff} />
          <span className="lab-note">{LLM.protocol.pairs} pairs, up to {LLM.protocol.maxSteps} clicks each, temperature {LLM.protocol.temperature}. each model sees {LLM.protocol.sees}.</span>
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
      {MD.llm && <Writeup md={MD.llm} charts={{}} />}
      <PriorWork llm={LLM} />
    </>
  );
}

export default function LabPage() {
  const [diff, setDiff] = useState(ALL);
  return (
    <PageShell activePage="projects" crumb="how many clicks / lab" back={{ href: '/how-many-clicks', label: 'how many clicks' }} wide>
      <style>{CLICKS_CSS}</style>
      <style>{LAB_CSS + LAB_CSS_2}</style>
      <ClicksHero
        hid="how-many-clicks-lab"
        title="the search lab"
        lede="every way i tried to search wikipedia, racing live in front of you, then measured on the same pairs."
        actions={[{ label: 'play the game', href: '/how-many-clicks', primary: true }, { label: 'read the code', href: CODE.lab, external: true }]}
      />
      <div className="site-col clk lab">
        <Section id="race" first label="race two strategies" lede="same pair, both searching live wikipedia. filled squares are pages opened, hollow ones are queued up next.">
          <RaceLab />
        </Section>
        <Section id="numbers" label="leaderboard" tag={BENCH?.preliminary ? 'preliminary' : null} lede="a race is one pair. this is every strategy on the same pairs with a known shortest path, so you can see who is good and who got lucky.">
          <Numbers diff={diff} setDiff={setDiff} />
        </Section>
        <Section id="llms" label="llms play it too" tag={LLM?.preliminary || (LLM && BENCH?.preliminary) ? 'preliminary' : null} lede="the same game, handed to large language models: the page title and its links as text, pick one, repeat. how often they get there, and what each win costs.">
          <Llms diff={diff} setDiff={setDiff} />
        </Section>
        <Section id="writeup" label="how i built it" tag={BENCH?.preliminary ? 'preliminary' : null}>
          <ModelSection />
          <div className="lab-sub">
            <div className="lab-label">each one on a toy graph</div>
            <p className="lab-sub-lede">the same little graph, every strategy through it. a is the start, b is the target.</p>
          </div>
          <Diagrams />
        </Section>
        <footer className="lab-foot">
          the benchmark runs on <a href="https://snap.stanford.edu/data/wikispeedia.html" target="_blank" rel="noopener noreferrer">wikispeedia</a> by robert west and jure leskovec (stanford snap). live races read <a href="https://en.wikipedia.org" target="_blank" rel="noopener noreferrer">wikipedia</a>, text under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">cc by-sa 4.0</a>. no backend, every search and the model run in your browser.
        </footer>
      </div>
    </PageShell>
  );
}
