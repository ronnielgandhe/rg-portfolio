import { cached, getJson, getJsonRetry, guard, pool } from './common.ts';
import type { OddsData, OddsRow } from '../types.ts';

const GAMMA = 'https://gamma-api.polymarket.com';
const CLOB = 'https://clob.polymarket.com';
const KALSHI = 'https://api.elections.kalshi.com/trade-api/v2';

export const MACRO = /\b(fed|fomc|rate cuts?|rate hikes?|interest rates?|recession|inflation|cpi|pce|gdp|unemployment|payrolls|jobs report|s&p|nasdaq|dow|treasury|10.year|yield|shutdown|tariffs?|debt ceiling|largest company|market cap|oil|wti|gold|bitcoin|ai bubble|ipo|presidential election|midterm|house|senate|fed chair)\b/i;
export const SKIP = /\b(argentina|china|chinese|japan|uk|euro|eurozone|ecb|brazil|india|canada|mexico|korea|turkey|french|spain|taipei|australia|eggs|gas hit|mention|say|tweet|week of|(january|february|march|april|may|june|july|august|september|october|november|december) \d+|what price|above ___|today|hourly|between \d|corn|wheat|decisions)\b/i;
const FLOOR_24H = 5000;
const FLOOR_TOTAL = 100000;
const PM_TAGS = ['economy', 'fed', 'finance', 'stocks', 'tariffs', 'government-shutdown', 'elections'];
const KS_CATEGORIES = ['Economics', 'Financials', 'Politics'];
const KS_SKIP_FREQ = new Set(['hourly', 'daily', 'weekly', 'fifteen_min']);

const lower = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const num = (x: unknown) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
};

async function polySpark(token: string): Promise<number[]> {
  try {
    const j = await getJson(`${CLOB}/prices-history?market=${token}&interval=1w&fidelity=120`, 6000);
    return (j.history ?? []).map((h: { p: number }) => Number(h.p)).filter(Number.isFinite);
  } catch {
    return [];
  }
}

async function polymarket(): Promise<OddsRow[]> {
  const lists = await Promise.allSettled(PM_TAGS.map((t) => getJson(`${GAMMA}/events?closed=false&active=true&limit=25&tag_slug=${t}&order=volume24hr&ascending=false`, 8000)));
  if (lists.every((l) => l.status === 'rejected')) throw new Error('gamma api down');
  const seen = new Set<string>();
  const rows: (OddsRow & { token?: string })[] = [];
  for (const l of lists) {
    if (l.status !== 'fulfilled' || !Array.isArray(l.value)) continue;
    for (const e of l.value) {
      const title = String(e.title ?? '');
      if (seen.has(e.slug) || !MACRO.test(title) || SKIP.test(title)) continue;
      if (num(e.volume24hr) < FLOOR_24H || num(e.volume) < FLOOR_TOTAL) continue;
      seen.add(e.slug);
      const markets = (e.markets ?? []).filter((m: any) => m.active && !m.closed);
      const outs = markets
        .map((m: any) => {
          const prices = JSON.parse(m.outcomePrices ?? '[]');
          const tokens = JSON.parse(m.clobTokenIds ?? '[]');
          return { m, p: Number(prices[0]), token: tokens[0] as string | undefined };
        })
        .filter((o: any) => Number.isFinite(o.p) && o.p > 0.02 && o.p < 0.98);
      const pick = outs.sort((a: any, b: any) => Math.abs(b.m.oneDayPriceChange ?? 0) - Math.abs(a.m.oneDayPriceChange ?? 0) || b.p - a.p)[0];
      if (!pick) continue;
      const single = markets.length === 1;
      rows.push({
        id: `pm:${pick.m.id ?? e.slug}`,
        source: 'polymarket',
        question: lower(title).replace(/\?*$/, '?'),
        outcome: single ? null : lower(pick.m.groupItemTitle || pick.m.question || ''),
        p: pick.p,
        d1: pick.m.oneDayPriceChange ?? null,
        d7: pick.m.oneWeekPriceChange ?? null,
        spark: [],
        volume24h: num(e.volume24hr),
        volume: num(e.volume),
        url: `https://polymarket.com/event/${e.slug}`,
        closes: e.endDate ?? null,
        token: pick.token,
      });
    }
  }
  rows.sort((a, b) => b.volume24h - a.volume24h);
  const top = rows.slice(0, 10);
  const sparks = await pool(top, 4, (r) => (r.token ? polySpark(r.token) : Promise.resolve([])));
  return top.map(({ token, ...r }, i) => ({ ...r, spark: sparks[i].status === 'fulfilled' ? sparks[i].value : [] }));
}

async function kalshiSeries(): Promise<{ ticker: string; title: string }[]> {
  return cached('board:ks-series', 12 * 3600_000, async () => {
    const lists = await Promise.allSettled(KS_CATEGORIES.map((c) => getJson(`${KALSHI}/series?category=${c}`, 10000)));
    const out: { ticker: string; title: string }[] = [];
    for (const l of lists) {
      if (l.status !== 'fulfilled') continue;
      for (const s of l.value.series ?? []) {
        const title = String(s.title ?? '');
        if (KS_SKIP_FREQ.has(s.frequency) || !MACRO.test(title) || SKIP.test(title)) continue;
        if ((s.tags ?? []).some((t: string) => /international|global central/i.test(t))) continue;
        out.push({ ticker: s.ticker, title });
      }
    }
    if (!out.length) throw new Error('kalshi series empty');
    const titles = new Set(out.filter((s) => s.ticker.startsWith('KX')).map((s) => s.title.toLowerCase()));
    return out
      .filter((s) => s.ticker.startsWith('KX') || !titles.has(s.title.toLowerCase()))
      .sort((a, b) => a.title.length - b.title.length)
      .slice(0, 70);
  });
}

