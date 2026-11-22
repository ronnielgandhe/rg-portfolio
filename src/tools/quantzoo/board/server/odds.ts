import { cached, getJson, getJsonRetry, guard, pool } from './common.ts';
import type { OddsData, OddsRow } from '../types.ts';

const GAMMA = 'https://gamma-api.polymarket.com';
const CLOB = 'https://clob.polymarket.com';
const KALSHI = 'https://api.elections.kalshi.com/trade-api/v2';
const PM_TAGS = ['economy', 'fed', 'finance', 'government-shutdown', 'commodities'];
const KS_CATEGORIES = ['Economics', 'Financials', 'Politics'];
const KS_SERIES = /^(fed meeting|recession|inflation|government shutdown|shutdown by|unemployment)$/i;
const FLOOR_24H = 1000;
const FLOOR_TOTAL = 50000;
const SHOW = 6;
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

interface Cand {
  source: 'polymarket' | 'kalshi';
  event: string;
  outcome: string;
  title: string;
  p: number;
  d1: number | null;
  d7: number | null;
  vol24: number;
  vol: number;
  url: string;
  closes: string | null;
  token?: string;
  series?: string;
  ticker?: string;
}

interface Topic {
  key: string;
  group: string;
  question: string;
  why: string;
  weight: number;
  pick: 'exact' | 'mid';
}

const lower = (s: unknown) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
const num = (x: unknown) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
};
const soon = (iso: string | null, days: number) => !!iso && Date.parse(iso) - Date.now() < days * 86400_000 && Date.parse(iso) > Date.now();
const money = (s: string) => s.replace(/[^\d.,k$]/gi, '');

const RULES: ((c: Cand) => Topic | null)[] = [
  (c) => {
    if (!soon(c.closes, 100)) return null;
    let month: string | undefined;
    if (c.source === 'polymarket') {
      const m = c.event.match(/^fed decision in (\w+)\?$/);
      if (!m || !/^no change$/.test(c.outcome)) return null;
      month = m[1];
    } else {
      const m = c.title.match(/hike rates by 0 ?bps at their (\w+) \d{4} meeting/);
      if (!m) return null;
      month = m[1];
    }
    if (!MONTHS.includes(month)) return null;
    return { key: `fed-hold-${month}`, group: `fed-hold-${month}`, question: `will the fed leave interest rates alone in ${month}?`, why: 'any surprise moves stocks, bonds and the dollar fast. a cut usually lifts stocks and gold, a hike does the opposite.', weight: 10, pick: 'exact' };
  },
  (c) => {
    const m = (c.event + ' ' + c.title).match(/(?:will there be a )?recession in (\d{4})/);
    if (!m || /japan|uk|euro|china|germany|canada/.test(c.event + c.title)) return null;
    return { key: `recession-${m[1]}`, group: `recession-${m[1]}`, question: `will the us fall into a recession in ${m[1]}?`, why: 'in a recession jobs and profits shrink, and stocks usually fall before it is official.', weight: 9, pick: 'exact' };
  },
  (c) => {
    const m = c.title.match(/rate of cpi inflation be above ([\d.]+)% for the year ending in (\w+) (\d{4})/);
    if (!m) return null;
    return { key: `cpi-${m[2]}-${m[1]}`, group: `cpi-${m[2]}`, question: `will prices be up more than ${m[1]}% from a year ago in the ${m[2]} inflation report?`, why: 'hot inflation keeps interest rates high, which weighs on stocks and bonds.', weight: 8, pick: 'mid' };
  },
  (c) => {
    if (c.source !== 'polymarket' || !/^another fed rate hike in (\d{4})\?$/.test(c.event)) return null;
    const y = c.event.match(/\d{4}/)![0];
    return { key: `fed-hike-${y}`, group: `fed-hike-${y}`, question: `will the fed raise interest rates again before the end of ${y}?`, why: 'higher rates make loans and mortgages pricier, which usually cools stocks.', weight: 7, pick: 'exact' };
  },
  (c) => {
    if (!/government shutdown/.test(c.event + ' ' + c.title)) return null;
    const by = c.outcome.match(/(\w+ \d{1,2}(?:, \d{4})?)/)?.[1] ?? c.title.match(/by (\w+ \d{1,2}(?:, \d{4})?)/)?.[1];
    if (!by) return null;
    return { key: `shutdown-${by}`, group: 'shutdown', question: `will the us government shut down by ${by}?`, why: 'a shutdown pauses government data and pay. markets usually shrug unless it drags on.', weight: 6, pick: 'mid' };
  },
  (c) => {
    if (c.source !== 'polymarket') return null;
    const m = c.event.match(/^what will (gold|wti crude oil|crude oil|silver) \(\w+\) hit.* by end of (\w+)\?$/) ?? c.event.match(/^what will (gold|wti crude oil|crude oil) \(\w+\) hit in (\w+) \d{4}\?$/);
    if (!m) return null;
    const what = m[1].includes('oil') ? 'oil' : m[1];
    const down = /↓|low/.test(c.outcome);
    const level = money(c.outcome);
    if (!level) return null;
    return {
      key: `${what}-${down ? 'lo' : 'hi'}-${level}`,
      group: `${what}-${down ? 'lo' : 'hi'}`,
      question: `will ${what} ${down ? 'drop to' : 'reach'} ${level} by the end of ${m[2]}?`,
      why: what === 'gold' ? 'gold is what people buy when they are scared, so its price is a fear gauge.' : 'oil feeds straight into gas prices and inflation.',
      weight: 4,
      pick: 'mid',
    };
  },
];

