import type { APIRoute } from 'astro';
import { json } from '../../../tools/quantzoo/server/http.ts';
import { buildNews } from '../../../tools/quantzoo/server/news.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    return json(await buildNews(), 300, 3600);
  } catch (e) {
    return json({ error: 'source down', detail: e instanceof Error ? e.message : String(e) }, 30, 120, 502);
  }
};
