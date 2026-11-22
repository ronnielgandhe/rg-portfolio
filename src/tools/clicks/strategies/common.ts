import type { LabEvent, RunOpts, Scored, Wiki } from './types.ts';
import { liveWiki, WikiError } from './live.ts';

const STOP_WORDS = new Set([
  'the', 'of', 'and', 'in', 'a', 'an', 'to', 'for', 'is', 'on', 'at', 'by',
  'with', 'from', 'as', 'or', 'its', 'list', 'also', 'was', 'are', 'be', 'has',
  'been', 'were', 'it', 'this', 'that', 'not', 'but', 'they', 'have', 'had',
]);

export const normalize = (title: string) => title.toLowerCase().replace(/_/g, ' ').trim();

export function extractWords(text: string) {
  return normalize(text).split(/[\s\-_,():.!?]+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export function makeSleep(opts: RunOpts) {
  return async (ms: number) => {
    const d = ms * opts.pace();
    if (d > 0) await new Promise((r) => setTimeout(r, d));
    opts.signal.throwIfAborted();
  };
}

export function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const isAbort = (err: unknown) => (err as Error)?.name === 'AbortError';

export async function begin(startQuery: string, targetQuery: string, onStep: (e: LabEvent) => void, opts: RunOpts): Promise<{ wiki: Wiki; start: string; target: string } | null> {
  const wiki = opts.wiki ?? liveWiki;
  try {
    onStep({ type: 'status', message: `looking up ${startQuery}` });
    const s = await wiki.resolve(startQuery, opts.signal);
    onStep({ type: 'status', message: `looking up ${targetQuery}` });
    const t = await wiki.resolve(targetQuery, opts.signal);
    if (t.disambiguation) throw new WikiError(`"${t.title}" is a disambiguation page, so there is nothing to land on. pick a more specific article for "to".`);
    onStep({ type: 'resolved', start: s.title, target: t.title });
    return { wiki, start: s.title, target: t.title };
  } catch (err) {
    if (isAbort(err)) throw err;
    onStep({ type: 'error', message: err instanceof WikiError ? err.message : 'something went wrong looking those up.' });
    return null;
  }
}

export class Fetcher {
  failures = 0;
  wiki: Wiki;
  onStep: (e: LabEvent) => void;
  signal: AbortSignal;
  constructor(wiki: Wiki, onStep: (e: LabEvent) => void, signal: AbortSignal) {
    this.wiki = wiki;
    this.onStep = onStep;
    this.signal = signal;
  }

  async get(kind: 'links' | 'backlinks', page: string): Promise<string[] | null | 'fatal'> {
    try {
      const out = await this.wiki[kind](page, this.signal);
      this.failures = 0;
      return out;
    } catch (err) {
      if (isAbort(err)) throw err;
      this.onStep({ type: 'skipped', page });
      if (++this.failures >= 4) {
        this.onStep({ type: 'error', message: err instanceof WikiError ? err.message : 'lost the connection to wikipedia mid-race.' });
        return 'fatal';
      }
      return null;
    }
  }
}

export function found(onStep: (e: LabEvent) => void, path: string[], totalExplored: number, extra: Partial<LabEvent> = {}) {
  onStep({ type: 'found', path, clicks: path.length - 1, totalExplored, ...extra } as LabEvent);
  return { path, totalExplored };
}

export function notFound(onStep: (e: LabEvent) => void, totalExplored: number) {
  onStep({ type: 'not_found', totalExplored });
  return { path: null, totalExplored };
}

export function withClicks(title: string, score: number, clicksOf?: (s: number) => number): Scored {
  const out: Scored & { clicks?: number } = { title, score: Math.round(score) };
  if (clicksOf && score < 10000) out.clicks = Math.round(clicksOf(score) * 10) / 10;
  return out;
}
