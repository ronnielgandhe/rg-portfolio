import { getPageLinks, resolveTitle, WikiError } from './wiki';

export type Mode = 'normal' | 'god';

export interface Scored { title: string; score: number }

export type Side = 'forward' | 'backward';

export type RaceEvent =
  | { type: 'status'; message: string }
  | { type: 'resolved'; start: string; target: string }
  | { type: 'visiting'; page: string; path: string[]; totalExplored: number; side?: Side }
  | { type: 'links_found'; page: string; count: number; totalExplored: number; side?: Side }
  | { type: 'scored'; page: string; ranked: Scored[]; selected: string[]; stuck: boolean; unvisited: number; side?: Side }
  | { type: 'considering'; link: string; score: number; index: number; side?: Side }
  | { type: 'clicking'; link: string; path: string[]; totalExplored: number; side?: Side }
  | { type: 'skipped'; page: string; side?: Side }
  | { type: 'found'; path: string[]; clicks: number; totalExplored: number }
  | { type: 'not_found'; totalExplored: number }
  | { type: 'error'; message: string };

export type StepEvent = RaceEvent;

export interface RaceResult { path: string[] | null; totalExplored: number }

export interface RunOptions { signal: AbortSignal; pace: () => number }

export type StrategyRun = (start: string, target: string, onStep: (e: StepEvent) => void, opts: RunOptions) => Promise<RaceResult>;

export interface Strategy { id: string; name: string; blurb: string; run: StrategyRun }

const STOP_WORDS = new Set([
  'the', 'of', 'and', 'in', 'a', 'an', 'to', 'for', 'is', 'on', 'at', 'by',
  'with', 'from', 'as', 'or', 'its', 'list', 'also', 'was', 'are', 'be', 'has',
  'been', 'were', 'it', 'this', 'that', 'not', 'but', 'they', 'have', 'had',
]);

export function normalize(title: string) {
  return title.toLowerCase().replace(/_/g, ' ').trim();
}

