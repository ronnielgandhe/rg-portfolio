import type { APIRoute } from 'astro';
import { json } from '../../../../tools/quantzoo/board/server/common.ts';
import { buildHistory } from '../../../../tools/quantzoo/board/server/history.ts';

export const prerender = false;

export const GET: APIRoute = () => json(buildHistory(), 3600, 86400);
