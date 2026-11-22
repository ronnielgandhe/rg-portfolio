import type { Scored } from '../pathfinder.ts';
import type { LabEvent, RunOpts } from './types.ts';
import { Fetcher, begin, found, makeSleep, normalize, notFound, withClicks } from './common.ts';

export interface Node { title: string; path: string[]; score: number; priority: number }

export type Scorer = (links: string[], current: Node) => number[];

export interface BestFirstCfg {
  beam: number;
  budget: number;
  depthCost: number;
  thinkDelay: number;
  clickDelay: number;
  prepare: (start: string, target: string, opts: RunOpts) => Promise<Scorer>;
  clicksOf?: (score: number) => number;
}

export function bestFirst(cfg: BestFirstCfg) {
  return async (startQuery: string, targetQuery: string, onStep: (e: LabEvent) => void, opts: RunOpts) => {
    const sleep = makeSleep(opts);
    const ok = await begin(startQuery, targetQuery, onStep, opts);
    if (!ok) return { path: null, totalExplored: 0 };
    const { wiki, start, target } = ok;
    if (normalize(start) === normalize(target)) return found(onStep, [start], 0);

    let score: Scorer;
    try {
      score = await cfg.prepare(start, target, opts);
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err;
      onStep({ type: 'error', message: 'could not load the model weights.' });
      return { path: null, totalExplored: 0 };
    }

    const fetcher = new Fetcher(wiki, onStep, opts.signal);
    const nt = normalize(target);
    const visited = new Set([normalize(start)]);
    let open: Node[] = [{ title: start, path: [start], score: 0, priority: 0 }];
    let totalExplored = 0;

    while (open.length > 0 && totalExplored < cfg.budget) {
      totalExplored++;
      const current = open.shift()!;
      onStep({ type: 'visiting', page: current.title, path: current.path, totalExplored });
      await sleep(cfg.thinkDelay);

      const links = await fetcher.get('links', current.title);
      if (links === 'fatal') return { path: null, totalExplored };
      if (!links) continue;
      onStep({ type: 'links_found', page: current.title, count: links.length, totalExplored });
      await sleep(cfg.thinkDelay);
      if (links.some((l) => normalize(l) === nt)) return found(onStep, [...current.path, target], totalExplored + 1);

      const fresh = [...new Set(links)].filter((l) => !visited.has(normalize(l)));
      const scores = score(fresh, current);
      const depth = current.path.length;
      const kids: Node[] = fresh
        .map((title, i) => ({ title, path: [...current.path, title], score: scores[i], priority: scores[i] - cfg.depthCost * depth }))
        .sort((a, b) => b.score - a.score);
      const selected = kids.slice(0, cfg.beam);
      const ranked: Scored[] = kids.slice(0, Math.max(cfg.beam, 8) + 6).map((k) => withClicks(k.title, k.score, cfg.clicksOf));
      onStep({ type: 'scored', page: current.title, ranked, selected: selected.map((s) => s.title), stuck: false, unvisited: kids.length });

      for (let i = 0; i < Math.min(4, kids.length); i++) {
        onStep({ type: 'considering', link: kids[i].title, score: Math.round(kids[i].score), index: i });
        await sleep(cfg.thinkDelay);
      }

      for (const k of selected) {
        visited.add(normalize(k.title));
        open.push(k);
      }
      open.sort((a, b) => b.priority - a.priority);
      open = open.slice(0, cfg.beam * 5);

      if (open.length > 0) {
        onStep({ type: 'clicking', link: open[0].title, path: open[0].path, totalExplored });
        await sleep(cfg.clickDelay);
      }
    }
    return notFound(onStep, totalExplored);
  };
}
