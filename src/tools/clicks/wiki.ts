const API_BASE = 'https://en.wikipedia.org/w/api.php';
const REST_BASE = 'https://en.wikipedia.org/api/rest_v1';
const HEADERS = { 'Api-User-Agent': 'how-many-clicks/2.0 (ronnielgandhe.com/how-many-clicks)' };

export class WikiError extends Error {}

export interface Summary {
  title: string;
  extract: string;
  description: string;
  thumbnail: string | null;
  url: string;
}

export const articleUrl = (title: string) => `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

type Waiter = { hi: boolean; go: () => void };
const MAX_CONCURRENT = 6;
let active = 0;
const queue: Waiter[] = [];

function acquire(hi: boolean): Promise<void> {
  if (active < MAX_CONCURRENT) { active++; return Promise.resolve(); }
  return new Promise((go) => {
    const w = { hi, go };
    if (hi) { const i = queue.findIndex((q) => !q.hi); i < 0 ? queue.push(w) : queue.splice(i, 0, w); }
    else queue.push(w);
  });
}

function release() {
  const next = queue.shift();
  if (next) next.go(); else active--;
}

const wait = (ms: number, signal?: AbortSignal) => new Promise<void>((res, rej) => {
  const t = setTimeout(res, ms);
  signal?.addEventListener('abort', () => { clearTimeout(t); rej(signal.reason ?? new DOMException('aborted', 'AbortError')); }, { once: true });
});

async function getJson(url: string, opts: { signal?: AbortSignal; hi?: boolean; allow404?: boolean } = {}): Promise<any> {
  await acquire(!!opts.hi);
  try {
    for (let attempt = 0; ; attempt++) {
      opts.signal?.throwIfAborted();
      let res: Response;
      try {
        res = await fetch(url, { headers: HEADERS, signal: opts.signal });
      } catch (e) {
        if ((e as Error).name === 'AbortError') throw e;
        if (attempt < 2) { await wait(600 * (attempt + 1), opts.signal); continue; }
        throw new WikiError('could not reach wikipedia. check your connection and try again.');
      }
      if (res.status === 429 || res.status >= 500) {
        if (attempt < 3) {
          const after = Number(res.headers.get('retry-after'));
          await wait(after > 0 ? Math.min(after, 10) * 1000 : 800 * 2 ** attempt, opts.signal);
          continue;
        }
        throw new WikiError(res.status === 429 ? 'wikipedia is rate limiting us right now. give it a minute.' : 'wikipedia is having a moment. try again shortly.');
      }
      if (res.status === 404 && opts.allow404) return null;
      if (!res.ok) throw new WikiError(`wikipedia answered ${res.status}.`);
      const data = await res.json();
      if (data?.error?.code === 'ratelimited' || data?.error?.code === 'maxlag') {
        if (attempt < 3) { await wait(1000 * 2 ** attempt, opts.signal); continue; }
        throw new WikiError('wikipedia is rate limiting us right now. give it a minute.');
      }
      return data;
    }
  } finally {
    release();
  }
}

const api = (params: Record<string, string>) => `${API_BASE}?${new URLSearchParams({ ...params, format: 'json', origin: '*' })}`;

export async function searchArticles(query: string, signal?: AbortSignal): Promise<string[]> {
  if (!query || query.length < 2) return [];
  const data = await getJson(api({ action: 'opensearch', search: query, limit: '6', namespace: '0' }), { signal, hi: true });
  return data?.[1] || [];
}

export interface Resolved { title: string; disambiguation: boolean }

export async function resolveTitle(query: string, signal?: AbortSignal, depth = 0): Promise<Resolved> {
  const data = await getJson(api({ action: 'query', titles: query, redirects: '1', prop: 'pageprops', ppprop: 'disambiguation' }), { signal, hi: true });
  const pages = data?.query?.pages || {};
  const pageId = Object.keys(pages)[0];
  if (!pageId || pageId === '-1' || pages[pageId].missing !== undefined || pages[pageId].invalid !== undefined) {
    const results = await searchArticles(query, signal);
    if (results.length === 0 || depth > 0) throw new WikiError(`no wikipedia article called "${query}".`);
    return resolveTitle(results[0], signal, depth + 1);
  }
  const page = pages[pageId];
  return { title: page.title, disambiguation: !!page.pageprops && 'disambiguation' in page.pageprops };
}

export async function getPageLinks(title: string, signal?: AbortSignal): Promise<string[]> {
  const allLinks: string[] = [];
  let plcontinue: string | null = null;
  for (let i = 0; i < 2; i++) {
    const params: Record<string, string> = { action: 'query', titles: title, prop: 'links', pllimit: 'max', plnamespace: '0' };
    if (plcontinue) params.plcontinue = plcontinue;
    const data = await getJson(api(params), { signal, hi: true });
    const pages = data?.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    if (pageId && pages[pageId].links) allLinks.push(...pages[pageId].links.map((l: { title: string }) => l.title));
    plcontinue = data?.continue?.plcontinue ?? null;
    if (!plcontinue) break;
  }
  return allLinks;
}

const summaryCache = new Map<string, Promise<Summary>>();

export function getSummary(title: string): Promise<Summary> {
  const key = title.replace(/_/g, ' ');
  const hit = summaryCache.get(key);
  if (hit) return hit;
  const p = getJson(`${REST_BASE}/page/summary/${encodeURIComponent(key.replace(/ /g, '_'))}?redirect=true`, { allow404: true })
    .then((d): Summary => ({
      title: d?.title || key,
      extract: d?.extract || '',
      description: d?.description || '',
      thumbnail: d?.thumbnail?.source || null,
      url: d?.content_urls?.desktop?.page || articleUrl(key),
    }))
    .catch((): Summary => {
      summaryCache.delete(key);
      return { title: key, extract: '', description: '', thumbnail: null, url: articleUrl(key) };
    });
  summaryCache.set(key, p);
  return p;
}

export interface ParsedArticle { title: string; html: string }

export async function getArticleHtml(title: string, signal?: AbortSignal): Promise<ParsedArticle> {
  const data = await getJson(api({
    action: 'parse', page: title, prop: 'text', redirects: '1', disableeditsection: '1', disabletoc: '1', formatversion: '2',
  }), { signal, hi: true });
  if (data?.error) {
    if (data.error.code === 'missingtitle') throw new WikiError(`"${title}" does not exist on wikipedia (yet).`);
    throw new WikiError('could not load that article.');
  }
  return { title: data.parse.title, html: data.parse.text };
}

export interface Suggestion { title: string; description: string; thumbnail: string | null }

export async function suggest(query: string, signal?: AbortSignal): Promise<Suggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const data = await getJson(api({
    action: 'query', generator: 'prefixsearch', gpssearch: q, gpslimit: '6', gpsnamespace: '0', redirects: '1',
    prop: 'pageimages|description', piprop: 'thumbnail', pithumbsize: '80', pilimit: '6', formatversion: '2',
  }), { signal, hi: true });
  const pages: any[] = data?.query?.pages || [];
  return pages
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((p) => ({ title: p.title, description: p.description || '', thumbnail: p.thumbnail?.source || null }));
}
