import type { LabEvent, Side } from '../strategies/types.ts';

export interface GNode {
  key: string;
  title: string;
  side: Side;
  depth: number;
  parent: string | null;
  order: number;
  opened: boolean;
}

export type Outcome = 'idle' | 'running' | 'found' | 'not_found' | 'error' | 'stopped';

export interface Lane {
  status: string;
  start: string;
  target: string;
  nodes: Record<string, GNode>;
  count: number;
  current: string | null;
  currentSide: Side;
  trail: string[];
  opened: number;
  depth: number;
  frontier: { forward: number; backward: number } | null;
  links: number | null;
  outcome: Outcome;
  path: string[] | null;
  pathKeys: string[];
  meet: string | null;
  startedAt: number;
  finishedAt: number | null;
  error: string | null;
}

const MAX_NODES = 520;
const norm = (t: string) => t.toLowerCase().replace(/_/g, ' ').trim();
export const nodeKey = (side: Side, title: string) => `${side[0]}:${norm(title)}`;

export function initialLane(from: string, to: string): Lane {
  return {
    status: 'looking up both articles', start: from, target: to, nodes: {}, count: 0, current: null, currentSide: 'forward', trail: [],
    opened: 0, depth: 0, frontier: null, links: null, outcome: 'running', path: null, pathKeys: [], meet: null,
    startedAt: Date.now(), finishedAt: null, error: null,
  };
}

function put(nodes: Record<string, GNode>, count: number, side: Side, chain: string[], openLast: boolean): number {
  let parent: string | null = null;
  chain.forEach((title, depth) => {
    const key = nodeKey(side, title);
    const have = nodes[key];
    const opened = (openLast && depth === chain.length - 1) || depth < chain.length - 1;
    if (!have) {
      if (count >= MAX_NODES && !opened) return;
      nodes[key] = { key, title, side, depth, parent, order: count++, opened };
    } else if (opened && !have.opened) {
      nodes[key] = { ...have, opened: true };
    }
    parent = key;
  });
  return count;
}

function ghosts(nodes: Record<string, GNode>, count: number, side: Side, parentTitle: string, titles: string[], limit: number): number {
  const pk = nodeKey(side, parentTitle);
  const p = nodes[pk];
  if (!p) return count;
  for (const t of titles.slice(0, limit)) {
    const key = nodeKey(side, t);
    if (nodes[key] || count >= MAX_NODES) continue;
    nodes[key] = { key, title: t, side, depth: p.depth + 1, parent: pk, order: count++, opened: false };
  }
  return count;
}

export function laneReducer(s: Lane, e: LabEvent): Lane {
  if (s.outcome !== 'running') return s;
  const frontier = e.frontier ?? s.frontier;
  switch (e.type) {
    case 'status': {
      if (e.back) {
        const nodes = { ...s.nodes };
        const chain = [...e.back.path].reverse();
        let count = put(nodes, s.count, 'backward', chain, true);
        if (e.back.ranked) count = ghosts(nodes, count, 'backward', e.back.page, e.back.ranked.map((r) => r.title), 6);
        const opened = s.nodes[nodeKey('backward', e.back.page)]?.opened ? s.opened : s.opened + (e.back.count === null ? 1 : 0);
        return { ...s, nodes, count, frontier, status: e.message, current: e.back.page, currentSide: 'backward', trail: chain, opened, depth: Math.max(s.depth, chain.length - 1), links: e.back.count ?? s.links };
      }
      return { ...s, status: e.message, frontier };
    }
    case 'resolved': {
      const nodes: Record<string, GNode> = {};
      let count = put(nodes, 0, 'forward', [e.start], false);
      count = put(nodes, count, 'backward', [e.target], false);
      return { ...s, start: e.start, target: e.target, nodes, count, status: 'starting the search' };
    }
    case 'visiting': {
      const nodes = { ...s.nodes };
      const count = put(nodes, s.count, 'forward', e.path, true);
      return { ...s, nodes, count, frontier, current: e.page, currentSide: 'forward', trail: e.path, opened: e.totalExplored, depth: Math.max(s.depth, e.path.length - 1), status: `reading ${e.page}` };
    }
    case 'links_found':
      return { ...s, frontier, links: e.count, status: `${e.count.toLocaleString()} links on ${e.page}` };
    case 'scored': {
      const nodes = { ...s.nodes };
      const count = ghosts(nodes, s.count, 'forward', e.page, e.selected, 6);
      return { ...s, nodes, count, frontier };
    }
    case 'clicking':
      return { ...s, frontier, status: `next up: ${e.link}` };
    case 'skipped':
      return { ...s, status: `could not load ${e.page}, skipping` };
    case 'found': {
      const nodes = { ...s.nodes };
      const path = e.path;
      const mi = e.meet ? Math.max(0, path.findIndex((t) => norm(t) === norm(e.meet!))) : path.length - 1;
      const meetBack = !!nodes[nodeKey('backward', path[mi])] || !nodes[nodeKey('forward', path[mi])];
      const fChain = path.slice(0, meetBack ? mi : mi + 1);
      const bChain = path.slice(meetBack ? mi : mi + 1).reverse();
      let count = put(nodes, s.count, 'forward', fChain, true);
      count = put(nodes, count, 'backward', bChain, true);
      const pathKeys = [...fChain.map((t) => nodeKey('forward', t)), ...[...bChain].reverse().map((t) => nodeKey('backward', t))];
      return { ...s, nodes, count, frontier, outcome: 'found', path, pathKeys, meet: e.meet ?? null, opened: e.totalExplored, finishedAt: Date.now(), current: null, status: `found it in ${e.clicks} click${e.clicks === 1 ? '' : 's'}${e.meet ? `, the two sides met at ${e.meet}` : ''}` };
    }
    case 'not_found':
      return { ...s, outcome: 'not_found', opened: e.totalExplored, finishedAt: Date.now(), current: null, status: 'ran out of budget without finding it' };
    case 'error':
      return { ...s, outcome: 'error', error: e.message, finishedAt: Date.now(), current: null, status: e.message };
    default:
      return s;
  }
}

export function stopLane(s: Lane): Lane {
  return s.outcome === 'running' ? { ...s, outcome: 'stopped', finishedAt: Date.now(), current: null, status: 'stopped' } : s;
}
