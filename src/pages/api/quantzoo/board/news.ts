import type { APIRoute } from 'astro';
import { downList, json } from '../../../../tools/quantzoo/board/server/common.ts';
import { buildNews } from '../../../../tools/quantzoo/board/server/news.ts';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    return json(await buildNews(downList(url)), 600, 3600);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e), source: 'news' }, 30, 120, 502);
  }
};
