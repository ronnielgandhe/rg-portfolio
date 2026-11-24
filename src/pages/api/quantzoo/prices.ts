import type { APIRoute } from 'astro';
import { json, pool } from '../../../tools/quantzoo/server/http.ts';
import { daily, validSymbol } from '../../../tools/quantzoo/server/yahoo.ts';

export const prerender = false;

const r6 = (x: number) => Number(x.toPrecision(7));

export const GET: APIRoute = async ({ url }) => {
  const symbols = (url.searchParams.get('symbols') ?? '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(validSymbol)
    .slice(0, 20);
  if (!symbols.length) return json({ error: 'pass ?symbols=SPY,QQQ' }, 60, 60, 400);
  const results = await pool(symbols, 4, (s) => daily(s));
  const data: Record<string, { d: string[]; c: number[]; o: number[] }> = {};
  const failed: string[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') data[symbols[i]] = { d: r.value.d, c: r.value.c.map(r6), o: r.value.o.map(r6) };
    else failed.push(symbols[i]);
  });
  if (!Object.keys(data).length) return json({ error: 'price source down', failed }, 30, 60, 502);
  return json({ data, failed, source: 'Yahoo Finance chart API, adjusted closes', fetchedAt: new Date().toISOString() }, 21600, 86400);
};
