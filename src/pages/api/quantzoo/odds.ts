import type { APIRoute } from 'astro';
import { json } from '../../../tools/quantzoo/server/http.ts';
import { buildOdds } from '../../../tools/quantzoo/server/odds.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    return json(await buildOdds(), 300, 3600);
  } catch (e) {
    return json({ error: 'source down', detail: e instanceof Error ? e.message : String(e) }, 30, 120, 502);
  }
};
