import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const prerender = false;

const SLUG = /^[a-z0-9][a-z0-9-]{0,60}$/;

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.DEV) return new Response(JSON.stringify({ error: 'saving only works in dev' }), { status: 403 });
  try {
    const { slug, version } = await request.json();
    if (!SLUG.test(String(slug)) || !version?.config || typeof version.note !== 'string') return new Response(JSON.stringify({ error: 'bad request' }), { status: 400 });
    const base = path.join(process.cwd(), 'src/data/quantzoo');
    const ideaFile = path.join(base, 'ideas', `${slug}.versions.json`);
    const file = await fs.access(ideaFile).then(() => ideaFile, () => path.join(base, 'algorithms', slug, 'versions.json'));
    const list = JSON.parse(await fs.readFile(file, 'utf8')) as { id: string }[];
    const n = Math.max(0, ...list.map((v) => Number(v.id.replace(/\D/g, '')) || 0)) + 1;
    const entry = { id: `v${n}`, date: String(version.date ?? new Date().toISOString().slice(0, 10)).slice(0, 10), note: version.note.slice(0, 500), config: version.config };
    list.push(entry);
    await fs.writeFile(file, JSON.stringify(list, null, 2) + '\n');
    return new Response(JSON.stringify({ ok: true, id: entry.id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
