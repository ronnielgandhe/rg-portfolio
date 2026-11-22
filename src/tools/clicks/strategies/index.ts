import type { Strategy } from './types.ts';
import { random } from './random.ts';
import { keyword, god } from './keyword.ts';
import { hub } from './hub.ts';
import { semantic } from './semantic.ts';
import { learned, guided, MODEL_LABELS, MODEL_VARIANTS } from './learned.ts';
import { bidi } from './bidirectional.ts';

export type { Strategy, LabEvent, RunOpts, Wiki } from './types.ts';

export const MODEL_NAME = 'hopper';

const as = (s: Strategy, name: string, blurb: string, explain = s.explain): Strategy => ({ ...s, name, blurb, explain });

export const FLAGSHIP = as(
  guided,
  MODEL_NAME,
  'my trained model. searches from both ends and picks every next page by how close it predicts the other side is.',
  `${MODEL_NAME} is the model i trained. it searches forward from the start and backward from the target ("what links here") at the same time, and the moment the two sides touch, that is the path. the model decides the order: the forward side opens the page it predicts is closest to the target, the backward side the page it predicts is closest to the start, with a small cost per click so paths stay short. the model is a small distance predictor trained on 1.2 million shortest-path examples from wikispeedia, then fine-tuned on real player clicks. 200 page budget, counting both sides.`,
);

export const TWO_WAY = as(
  bidi,
  'two-way search',
  'searches forward from the start and backward from the target until the two sides meet in the middle.',
  'two searches at once, no model. one walks forward from the start reading each page\'s links, the other walks backward from the target reading "what links here". every new page gets checked against the other side, and the moment they touch, that is the path. it grows whichever side is smaller and finishes each layer before the next, so paths come out near shortest. inside a layer it tries the most target-sounding titles first. 200 page budget, counting both sides.',
);

export const WIDE_BEAM = as(
  god,
  'wide keyword beam',
  'the keyword beam search with a wider beam: keeps 20 links per page and opens up to 200 pages.',
  'exactly the keyword scorer, with more memory: it keeps the best 20 links from every page instead of 8 and will open up to 200 pages before giving up. a wider beam means fewer dead ends, but it still only sees titles and still stops at the first path it finds.',
);

export const KEYWORD = as(keyword, 'keyword beam search', 'the original bot. scores link titles by words shared with the target and keeps the best 8.');
export const HUB = as(hub, 'hub-first search', 'climbs to the biggest hub page it can reach, like united states, then works down toward the target.');
export const SEMANTIC = as(semantic, 'semantic search', 'scores links by meaning with small learned title embeddings, then opens the closest.');
export const RANDOM = as(random, 'random walk', 'clicks a random unseen link every time. the floor everything else has to beat.');

export const LEARNED_RANKER = as(
  learned,
  'learned ranker',
  `${MODEL_NAME}'s model playing alone: one search, the model chooses every click.`,
  `the model on its own, with no backward search. it ranks every link on the page by how many clicks it predicts the target is, opens the best, and pays a small cost per click already spent so it does not wander. this version was trained only on 157,519 clicks real people made in wikispeedia games.`,
);

export const STRATEGIES: Strategy[] = [FLAGSHIP, TWO_WAY, WIDE_BEAM, KEYWORD, HUB, SEMANTIC, RANDOM];

export const VARIANTS: Strategy[] = MODEL_VARIANTS.map((v) => {
  const size = v.id.replace(/^(model|guided)-/, '');
  const label = MODEL_LABELS[size] ?? size;
  return v.id.startsWith('guided-')
    ? as(v, `${MODEL_NAME} (${label} model)`, `two-way search guided by the ${label} model.`)
    : as(v, `learned ranker (${label} model)`, `one search, every click chosen by the ${label} model.`);
});

export const DEFAULT_STRATEGY = 'guided';

export const strategyById = (id: string) => [...STRATEGIES, LEARNED_RANKER, ...VARIANTS].find((s) => s.id === id);