async function polymarket(): Promise<Cand[]> {
  const lists = await Promise.allSettled(PM_TAGS.map((t) => getJson(`${GAMMA}/events?closed=false&active=true&limit=30&tag_slug=${t}&order=volume24hr&ascending=false`, 8000)));
  if (lists.every((l) => l.status === 'rejected')) throw new Error('gamma api down');
  const seen = new Set<string>();
  const out: Cand[] = [];
  for (const l of lists) {
    if (l.status !== 'fulfilled' || !Array.isArray(l.value)) continue;
    for (const e of l.value) {
      if (seen.has(e.slug) || num(e.volume) < FLOOR_TOTAL) continue;
      seen.add(e.slug);
      const markets = (e.markets ?? []).filter((m: any) => m.active && !m.closed);
      for (const m of markets) {
        const p = Number(JSON.parse(m.outcomePrices ?? '[]')[0]);
        if (!Number.isFinite(p)) continue;
        out.push({
          source: 'polymarket',
          event: lower(e.title),
          outcome: markets.length === 1 ? '' : lower(m.groupItemTitle || ''),
          title: lower(m.question),
          p,
          d1: m.oneDayPriceChange ?? null,
          d7: m.oneWeekPriceChange ?? null,
          vol24: num(m.volume24hr ?? e.volume24hr),
          vol: num(m.volumeNum ?? m.volume),
          url: `https://polymarket.com/event/${e.slug}`,
          closes: m.endDate ?? e.endDate ?? null,
          token: JSON.parse(m.clobTokenIds ?? '[]')[0],
        });
      }
    }
  }
  return out;
}

async function kalshiSeries(): Promise<{ ticker: string; title: string }[]> {
  return cached('board:ks-series2', 12 * 3600_000, async () => {
    const lists = await Promise.allSettled(KS_CATEGORIES.map((c) => getJson(`${KALSHI}/series?category=${c}`, 10000)));
    const out = lists.flatMap((l) => (l.status === 'fulfilled' ? (l.value.series ?? []) : [])).filter((s: any) => KS_SERIES.test(String(s.title ?? '').trim()) && String(s.ticker).startsWith('KX'));
    if (!out.length) throw new Error('kalshi series empty');
    return out.map((s: any) => ({ ticker: s.ticker, title: s.title }));
  });
}

async function kalshi(): Promise<Cand[]> {
  const series = await kalshiSeries();
  const res = await pool(series, 3, (s) => getJsonRetry(`${KALSHI}/markets?series_ticker=${s.ticker}&status=open&limit=500`, 8000).then((j) => ({ s, markets: (j.markets ?? []) as any[] })));
  if (res.every((r) => r.status === 'rejected')) throw new Error('kalshi markets down');
  const out: Cand[] = [];
  for (const r of res) {
    if (r.status !== 'fulfilled') continue;
    for (const m of r.value.markets) {
      const prev = Number(m.previous_price_dollars);
      const p = num(m.last_price_dollars);
      out.push({
        source: 'kalshi',
        event: lower(r.value.s.title),
        outcome: lower(m.yes_sub_title),
        title: lower(m.title),
        p,
        d1: Number.isFinite(prev) && prev > 0 ? p - prev : null,
        d7: null,
        vol24: num(m.volume_24h_fp),
        vol: num(m.volume_fp),
        url: `https://kalshi.com/markets/${r.value.s.ticker.toLowerCase()}`,
        closes: m.close_time ?? null,
        series: r.value.s.ticker,
        ticker: m.ticker,
      });
    }
  }
  return out;
}

