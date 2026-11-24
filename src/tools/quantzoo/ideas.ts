import type { Version } from './engine/index.ts';
import { parsePlay, type PlayLeg } from './engine/play.ts';

export interface Idea {
  slug: string;
  title: string;
  date: string;
  play: PlayLeg[];
  benchmark: string;
  draft: boolean;
  sections: { heading: string; body: string }[];
  versions: Version[];
}

const docs = import.meta.glob('/src/data/quantzoo/ideas/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const vers = import.meta.glob('/src/data/quantzoo/ideas/*.versions.json', { import: 'default', eager: true }) as Record<string, Version[]>;

function parse(path: string, raw: string): Idea {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const front: Record<string, string> = {};
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) front[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const body = m ? m[2] : raw;
  const sections = body
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [head, ...rest] = chunk.split('\n');
      return { heading: head.trim(), body: rest.join('\n').trim() };
    });
  const vfile = front.versions ? `/src/data/quantzoo/ideas/${front.versions}` : '';
  const versions = (vers[vfile] ?? []).map(({ draft: _d, ...v }) => v as Version);
  return {
    slug,
    title: front.title ?? slug,
    date: front.date ?? '',
    play: parsePlay(front.play ?? ''),
    benchmark: (front.benchmark ?? 'SPY').toUpperCase(),
    draft: front.draft === 'true',
    sections,
    versions,
  };
}

export function allIdeas(): Idea[] {
  return Object.entries(docs)
    .map(([p, raw]) => parse(p, raw))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getIdea(slug: string): Idea | undefined {
  return allIdeas().find((i) => i.slug === slug);
}
