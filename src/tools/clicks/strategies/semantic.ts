import type { Strategy } from './types.ts';
import { bestFirst } from './bestFirst.ts';
import { loadSemantic } from './model.ts';
import { normalize } from './common.ts';

export const semantic: Strategy = {
  id: 'semantic',
  name: 'semantic',
  blurb: 'scores links by meaning: learned title embeddings, cosine similarity to the target.',
  explain: 'every title becomes a 24 number vector built from its words and three-letter chunks, trained on one question only: are these two articles linked or not. titles that show up together end up close. so "volcano" sits near "lava" and "iceland" even with zero shared words. it scores each link by how close it sits to the target, keeps the best 20 and opens up to 200 pages. no word lists, no hub list, no paid api: about 230 kb of weights running in your browser.',
  shape: 'cloud',
  budget: 200,
  run: bestFirst({
    beam: 20, budget: 200, depthCost: 0, thinkDelay: 80, clickDelay: 150,
    prepare: async (_s, target, opts) => {
      const m = await loadSemantic(opts.modelUrl);
      const nt = normalize(target);
      return (links) => {
        const r = m.related(links, target);
        return links.map((l, i) => (normalize(l) === nt ? 10000 : Math.round(r[i] * 100)));
      };
    },
  }),
};