async function polySpark(token: string): Promise<number[]> {
  try {
    const j = await getJson(`${CLOB}/prices-history?market=${token}&interval=1w&fidelity=120`, 6000);
    return (j.history ?? []).map((h: { p: number }) => Number(h.p)).filter(Number.isFinite);
  } catch {
    return [];
  }
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

function choose(cands: Cand[]): OddsRow[] {
  const groups = new Map<string, { t: Topic; c: Cand }[]>();
  for (const c of cands) {
    if (!(c.p > 0.03 && c.p < 0.97) || c.vol < FLOOR_TOTAL / 10) continue;
    for (const rule of RULES) {
      const t = rule(c);
      if (t) {
        groups.set(t.group, [...(groups.get(t.group) ?? []), { t, c }]);
        break;
      }
    }
  }
  const rows: (OddsRow & { weight: number; c: Cand })[] = [];
  for (const items of groups.values()) {
    const liquid = items.filter((x) => x.c.vol24 >= FLOOR_24H || x.c.vol >= FLOOR_TOTAL);
    if (!liquid.length) continue;
    const best = liquid.slice().sort((a, b) => (a.t.pick === 'mid' ? Math.abs(a.c.p - 0.5) - Math.abs(b.c.p - 0.5) : 0) || b.c.vol24 - a.c.vol24)[0];
    const same = liquid.filter((x) => x.t.key === best.t.key);
    const prices = (['polymarket', 'kalshi'] as const)
      .map((src) => same.filter((x) => x.c.source === src).sort((a, b) => b.c.vol24 - a.c.vol24)[0])
      .filter(Boolean)
      .map((x) => ({ source: x.c.source, p: x.c.p, url: x.c.url, title: x.c.source === 'kalshi' || !x.c.outcome ? x.c.title : `${x.c.event} ${x.c.outcome}`, volume24h: x.c.vol24 }));
    const lead = same.slice().sort((a, b) => b.c.vol24 - a.c.vol24)[0];
    rows.push({
      id: best.t.key,
      question: best.t.question,
      why: best.t.why,
      p: lead.c.p,
      d1: lead.c.d1,
      d7: lead.c.d7,
      spark: [],
      prices,
      volume24h: prices.reduce((a, x) => a + x.volume24h, 0),
      closes: lead.c.closes,
      weight: best.t.weight,
      c: lead.c,
    });
  }
  const family = (id: string) => (id.startsWith('fed-') ? id.split('-').slice(0, 2).join('-') : id.split('-')[0]);
  const byClose = rows.slice().sort((a, b) => Date.parse(a.closes ?? '') - Date.parse(b.closes ?? ''));
  const count = new Map<string, number>();
  const keep = byClose.filter((r) => {
    const f = family(r.id);
    const n = count.get(f) ?? 0;
    if (n >= (f === 'fed-hold' ? 2 : 1)) return false;
    count.set(f, n + 1);
    return true;
  });
  const decHold = keep.find((r) => r.id === 'fed-hold-december');
  const lastMeetingYear = decHold?.closes?.slice(0, 4);
  return keep
    .filter((r) => !(lastMeetingYear && r.id === `fed-hike-${lastMeetingYear}`))
    .sort((a, b) => b.weight - a.weight || b.volume24h - a.volume24h)
    .slice(0, SHOW)
    .map((r) => r as OddsRow & { c: Cand });
}

const moved = (r: OddsRow) => Math.abs(r.d7 ?? r.d1 ?? 0);

export function buildOdds(down: Set<string> = new Set()): Promise<OddsData> {
  const load = async () => {
    const [pm, ks] = await Promise.allSettled([(async () => (guard(down, 'polymarket'), polymarket()))(), (async () => (guard(down, 'kalshi'), kalshi()))()]);
    if (pm.status === 'rejected' && ks.status === 'rejected') throw new Error('both odds sources down');
    const err = (r: PromiseSettledResult<unknown>) => (r.status === 'rejected' ? String(r.reason instanceof Error ? r.reason.message : r.reason) : undefined);
    const picked = choose([...(pm.status === 'fulfilled' ? pm.value : []), ...(ks.status === 'fulfilled' ? ks.value : [])]) as (OddsRow & { c: Cand; weight?: number })[];
    const sparks = await pool(picked, 3, (r) => (r.c.token ? polySpark(r.c.token) : r.c.series && r.c.ticker ? kalshiSpark(r.c.series, r.c.ticker) : Promise.resolve([])));
    const rows: OddsRow[] = picked.map(({ c, weight, ...r }, i) => {
      const sp = sparks[i].status === 'fulfilled' ? sparks[i].value : [];
      return { ...r, spark: sp, d7: r.d7 ?? (sp.length > 1 ? r.p - sp[0] : null) };
    });
    return {
      rows: rows.sort((a, b) => moved(b) - moved(a)),
      sources: [
        { id: 'polymarket' as const, ok: pm.status === 'fulfilled', count: rows.filter((r) => r.prices.some((x) => x.source === 'polymarket')).length, error: err(pm) },
        { id: 'kalshi' as const, ok: ks.status === 'fulfilled', count: rows.filter((r) => r.prices.some((x) => x.source === 'kalshi')).length, error: err(ks) },
      ],
      fetchedAt: new Date().toISOString(),
    };
  };
  return down.size ? load() : cached('board:odds2', 5 * 60_000, load);
}
