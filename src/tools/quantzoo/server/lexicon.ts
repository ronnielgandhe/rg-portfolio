export const WORDS: Record<string, number> = {
  surge: 2, surges: 2, soar: 2, soars: 2, rally: 2, rallies: 2, boom: 2, record: 1, best: 1, jump: 1.5, jumps: 1.5, gain: 1, gains: 1,
  rise: 1, rises: 1, rising: 0.5, climb: 1, climbs: 1, rebound: 1.5, rebounds: 1.5, recover: 1, recovers: 1, recovery: 1, beat: 1.5, beats: 1.5,
  strong: 1, stronger: 1, strength: 1, upgrade: 1.5, upgrades: 1.5, upgraded: 1.5, optimism: 1.5, optimistic: 1.5, confidence: 1, boost: 1, boosts: 1,
  growth: 1, grows: 1, expand: 1, expands: 1, expansion: 1, hire: 0.5, hiring: 0.5, deal: 1, approve: 1, approves: 1, approval: 1, win: 1, wins: 1,
  cools: 1, cooling: 1, eases: 1, easing: 1, ease: 1, relief: 1.5, calm: 1, steady: 0.5, resilient: 1, profit: 1, profits: 1, upbeat: 1.5, bullish: 2,
  high: 0.5, highs: 1, outperform: 1, outperforms: 1, accelerate: 1, accelerates: 1, buyback: 1, dividend: 0.5, breakthrough: 1.5, tops: 1, topped: 1,
  plunge: -2, plunges: -2, crash: -2, crashes: -2, tumble: -2, tumbles: -2, sink: -1.5, sinks: -1.5, slump: -2, slumps: -2, selloff: -2, rout: -2,
  fall: -1, falls: -1, fell: -1, drop: -1, drops: -1, slide: -1, slides: -1, decline: -1, declines: -1, lower: -0.5, loss: -1, losses: -1, lose: -1,
  miss: -1.5, misses: -1.5, missed: -1.5, weak: -1, weaker: -1, weakness: -1, downgrade: -1.5, downgrades: -1.5, downgraded: -1.5, cut: -0.5, cuts: -0.5,
  fear: -1.5, fears: -1.5, worry: -1, worries: -1, worried: -1, concern: -1, concerns: -1, risk: -0.5, risks: -0.5, warn: -1.5, warns: -1.5, warning: -1.5,
  recession: -2, slowdown: -1.5, slows: -1, slowing: -1, stall: -1, stalls: -1, layoffs: -1.5, layoff: -1.5, bankrupt: -2, bankruptcy: -2, default: -1.5,
  crisis: -2, war: -1.5, tariff: -1, tariffs: -1, sanctions: -1, probe: -1, lawsuit: -1, sues: -1, fraud: -2, scandal: -1.5, shutdown: -1.5, strike: -0.5,
  inflation: -0.5, hot: -0.5, hotter: -1, soaring: -0.5, volatile: -1, volatility: -0.5, turmoil: -2, panic: -2, bearish: -2, bubble: -1, uncertainty: -1,
  hike: -0.5, hikes: -0.5, glut: -1, underperform: -1, plummet: -2, plummets: -2, sputter: -1, struggle: -1, struggles: -1, collapse: -2, threat: -1,
};

const NEGATORS = new Set(['not', 'no', 'never', 'without', "isn't", "doesn't", "won't", "didn't", 'fails', 'fail', 'avoid', 'avoids', 'despite']);
const BOOST = new Set(['sharply', 'biggest', 'massive', 'huge', 'steep', 'steepest', 'worst', 'record']);

export interface Scored {
  score: number;
  hits: { word: string; w: number }[];
}

export function scoreHeadline(title: string): Scored {
  const toks = title.toLowerCase().replace(/[’']/g, "'").replace(/sell-off/g, 'selloff').match(/[a-z']+/g) ?? [];
  const hits: Scored['hits'] = [];
  let sum = 0;
  toks.forEach((t, i) => {
    let w = WORDS[t];
    if (w == null) return;
    const window = toks.slice(Math.max(0, i - 3), i);
    if (window.some((x) => NEGATORS.has(x))) w = -w * 0.8;
    if (i > 0 && BOOST.has(toks[i - 1]) && toks[i - 1] !== t) w *= 1.5;
    hits.push({ word: t, w });
    sum += w;
  });
  return { score: Math.max(-1, Math.min(1, sum / 3)), hits };
}

export const THEMES: { id: string; name: string; re: RegExp }[] = [
  { id: 'stocks', name: 'stocks', re: /\b(stocks?|s&p|nasdaq|dow|equit|wall street|shares|index|indexes)\b/i },
  { id: 'tech', name: 'tech and ai', re: /\b(ai|nvidia|chips?|semiconductors?|tech|apple|microsoft|google|alphabet|meta|amazon|tesla|openai|software)\b/i },
  { id: 'rates', name: 'fed and rates', re: /\b(fed|powell|rates?|yields?|treasur|bonds?|central bank|fomc|ecb|boj|bank of)\b/i },
  { id: 'inflation', name: 'inflation', re: /\b(inflation|cpi|prices|pce|cost of living)\b/i },
  { id: 'economy', name: 'economy and jobs', re: /\b(jobs?|payrolls|unemployment|gdp|economy|economic|recession|consumer|retail sales|spending|housing)\b/i },
  { id: 'energy', name: 'oil and energy', re: /\b(oil|crude|opec|energy|gas|brent|wti)\b/i },
  { id: 'gold', name: 'gold and metals', re: /\b(gold|silver|copper|metals?)\b/i },
  { id: 'crypto', name: 'crypto', re: /\b(bitcoin|crypto|ether|ethereum|stablecoin|btc)\b/i },
  { id: 'trade', name: 'trade and china', re: /\b(china|chinese|tariffs?|trade war|exports?|imports?)\b/i },
];
