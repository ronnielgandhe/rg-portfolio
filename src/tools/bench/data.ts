export interface Model {
  id: string;
  name: string;
  provider: string;
  inPrice: number;
  outPrice: number;
  context: number | null;
  added: string | null;
  released: string | null;
  open: boolean;
  modality: string | null;
  scored: boolean;
}

export interface Row {
  modelId: string | null;
  raw: string;
  name: string | null;
  org: string | null;
  score: number;
  variant: string | null;
  extra?: Record<string, unknown>;
  src: string;
  runs: number;
  rank: number;
}

export interface Bench {
  id: string;
  name: string;
  short: string;
  category: CategoryId;
  source: string;
  measures: string;
  metric: string;
  unit: string;
  higherIsBetter: boolean;
  url: string;
  date: string | null;
  dataUrl: string;
  license: string;
  stats: { rawRows: number; models: number; matchRate: number | null; matchedRows?: number; unmatchedRows?: number; pricedModels?: number };
  rows: Row[];
}

export interface Source {
  id: string;
  name: string;
  url: string;
  home: string;
  license: string;
  role: string;
  ok: boolean;
  error: string | null;
  benchmarks: string[];
}

export type CategoryId = 'general' | 'coding' | 'agentic' | 'tools' | 'hallucination' | 'reasoning' | 'speech';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'general', label: 'general' },
  { id: 'coding', label: 'coding' },
  { id: 'agentic', label: 'agentic coding' },
  { id: 'tools', label: 'tool calling' },
  { id: 'hallucination', label: 'hallucination' },
  { id: 'reasoning', label: 'reasoning' },
  { id: 'speech', label: 'speech' },
];

const files = import.meta.glob('../../data/bench/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const file = (name: string) => files[`../../data/bench/${name}.json`];

const modelFile = file('models') as { syncedAt: string; pricing: { source: string; date: string; note: string }; models: Model[] };
const sourceFile = file('sources') as { syncedAt: string; sources: Source[]; benchmarks: Omit<Bench, 'rows'>[] };

export const SYNCED = modelFile.syncedAt;
export const PRICING = modelFile.pricing;
export const MODELS = modelFile.models;
export const SOURCES = sourceFile.sources;
export const MODEL_BY_ID = new Map(MODELS.map((m) => [m.id, m]));

export const BENCHES: Bench[] = sourceFile.benchmarks
  .map((b) => file(b.id) as Bench | undefined)
  .filter((b): b is Bench => !!b);
export const BENCH_BY_ID = new Map(BENCHES.map((b) => [b.id, b]));
export const LLM_BENCHES = BENCHES.filter((b) => b.category !== 'speech');

export const blended = (m: Model) => (3 * m.inPrice + m.outPrice) / 4;

export const priced = (m: Model | undefined): m is Model => !!m && blended(m) > 0;

export function modelBenches(id: string) {
  const out: { bench: Bench; row: Row; of: number }[] = [];
  for (const b of LLM_BENCHES) {
    const row = b.rows.find((r) => r.modelId === id);
    if (row) out.push({ bench: b, row, of: b.rows.length });
  }
  return out;
}

export function fmtScore(b: Pick<Bench, 'unit' | 'id'>, v: number) {
  if (b.unit === '%') return `${v.toFixed(1)}%`;
  if (b.id === 'tts_arena') return String(Math.round(v));
  return v.toFixed(1);
}

export function fmtPrice(v: number) {
  if (v === 0) return 'free';
  if (v < 0.1) return `$${+v.toFixed(3)}`;
  if (v < 10) return `$${v.toFixed(2)}`;
  return `$${+v.toFixed(1)}`;
}

export function fmtMoney(v: number) {
  if (v < 1) return `$${v.toFixed(2)}`;
  if (v < 1000) return `$${Math.round(v).toLocaleString('en-US')}`;
  if (v < 1e6) return `$${(v / 1000).toFixed(v < 1e4 ? 1 : 0)}k`;
  return `$${(v / 1e6).toFixed(1)}m`;
}

export function fmtTokens(v: number) {
  if (v >= 1e6) return `${+(v / 1e6).toFixed(1)}M`;
  if (v >= 1000) return `${+(v / 1000).toFixed(v < 10000 ? 1 : 0)}k`;
  return String(v);
}

export function fmtDate(d: string | null) {
  if (!d) return 'unknown';
  const dt = new Date(`${d}T00:00:00Z`);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).toLowerCase();
}

export function displayName(r: Row) {
  const m = r.modelId ? MODEL_BY_ID.get(r.modelId) : undefined;
  if (m) return m.name;
  const n = (r.name ?? r.raw).replace(/\s*\([^)]*\)\s*$/, '').replace(/_(unknown|minimal|none|low|medium|high|xhigh|max|thinking|\d+k)$/i, '');
  return n.includes('/') ? n.split('/').slice(1).join('/') : n;
}

export function rowSub(r: Row, extra: (string | null | false | undefined)[] = []) {
  return [rowProvider(r), r.variant, ...extra].filter(Boolean).join(' · ');
}

export function rowProvider(r: Row) {
  const m = r.modelId ? MODEL_BY_ID.get(r.modelId) : undefined;
  if (m) return m.provider;
  if (r.org) return r.org;
  const n = r.name ?? r.raw;
  return n.includes('/') ? n.split('/')[0] : '';
}

export function better(b: Pick<Bench, 'higherIsBetter'>, a: number, c: number) {
  return b.higherIsBetter ? a > c : a < c;
}

export interface Pt { id: string; label: string; sub: string; x: number; y: number; modelId: string | null }

export function frontier(pts: Pt[], xBetterLow: boolean, yBetterHigh: boolean) {
  const xb = (a: number, c: number) => (xBetterLow ? a <= c : a >= c);
  const yb = (a: number, c: number) => (yBetterHigh ? a >= c : a <= c);
  return pts.filter((p) => !pts.some((q) => q !== p && xb(q.x, p.x) && yb(q.y, p.y) && (q.x !== p.x || q.y !== p.y)));
}
