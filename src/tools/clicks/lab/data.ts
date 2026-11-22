import { MODEL_NAME, STRATEGIES, strategyById } from '../strategies/index.ts';

export interface Stats {
  success: number;
  clicksMean: number;
  optimalMean: number;
  clicksOverOptimal: number;
  pagesOpenedMean: number;
  pagesOpenedMedian: number;
}

export interface BenchStrategy { id: string; name: string; overall: Stats; byDifficulty: Record<string, Stats> }

export interface ModelInfo {
  params: number;
  sizeBytes: number;
  trainSeconds: number;
  trainPairs: number;
  valPairs: number;
  testPairs: number;
  testMetric: { name: string; value: number };
  lossCurve: { epoch: number; train: number; val: number }[];
  lossCurveNote?: string;
  ablations: { name: string; metricDelta: number }[];
  ablationMetric?: string;
}

export interface Benchmark {
  preliminary: boolean;
  dataset: { name: string; url: string; license: string; articles: number; pairs: number; seed: number; date: string };
  difficulties: string[];
  humans: Record<string, { medianClicks: number; n: number }> | null;
  strategies: BenchStrategy[];
  live: { date: string; pairs: number; strategies: { id: string; success: number; clicksMean: number; pagesOpenedMean: number }[] } | null;
  model: ModelInfo | null;
}

const benchFiles = import.meta.glob<Benchmark>('../../../data/clicks/benchmark.json', { eager: true, import: 'default' });
const mdFiles = import.meta.glob<string>('../../../data/clicks/writeup.md', { eager: true, query: '?raw', import: 'default' });

function valid(b: unknown): b is Benchmark {
  const x = b as Benchmark;
  return !!x && Array.isArray(x.strategies) && x.strategies.length > 0 && Array.isArray(x.difficulties);
}

const rawBench = Object.values(benchFiles)[0];
export const BENCH: Benchmark | null = valid(rawBench) ? rawBench : null;
export const WRITEUP: string | null = (Object.values(mdFiles)[0] ?? '').trim() || null;

export const ALL = 'all';

export function statsFor(s: BenchStrategy, diff: string): Stats | null {
  return diff === ALL ? s.overall : s.byDifficulty?.[diff] ?? null;
}

export const MODEL_IDS = new Set(['guided']);
export const SHOWN_IDS = new Set(STRATEGIES.map((s) => s.id));
export const nameOf = (id: string, fallback: string) => strategyById(id)?.name ?? fallback;
export const shownStrategies = (b: Benchmark) => b.strategies.filter((s) => SHOWN_IDS.has(s.id)).map((s) => ({ ...s, name: nameOf(s.id, s.name) }));
export { MODEL_NAME };
export const REPO = 'https://github.com/ronnielgandhe/rg-portfolio';
export const CODE = {
  strategies: `${REPO}/tree/main/src/tools/clicks/strategies`,
  page: `${REPO}/tree/main/src/tools/clicks`,
};

export interface LlmStats {
  n: number;
  success: number;
  successCI: [number, number];
  clicksMean: number;
  clicksOverOptimal: number;
  stepsMean: number;
  invalidMoveRate: number;
  tokensInMean: number;
  tokensOutMean: number;
  costPerGameUsd: number;
  costPerSolvedUsd: number | null;
  latencyMsPerStep: number;
}

export interface LlmModel {
  id: string;
  name: string;
  provider: string;
  priceInPerM: number;
  priceOutPerM: number;
  pricedOn: string;
  overall: LlmStats;
  byDifficulty: Record<string, LlmStats>;
}

export interface Replay {
  model: string;
  start: string;
  target: string;
  optimal: number;
  outcome: 'solved' | 'failed';
  path: string[];
  steps: { page: string; offered: number; chosen: string | null }[];
}

export interface LlmBench {
  preliminary: boolean;
  date: string;
  dataset: { name: string; url: string; license: string };
  protocol: { pairs: number; perDifficulty: number; maxSteps: number; sees: string; temperature: number; promptVersion: string };
  priorWork: { name: string; url: string; note: string }[];
  models: LlmModel[];
  replays: Replay[];
  spendUsd: number;
}

const llmFiles = import.meta.glob<LlmBench>('../../../data/clicks/llm.json', { eager: true, import: 'default' });
const rawLlm = Object.values(llmFiles)[0];
export const LLM: LlmBench | null = rawLlm && Array.isArray(rawLlm.models) && rawLlm.models.length > 0 ? rawLlm : null;

export function llmStatsFor(m: LlmModel, diff: string): LlmStats | null {
  return diff === ALL ? m.overall : m.byDifficulty?.[diff] ?? null;
}

export function splitWriteup(md: string | null): { main: string | null; llm: string | null } {
  if (!md) return { main: null, llm: null };
  const parts = md.split(/\n(?=## )/);
  const i = parts.findIndex((p) => /^## .*\b(llms?|language models?)\b/i.test(p.trim()));
  if (i < 0) return { main: md, llm: null };
  const llm = parts[i].replace(/^## .*\n?/, '').trim();
  return { main: parts.filter((_, j) => j !== i).join('\n').trim() || null, llm: llm || null };
}
