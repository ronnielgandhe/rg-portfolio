import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import PageShell from '../../components/portfolio/PageShell';
import { BUILTIN_STRATEGIES, type StepEvent, type Strategy } from './pathfinder';
import { findStrategy, loadStrategies, pickStrategy } from './registry';
import { initialRace, raceReducer, type RaceState } from './raceState';
import Start from './Start';
import Race, { PACE, type Speed } from './Race';
import Result from './Result';
import Play from './Play';
import { CLICKS_CSS } from './styles';
import ClicksHero from '../../components/portfolio/heroes/ClicksHero';
import Rows, { Breakdown, ROWS_CSS } from './lab/Rows';
import { LAB_CSS, LAB_CSS_2 } from './lab/styles';

const toPlay = (smooth = false) => {
  const el = document.getElementById('play');
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 72;
  if (Math.abs(window.scrollY - y) > 4) window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
};

type Phase = 'start' | 'race' | 'result' | 'play';
interface Form { from: string; to: string; strategy: string }

function readParams(): Form {
  const q = new URLSearchParams(location.search);
  if (q.has('race') || q.has('a') || q.has('b')) return { from: '', to: '', strategy: '' };
  const strategy = q.get('strategy') ?? (q.get('mode') === 'god' ? 'beam-god' : '');
  return { from: q.get('from') ?? '', to: q.get('to') ?? '', strategy };
}

function writeParams(p: Form | null) {
  const url = new URL(location.href);
  url.search = p ? new URLSearchParams({ from: p.from, to: p.to, strategy: p.strategy }).toString() : '';
  history.replaceState(null, '', url);
}

type Action = { kind: 'reset'; state: RaceState } | { kind: 'event'; e: StepEvent };

function reducer(s: RaceState | null, a: Action): RaceState | null {
  if (a.kind === 'reset') return a.state;
  return s ? raceReducer(s, a.e) : s;
}

export default function ClicksPage() {
  const [phase, setPhase] = useState<Phase>('start');
  const [strategies, setStrategies] = useState<Strategy[]>(BUILTIN_STRATEGIES);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<Form>({ from: '', to: '', strategy: 'guided' });
  const [race, dispatch] = useReducer(reducer, null);
  const [speed, setSpeed] = useState<Speed>('quick');
  const [startError, setStartError] = useState<string | null>(null);
  const speedRef = useRef(speed);
  const ctlRef = useRef<AbortController | null>(null);
  speedRef.current = speed;

  const go = useCallback((from: string, to: string, strategy: Strategy) => {
    ctlRef.current?.abort();
    const ctl = new AbortController();
    ctlRef.current = ctl;
    const f = { from, to, strategy: strategy.id };
    setForm(f);
    setStartError(null);
    writeParams(f);
    dispatch({ kind: 'reset', state: initialRace(from, to, strategy) });
    setPhase('race');
    toPlay();
    const onStep = (e: StepEvent) => {
      if (ctl.signal.aborted) return;
      if (e.type === 'error') { ctl.abort(); setStartError(e.message); writeParams(null); setPhase('start'); return; }
      dispatch({ kind: 'event', e });
    };
    Promise.resolve()
      .then(() => strategy.run(from, to, onStep, { signal: ctl.signal, pace: () => PACE[speedRef.current] }))
      .then(() => {
        if (ctl.signal.aborted) return;
        setTimeout(() => { if (!ctl.signal.aborted) { setPhase('result'); toPlay(true); } }, 1100);
      })
      .catch((err) => {
        if (ctl.signal.aborted || err?.name === 'AbortError') return;
        console.error(err);
        ctl.abort();
        setStartError('the search crashed partway through. try again, or pick another strategy.');
        setPhase('start');
      });
  }, []);

  useEffect(() => {
    let live = true;
    const p = readParams();
    loadStrategies().then((list) => {
      if (!live) return;
      setStrategies(list);
      setLoaded(true);
      const s = pickStrategy(list, p.strategy);
      if (p.from && p.to) go(p.from, p.to, s);
      else setForm({ ...p, strategy: s.id });
    });
    return () => { live = false; ctlRef.current?.abort(); };
  }, [go]);

  const stop = () => { ctlRef.current?.abort(); writeParams(null); setPhase('start'); };
  const fresh = () => { ctlRef.current?.abort(); writeParams(null); setForm({ from: '', to: '', strategy: form.strategy }); setPhase('start'); toPlay(); };
  const flagship = findStrategy(strategies, 'guided');

  return (
    <PageShell activePage="projects" crumb="how many clicks" back={{ href: '/projects', label: 'projects' }} wide>
      <style>{CLICKS_CSS}</style>
      <style>{LAB_CSS + LAB_CSS_2}</style>
      <ClicksHero />
      <style>{ROWS_CSS}</style>
      <div className="site-col clk lab">
        <section id="play" className="lab-sec lab-sec-first" aria-label="the game">
          {phase === 'start' && loaded && (
            <Start key={`${form.from}>${form.to}>${strategies.length}`} initial={form} strategies={strategies} error={startError} onGo={(a, b, id) => go(a, b, pickStrategy(strategies, id))} />
          )}
          {phase === 'race' && race && <Race race={race} speed={speed} onSpeed={setSpeed} onStop={stop} />}
          {phase === 'result' && race && race.outcome !== 'error' && (
            <Result
              race={race}
              onPlay={() => { setPhase('play'); toPlay(); }}
              onNew={fresh}
              retry={flagship && race.strategy.id !== flagship.id ? { label: `try ${flagship.name}`, run: () => go(race.start, race.target, flagship) } : null}
            />
          )}
          {phase === 'play' && race?.path && (
            <Play start={race.start} target={race.target} botPath={race.path} botTotal={race.explored} onGiveUp={() => { setPhase('result'); toPlay(); }} onNew={fresh} />
          )}
        </section>
        <Breakdown />
        <Rows />
        <footer className="clk-foot lab-foot">
          articles, summaries and images come from wikipedia, text under cc by-sa 4.0. benchmark data is wikispeedia by robert west and jure leskovec (stanford snap).
        </footer>
      </div>
    </PageShell>
  );
}
