import type { RaceEvent, Scored, Side, Strategy } from './pathfinder';

export interface StrategyInfo { id: string; name: string; blurb: string }

export interface RaceState {
  from: string;
  to: string;
  strategy: StrategyInfo;
  start: string;
  target: string;
  chain: string[];
  backChain: string[];
  current: string | null;
  side: Side;
  linkCount: number | null;
  ranked: Scored[];
  rankedFor: string | null;
  selected: string[];
  considering: number;
  chosen: string | null;
  stuck: boolean;
  explored: number;
  deadEnds: number;
  backTo: { title: string; n: number } | null;
  skipped: number;
  status: string;
  startedAt: number;
  finishedAt: number | null;
  outcome: 'running' | 'found' | 'not_found' | 'error';
  path: string[] | null;
  error: string | null;
}

export function initialRace(from: string, to: string, s: Strategy): RaceState {
  return {
    from, to, strategy: { id: s.id, name: s.name, blurb: s.blurb }, start: from, target: to, chain: [], backChain: [],
    current: null, side: 'forward', linkCount: null, ranked: [], rankedFor: null, selected: [], considering: -1, chosen: null, stuck: false,
    explored: 0, deadEnds: 0, backTo: null, skipped: 0, status: 'looking up both articles', startedAt: Date.now(),
    finishedAt: null, outcome: 'running', path: null, error: null,
  };
}

const isExtension = (prev: string[], next: string[]) =>
  next.length === prev.length + 1 && prev.every((p, i) => p === next[i]);

export interface BackInfo { page: string; path: string[]; count: number | null; ranked?: Scored[] }
export type IncomingEvent = RaceEvent & { back?: BackInfo };

const targetFirst = (path: string[], target: string) =>
  path.length > 1 && path[path.length - 1] === target && path[0] !== target ? [...path].reverse() : path;

export function raceReducer(s: RaceState, e: IncomingEvent): RaceState {
  switch (e.type) {
    case 'status': {
      const b = e.back;
      if (!b) return { ...s, status: e.message };
      const path = targetFirst(b.path, s.target);
      const moved = s.current !== b.page || s.side !== 'backward';
      return {
        ...s,
        backChain: path,
        current: b.page,
        side: 'backward',
        linkCount: b.count,
        ranked: b.ranked ?? s.ranked,
        rankedFor: b.ranked ? b.page : s.rankedFor,
        selected: b.ranked ? b.ranked.map((r) => r.title) : s.selected,
        considering: moved ? -1 : s.considering,
        chosen: moved ? null : s.chosen,
        status: e.message,
      };
    }
    case 'resolved':
      return { ...s, start: e.start, target: e.target, chain: [e.start], status: `racing from ${e.start} to ${e.target}` };
    case 'visiting': {
      const side: Side = e.side === 'backward' ? 'backward' : 'forward';
      if (side === 'backward') e = { ...e, path: targetFirst(e.path, s.target) };
      const prev = side === 'backward' ? s.backChain : s.chain;
      const back = prev.length > 1 && s.current !== null && !isExtension(prev, e.path);
      let common = 0;
      while (common < prev.length && prev[common] === e.path[common]) common++;
      const anchor = e.path[Math.max(0, common - 1)];
      const from = side === 'backward' ? ' from the target end' : '';
      return {
        ...s,
        chain: side === 'forward' ? e.path : s.chain,
        backChain: side === 'backward' ? e.path : s.backChain,
        current: e.page,
        side,
        explored: e.totalExplored,
        linkCount: null,
        considering: -1,
        chosen: null,
        stuck: false,
        deadEnds: back ? s.deadEnds + 1 : s.deadEnds,
        backTo: back ? { title: anchor, n: s.deadEnds + 1 } : s.backTo,
        status: back ? `that branch went cold. back to ${anchor}, trying ${e.page}${from}` : `opening ${e.page}${from}`,
      };
    }
    case 'links_found':
      return { ...s, linkCount: e.count, status: `${e.count} links on ${e.page}. reading them` };
    case 'scored':
      return {
        ...s,
        ranked: e.ranked,
        rankedFor: e.page,
        selected: e.selected,
        stuck: e.stuck,
        status: e.unvisited === 0 ? 'every link here is already seen' : e.stuck ? 'nothing scores well here. widening to general pages' : `scored ${e.unvisited} new links, keeping the best ${new Set(e.selected).size}`,
      };
    case 'considering':
      return { ...s, considering: e.index, status: `weighing ${e.link}` };
    case 'clicking':
      return { ...s, chosen: e.link, considering: -1, status: `best lead: ${e.link}` };
    case 'skipped':
      return { ...s, skipped: s.skipped + 1, status: `could not load ${e.page}, moving on` };
    case 'found':
      return { ...s, outcome: 'found', path: e.path, chain: e.path, backChain: [], side: 'forward', explored: e.totalExplored, finishedAt: Date.now(), current: e.path[e.path.length - 1], status: `found ${e.path[e.path.length - 1]}` };
    case 'not_found':
      return { ...s, outcome: 'not_found', explored: e.totalExplored, finishedAt: Date.now(), status: 'out of pages' };
    case 'error':
      return { ...s, outcome: 'error', error: e.message, finishedAt: Date.now(), status: e.message };
  }
}
