import { BENCHES, PRICING, SOURCES, fmtDate } from './data';

const MISSING = [
  { what: 'LMArena text arena', why: 'the public data repo has no license file and its last drop is from dec 2025, so it is linked, not copied.', href: 'https://lmarena.ai/leaderboard' },
  { what: 'official SWE-bench leaderboard', why: 'its site data is CC BY-NC. the SWE-bench Verified numbers here come from epoch\'s own runs instead, under CC BY.', href: 'https://www.swebench.com' },
  { what: 'MTEB embeddings', why: 'results are published per task, not as one leaderboard file. not rolled up here yet.', href: 'https://huggingface.co/spaces/mteb/leaderboard' },
  { what: 'Open TTS leaderboard (WER, speed)', why: 'its results dataset needs a login. TTS Arena covers voices by listener votes instead.', href: 'https://huggingface.co/spaces/hf-audio/open_tts_leaderboard' },
  { what: 'Artificial Analysis direct API', why: 'the open endpoint is gone (410). their index is read from the field openrouter publishes.', href: 'https://artificialanalysis.ai' },
];

export default function Sources() {
  return (
    <div className="bx-sources">
      <div className="bx-src-table" role="table" aria-label="benchmarks and sources">
        <div className="bx-src-row bx-row-head" role="row">
          <span role="columnheader">benchmark</span>
          <span role="columnheader">measures</span>
          <span role="columnheader">data</span>
          <span role="columnheader">matched</span>
          <span role="columnheader">license</span>
        </div>
        {BENCHES.map((b) => (
          <div key={b.id} className="bx-src-row" role="row">
            <span className="bx-src-name"><a href={b.url} target="_blank" rel="noopener noreferrer" className="bx-link">{b.name}</a><span className="bx-name-sub">{SOURCES.find((s) => s.id === b.source)?.name}</span></span>
            <span>{b.measures} <span className="bx-faint">{b.metric}, {b.higherIsBetter ? 'higher is better' : 'lower is better'}.</span></span>
            <span className="bx-tab">{fmtDate(b.date)}</span>
            <span className="bx-tab">{b.stats.matchRate === null ? `${b.stats.models} rows, own names` : `${Math.round(b.stats.matchRate * 100)}% of ${b.stats.rawRows} rows`}</span>
            <span>{SOURCES.find((s) => s.id === b.source)?.license}</span>
          </div>
        ))}
      </div>

      <div className="bx-method">
        <div>
          <span className="bx-label">how it is put together</span>
          <p>prices are {PRICING.source} list prices per 1M tokens, pulled {fmtDate(PRICING.date)}. the base variant only: cache reads, batch and free tiers are ignored. the scatter uses a blended price of 3 input tokens to 1 output token.</p>
          <p>every benchmark row is joined to a model with an explicit alias list plus a careful name cleanup (dates, reasoning settings and spacing). anything that does not join cleanly stays unjoined and shows as not priced. a wrong join is worse than a missing one.</p>
          <p>when a source ran a model more than once (reasoning effort, agent harness, prompt mode), the best run is shown and the setting is named next to it. speech systems keep their own names and have no token price, so they sit in their own section.</p>
          <p>refresh with <code>node scripts/bench-sync.mjs</code>. every score carries the id of the source it came from.</p>
        </div>
        <div>
          <span className="bx-label">what is missing</span>
          <ul className="bx-missing">
            {MISSING.map((x) => (
              <li key={x.what}><a href={x.href} target="_blank" rel="noopener noreferrer" className="bx-link">{x.what}</a>. {x.why}</li>
            ))}
          </ul>
          <span className="bx-label bx-gap">sources</span>
          <ul className="bx-missing">
            {SOURCES.map((s) => (
              <li key={s.id}><a href={s.home} target="_blank" rel="noopener noreferrer" className="bx-link">{s.name}</a>. {s.role}. {s.license}.</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
