import type { Strategy } from './types.ts';
import { bestFirst } from './bestFirst.ts';
import { bidirectional } from './bidirectional.ts';
import { loadModel } from './model.ts';
import { normalize } from './common.ts';
import { TUNED } from './tuned.ts';

export const clicksScore = (distance: number) => Math.round((9 - distance) * 10);
const clicksOf = (score: number) => 9 - score / 10;

export const learnedRun = (modelId: string, beam: number, depthCost: number) => bestFirst({
  beam, budget: 200, depthCost, thinkDelay: 80, clickDelay: 150, clicksOf,
  prepare: async (_s, target, opts) => {
    const m = await loadModel(modelId, opts.modelUrl);
    const nt = normalize(target);
    return (links) => {
      const d = m.distance(links, target);
      return links.map((l, i) => (normalize(l) === nt ? 10000 : clicksScore(d[i])));
    };
  },
});

export const guidedRun = (modelId: string, depthCost: number) => bidirectional({
  budget: 200, depthCost, thinkDelay: 80, clickDelay: 150, clicksOf,
  prepare: async (start, target, opts) => {
    const m = await loadModel(modelId, opts.modelUrl);
    return (side, titles) => {
      const d = side === 'forward' ? m.distance(titles, target) : m.distanceFrom(start, titles);
      return Array.from(d, clicksScore);
    };
  },
});

export const MODEL_LABELS: Record<string, string> = {
  tiny: 'tiny',
  base: 'base',
  imitate: 'imitation',
  human: 'base + human clicks',
};

export const learned: Strategy = {
  id: 'model',
  name: 'my model',
  blurb: 'one search, steered by a model i trained on 157,519 real player clicks. opens few pages.',
  explain: `my model, playing alone. it is the imitation model: i trained it on 157,519 clicks real people made in wikispeedia games, to rank the link a player actually clicked above the other links on that page. on every page it scores all the links in one pass (the score is its guess at how many clicks away the target is) and opens the one it likes best, with a small cost for every click already spent so it does not wander. keeps the best ${TUNED.model.beam}, 200 page budget. about 625 kb of weights, plain typescript math, in your browser.`,
  shape: 'guided',
  budget: 200,
  run: learnedRun(TUNED.model.id, TUNED.model.beam, TUNED.model.depthCost),
};

export const guided: Strategy = {
  id: 'guided',
  name: 'my model, both ends',
  blurb: 'the god model: search from both ends at once, my model picks which page each side opens.',
  explain: 'my god model. it searches forward from the start and backward from the target ("what links here") at the same time, and the moment the two sides touch, that is the path. my model decides the order: the forward side opens the page it predicts is closest to the target, the backward side the page it predicts is closest to the start, and a cost per click keeps paths short. the model here is my distance predictor, trained on 1.2 million shortest-path examples and then fine-tuned on real player clicks. 200 page budget, counting both sides.',
  shape: 'meet-guided',
  budget: 200,
  run: guidedRun(TUNED.guided.id, TUNED.guided.depthCost),
};

export const MODEL_VARIANTS: Strategy[] = Object.entries(MODEL_LABELS).flatMap(([id, label]) => [
  { ...learned, id: `model-${id}`, name: `my model (${label})`, blurb: `greedy search with the ${label} model.`, run: learnedRun(id, TUNED.model.beam, TUNED.model.depthCost) },
  { ...guided, id: `guided-${id}`, name: `my model (${label}), both ends`, blurb: `both-ends search guided by the ${label} model.`, run: guidedRun(id, TUNED.guided.depthCost) },
]);
