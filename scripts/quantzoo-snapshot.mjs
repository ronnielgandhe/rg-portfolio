import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = (process.env.QZ_BASE || 'http://localhost:4321').replace(/\/$/, '');
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'quantzoo', 'snapshots');

async function get(path) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 60000);
  try {
    const res = await fetch(`${BASE}/api/quantzoo/board/${path}`, { headers: { 'User-Agent': 'quantzoo-snapshot/1.0' }, signal: ctl.signal });
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`skip ${path}: ${e.message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const [tape, odds, news] = await Promise.all([get('tape'), get('odds'), get('news')]);
if (!tape && !odds && !news) {
  console.error('every route failed, nothing written');
  process.exit(1);
}

const round = (x, d = 3) => (Number.isFinite(x) ? Number(x.toFixed(d)) : null);
const date = new Date().toISOString().slice(0, 10);
const snap = {
  date,
  gauge: tape ? tape.gauge.score : null,
  breadth: tape && tape.breadth.of ? round(tape.breadth.above50 / tape.breadth.of) : null,
  mood: news ? round(news.overall) : null,
  themes: news ? Object.fromEntries(news.themes.map((t) => [t.id, round(t.mean)])) : {},
  odds: odds
    ? odds.rows
        .slice()
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 8)
        .map((r) => ({ question: r.question, p: round(r.p), sources: r.prices.map((x) => x.source) }))
    : [],
};

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, `${date}.json`), JSON.stringify(snap, null, 2) + '\n');
console.log(`wrote ${date}.json  gauge ${snap.gauge}  mood ${snap.mood}  odds ${snap.odds.length}`);
