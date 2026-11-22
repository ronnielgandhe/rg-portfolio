import type { Strategy } from './types.ts';
import { random } from './random.ts';
import { keyword, god } from './keyword.ts';
import { hub } from './hub.ts';
import { semantic } from './semantic.ts';
import { learned, guided, MODEL_VARIANTS } from './learned.ts';
import { bidi } from './bidirectional.ts';

export type { Strategy, LabEvent, RunOpts, Wiki } from './types.ts';

export const STRATEGIES: Strategy[] = [guided, learned, bidi, god, keyword, hub, semantic, random];

export const VARIANTS: Strategy[] = MODEL_VARIANTS;

export const DEFAULT_STRATEGY = 'guided';

export const strategyById = (id: string) => [...STRATEGIES, ...VARIANTS].find((s) => s.id === id);
