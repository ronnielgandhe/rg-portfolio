import { useState } from 'react';
import type { Strategy } from './pathfinder';
import { Arrow, TitleInput, Thumb, useSummary } from './ui';
import ClicksHero from '../../components/portfolio/heroes/ClicksHero';

export const EXAMPLES: [string, string][] = [
  ['Batman', 'Bank of England'],
  ['Pizza', 'Moon'],
  ['Taylor Swift', 'Roman Empire'],
  ['Penguin', 'Jazz'],
];

const POOL = [
  'Batman', 'Bank of England', 'Taylor Swift', 'Roman Empire', 'Coffee', 'Albert Einstein', 'Pizza', 'Moon', 'Penguin', 'Jazz',
  'Mount Everest', 'William Shakespeare', 'Tokyo', 'Chess', 'Volcano', 'The Beatles', 'Ancient Egypt', 'Basketball', 'Bitcoin',
  'Leonardo da Vinci', 'Octopus', 'Olympic Games', 'Star Wars', 'Black hole', 'Chocolate', 'Napoleon', 'Sushi', 'Internet',
  'Dinosaur', 'Formula One', 'Eiffel Tower', 'Harry Potter', 'Photosynthesis', 'Vikings', 'Hip hop music', 'Great Wall of China',
  'Banana', 'Shark', 'Mona Lisa', 'Apollo 11',
];

export function randomPair(): [string, string] {
  const a = POOL[Math.floor(Math.random() * POOL.length)];
  let b = a;
  while (b === a) b = POOL[Math.floor(Math.random() * POOL.length)];
  return [a, b];
}

export const LAB_HREF = '/how-many-clicks/lab';

const HOW = [
  { n: '1', title: 'it reads every link', text: 'for the page it is on, the bot pulls up to a thousand outgoing article links from the wikipedia api.' },
  { n: '2', title: 'it scores each one', text: 'word overlap with the target, a list of related terms, a bonus for hub pages like london or film, and a penalty for circling the same topic.' },
  { n: '3', title: 'it keeps the best few', text: 'a beam search: the top links go into a queue, it always opens the best scoring page next, and backs up when a branch dies.' },
];

function ExampleCard({ pair, onPick }: { pair: [string, string]; onPick: () => void }) {
  const a = useSummary(pair[0]);
  const b = useSummary(pair[1]);
  return (
    <button type="button" className="clk-example" onClick={onPick}>
      <span className="clk-example-thumbs">
        <Thumb src={a?.thumbnail} title={pair[0]} size={40} />
        <span className="clk-example-line" />
        <Thumb src={b?.thumbnail} title={pair[1]} size={40} />
      </span>
      <span className="clk-example-title">{pair[0]} <Arrow size={12} /> {pair[1]}</span>
    </button>
  );
}

export default function Start({ initial, strategies, error, onGo }: {
  initial: { from: string; to: string; strategy: string };
  strategies: Strategy[];
  error: string | null;
  onGo: (from: string, to: string, strategy: string) => void;
}) {
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [mode, setMode] = useState(strategies.some((s) => s.id === initial.strategy) ? initial.strategy : strategies[0].id);
  const ready = from.trim().length > 0 && to.trim().length > 0;
  const go = () => { if (ready) onGo(from.trim(), to.trim(), mode); };

  return (
    <div className="clk-view">
      <ClicksHero />

      <form className="clk-form" onSubmit={(e) => { e.preventDefault(); go(); }}>
        <div className="clk-pair">
          <TitleInput label="from" value={from} onChange={setFrom} placeholder="any article" autoFocus={!initial.from} />
          <span className="clk-pair-arrow"><Arrow size={18} /></span>
          <TitleInput label="to" value={to} onChange={setTo} placeholder="any other article" onEnter={go} />
        </div>
        <div className="clk-strats" role="radiogroup" aria-label="strategy">
          {strategies.map((st) => (
            <button key={st.id} type="button" role="radio" aria-checked={mode === st.id} className={mode === st.id ? 'clk-strat clk-strat-on' : 'clk-strat'} onClick={() => setMode(st.id)}>
              <span className="clk-strat-name">{st.name}</span>
              {st.blurb && <span className="clk-strat-blurb">{st.blurb}</span>}
            </button>
          ))}
        </div>
        <div className="clk-form-row">
          <a className="clk-quiet" href={LAB_HREF}>how the strategies compare</a>
          <span className="clk-grow" />
          <button type="button" className="st-btn" onClick={() => { const [a, b] = randomPair(); setFrom(a); setTo(b); }}>surprise me</button>
          <button type="submit" className="st-btn st-btn-primary" disabled={!ready}>go</button>
        </div>
        {error && <p className="clk-error" role="alert">{error}</p>}
      </form>

      <section className="clk-section">
        <div className="clk-label">or try one</div>
        <div className="clk-examples">
          {EXAMPLES.map((p) => (
            <ExampleCard key={p.join('>')} pair={p} onPick={() => { setFrom(p[0]); setTo(p[1]); onGo(p[0], p[1], mode); }} />
          ))}
        </div>
      </section>

      <section className="clk-section">
        <div className="clk-label">how the default bot thinks</div>
        <div className="clk-how">
          {HOW.map((h) => (
            <div key={h.n} className="clk-how-item">
              <div className="clk-how-n">{h.n}</div>
              <div className="clk-how-title">{h.title}</div>
              <p className="clk-how-text">{h.text}</p>
            </div>
          ))}
        </div>
        <p className="clk-small">two numbers come out the other end. prime clicks is the length of the path it found. total clicks is every page it opened to find it.</p>
      </section>
    </div>
  );
}
