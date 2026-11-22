import type { APIRoute } from 'astro';
import { downList, json } from '../../../../tools/quantzoo/board/server/common.ts';
import { buildOdds } from '../../../../tools/quantzoo/board/server/odds.ts';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    return json(await buildOdds(downList(url)), 300, 1800);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e), source: 'odds' }, 30, 120, 502);
  }
};
