import { cached, getJson, pool } from './http.ts';

export interface Outcome {
  name: string;
  p: number;
  d1: number | null;
  d7: number | null;
  spark: number[];
}

export interface Market {
  id: string;
  source: 'polymarket' | 'kalshi';
  question: string;
  url: string;
  closes?: string;
  volume?: number;
  kind: 'pick' | 'ladder';
  outcomes: Outcome[];
  middle?: string;
}

const GAMMA = 'https://gamma-api.polymarket.com';
const CLOB = 'https://clob.polymarket.com';
const KALSHI = 'https://api.elections.kalshi.com/trade-api/v2';
const RELEVANT = /(fed|rate|recession|inflation|cpi|gdp|unemployment|jobs|s&p|nasdaq|largest company|tariff|treasury|yield|gold|oil|stock)/i;
const NOISE = /(hike-pause|pause-hike|decisions \(|which party|election|trump say|mention)/i;

async function polySpark(token: string): Promise<number[]> {
  try {
    const j = await getJson(`${CLOB}/prices-history?market=${token}&interval=1w&fidelity=180`, 6000);
    return (j.history ?? []).map((h: { p: number }) => h.p);
  } catch {
    return [];
  }
}

async function polymarket(): Promise<Market[]> {
  const tags = ['fed', 'economy', 'finance'];
  const lists = await Promise.allSettled(tags.map((t) => getJson(`${GAMMA}/events?closed=false&limit=20&tag_slug=${t}&order=volume24hr&ascending=false`, 8000)));
  const seen = new Set<string>();
  const events: any[] = [];
  for (const l of lists) if (l.status === 'fulfilled') for (const e of l.value) {
    if (seen.has(e.slug) || !RELEVANT.test(e.title) || NOISE.test(e.title)) continue;
    seen.add(e.slug);
    events.push(e);
  }
  events.sort((a, b) => (b.volume24hr ?? 0) - (a.volume24hr ?? 0));
  const top = events.slice(0, 5);
  return Promise.all(
    top.map(async (e) => {
      const ms = (e.markets ?? []).filter((m: any) => m.active && !m.closed);
      const outs = ms
        .map((m: any) => {
          const prices = JSON.parse(m.outcomePrices ?? '[]');
          const tokens = JSON.parse(m.clobTokenIds ?? '[]');
          return { name: (m.groupItemTitle || (ms.length === 1 ? 'yes' : m.question) || '').toLowerCase(), p: Number(prices[0]), d1: m.oneDayPriceChange ?? null, d7: m.oneWeekPriceChange ?? null, token: tokens[0] as string };
        })
        .filter((o: any) => Number.isFinite(o.p))
        .sort((a: any, b: any) => b.p - a.p)
        .slice(0, 3);
      const sparks = await Promise.all(outs.map((o: any) => (o.token ? polySpark(o.token) : Promise.resolve([]))));
      return {
        id: `pm:${e.slug}`,
        source: 'polymarket' as const,
        question: String(e.title).toLowerCase().replace(/\?$/, '') + '?',
        url: `https://polymarket.com/event/${e.slug}`,
        closes: e.endDate,
        volume: Number(e.volume24hr ?? 0),
        kind: 'pick' as const,
        outcomes: outs.map((o: any, i: number) => ({ name: o.name, p: o.p, d1: o.d1, d7: o.d7, spark: sparks[i] })),
      };
    }),
  );
}

const KALSHI_SERIES = [
  { s: 'KXFEDDECISION', q: 'fed decision at the next meeting?' },
  { s: 'KXRECSSNBER', q: 'recession this year?' },
  { s: 'KXCPIYOY', q: 'inflation (cpi, year over year) in the next print?' },
  { s: 'KXU3', q: 'unemployment rate in the next jobs report?' },
  { s: 'KXINXY', q: 's&p 500 at the end of the year?' },
];

async function kalshiCandles(series: string, ticker: string): Promise<number[]> {
  const now = Math.floor(Date.now() / 1000);
  try {
    const j = await getJson(`${KALSHI}/series/${series}/markets/${ticker}/candlesticks?start_ts=${now - 8 * 86400}&end_ts=${now}&period_interval=60`, 6000);
    return (j.candlesticks ?? []).map((c: any) => Number(c.price?.close_dollars ?? c.yes_bid?.close_dollars)).filter((x: number) => Number.isFinite(x));
  } catch {
    return [];
  }
}

const strikeOf = (t: string) => Number((t.match(/-?\d+(\.\d+)?/) ?? ['NaN'])[0].replace(/,/g, ''));

async function kalshi(): Promise<Market[]> {
  const res = await pool(KALSHI_SERIES, 3, async ({ s, q }) => {
    const j = await getJson(`${KALSHI}/events?status=open&limit=1&series_ticker=${s}&with_nested_markets=true`, 8000);
    const e = j.events?.[0];
    if (!e) throw new Error('no event');
    const ms = (e.markets ?? []).map((m: any) => ({ ticker: m.ticker, name: String(m.yes_sub_title ?? m.subtitle ?? '').toLowerCase(), p: Number(m.last_price_dollars), prev: Number(m.previous_price_dollars), strike: m.strike_type, vol: Number(m.volume_fp ?? 0) }));
    const ladder = ms.length > 2 && ms.every((m: any) => m.strike === 'greater');
    let chosen: any[];
    let middle: string | undefined;
    if (ladder) {
      const sorted = ms.slice().sort((a: any, b: any) => strikeOf(a.name) - strikeOf(b.name));
      const cross = sorted.findIndex((m: any) => m.p < 0.5);
      const i = cross < 0 ? sorted.length - 1 : cross;
      chosen = sorted.slice(Math.max(0, i - 1), Math.max(0, i - 1) + 3);
      if (cross > 0) middle = `${sorted[cross - 1].name.replace('above ', '')} to ${sorted[cross].name.replace('above ', '')}`;
    } else chosen = ms.slice().sort((a: any, b: any) => b.p - a.p).slice(0, 3);
    const sparks = await Promise.all(chosen.map((m: any) => kalshiCandles(s, m.ticker)));
    return {
      id: `ks:${e.event_ticker}`,
      source: 'kalshi' as const,
      question: e.sub_title && q.includes('next meeting') ? `fed decision ${String(e.sub_title).toLowerCase()}?` : q,
      url: `https://kalshi.com/markets/${s.toLowerCase()}`,
      closes: e.markets?.[0]?.close_time,
      kind: ladder ? ('ladder' as const) : ('pick' as const),
      middle,
      outcomes: chosen.map((m: any, k: number) => {
        const sp = sparks[k];
        return { name: ms.length === 1 ? 'yes' : m.name, p: m.p, d1: Number.isFinite(m.prev) ? m.p - m.prev : null, d7: sp.length > 1 ? m.p - sp[0] : null, spark: sp.length > 1 ? sp : [] };
      }),
    };
  });
  const out: Market[] = [];
  for (const r of res) if (r.status === 'fulfilled') out.push(r.value);
  return out;
}

export function buildOdds() {
  return cached('odds', 10 * 60_000, async () => {
    const [pm, ks] = await Promise.allSettled([polymarket(), kalshi()]);
    return {
      polymarket: pm.status === 'fulfilled' ? { ok: true, markets: pm.value } : { ok: false, markets: [] as Market[], error: String(pm.reason) },
      kalshi: ks.status === 'fulfilled' && ks.value.length ? { ok: true, markets: ks.value } : { ok: false, markets: [] as Market[], error: ks.status === 'rejected' ? String(ks.reason) : 'no markets' },
      fetchedAt: new Date().toISOString(),
    };
  });
}
