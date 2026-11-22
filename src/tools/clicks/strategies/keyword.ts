import { MODES, findPath } from '../pathfinder.ts';
import type { Strategy } from './types.ts';
import { extractWords, normalize } from './common.ts';

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

export const HUB_ARTICLES = new Set([
  'united states', 'united kingdom', 'england', 'london', 'france', 'germany',
  'japan', 'china', 'india', 'canada', 'australia', 'russia', 'italy', 'spain',
  'brazil', 'new york city', 'california', 'europe', 'asia', 'africa',
  'world war ii', 'world war i', 'english language', 'latin', 'greek',
  'film', 'television', 'music', 'internet', 'science', 'mathematics',
  'philosophy', 'history', 'geography', 'economics', 'politics',
  'christianity', 'islam', 'university', 'population', 'government',
]);

export function buildRelatedTerms(targetWords: string[]) {
  const related = new Map<string, number>();
  for (const tw of targetWords) {
    related.set(tw, 25);
    if (RELATIONSHIPS[tw]) for (const r of RELATIONSHIPS[tw]) related.set(r, 15);
    for (const [key, vals] of Object.entries(RELATIONSHIPS)) {
      if (key.includes(tw) || tw.includes(key)) {
        related.set(key, 12);
        for (const v of vals) related.set(v, 10);
      }
    }
  }
  return related;
}

export function keywordScore(linkTitle: string, targetTitle: string, relatedTerms: Map<string, number>, pathSoFar: string[]) {
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
      if (lw === tw) { score += 30; wordMatches++; break; }
      if (tw.length > 3 && lw.length > 3 && (lw.includes(tw) || tw.includes(lw))) { score += 10; break; }
    }
  }
  if (wordMatches >= 2) score += 40;
  for (const lw of linkWords) score += relatedTerms.get(lw) ?? 0;
  if (HUB_ARTICLES.has(link)) score += 15;
  const wordCount = linkWords.length;
  if (score > 0) {
    if (wordCount <= 2) score += 3;
    if (wordCount === 1) score += 2;
  }
  if (wordCount > 5) score -= 5;
  if (wordCount > 8) score -= 12;
  if (pathSoFar.length > 1) {
    const pathWords = new Set<string>();
    for (const p of pathSoFar) for (const w of extractWords(p)) pathWords.add(w);
    for (const tw of targetWords) pathWords.delete(tw);
    for (const [rw] of relatedTerms) pathWords.delete(rw);
    let overlap = 0;
    for (const lw of linkWords) if (pathWords.has(lw)) overlap++;
    score -= overlap * 8;
  }
  return score;
}

export const keyword: Strategy = {
  id: 'keyword',
  name: 'keyword',
  blurb: 'the original bot. scores link titles by shared words with the target.',
  explain: 'reads every link title on the page and scores it: shared words with the target, a hand-written list of about 23 related-word groups, a bonus for about 40 big hub pages, a penalty for reusing words already on the path. keeps the best 8, always opens the best-scoring page it has not opened yet, gives up after 100 pages. it never reads article text and never looks backward from the target, so it returns the first path it trips over, not the shortest.',
  shape: 'line',
  budget: MODES.normal.maxExplored,
  run: (start, target, onStep, opts) => findPath(start, target, 'normal', onStep, opts),
};

export const god: Strategy = {
  id: 'god',
  name: 'god mode',
  blurb: 'the same scorer with a wider beam: keeps 20 links per page, 200 page budget.',
  explain: 'exactly the keyword scorer, just greedier with memory: it keeps the best 20 links from every page instead of 8 and will open up to 200 pages before giving up. wider beam means fewer dead ends, but it still only sees titles and still stops at the first path it finds.',
  shape: 'fan',
  budget: MODES.god.maxExplored,
  run: (start, target, onStep, opts) => findPath(start, target, 'god', onStep, opts),
};
