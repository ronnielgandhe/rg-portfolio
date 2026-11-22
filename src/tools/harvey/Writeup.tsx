import { useEffect, useRef, useState } from 'react';
import Pipeline from './Pipeline';

export const REPO = 'https://github.com/ronnielgandhe/harvey';

const STEPS = [
  'you hit call. this page gets a token and joins a livekit room.',
  'the agent joins and says hello right away with a canned line, so you hear something before the llm is even warm.',
  'you talk. deepgram streams the transcript, vad and turn detection decide when you are done.',
  'claude either answers or looks up the statute first.',
  'the lookup sends the section back on the data channel, and this page opens it as a card.',
  'harvey talks, and the waveform up top is drawn from his actual audio.',
];

const CORPUS: [string, number][] = [
  ['ontario highway traffic act', 1100],
  ['canada criminal code', 785],
  ['ontario residential tenancies act', 392],
  ['ontario employment standards act', 359],
  ['controlled drugs and substances act', 69],
  ['cannabis act', 57],
  ['ontario consumer protection guides', 44],
];

function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: '0px 0px -12% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

function Corpus() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const max = CORPUS[0][1];
  return (
    <div ref={ref} className={`hv-corpus${seen ? ' hv-seen' : ''}`}>
      <div className="hv-corpus-head">
        <span className="hv-label">the corpus</span>
        <span className="hv-label">7 sources · 2,806 chunks</span>
      </div>
      {CORPUS.map(([name, n], i) => (
        <div key={name} className="hv-bar" style={{ ['--i' as string]: i }}>
          <div className="hv-bar-row">
            <span>{name}</span>
            <span className="hv-bar-n">{n.toLocaleString('en-US')}</span>
          </div>
          <div className="hv-bar-track"><div className="hv-bar-fill" style={{ width: `${(n / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export default function Writeup() {
  const [step, setStep] = useState(-1);
  return (
    <section className="hv-full hv-write" aria-label="how it works">
      <div className="hv-label">how it works</div>
      <div className="hv-write-body">
        <p className="hv-p">you hit call and the browser joins a livekit room. a python agent picks up: deepgram hears you, claude decides whether to answer or look up the law, elevenlabs talks back. the greeting fires the moment you connect, so you hear him before the model is even warm.</p>
        <p className="hv-p">legal questions go through two stage retrieval. a small model works out which statute you mean and rewrites the question, then chroma searches inside that source. plain similarity search kept missing things like "n12", which means nothing to an embedding and everything to a tenant.</p>
      </div>
      <div className="hv-pl-wrap">
        <Pipeline onStep={setStep} />
        <ol className="hv-steps">
          {STEPS.map((s, i) => (
            <li key={i} className={step === i ? 'hv-step-on' : ''}>{s}</li>
          ))}
        </ol>
      </div>
      <Corpus />
      <p className="hv-fine">not legal advice. he just sounds like it.</p>
    </section>
  );
}
