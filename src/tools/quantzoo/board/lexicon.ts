export const TONE_UP: Record<string, number> = {
  rally: 2, rallies: 2, boom: 2, bullish: 2, euphoria: 2,
  beat: 1.5, beats: 1.5, tops: 1, upgrade: 1.5, upgrades: 1.5, upgraded: 1.5, relief: 1.5, breakthrough: 1.5,
  strong: 1, stronger: 1, robust: 1, resilient: 1, optimism: 1, optimistic: 1, upbeat: 1, confidence: 1, record: 1, highs: 1,
  growth: 1, expands: 1, expansion: 1, hiring: 0.5, profit: 1, profits: 1, deal: 0.5, approves: 0.5, buyback: 1, calm: 1, steady: 0.5,
};

export const TONE_DOWN: Record<string, number> = {
  crash: -2, crashes: -2, rout: -2, selloff: -2, panic: -2, turmoil: -2, collapse: -2, bearish: -2, meltdown: -2,
  miss: -1.5, misses: -1.5, missed: -1.5, downgrade: -1.5, downgraded: -1.5, warns: -1.5, warning: -1.5,
  recession: -1.5, crisis: -1.5, bankruptcy: -1.5, default: -1.5, fraud: -1.5, shutdown: -1, layoffs: -1, slowdown: -1, stagflation: -1.5,
  fear: -1, fears: -1, worry: -1, worries: -1, jitters: -1, weak: -1, weaker: -1, weakness: -1, losses: -1, struggle: -1, struggles: -1,
  uncertainty: -1, volatile: -1, tariff: -0.5, tariffs: -0.5, probe: -0.5, lawsuit: -0.5, bubble: -1, war: -1, threat: -1, risks: -0.5,
};

export const MOVES: Record<string, number> = {
  soar: 2, soars: 2, surge: 2, surges: 2, skyrockets: 2, spikes: 1.5, jump: 1.5, jumps: 1.5, rebound: 1.5, rebounds: 1.5,
  jumped: 1.5, surged: 2, soared: 2, plunged: -2, tumbled: -1.5, rise: 1, rises: 1, rising: 1, rose: 1, gain: 1, gains: 1, climb: 1, climbs: 1, accelerates: 1, hotter: 1, higher: 0.5,
  plunge: -2, plunges: -2, plummet: -2, plummets: -2, tumble: -1.5, tumbles: -1.5, slump: -1.5, slumps: -1.5, sinks: -1.5, sink: -1.5,
  fall: -1, falls: -1, fell: -1, drop: -1, drops: -1, slide: -1, slides: -1, decline: -1, declines: -1, slips: -1, eases: -1, cools: -1, cooler: -1, slows: -1, lower: -0.5,
};
export const BAD_WHEN_UP = ['inflation', 'rates', 'borrowing', 'cpi', 'prices', 'unemployment', 'jobless', 'claims', 'yields', 'yield', 'vix', 'volatility', 'deficit', 'layoffs', 'costs', 'mortgage'];
export const NEGATORS = ['not', 'no', 'never', 'without', "isn't", "doesn't", "won't", "didn't", 'avoids', 'fails'];
export const BOOSTERS = ['sharply', 'biggest', 'massive', 'steep', 'steepest', 'worst', 'best', 'huge'];

export const RULE = [
  'every headline gets split into words.',
  'good words add points and bad words take points away, from 0.5 to 2 each (lists below).',
  'move words like jump or fall count as good when things go up, except for things that hurt when they go up, like rates or prices. so "inflation cools" counts as good news.',
  'a flip word like "not" just before turns the word around. a strong word like "sharply" makes it count 1.5 times.',
  'add it up, divide by 3, keep it between -1 and +1. a topic is the average of its headlines.',
  'the headlines shown are the ones with the strongest words, nudged up when several outlets ran the same story and down as they get older.',
];

const bad = new Set(BAD_WHEN_UP);
const neg = new Set(NEGATORS);
const boost = new Set(BOOSTERS);

export function tokens(title: string): string[] {
  return title.toLowerCase().replace(/[’']/g, "'").replace(/sell-off/g, 'selloff').match(/[a-z']+/g) ?? [];
}

export function scoreHeadline(title: string): { score: number; hits: { word: string; w: number }[] } {
  const t = tokens(title);
  const hits: { word: string; w: number }[] = [];
  let sum = 0;
  t.forEach((word, i) => {
    let w = TONE_UP[word] ?? TONE_DOWN[word];
    if (w == null && MOVES[word] != null) {
      w = MOVES[word];
      if (t.slice(0, i).some((x) => bad.has(x))) w = -w;
    }
    if (w == null) return;
    if (t.slice(Math.max(0, i - 3), i).some((x) => neg.has(x))) w = -w * 0.8;
    if (i > 0 && boost.has(t[i - 1])) w *= 1.5;
    hits.push({ word, w: Math.round(w * 100) / 100 });
    sum += w;
  });
  return { score: Math.max(-1, Math.min(1, sum / 3)), hits };
}

export const THEMES: { id: string; name: string; re: RegExp }[] = [
  { id: 'stocks', name: 'stocks', re: /\b(stocks?|s&p|nasdaq|dow|equities|wall street|shares|index)\b/i },
  { id: 'tech', name: 'tech and ai', re: /\b(ai|nvidia|chips?|semiconductors?|tech|apple|microsoft|alphabet|google|meta|amazon|tesla|openai|anthropic|software)\b/i },
  { id: 'rates', name: 'fed and rates', re: /\b(fed|powell|rates?|yields?|treasur\w*|bonds?|fomc|central bank)\b/i },
  { id: 'inflation', name: 'inflation', re: /\b(inflation|cpi|pce|prices|cost of living)\b/i },
  { id: 'economy', name: 'jobs and economy', re: /\b(jobs?|payrolls|unemployment|jobless|gdp|economy|economic|recession|consumers?|retail sales|spending|housing)\b/i },
  { id: 'energy', name: 'oil and energy', re: /\b(oil|crude|opec|energy|natural gas|brent|wti|gasoline)\b/i },
  { id: 'gold', name: 'gold and metals', re: /\b(gold|silver|copper|metals?)\b/i },
  { id: 'crypto', name: 'crypto', re: /\b(bitcoin|crypto\w*|ether|ethereum|stablecoins?|btc)\b/i },
  { id: 'trade', name: 'trade and tariffs', re: /\b(china|tariffs?|trade war|exports?|imports?|trade deal)\b/i },
  { id: 'banks', name: 'banks and credit', re: /\b(banks?|banking|credit|lenders?|loans?|private credit|jpmorgan|goldman)\b/i },
];
