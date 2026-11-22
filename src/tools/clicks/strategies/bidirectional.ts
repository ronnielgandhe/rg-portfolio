import type { Scored } from '../pathfinder.ts';
import type { LabEvent, RunOpts, Side, Strategy } from './types.ts';
import { Fetcher, begin, extractWords, found, makeSleep, normalize, notFound, withClicks } from './common.ts';
import { buildRelatedTerms, keywordScore } from './keyword.ts';

interface Entry { title: string; parent: string | null; depth: number; score: number; priority: number }

type Order = (side: Side, titles: string[]) => number[];

interface BidiCfg {
  budget: number;
  depthCost: number | null;
  thinkDelay: number;
  clickDelay: number;
  prepare: (start: string, target: string, opts: RunOpts) => Promise<Order>;
  clicksOf?: (score: number) => number;
}

export const BACKLINK_CAP = 1000;

function trace(map: Map<string, Entry>, key: string) {
  const out: string[] = [];
  for (let k: string | null = key; k !== null; k = map.get(k)!.parent) out.push(map.get(k)!.title);
  return out;
}

export function bidirectional(cfg: BidiCfg) {
  return async (startQuery: string, targetQuery: string, onStep: (e: LabEvent) => void, opts: RunOpts) => {
    const sleep = makeSleep(opts);
    const ok = await begin(startQuery, targetQuery, onStep, opts);
    if (!ok) return { path: null, totalExplored: 0 };
    const { wiki, start, target } = ok;
    if (normalize(start) === normalize(target)) return found(onStep, [start], 0);

    let order: Order;
    try {
      order = await cfg.prepare(start, target, opts);
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err;
      onStep({ type: 'error', message: 'could not load the model weights.' });
      return { path: null, totalExplored: 0 };
    }

    const fetcher = new Fetcher(wiki, onStep, opts.signal);
    const sides: Record<Side, { map: Map<string, Entry>; queue: Entry[] }> = {
      forward: { map: new Map(), queue: [] },
      backward: { map: new Map(), queue: [] },
    };
    const seed = (side: Side, title: string) => {
      const e = { title, parent: null, depth: 0, score: 0, priority: 0 };
      sides[side].map.set(normalize(title), e);
      sides[side].queue.push(e);
    };
    seed('forward', start);
    seed('backward', target);
    const frontier = () => ({ forward: sides.forward.queue.length, backward: sides.backward.queue.length });
    const prio = (depth: number, score: number) => (cfg.depthCost === null ? -depth * 1e6 + score : score - cfg.depthCost * depth);
    let totalExplored = 0;

    while (totalExplored < cfg.budget && (sides.forward.queue.length || sides.backward.queue.length)) {
      const f = sides.forward.queue.length, b = sides.backward.queue.length;
      const side: Side = b === 0 || (f > 0 && f <= b) ? 'forward' : 'backward';
      const other: Side = side === 'forward' ? 'backward' : 'forward';
      const me = sides[side], them = sides[other];
      const node = me.queue.shift()!;
      const key = normalize(node.title);
      totalExplored++;

      const myPath = side === 'forward' ? trace(me.map, key).reverse() : trace(me.map, key);
      if (side === 'forward') onStep({ type: 'visiting', page: node.title, path: myPath, totalExplored, side, frontier: frontier() });
      else onStep({ type: 'status', message: `working backward: who links to ${node.title}?`, side, frontier: frontier(), back: { page: node.title, path: myPath, count: null } });
      await sleep(cfg.thinkDelay);

      const raw = await fetcher.get(side === 'forward' ? 'links' : 'backlinks', node.title);
      if (raw === 'fatal') return { path: null, totalExplored };
      if (!raw) continue;
      const nbrs = [...new Set(raw)].slice(0, side === 'backward' ? BACKLINK_CAP : undefined);
      if (side === 'forward') onStep({ type: 'links_found', page: node.title, count: nbrs.length, totalExplored, side, frontier: frontier() });
      else onStep({ type: 'status', message: `${nbrs.length.toLocaleString()} pages link to ${node.title}`, side, frontier: frontier(), back: { page: node.title, path: myPath, count: nbrs.length } });

      let best: { n: string; len: number } | null = null;
      for (const n of nbrs) {
        const hit = them.map.get(normalize(n));
        if (hit && (!best || hit.depth < best.len)) best = { n, len: hit.depth };
      }
      if (best) {
        const nk = normalize(best.n);
        const fwd = side === 'forward' ? [...myPath, ...trace(them.map, nk)] : [...trace(them.map, nk).reverse(), ...myPath];
        const path = fwd.filter((t, i) => i === 0 || normalize(t) !== normalize(fwd[i - 1]));
        return found(onStep, path, totalExplored + 1, { side, meet: best.n, frontier: frontier() });
      }

      const fresh = nbrs.filter((n) => !me.map.has(normalize(n)));
      const scores = order(side, fresh);
      const added: Entry[] = fresh.map((title, i) => ({ title, parent: key, depth: node.depth + 1, score: scores[i], priority: prio(node.depth + 1, scores[i]) }));
      for (const e of added) {
        me.map.set(normalize(e.title), e);
        me.queue.push(e);
      }
      me.queue.sort((x, y) => y.priority - x.priority);

      added.sort((x, y) => y.score - x.score);
      const ranked: Scored[] = added.slice(0, 14).map((e) => withClicks(e.title, e.score, cfg.clicksOf));
      if (side === 'forward') {
        onStep({ type: 'scored', page: node.title, ranked, selected: ranked.map((r) => r.title), stuck: false, unvisited: added.length, side, frontier: frontier() });
        for (let i = 0; i < Math.min(3, ranked.length); i++) {
          onStep({ type: 'considering', link: ranked[i].title, score: ranked[i].score, index: i, side });
          await sleep(cfg.thinkDelay);
        }
        const next = me.queue[0];
        if (next) {
          onStep({ type: 'clicking', link: next.title, path: [...trace(me.map, normalize(next.title))].reverse(), totalExplored, side, frontier: frontier() });
          await sleep(cfg.clickDelay);
        }
      } else {
        onStep({ type: 'status', message: `${added.length.toLocaleString()} new pages on the backward side`, side, frontier: frontier(), back: { page: node.title, path: myPath, count: nbrs.length, ranked } });
        await sleep(cfg.clickDelay);
      }
    }
    return notFound(onStep, totalExplored);
  };
}

export const bidi: Strategy = {
  id: 'bidi',
  name: 'bidirectional',
  blurb: 'searches forward from the start and backward from the target until the two meet.',
  explain: 'two searches at once. one walks forward from the start reading each page\'s links, the other walks backward from the target reading "what links here". every new page gets checked against the other side, and the moment they touch, that is the path. it always grows whichever frontier is smaller and finishes each layer before the next, so the paths come out near shortest. inside a layer it tries the most target-sounding titles first. 200 page budget, counting both sides.',
  shape: 'meet',
  budget: 200,
  run: bidirectional({
    budget: 200, depthCost: null, thinkDelay: 80, clickDelay: 150,
    prepare: async (start, target) => {
      const toT = buildRelatedTerms(extractWords(target));
      const toS = buildRelatedTerms(extractWords(start));
      return (side, titles) => titles.map((t) => (side === 'forward' ? keywordScore(t, target, toT, []) : keywordScore(t, start, toS, [])));
    },
  }),
};
