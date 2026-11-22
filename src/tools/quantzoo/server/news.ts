import { cached, getText, pool } from './http.ts';
import { THEMES, scoreHeadline } from './lexicon.ts';

export const FEEDS = [
  { id: 'marketwatch', name: 'marketwatch', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', home: 'https://www.marketwatch.com' },
  { id: 'cnbc-top', name: 'cnbc', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', home: 'https://www.cnbc.com' },
  { id: 'cnbc-econ', name: 'cnbc economy', url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html', home: 'https://www.cnbc.com/economy/' },
  { id: 'cnbc-fin', name: 'cnbc finance', url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', home: 'https://www.cnbc.com/finance/' },
  { id: 'ft', name: 'financial times', url: 'https://www.ft.com/markets?format=rss', home: 'https://www.ft.com/markets' },
  { id: 'investing', name: 'investing.com', url: 'https://www.investing.com/rss/news_25.rss', home: 'https://www.investing.com' },
  { id: 'fed', name: 'federal reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml', home: 'https://www.federalreserve.gov' },
];

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&apos;|&#39;|&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2019;|&#8217;/g, '’')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();

const tag = (block: string, name: string) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
};

export interface Headline {
  title: string;
  url: string;
  source: string;
  at: number;
  score: number;
  hits: { word: string; w: number }[];
  themes: string[];
}

async function readFeed(f: (typeof FEEDS)[number]): Promise<Headline[]> {
  const xml = await getText(f.url, 8000, { Accept: 'application/rss+xml, application/xml, text/xml' });
  const items = xml.split(/<item[\s>]/i).slice(1);
  return items
    .map((it) => {
      const title = tag(it, 'title');
      const link = tag(it, 'link') || (it.match(/<link[^>]*href="([^"]+)"/i) ?? [])[1] || '';
      const when = Date.parse(tag(it, 'pubDate') || tag(it, 'dc:date') || '') || Date.now();
      const s = scoreHeadline(title);
      return { title, url: link, source: f.name, at: when, score: s.score, hits: s.hits, themes: THEMES.filter((t) => t.re.test(title)).map((t) => t.id) };
    })
    .filter((h) => h.title && /^https?:\/\//.test(h.url));
}

export function buildNews() {
  return cached('news', 15 * 60_000, async () => {
    const res = await pool(FEEDS, 4, readFeed);
    const status = FEEDS.map((f, i) => ({ id: f.id, name: f.name, home: f.home, ok: res[i].status === 'fulfilled' }));
    const all: Headline[] = [];
    const seen = new Set<string>();
    const cutoff = Date.now() - 72 * 3600_000;
    res.forEach((r) => {
      if (r.status !== 'fulfilled') return;
      for (const h of r.value) {
        const key = h.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
        if (seen.has(key) || h.at < cutoff) continue;
        seen.add(key);
        all.push(h);
      }
    });
    all.sort((a, b) => b.at - a.at);
    const themes = THEMES.map((t) => {
      const hs = all.filter((h) => h.themes.includes(t.id));
      const scored = hs.filter((h) => h.hits.length);
      const mean = scored.length ? scored.reduce((a, h) => a + h.score, 0) / scored.length : 0;
      return { id: t.id, name: t.name, count: hs.length, scored: scored.length, mean };
    }).filter((t) => t.count > 0);
    const scoredAll = all.filter((h) => h.hits.length);
    return {
      headlines: all.slice(0, 80),
      themes,
      overall: scoredAll.length ? scoredAll.reduce((a, h) => a + h.score, 0) / scoredAll.length : 0,
      counted: all.length,
      scoredCount: scoredAll.length,
      feeds: status,
      fetchedAt: new Date().toISOString(),
    };
  });
}
