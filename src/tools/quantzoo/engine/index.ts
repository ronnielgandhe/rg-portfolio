export * from './types.ts';
export { runPortfolio, symbolsFor } from './backtest.ts';
export { runBars, tradeStats, BAR_STRATEGIES } from './bars.ts';
export type { Bars } from './bars.ts';
export { computeMetrics, drawdownSeries, sliceFrom } from './metrics.ts';
export { LEVERAGED, CASH, sma } from './series.ts';