function extractWords(text: string) {
  return normalize(text)
    .split(/[\s\-_,():.!?]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

const RELATIONSHIPS: Record<string, string[]> = {
  bank: ['finance', 'financial', 'banking', 'money', 'currency', 'economy', 'economic', 'central', 'monetary'],
  england: ['english', 'british', 'britain', 'london', 'uk', 'kingdom', 'united', 'anglo'],
  united: ['kingdom', 'states', 'nations'],
  kingdom: ['united', 'england', 'britain', 'british', 'monarchy', 'royal'],
  america: ['american', 'united', 'states', 'usa', 'us'],
  states: ['united', 'america', 'american', 'federal'],
  japan: ['japanese', 'tokyo'],
  china: ['chinese', 'beijing'],
  france: ['french', 'paris'],
  germany: ['german', 'berlin'],
  london: ['england', 'english', 'british', 'britain', 'thames', 'uk', 'united'],
  science: ['scientific', 'scientist', 'research'],
  music: ['musical', 'musician', 'song', 'album'],
  war: ['military', 'army', 'battle', 'soldier'],
  film: ['movie', 'cinema', 'actor', 'director'],
  computer: ['computing', 'software', 'technology', 'digital'],
  city: ['urban', 'metropolitan', 'town'],
  history: ['historical', 'ancient', 'medieval'],
  politics: ['political', 'government', 'parliament', 'minister'],
  sport: ['sports', 'athletic', 'player', 'team'],
  europe: ['european', 'eu'],
  africa: ['african'],
  asia: ['asian'],
};

function buildRelatedTerms(targetWords: string[]) {
  const related = new Map<string, number>();
  for (const tw of targetWords) {
    related.set(tw, 25);
    if (RELATIONSHIPS[tw]) {
      for (const r of RELATIONSHIPS[tw]) related.set(r, 15);
    }
    for (const [key, vals] of Object.entries(RELATIONSHIPS)) {
      if (key.includes(tw) || tw.includes(key)) {
        related.set(key, 12);
        for (const v of vals) related.set(v, 10);
      }
    }
  }
  return related;
}

const HUB_ARTICLES = new Set([
  'united states', 'united kingdom', 'england', 'london', 'france', 'germany',
  'japan', 'china', 'india', 'canada', 'australia', 'russia', 'italy', 'spain',
  'brazil', 'new york city', 'california', 'europe', 'asia', 'africa',
  'world war ii', 'world war i', 'english language', 'latin', 'greek',
  'film', 'television', 'music', 'internet', 'science', 'mathematics',
  'philosophy', 'history', 'geography', 'economics', 'politics',
  'christianity', 'islam', 'university', 'population', 'government',
]);

function scoreSimilarity(linkTitle: string, targetTitle: string, relatedTerms: Map<string, number>, pathSoFar: string[]) {
  const link = normalize(linkTitle);
  const target = normalize(targetTitle);
  if (link === target) return 10000;

  const linkWords = extractWords(linkTitle);
  const targetWords = extractWords(targetTitle);
  let score = 0;

  if (link.includes(target)) score += 200;
  if (target.includes(link) && link.length > 3) score += 100;

  let wordMatches = 0;
  for (const tw of targetWords) {
    for (const lw of linkWords) {
      if (lw === tw) {
        score += 30;
        wordMatches++;
        break;
      } else if (tw.length > 3 && lw.length > 3 && (lw.includes(tw) || tw.includes(lw))) {
        score += 10;
        break;
      }
    }
  }
  if (wordMatches >= 2) score += 40;

  for (const lw of linkWords) {
    const bonus = relatedTerms.get(lw);
    if (bonus) score += bonus;
  }

  if (HUB_ARTICLES.has(link)) score += 15;

  const wordCount = linkWords.length;
  if (score > 0) {
    if (wordCount <= 2) score += 3;
    if (wordCount === 1) score += 2;
  }
  if (wordCount > 5) score -= 5;
  if (wordCount > 8) score -= 12;

  if (pathSoFar && pathSoFar.length > 1) {
    const pathWords = new Set<string>();
    for (const p of pathSoFar) for (const w of extractWords(p)) pathWords.add(w);
    for (const tw of targetWords) pathWords.delete(tw);
    for (const [rw] of relatedTerms) pathWords.delete(rw);
    let pathOverlap = 0;
    for (const lw of linkWords) if (pathWords.has(lw)) pathOverlap++;
    if (pathOverlap > 0) score -= pathOverlap * 8;
  }

  return score;
}

export const MODES: Record<Mode, { beamWidth: number; thinkDelay: number; clickDelay: number; maxExplored: number }> = {
  normal: { beamWidth: 8, thinkDelay: 200, clickDelay: 400, maxExplored: 100 },
  god: { beamWidth: 20, thinkDelay: 60, clickDelay: 100, maxExplored: 200 },
};

interface Candidate { title: string; path: string[]; score: number }

export async function findPath(
  startQuery: string,
  targetQuery: string,
  mode: Mode,
  onStep: (e: RaceEvent) => void,
  opts: RunOptions,
): Promise<RaceResult> {
  const { signal, pace } = opts;
  const sleep = async (ms: number) => {
    const d = ms * pace();
    if (d > 0) await new Promise((r) => setTimeout(r, d));
    signal.throwIfAborted();
  };

  let startTitle: string, targetTitle: string;
  try {
    onStep({ type: 'status', message: `looking up ${startQuery}` });
    const s = await resolveTitle(startQuery, signal);
    onStep({ type: 'status', message: `looking up ${targetQuery}` });
    const t = await resolveTitle(targetQuery, signal);
    if (t.disambiguation) throw new WikiError(`"${t.title}" is a disambiguation page, so there is nothing to land on. pick a more specific article for "to".`);
    startTitle = s.title;
    targetTitle = t.title;
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    onStep({ type: 'error', message: err instanceof WikiError ? err.message : 'something went wrong looking those up.' });
    return { path: null, totalExplored: 0 };
  }

  onStep({ type: 'resolved', start: startTitle, target: targetTitle });

  if (normalize(startTitle) === normalize(targetTitle)) {
    onStep({ type: 'found', path: [startTitle], clicks: 0, totalExplored: 0 });
    return { path: [startTitle], totalExplored: 0 };
  }

  const targetWords = extractWords(targetTitle);
  const relatedTerms = buildRelatedTerms(targetWords);
  const { beamWidth, thinkDelay, clickDelay, maxExplored } = MODES[mode];

  const visited = new Set([normalize(startTitle)]);
  let candidates: Candidate[] = [{ title: startTitle, path: [startTitle], score: 0 }];
  let totalExplored = 0;
  let stuckCount = 0;
  let failures = 0;

  while (candidates.length > 0 && totalExplored < maxExplored) {
    totalExplored++;
    const current = candidates.shift()!;

    onStep({ type: 'visiting', page: current.title, path: current.path, totalExplored });
    await sleep(thinkDelay);

    let links: string[];
    try {
      links = await getPageLinks(current.title, signal);
      failures = 0;
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err;
      onStep({ type: 'skipped', page: current.title });
      if (++failures >= 4) {
        onStep({ type: 'error', message: err instanceof WikiError ? err.message : 'lost the connection to wikipedia mid-race.' });
        return { path: null, totalExplored };
      }
      continue;
    }

    onStep({ type: 'links_found', page: current.title, count: links.length, totalExplored });
    await sleep(thinkDelay);

    const normalizedTarget = normalize(targetTitle);
    const directLink = links.find((l) => normalize(l) === normalizedTarget);
    if (directLink) {
      const finalPath = [...current.path, targetTitle];
      totalExplored++;
      onStep({ type: 'found', path: finalPath, clicks: finalPath.length - 1, totalExplored });
      return { path: finalPath, totalExplored };
    }

    const scoredLinks: Candidate[] = links
      .filter((l) => !visited.has(normalize(l)))
      .map((l) => ({ title: l, score: scoreSimilarity(l, targetTitle, relatedTerms, current.path), path: [...current.path, l] }))
      .sort((a, b) => b.score - a.score);
    const unvisited = scoredLinks.length;

    let stuck = false;
    const topScore = scoredLinks.length > 0 ? scoredLinks[0].score : 0;
    if (topScore < 3) {
      stuckCount++;
      if (stuckCount > 2) {
        stuck = true;
        const generalLinks = [...scoredLinks]
          .sort((a, b) => extractWords(a.title).length - extractWords(b.title).length)
          .slice(0, 3);
        for (const gl of generalLinks) gl.score += 10;
        scoredLinks.splice(0, 0, ...generalLinks);
        scoredLinks.sort((a, b) => b.score - a.score);
        stuckCount = 0;
      }
    } else {
      stuckCount = 0;
    }

    const selected = scoredLinks.slice(0, beamWidth);
    const seen = new Set<string>();
    const ranked: Scored[] = [];
    for (const l of scoredLinks) {
      if (seen.has(l.title)) continue;
      seen.add(l.title);
      ranked.push({ title: l.title, score: l.score });
      if (ranked.length >= Math.max(beamWidth, 8) + 6) break;
    }
    onStep({ type: 'scored', page: current.title, ranked, selected: selected.map((s) => s.title), stuck, unvisited });

    const showCount = Math.min(4, scoredLinks.length);
    for (let i = 0; i < showCount; i++) {
      const c = scoredLinks[i];
      onStep({ type: 'considering', link: c.title, score: c.score, index: i });
      await sleep(thinkDelay);
    }

    for (const link of selected) {
      visited.add(normalize(link.title));
      candidates.push(link);
    }
    candidates.sort((a, b) => b.score - a.score);
    candidates = candidates.slice(0, beamWidth * 5);

    if (selected.length > 0) {
      onStep({ type: 'clicking', link: selected[0].title, path: selected[0].path, totalExplored });
      await sleep(clickDelay);
    }
  }

  onStep({ type: 'not_found', totalExplored });
  return { path: null, totalExplored };
}

export const BUILTIN_STRATEGIES: Strategy[] = [
  {
    id: 'beam',
    name: 'normal',
    blurb: 'beam search that keeps the best 8 links per page and gives up after 100 pages',
    run: (start, target, onStep, opts) => findPath(start, target, 'normal', onStep, opts),
  },
  {
    id: 'beam-god',
    name: 'wide keyword beam',
    blurb: 'the same search with a wider beam: best 20 links per page, up to 200 pages',
    run: (start, target, onStep, opts) => findPath(start, target, 'god', onStep, opts),
  },
];
