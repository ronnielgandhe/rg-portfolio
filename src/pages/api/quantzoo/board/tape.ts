import type { APIRoute } from 'astro';
import { downList, json } from '../../../../tools/quantzoo/board/server/common.ts';
import { buildTape } from '../../../../tools/quantzoo/board/server/tape.ts';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    return json(await buildTape(downList(url)), 300, 3600);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e), source: 'tape' }, 30, 120, 502);
  }
};
