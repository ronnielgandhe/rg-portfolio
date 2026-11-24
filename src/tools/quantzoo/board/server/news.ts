import { cached, getText, guard, pool } from './common.ts';
import { THEMES, scoreHeadline, tokens } from '../lexicon.ts';
import type { Headline, NewsData, Theme } from '../types.ts';

export const FEEDS = [
  { id: 'mw', name: 'marketwatch', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', home: 'https://www.marketwatch.com' },
  { id: 'mw-pulse', name: 'marketwatch pulse', url: 'https://feeds.content.dowjones.io/public/rss/mw_marketpulse', home: 'https://www.marketwatch.com/markets' },
  { id: 'wsj', name: 'wsj markets', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', home: 'https://www.wsj.com/finance' },
  { id: 'cnbc', name: 'cnbc', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', home: 'https://www.cnbc.com' },
  { id: 'cnbc-econ', name: 'cnbc economy', url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html', home: 'https://www.cnbc.com/economy/' },
  { id: 'cnbc-fin', name: 'cnbc finance', url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', home: 'https://www.cnbc.com/finance/' },
  { id: 'ft', name: 'financial times', url: 'https://www.ft.com/markets?format=rss', home: 'https://www.ft.com/markets' },
  { id: 'bbc', name: 'bbc business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', home: 'https://www.bbc.com/news/business' },
  { id: 'guardian', name: 'guardian economics', url: 'https://www.theguardian.com/business/economics/rss', home: 'https://www.theguardian.com/business/economics' },
  { id: 'nasdaq', name: 'nasdaq', url: 'https://www.nasdaq.com/feed/rssoutbound?category=Markets', home: 'https://www.nasdaq.com/news-and-insights/markets' },
  { id: 'investing', name: 'investing.com', url: 'https://www.investing.com/rss/news_25.rss', home: 'https://www.investing.com/news/stock-market-news' },
  { id: 'fed', name: 'federal reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml', home: 'https://www.federalreserve.gov/newsevents/pressreleases.htm' },
];

const ENTITIES: Record<string, string> = { amp: '&', apos: "'", quot: '"', lt: '<', gt: '>', nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', mdash: ', ', ndash: '-' };

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

const tag = (block: string, name: string) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
};

type Raw = Omit<Headline, 'also'>;

async function readFeed(f: (typeof FEEDS)[number]): Promise<Raw[]> {
  const xml = await getText(f.url, 7000, { Accept: 'application/rss+xml, application/xml, text/xml' });
  const items = xml.split(/<item[\s>]/i).slice(1);
  if (!items.length) throw new Error('no items');
  return items
    .map((it) => {
      const title = tag(it, 'title');
      const url = tag(it, 'link') || (it.match(/<link[^>]*href="([^"]+)"/i) ?? [])[1] || tag(it, 'guid');
      const at = Date.parse(tag(it, 'pubDate') || tag(it, 'dc:date') || tag(it, 'updated')) || 0;
      const s = scoreHeadline(title);
      return { title, url, source: f.name, at, score: s.score, hits: s.hits, themes: THEMES.filter((t) => t.re.test(title)).map((t) => t.id) };
    })
    .filter((h) => h.title.length > 12 && /^https?:\/\//.test(h.url) && h.at > 0);
}

const STOP = new Set(['the', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'and', 'as', 'at', 'is', 'are', 'with', 'by', 'from', 'after', 'its', 'it', 'this', 'that', 'how', 'what', 'why', 'will', 's']);
const keyset = (t: string) => new Set(tokens(t).filter((w) => w.length > 2 && !STOP.has(w)));
const similar = (a: Set<string>, b: Set<string>) => {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n / Math.max(1, Math.min(a.size, b.size)) >= 0.7 && n >= 3;
};

function cluster(all: Raw[]): Headline[] {
  const out: (Headline & { keys: Set<string> })[] = [];
  for (const h of all.sort((a, b) => b.at - a.at)) {
    const keys = keyset(h.title);
    const twin = out.find((o) => o.title.toLowerCase() === h.title.toLowerCase() || similar(o.keys, keys));
    if (twin) {
      if (twin.source !== h.source && !twin.also.includes(h.source)) twin.also.push(h.source);
      continue;
    }
    out.push({ ...h, also: [], keys });
  }
  return out.map(({ keys, ...h }) => h);
}

const signal = (h: Headline, now: number) => Math.abs(h.score) * (1 + 0.6 * h.also.length) * Math.exp(-(now - h.at) / (36 * 3600_000)) * (h.hits.length ? 1 : 0);

export function buildNews(down: Set<string> = new Set()): Promise<NewsData> {
  const load = async () => {
    const res = await pool(FEEDS, 4, (f) => (guard(down, f.id), guard(down, 'news'), readFeed(f)));
    const feeds = FEEDS.map((f, i) => {
      const r = res[i];
      return { id: f.id, name: f.name, home: f.home, ok: r.status === 'fulfilled', items: r.status === 'fulfilled' ? r.value.length : 0 };
    });
    if (feeds.every((f) => !f.ok)) throw new Error('every feed is down');
    const now = Date.now();
    const cutoff = now - 72 * 3600_000;
    const raw = res.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])).filter((h) => h.at > cutoff && h.at < now + 3600_000);
    const all = cluster(raw);
    const scored = all.filter((h) => h.hits.length);
    const themes: Theme[] = THEMES.map((t) => {
      const hs = all.filter((h) => h.themes.includes(t.id));
      const sc = hs.filter((h) => h.hits.length);
      const mean = sc.length ? sc.reduce((a, h) => a + h.score, 0) / sc.length : 0;
      const drivers = sc.slice().sort((a, b) => signal(b, now) - signal(a, now)).slice(0, 3);
      return { id: t.id, name: t.name, count: hs.length, scored: sc.length, mean, drivers };
    })
      .filter((t) => t.scored > 0)
      .sort((a, b) => b.scored - a.scored);
    const reads = scored.slice().sort((a, b) => signal(b, now) - signal(a, now)).slice(0, 6);
    return {
      themes,
      reads,
      latest: all.slice(0, 12),
      overall: scored.length ? scored.reduce((a, h) => a + h.score, 0) / scored.length : 0,
      counted: all.length,
      feeds,
      fetchedAt: new Date().toISOString(),
    };
  };
  return down.size ? load() : cached('board:news', 10 * 60_000, load);
}
