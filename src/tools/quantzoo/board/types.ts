export type Down = { sym: string; name: string; group: string; down: true };

export interface Quote {
  sym: string;
  name: string;
  group: string;
  unit?: 'pct' | 'pts' | 'usd';
  price: number;
  ch1d: number;
  abs1d: number;
  above50: boolean | null;
  above200: boolean | null;
  spark: number[];
  date: string;
}

export interface GaugePart {
  name: string;
  reading: string;
  points: -1 | 0 | 1;
  rule: string;
}

export interface TapeData {
  quotes: (Quote | Down)[];
  sectors: (Quote | Down)[];
  breadth: { up: number; above50: number; above200: number; of: number };
  gauge: { score: number; parts: GaugePart[] };
  asOf: string;
  fetchedAt: string;
}

export interface OddsPrice {
  source: 'polymarket' | 'kalshi';
  p: number;
  url: string;
  title: string;
  volume24h: number;
}

export interface OddsRow {
  id: string;
  question: string;
  why: string;
  p: number;
  d1: number | null;
  d7: number | null;
  spark: number[];
  prices: OddsPrice[];
  volume24h: number;
  closes: string | null;
}

export interface OddsData {
  rows: OddsRow[];
  sources: { id: 'polymarket' | 'kalshi'; ok: boolean; count: number; error?: string }[];
  fetchedAt: string;
}

export interface Headline {
  title: string;
  url: string;
  source: string;
  at: number;
  score: number;
  hits: { word: string; w: number }[];
  themes: string[];
  also: string[];
}

export interface Theme {
  id: string;
  name: string;
  count: number;
  scored: number;
  mean: number;
  drivers: Headline[];
}

export interface NewsData {
  themes: Theme[];
  reads: Headline[];
  latest: Headline[];
  overall: number;
  counted: number;
  feeds: { id: string; name: string; home: string; ok: boolean; items: number }[];
  fetchedAt: string;
}

export interface Snapshot {
  date: string;
  gauge: number | null;
  breadth: number | null;
  mood: number | null;
  themes: Record<string, number>;
  odds: { question: string; p: number; sources?: string[]; outcome?: string | null; source?: string }[];
}

export interface HistoryData {
  snapshots: Snapshot[];
}
