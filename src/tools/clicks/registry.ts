import { BUILTIN_STRATEGIES, type Strategy } from './pathfinder';

const modules = import.meta.glob<{ STRATEGIES?: unknown }>('./strategies/index.ts');

const isStrategy = (s: unknown): s is Strategy => {
  const x = s as Strategy;
  return !!x && typeof x.id === 'string' && typeof x.name === 'string' && typeof x.run === 'function';
};

export async function loadStrategies(): Promise<Strategy[]> {
  const load = modules['./strategies/index.ts'];
  if (!load) return BUILTIN_STRATEGIES;
  try {
    const m = await load();
    const list = Array.isArray(m.STRATEGIES) ? m.STRATEGIES.filter(isStrategy).map((s) => ({ ...s, blurb: s.blurb || '' })) : [];
    return list.length ? list : BUILTIN_STRATEGIES;
  } catch {
    return BUILTIN_STRATEGIES;
  }
}

const ALIASES: Record<string, string[]> = {
  beam: ['beam', 'keyword'],
  keyword: ['keyword', 'beam'],
  'beam-god': ['beam-god', 'god'],
  god: ['god', 'beam-god'],
};

export function findStrategy(list: Strategy[], id: string | null | undefined): Strategy | undefined {
  if (!id) return undefined;
  for (const c of ALIASES[id] ?? [id]) {
    const hit = list.find((s) => s.id === c);
    if (hit) return hit;
  }
  return undefined;
}

export function pickStrategy(list: Strategy[], id: string | null | undefined): Strategy {
  return findStrategy(list, id) ?? findStrategy(list, 'guided') ?? findStrategy(list, 'beam') ?? list[0];
}