const mid = (c: any) => {
  const close = Number(c.price?.close_dollars);
  if (Number.isFinite(close)) return close;
  const b = Number(c.yes_bid?.close_dollars);
  const a = Number(c.yes_ask?.close_dollars);
  return Number.isFinite(a) && Number.isFinite(b) ? (a + b) / 2 : NaN;
};

async function kalshiSpark(series: string, ticker: string): Promise<number[]> {
  const now = Math.floor(Date.now() / 1000);
  try {
    const j = await getJsonRetry(`${KALSHI}/series/${series}/markets/${ticker}/candlesticks?start_ts=${now - 8 * 86400}&end_ts=${now}&period_interval=60`, 6000);
    return (j.candlesticks ?? []).map(mid).filter(Number.isFinite);
  } catch {
    return [];
  }
}

async function kalshi(): Promise<OddsRow[]> {
  const series = await kalshiSeries();
  const res = await pool(series, 3, (s) => getJsonRetry(`${KALSHI}/markets?series_ticker=${s.ticker}&status=open&limit=200`, 8000).then((j) => ({ s, markets: (j.markets ?? []) as any[] })));
  if (res.every((r) => r.status === 'rejected')) throw new Error('kalshi markets down');
  const rows: (OddsRow & { series: string; ticker: string })[] = [];
  for (const r of res) {
    if (r.status !== 'fulfilled') continue;
    const byEvent = new Map<string, any[]>();
    for (const m of r.value.markets) byEvent.set(m.event_ticker, [...(byEvent.get(m.event_ticker) ?? []), m]);
    for (const [, ms] of byEvent) {
      const vol24 = ms.reduce((a, m) => a + num(m.volume_24h_fp ?? m.volume_24h), 0);
      const vol = ms.reduce((a, m) => a + num(m.volume_fp ?? m.volume), 0);
      if (vol24 < FLOOR_24H / 5 || vol < FLOOR_TOTAL / 2) continue;
      const live = ms
        .map((m) => ({ m, p: num(m.last_price_dollars), prev: Number(m.previous_price_dollars) }))
        .filter((x) => x.p > 0.02 && x.p < 0.98);
      const pick = live.sort((a, b) => Math.abs(b.p - b.prev) - Math.abs(a.p - a.prev) || num(b.m.volume_24h_fp) - num(a.m.volume_24h_fp))[0];
      if (!pick) continue;
      const q = lower(String(pick.m.title ?? r.value.s.title));
      rows.push({
        id: `ks:${pick.m.ticker}`,
        source: 'kalshi',
        question: q.replace(/\?*$/, '?'),
        outcome: null,
        p: pick.p,
        d1: Number.isFinite(pick.prev) && pick.prev > 0 ? pick.p - pick.prev : null,
        d7: null,
        spark: [],
        volume24h: vol24,
        volume: vol,
        url: `https://kalshi.com/markets/${r.value.s.ticker.toLowerCase()}`,
        closes: pick.m.close_time ?? null,
        series: r.value.s.ticker,
        ticker: pick.m.ticker,
      });
    }
  }
  rows.sort((a, b) => b.volume24h - a.volume24h);
  const top = rows.slice(0, 8);
  const sparks = await pool(top, 2, (r) => kalshiSpark(r.series, r.ticker));
  return top.map(({ series, ticker, ...r }, i) => {
    const sp = sparks[i].status === 'fulfilled' ? sparks[i].value : [];
    return { ...r, spark: sp, d7: sp.length > 1 ? r.p - sp[0] : null };
  });
}

const moved = (r: OddsRow) => Math.abs(r.d1 ?? 0) * 2 + Math.abs(r.d7 ?? 0);

export function buildOdds(down: Set<string> = new Set()): Promise<OddsData> {
  const load = async () => {
    const [pm, ks] = await Promise.allSettled([
      (async () => (guard(down, 'polymarket'), polymarket()))(),
      (async () => (guard(down, 'kalshi'), kalshi()))(),
    ]);
    const err = (r: PromiseSettledResult<unknown>) => (r.status === 'rejected' ? String(r.reason instanceof Error ? r.reason.message : r.reason) : undefined);
    const pmRows = pm.status === 'fulfilled' ? pm.value : [];
    const ksRows = ks.status === 'fulfilled' ? ks.value : [];
    if (!pmRows.length && !ksRows.length && pm.status === 'rejected' && ks.status === 'rejected') throw new Error('both odds sources down');
    return {
      rows: [...pmRows, ...ksRows].sort((a, b) => moved(b) - moved(a)),
      sources: [
        { id: 'polymarket' as const, ok: pm.status === 'fulfilled', count: pmRows.length, error: err(pm) },
        { id: 'kalshi' as const, ok: ks.status === 'fulfilled', count: ksRows.length, error: err(ks) },
      ],
      fetchedAt: new Date().toISOString(),
    };
  };
  return down.size ? load() : cached('board:odds', 5 * 60_000, load);
}
