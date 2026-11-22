export interface Series {
  d: string[];
  c: number[];
  o?: number[];
}

export type PriceMap = Record<string, Series>;

export interface Leg {
  symbol: string;
  weight: number;
}

export interface TrendRule {
  signal: string;
  sma: number;
  buffer?: number;
  riskOff: Leg[];
}

export interface VolTarget {
  annual: number;
  lookback: number;
  maxExposure: number;
}

export interface PortfolioConfig {
  kind: 'portfolio';
  start: string;
  end?: string;
  initial: number;
  universe: Leg[];
  rebalance: 'none' | 'monthly' | 'quarterly' | 'yearly';
  band?: number;
  trend?: TrendRule;
  volTarget?: VolTarget;
  leverage?: number;
  costBps: number;
  benchmark: string;
  synthetic?: boolean;
  oosStart?: string;
}

export interface BarConfig {
  kind: 'bars';
  strategy: string;
  symbol: string;
  interval: string;
  range: string;
  timezone: string;
  pointValue: number;
  tickSize: number;
  initial: number;
  commission: number;
  slippageTicks: number;
  intrabar?: 'tv' | 'worst';
  params: Record<string, number | boolean | string>;
}

export type StrategyConfig = PortfolioConfig | BarConfig;

export interface Version {
  id: string;
  date: string;
  note: string;
  tunedOnFullHistory?: boolean;
  draft?: string;
  config: StrategyConfig;
}

export interface RunResult {
  dates: string[];
  equity: number[];
  benchmark: number[];
  exposure: number[];
  rf: number[];
  events: { date: string; kind: string }[];
  costs: number;
  syntheticUntil?: string;
  trades?: Trade[];
  periodsPerYear: number;
  cleaned?: number[];
}

export interface Trade {
  side: 1 | -1;
  entryTime: number;
  exitTime: number;
  entry: number;
  exit: number;
  pnl: number;
  reason: string;
}

export interface Metrics {
  start: string;
  end: string;
  years: number;
  initial: number;
  final: number;
  totalReturn: number;
  cagr: number;
  maxDrawdown: number;
  maxDrawdownDollars: number;
  dollarPeakDate: string;
  dollarTroughDate: string;
  dollarPeak: number;
  ddPeakDate: string;
  ddTroughDate: string;
  worstYear: { year: string; ret: number } | null;
  sharpe: number;
  vol: number;
  longestUnderwaterDays: number;
  underwaterFrom: string;
  underwaterTo: string;
  recovered: boolean;
}
