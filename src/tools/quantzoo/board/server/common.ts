import { getJson } from '../../server/http.ts';
export { cached, getJson, getText, json, pool } from '../../server/http.ts';

export async function getJsonRetry<T = any>(url: string, timeoutMs = 8000, waits = [600, 1600]): Promise<T> {
  try {
    return await getJson<T>(url, timeoutMs);
  } catch (e) {
    if (!waits.length) throw e;
    await new Promise((r) => setTimeout(r, waits[0]));
    return getJsonRetry<T>(url, timeoutMs, waits.slice(1));
  }
}

export function downList(url: URL): Set<string> {
  if (!import.meta.env.DEV) return new Set();
  return new Set((url.searchParams.get('down') ?? '').split(',').filter(Boolean));
}

export function guard(down: Set<string>, id: string) {
  if (down.has(id)) throw new Error(`${id} forced down`);
}
