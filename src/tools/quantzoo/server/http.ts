export const UA = 'Mozilla/5.0 (compatible; quantzoo-research/1.0)';

type Entry = { at: number; value: unknown; pending?: Promise<unknown> };
const store = new Map<string, Entry>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  const now = Date.now();
  if (hit && now - hit.at < ttlMs) return hit.value as T;
  if (hit?.pending) return hit.pending as Promise<T>;
  const pending = load()
    .then((value) => {
      store.set(key, { at: Date.now(), value });
      return value;
    })
    .catch((err) => {
      if (hit) {
        store.set(key, { at: hit.at, value: hit.value });
        return hit.value as T;
      }
      store.delete(key);
      throw err;
    });
  store.set(key, { at: hit?.at ?? 0, value: hit?.value, pending });
  return pending;
}

export async function getText(url: string, timeoutMs = 8000, headers: Record<string, string> = {}): Promise<string> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*', ...headers }, signal: ctl.signal });
    if (!res.ok) throw new Error(`${res.status} from ${new URL(url).hostname}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function getJson<T = any>(url: string, timeoutMs = 8000): Promise<T> {
  return JSON.parse(await getText(url, timeoutMs, { Accept: 'application/json' })) as T;
}

export function json(body: unknown, sMaxAge: number, swr: number, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=60, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
    },
  });
}

export async function settle<T>(p: Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    return { ok: true, data: await p };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function pool<T, R>(items: T[], size: number, fn: (x: T) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const out: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        try {
          out[i] = { status: 'fulfilled', value: await fn(items[i]) };
        } catch (reason) {
          out[i] = { status: 'rejected', reason };
        }
      }
    }),
  );
  return out;
}
