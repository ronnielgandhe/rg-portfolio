import { Ablations, DifficultyGrid, LossChart, ModelFacts } from './charts';
import Writeup from './Writeup';
import { BENCH, CODE, LLM, MODEL_NAME, WRITEUP, nameOf, splitWriteup, type BenchStrategy } from './data.ts';
import { num, pct } from './motion.ts';

const KEEP = /^(the data|the models|training|what worked|what did not)$/i;

const RENAMES: [RegExp, string][] = [
  [/\*\*my model, both ends\*\*/gi, `**${MODEL_NAME}**`],
  [/my model, both ends/gi, MODEL_NAME],
  [/the god model/gi, MODEL_NAME],
  [/\*\*my model\*\*/gi, '**the learned ranker**'],
  [/god mode's/gi, "the wide keyword beam's"],
  [/god mode/gi, 'the wide keyword beam'],
  [/both-ends search/gi, 'two-way search'],
  [/plain bidirectional/gi, 'plain two-way search'],
  [/bidirectional/gi, 'two-way search'],
  [/not my model/gi, 'not the model'],
  [/my model on top/gi, 'the model on top'],
  [/\bmy model\b/gi, 'the model'],
];

export function modelWriteup(md: string | null): string | null {
  const main = splitWriteup(md).main;
  if (!main) return null;
  const parts = main.split(/\n(?=## )/).filter((p) => KEEP.test((p.match(/^## (.*)$/m)?.[1] ?? '').trim()));
  if (!parts.length) return null;
  return RENAMES.reduce((t, [re, to]) => t.replace(re, to), parts.join('\n\n')).replace(/^\{\{chart:(leaderboard|tradeoff)\}\}$/gm, '');
}

const MD = modelWriteup(WRITEUP);
const get = (id: string) => BENCH?.strategies.find((s) => s.id === id);
const kb = (b: number) => `${Math.round(b / 1000)} kb`;
const thousands = (n: number) => n.toLocaleString('en-US');

function Facts() {
  const b = BENCH!;
  const flag = get('guided'), two = get('bidi'), solo = get('model');
  const rivals = ['keyword', 'god', 'hub'].map(get).filter((s): s is BenchStrategy => !!s);
  const best = rivals.sort((x, y) => y.overall.success - x.overall.success)[0];
  const rows: { label: string; value: string; text: string }[] = [];
  if (flag && two) {
    const cut = 1 - flag.overall.pagesOpenedMean / two.overall.pagesOpenedMean;
    rows.push({ label: 'on top of two-way search', value: `${Math.round(cut * 100)}%`, text: `fewer pages opened: ${num(flag.overall.pagesOpenedMean)} against ${num(two.overall.pagesOpenedMean)}, both solving ${pct(flag.overall.success)} of ${b.dataset.pairs} races` });
  }
  if (solo && best) {
    rows.push({ label: 'playing alone', value: pct(solo.overall.success), text: `of races solved by the learned ranker, against ${pct(best.overall.success)} for the best hand-written search (${nameOf(best.id, best.name)})` });
  }
  if (flag) rows.push({ label: 'path length', value: `+${num(flag.overall.clicksMean - flag.overall.optimalMean, 2)}`, text: `clicks over the true shortest path, on average` });
  return (
    <div className="lab-story-facts">
      {rows.map((r) => (
        <div key={r.label} className="lab-story-fact">
          <div className="lab-label">{r.label}</div>
          <div className="lab-fact-num">{r.value}</div>
          <div className="lab-fact-sub">{r.text}</div>
        </div>
      ))}
    </div>
  );
}

function Family() {
  const ids = ['guided-tiny', 'guided-base', 'guided-human', 'guided-imitate', 'model-tiny', 'model-base', 'model-human', 'model-imitate'];
  const rows = ids.map(get).filter((s): s is BenchStrategy => !!s);
  if (!rows.length) return null;
  return (
    <div className="lab-family" role="table" aria-label="model variants">
      <div className="lab-family-row lab-family-head" role="row">
        <span className="lab-label" role="columnheader">variant</span>
        <span className="lab-label" role="columnheader">solved</span>
        <span className="lab-label" role="columnheader">pages opened</span>
        <span className="lab-label" role="columnheader">over shortest</span>
      </div>
      {rows.map((s) => (
        <div key={s.id} className={`lab-family-row${s.id === 'guided-human' ? ' lab-family-on' : ''}`} role="row">
          <span role="cell">{nameOf(s.id, s.name)}{s.id === 'guided-human' && <em>shipped</em>}</span>
          <span className="lab-val" role="cell">{pct(s.overall.success)}</span>
          <span className="lab-val" role="cell">{num(s.overall.pagesOpenedMean)}</span>
          <span className="lab-val" role="cell">+{num(s.overall.clicksOverOptimal, 2)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ModelStory() {
  const m = BENCH?.model;
  if (!BENCH || !m) return <div className="lab-empty">the model write-up lands here when the benchmark finishes.</div>;
  const d = BENCH.dataset as typeof BENCH.dataset & { links?: number; humanPaths?: number; citations?: string[] };
  const mx = m as typeof m & { totalSeconds?: number; humanClicks?: { train: number } };
  const charts = {
    loss: <LossChart model={m} />,
    ablations: <Ablations model={m} />,
    difficulty: <DifficultyGrid bench={BENCH} />,
  };
  return (
    <div className="lab-story">
      <div className="lab-story-lead">
        <p>
          <strong>{MODEL_NAME}</strong> is the bot you just watched, and the default. it is a small model i trained to answer one question: standing on this link, how many clicks away is the target? the search then opens whatever looks closest, from both ends at once.
        </p>
        <p>
          it learned on <a href={d.url} target="_blank" rel="noopener noreferrer">wikispeedia</a>, a frozen {thousands(d.articles)}-article slice of wikipedia from stanford{d.links ? ` with all ${thousands(d.links)} links` : ''}, the true shortest path between every pair{d.humanPaths ? `, and ${thousands(d.humanPaths)} games real people finished` : ''}. articles are split by article, so every test race below is between pages the model never saw.
        </p>
        <p>
          {thousands(m.params)} parameters, {kb(m.sizeBytes)} of weights. trained with numpy on my laptop, no gpu, in {Math.round(m.trainSeconds)} seconds{mx.totalSeconds ? ` (${Math.round(mx.totalSeconds)} for the whole script, every variant and ablation included)` : ''}, on {thousands(m.trainPairs)} shortest-path examples{mx.humanClicks ? ` and then ${thousands(mx.humanClicks.train)} real player clicks` : ''}. it runs in your browser as plain typescript.
        </p>
        <p>
          the honest read: searching from both ends does most of the work. plain two-way search, no model, already solves every race. {MODEL_NAME} on top opens fewer pages and finds the true shortest path a little more often. where the model clearly wins is playing alone, against the hand-written heuristics.
        </p>
      </div>
      <Facts />
      <ModelFacts model={m} />
      {MD && <Writeup md={MD} charts={charts} />}
      <div className="lab-sub">
        <div className="lab-label">the family</div>
        <p className="lab-sub-lede">four sizes and training recipes, each tried two ways: guiding the two-way search, and playing alone as the learned ranker. which model guides both ends barely matters.</p>
      </div>
      <Family />
      <p className="lab-prior">
        <span className="lab-label">related work</span>
        <span>
          the game and data come from {(d.citations ?? []).map((c, i) => <span key={c}>{i > 0 && '; '}{c.toLowerCase().replace(/\.$/, '')}</span>)}.
          {LLM?.priorWork?.length ? <> language models on the same game have been studied in {LLM.priorWork.map((p, i) => <span key={p.url}>{i > 0 && ', '}<a href={p.url} target="_blank" rel="noopener noreferrer">{p.name}</a></span>)}.</> : null}
        </span>
      </p>
      <div className="lab-links">
        <a href={CODE.strategies} target="_blank" rel="noopener noreferrer">the strategies, in typescript</a>
        <a href={CODE.page} target="_blank" rel="noopener noreferrer">this page's code</a>
        <a href={d.url} target="_blank" rel="noopener noreferrer">the wikispeedia dataset</a>
      </div>
    </div>
  );
}
