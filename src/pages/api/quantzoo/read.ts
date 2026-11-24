import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { cached, json } from '../../../tools/quantzoo/server/http.ts';
import { buildTape } from '../../../tools/quantzoo/server/tape.ts';
import { buildOdds } from '../../../tools/quantzoo/server/odds.ts';
import { buildNews } from '../../../tools/quantzoo/server/news.ts';

export const prerender = false;

const MODEL = 'claude-haiku-5-5';

export const GET: APIRoute = async () => {
  const key = import.meta.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ enabled: false }, 3600, 86400);
  const day = new Date().toISOString().slice(0, 10);
  try {
    const out = await cached(`read:${day}`, 24 * 3600_000, async () => {
      const [tape, odds, news] = await Promise.allSettled([buildTape(), buildOdds(), buildNews()]);
      const lines: string[] = [];
      if (tape.status === 'fulfilled') {
        lines.push(`risk gauge ${tape.value.gauge.score} (-100 to 100): ` + tape.value.gauge.parts.map((p) => `${p.name}: ${p.reading}`).join('; '));
        for (const t of tape.value.tiles) if ('ch1d' in t) lines.push(`${t.name}: ${(t.ch1d * 100).toFixed(2)}% today, ${(t.ch1m * 100).toFixed(1)}% this month`);
      }
      if (odds.status === 'fulfilled') for (const m of [...odds.value.polymarket.markets, ...odds.value.kalshi.markets]) lines.push(`${m.source} "${m.question}": ` + m.outcomes.map((o) => `${o.name} ${(o.p * 100).toFixed(0)}%${o.d7 != null ? ` (7d ${(o.d7 * 100).toFixed(0)} pts)` : ''}`).join(', '));
      if (news.status === 'fulfilled') for (const h of news.value.headlines.slice(0, 25)) lines.push(`headline (${h.source}): ${h.title}`);
      const client = new Anthropic({ apiKey: key });
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        output_config: { effort: 'low' },
        system: 'you write a 3 to 4 sentence plain-english read of what changed in markets, for a curious non-expert. lowercase, casual, no jargon, no em dashes, no advice, no predictions. only use facts in the data given.',
        messages: [{ role: 'user', content: `data as of ${day}:\n${lines.join('\n')}` }],
      } as Anthropic.MessageCreateParamsNonStreaming);
      if (res.stop_reason === 'refusal') throw new Error('declined');
      const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
      if (!text) throw new Error('empty');
      return { enabled: true, text, model: MODEL, day, at: new Date().toISOString() };
    });
    return json(out, 3600, 86400);
  } catch (e) {
    return json({ enabled: true, error: 'model read unavailable' }, 300, 600);
  }
};
