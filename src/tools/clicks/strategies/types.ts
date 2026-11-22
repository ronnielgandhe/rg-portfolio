import type { RaceEvent, RaceResult, Scored } from '../pathfinder.ts';

export type { RaceEvent, RaceResult, Scored };

export type Side = 'forward' | 'backward';

export type LabEvent = RaceEvent & {
  side?: Side;
  frontier?: { forward: number; backward: number };
  meet?: string;
  back?: { page: string; path: string[]; count: number | null; ranked?: Scored[] };
};

export interface Resolved { title: string; disambiguation: boolean }

export interface Wiki {
  resolve(query: string, signal: AbortSignal): Promise<Resolved>;
  links(title: string, signal: AbortSignal): Promise<string[]>;
  backlinks(title: string, signal: AbortSignal): Promise<string[]>;
}

export interface RunOpts {
  signal: AbortSignal;
  pace: () => number;
  wiki?: Wiki;
  seed?: number;
  modelUrl?: string;
}

export type Run = (startQuery: string, targetQuery: string, onStep: (e: LabEvent) => void, opts: RunOpts) => Promise<RaceResult>;

export interface Strategy {
  id: string;
  name: string;
  blurb: string;
  explain: string;
  shape: 'walk' | 'line' | 'fan' | 'hub' | 'meet' | 'cloud' | 'guided' | 'meet-guided';
  budget: number;
  run: Run;
}
