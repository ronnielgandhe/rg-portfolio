import type { APIRoute } from 'astro';
import { json } from '../../../tools/quantzoo/server/http.ts';
import { intraday } from '../../../tools/quantzoo/server/yahoo.ts';

export const prerender = false;

const ALLOWED = new Set(['MNQ=F', 'MGC=F', 'NQ=F', 'GC=F', 'MES=F', 'ES=F']);
const INTERVALS = new Set(['5m', '15m', '60m']);
const RANGES: Record<string, string> = { '5m': '60d', '15m': '60d', '60m': '730d' };

export const GET: APIRoute = async ({ url }) => {
  const symbol = (url.searchParams.get('symbol') ?? '').toUpperCase();
  const interval = url.searchParams.get('interval') ?? '5m';
  if (!ALLOWED.has(symbol) || !INTERVALS.has(interval)) return json({ error: 'unsupported symbol or interval' }, 60, 60, 400);
  try {
    const bars = await intraday(symbol, interval, RANGES[interval]);
    return json({ symbol, interval, bars, source: 'Yahoo Finance chart API', fetchedAt: new Date().toISOString() }, 1800, 7200);
  } catch (e) {
    return json({ error: 'bar source down', detail: String(e) }, 30, 60, 502);
  }
};
