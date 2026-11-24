import type { LabEvent, RunOpts, Strategy } from './types.ts';
import { Fetcher, begin, found, makeSleep, normalize, notFound, rng } from './common.ts';

const BUDGET = 200;

async function run(startQuery: string, targetQuery: string, onStep: (e: LabEvent) => void, opts: RunOpts) {
  const sleep = makeSleep(opts);
  const ok = await begin(startQuery, targetQuery, onStep, opts);
  if (!ok) return { path: null, totalExplored: 0 };
  const { wiki, start, target } = ok;
  if (normalize(start) === normalize(target)) return found(onStep, [start], 0);

  const rand = rng(opts.seed ?? Date.now());
  const fetcher = new Fetcher(wiki, onStep, opts.signal);
  const nt = normalize(target);
  const seen = new Set([normalize(start)]);
  const path = [start];
  let totalExplored = 0;

  while (totalExplored < BUDGET && path.length > 0) {
    totalExplored++;
    const page = path[path.length - 1];
    onStep({ type: 'visiting', page, path: [...path], totalExplored });
    await sleep(120);
    const links = await fetcher.get('links', page);
    if (links === 'fatal') return { path: null, totalExplored };
    if (links) {
      onStep({ type: 'links_found', page, count: links.length, totalExplored });
      if (links.some((l) => normalize(l) === nt)) return found(onStep, [...path, target], totalExplored + 1);
    }
    const fresh = (links ?? []).filter((l) => !seen.has(normalize(l)));
    if (fresh.length === 0) {
      path.pop();
      continue;
    }
    const pick = fresh[Math.floor(rand() * fresh.length)];
    const shown = [pick, ...fresh.filter((l) => l !== pick).slice(0, 7)];
    onStep({ type: 'scored', page, ranked: shown.map((title, i) => ({ title, score: i === 0 ? 1 : 0 })), selected: [pick], stuck: false, unvisited: fresh.length });
    seen.add(normalize(pick));
    path.push(pick);
    onStep({ type: 'clicking', link: pick, path: [...path], totalExplored });
    await sleep(200);
  }
  return notFound(onStep, totalExplored);
}

export const random: Strategy = {
  id: 'random',
  name: 'random walk',
  blurb: 'clicks a random unseen link every time. the floor everything else has to beat.',
  explain: 'no brain at all. it opens a page, checks whether the target is linked right there, and if not clicks a random link it has not seen yet. dead end, it backs up one page. it gets 200 pages. every other strategy is only interesting by how far it beats this.',
  shape: 'walk',
  budget: BUDGET,
  run,
};
