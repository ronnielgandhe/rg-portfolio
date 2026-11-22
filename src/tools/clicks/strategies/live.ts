import type { Resolved, Wiki } from './types.ts';

const API = 'https://en.wikipedia.org/w/api.php';
const AGENT = 'how-many-clicks-search-lab/1.0 (wikipedia game search benchmark)';

export class WikiError extends Error {}

const MAX_CONCURRENT = 4;
let active = 0;
const queue: (() => void)[] = [];

function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT) { active++; return Promise.resolve(); }
  return new Promise((go) => queue.push(go));
}

function release() {
  const next = queue.shift();
  if (next) next(); else active--;
}

const wait = (ms: number, signal: AbortSignal) => new Promise<void>((res, rej) => {
  const t = setTimeout(res, ms);
  signal.addEventListener('abort', () => { clearTimeout(t); rej(signal.reason ?? new DOMException('aborted', 'AbortError')); }, { once: true });
});

const url = (params: Record<string, string>) => `${API}?${new URLSearchParams({ ...params, format: 'json', formatversion: '2', origin: '*' })}`;

async function getJson(params: Record<string, string>, signal: AbortSignal): Promise<any> {
  const headers: Record<string, string> = typeof document === 'undefined' ? { 'User-Agent': AGENT } : { 'Api-User-Agent': AGENT };
  await acquire();
  try {
    for (let attempt = 0; ; attempt++) {
      signal.throwIfAborted();
      let res: Response;
      try {
        res = await fetch(url(params), { headers, signal });
      } catch (e) {
        if ((e as Error).name === 'AbortError') throw e;
        if (attempt < 2) { await wait(600 * (attempt + 1), signal); continue; }
        throw new WikiError('could not reach wikipedia. check your connection and try again.');
      }
      if (res.status === 429 || res.status >= 500) {
        if (attempt < 3) { await wait(800 * 2 ** attempt, signal); continue; }
        throw new WikiError('wikipedia is rate limiting us right now. give it a minute.');
      }
      if (!res.ok) throw new WikiError(`wikipedia answered ${res.status}.`);
      const data = await res.json();
      if (data?.error?.code === 'ratelimited' || data?.error?.code === 'maxlag') {
        if (attempt < 3) { await wait(1000 * 2 ** attempt, signal); continue; }
        throw new WikiError('wikipedia is rate limiting us right now. give it a minute.');
      }
      return data;
    }
  } finally {
    release();
  }
}

async function paged(base: Record<string, string>, key: 'plcontinue' | 'lhcontinue', pick: (data: any) => string[], signal: AbortSignal) {
  const out: string[] = [];
  let cont: string | null = null;
  for (let i = 0; i < 2; i++) {
    const data = await getJson(cont ? { ...base, [key]: cont } : base, signal);
    out.push(...pick(data));
    cont = data?.continue?.[key] ?? null;
    if (!cont) break;
  }
  return out;
}

export const liveWiki: Wiki = {
  async resolve(query: string, signal: AbortSignal, depth = 0): Promise<Resolved> {
    const data = await getJson({ action: 'query', titles: query, redirects: '1', prop: 'pageprops', ppprop: 'disambiguation' }, signal);
    const page = data?.query?.pages?.[0];
    if (!page || page.missing || page.invalid) {
      const s = await getJson({ action: 'opensearch', search: query, limit: '1', namespace: '0', formatversion: '1' }, signal);
      const hit = s?.[1]?.[0];
      if (!hit || depth > 0) throw new WikiError(`no wikipedia article called "${query}".`);
      return (liveWiki.resolve as (q: string, s: AbortSignal, d: number) => Promise<Resolved>)(hit, signal, depth + 1);
    }
    return { title: page.title, disambiguation: !!page.pageprops && 'disambiguation' in page.pageprops };
  },
  links: (title, signal) => paged(
    { action: 'query', titles: title, prop: 'links', pllimit: 'max', plnamespace: '0' }, 'plcontinue',
    (d) => (d?.query?.pages?.[0]?.links ?? []).map((l: { title: string }) => l.title), signal),
  backlinks: (title, signal) => paged(
    { action: 'query', titles: title, prop: 'linkshere', lhlimit: 'max', lhnamespace: '0', lhshow: '!redirect', lhprop: 'title' }, 'lhcontinue',
    (d) => (d?.query?.pages?.[0]?.linkshere ?? []).map((l: { title: string }) => l.title), signal),
};
