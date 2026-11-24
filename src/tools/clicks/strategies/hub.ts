import type { Strategy } from './types.ts';
import { bestFirst } from './bestFirst.ts';
import { buildRelatedTerms, keywordScore } from './keyword.ts';
import { extractWords, normalize } from './common.ts';

const HUBS = [
  'united states', 'united kingdom', 'france', 'germany', 'england', 'india', 'canada', 'australia', 'world war ii',
  'china', 'japan', 'italy', 'london', 'europe', 'russia', 'spain', 'new york city', 'english language', 'world war i',
  'latin', 'africa', 'asia', 'brazil', 'mexico', 'scotland', 'ireland', 'netherlands', 'poland', 'sweden', 'egypt',
  'roman empire', 'ancient greece', 'christianity', 'islam', 'catholic church', 'roman catholic church', 'european union',
  'united nations', 'paris', 'california', 'north america', 'south america', 'pacific ocean', 'atlantic ocean', 'earth',
  'science', 'mathematics', 'physics', 'chemistry', 'biology', 'history', 'geography', 'philosophy', 'music', 'film',
  'television', 'internet', 'religion', 'economics', 'politics', 'government', 'animal', 'plant', 'water', 'sun',
];
const HUB_RANK = new Map(HUBS.map((h, i) => [h, i]));

export const hub: Strategy = {
  id: 'hub',
  name: 'hub-first',
  blurb: 'climbs to the biggest hub page it can reach, then descends toward the target.',
  explain: 'the classic human move. most of wikipedia is a few clicks from united states, world war ii or england, and those pages link to almost everything. so it ignores the target at first and clicks the biggest hub it can see (a ranked list of about 65 giant pages). once it is standing on a hub, it switches to the keyword scorer and walks down toward the target. same 8-wide beam and 100 page budget as keyword, so the only difference is the climb.',
  shape: 'hub',
  budget: 100,
  run: bestFirst({
    beam: 8, budget: 100, depthCost: 0, thinkDelay: 200, clickDelay: 400,
    prepare: async (_start, target) => {
      const related = buildRelatedTerms(extractWords(target));
      return (links, current) => {
        const onHub = current.path.some((p) => HUB_RANK.has(normalize(p)));
        return links.map((l) => {
          const kw = keywordScore(l, target, related, current.path);
          if (onHub || kw >= 10000) return kw;
          const r = HUB_RANK.get(normalize(l));
          return r === undefined ? kw - 100 : 1000 - r * 10;
        });
      };
    },
  }),
};
