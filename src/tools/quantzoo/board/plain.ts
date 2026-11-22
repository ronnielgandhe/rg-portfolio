import { BAD_WHEN_UP, MOVES, tokens } from './lexicon.ts';
import type { GaugePart, Headline, OddsRow, Quote, TapeData } from './types.ts';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export const fix = (x: number, d: number) => Math.abs(x).toFixed(d);
export const group = (x: number, d: number) => x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const signed = (x: number, d = 2) => `${x > 0 ? '+' : x < 0 ? '-' : ''}${Math.abs(x).toFixed(d)}`;
export const dir = (x: number | null | undefined) => (x == null || Math.abs(x) < 1e-9 ? 'qzb-flat' : x > 0 ? 'qzb-up' : 'qzb-down');

export function niceDay(d: string) {
  const [y, m, day] = d.slice(0, 10).split('-').map(Number);
  return `${MONTHS[m - 1]} ${day}${y !== new Date().getFullYear() ? `, ${y}` : ''}`;
}

export function dayWord(date: string, now: number) {
  if (!now) return 'on the day';
  const today = new Date(now).toISOString().slice(0, 10);
  if (date === today) return 'today';
  const [y, m, d] = date.split('-').map(Number);
  return `on ${DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}`;
}

export function price(q: Quote, x: number) {
  if (q.unit === 'pct') return `${x.toFixed(2)}%`;
  if (q.unit === 'usd') return `$${group(x, x >= 1000 ? 0 : 2)}`;
  return group(x, q.unit === 'pts' ? 1 : 0);
}

const verb = (x: number, big = 0.015) => (x >= big ? 'jumped' : x > 0 ? 'rose' : x <= -big ? 'fell hard' : x < 0 ? 'slipped' : 'was flat');

export function happened(q: Quote, now: number) {
  const when = dayWord(q.date, now);
  if (q.unit === 'pct') return `${q.name} ${q.abs1d > 0 ? 'rose' : q.abs1d < 0 ? 'fell' : 'held'} to ${q.price.toFixed(2)}% ${when}.`;
  if (q.unit === 'pts') return `${q.name} ${verb(q.ch1d, 0.08)} ${when}, ${q.ch1d >= 0 ? 'up' : 'down'} ${fix(q.ch1d * 100, 0)}% to ${q.price.toFixed(1)}.`;
  return `${q.name} ${verb(q.ch1d)} ${when}, ${q.ch1d >= 0 ? 'up' : 'down'} ${fix(q.ch1d * 100, 1)}%.`;
}

const ABOUT: Record<string, string> = {
  '^GSPC': 'the 500 biggest us companies.',
  '^IXIC': 'mostly big tech.',
  '^RUT': '2,000 smaller us companies, they feel the economy first.',
  '^TNX': 'what the us pays to borrow for 10 years. higher means pricier mortgages and loans.',
  'GC=F': 'what people buy when they want something safe.',
  'CL=F': 'crude oil, $ per barrel. feeds straight into gas prices.',
  'BTC-USD': 'trades every day, weekends too.',
};

export function meaning(q: Quote) {
  if (q.sym === '^VIX') {
    const v = q.price;
    return `it guesses how wild stocks get next month. ${v < 17 ? 'under 17 is calm.' : v < 25 ? 'between 17 and 25 is a bit on edge.' : v < 35 ? 'over 25 means people are scared.' : 'over 35 is panic level.'}`;
  }
  const trend =
    q.above200 == null ? '' : q.above200 && q.above50 ? ' trending up for months.' : !q.above200 && !q.above50 ? ' trending down, under its 50 and 200 day averages.' : q.above200 ? ' long trend still up, recent weeks down.' : ' recent weeks up, long trend still down.';
  return `${ABOUT[q.sym] ?? ''}${q.unit === 'pct' ? '' : trend}`;
}

export function breadthLine(t: TapeData, now: number) {
  const { up, of } = t.breadth;
  const spx = t.quotes.find((q): q is Quote => q.sym === '^GSPC' && !('down' in q));
  const when = spx ? dayWord(spx.date, now) : 'on the day';
  if (!of) return '';
  if (up >= of - 2) return `${up} of ${of} parts of the market went up ${when}. that is a broad rally, not just one corner.`;
  if (up <= 2) return `only ${up} of ${of} parts of the market went up ${when}. almost everything fell together.`;
  return `${up} of ${of} parts of the market went up ${when}. a split day, some winners, some losers.`;
}

export type Mood = 'calm' | 'nervous' | 'scared';
export const moodOf = (score: number): Mood => (score >= 20 ? 'calm' : score > -40 ? 'nervous' : 'scared');

export function moodLine(t: TapeData, now: number) {
  const parts = t.gauge.parts;
  const neg = parts.filter((p) => p.points < 0).length;
  const pos = parts.filter((p) => p.points > 0).length;
  const spx = t.quotes.find((q): q is Quote => q.sym === '^GSPC' && !('down' in q));
  const vix = t.quotes.find((q): q is Quote => q.sym === '^VIX' && !('down' in q));
  const bits: string[] = [];
  if (spx) bits.push(`stocks ${spx.ch1d >= 0 ? 'went up' : 'went down'} ${fix(spx.ch1d * 100, 1)}% ${dayWord(spx.date, now)}`);
  if (vix) bits.push(`the fear index is at ${vix.price.toFixed(0)}${vix.price >= 25 ? ', which is high' : vix.price < 17 ? ', which is low' : ''}`);
  const head = bits.length ? `${bits.join(' and ')}. ` : '';
  return `${head}${neg > pos ? `${neg} of our ${parts.length} checks say people are playing it safe.` : pos > neg ? `${pos} of our ${parts.length} checks say people are happy to take risks.` : `our ${parts.length} checks are split down the middle.`}`;
}

export const partLine = (p: GaugePart) => p.name;

function plainText(s: string) {
  return s
    .replace(/hike rates by 0 ?bps/gi, 'keep rates the same')
    .replace(/>\s?(\d+)\s?bps/gi, (_, n) => `more than ${Number(n) / 100}%`)
    .replace(/(\d+)\s?bps/gi, (_, n) => `${Number(n) / 100}%`)
    .replace(/\bsp500\b/gi, 's&p 500')
    .replace(/__+/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

export function oddsLine(r: OddsRow) {
  const ref = r.d7 != null ? { d: r.d7, when: 'a week ago' } : r.d1 != null ? { d: r.d1, when: 'yesterday' } : null;
  if (!ref || Math.round(Math.abs(ref.d) * 100) < 1) return `about the same as ${ref ? ref.when : 'before'}`;
  return `${ref.d > 0 ? 'up' : 'down'} from ${Math.round((r.p - ref.d) * 100)}% ${ref.when}`;
}

export function newsAbout(themes: { name: string; count: number; mean: number }[]) {
  const top = themes.slice().sort((a, b) => b.count - a.count).slice(0, 3);
  if (!top.length) return '';
  const bit = (t: (typeof top)[number]) => `${t.name} (${t.count} stories, ${readOf(t.mean) === 'mixed' ? 'mixed' : `mostly ${readOf(t.mean)}`})`;
  return `most of the news is about ${bit(top[0])}${top[1] ? `, then ${top.slice(1).map(bit).join(' and ')}` : ''}.`;
}

export type Read = 'good news' | 'bad news' | 'mixed';
export const readOf = (s: number): Read => (s > 0.15 ? 'good news' : s < -0.15 ? 'bad news' : 'mixed');

export function why(h: Headline) {
  const toks = tokens(h.title);
  const label = (x: { word: string; w: number }) => {
    const m = MOVES[x.word];
    if (m == null || Math.sign(m) === Math.sign(x.w)) return x.word;
    const noun = toks.find((t) => BAD_WHEN_UP.includes(t));
    return noun ? `${noun} ${x.word}` : x.word;
  };
  const good = h.hits.filter((x) => x.w > 0).map(label);
  const bad = h.hits.filter((x) => x.w < 0).map(label);
  const q = (xs: string[]) => xs.map((w) => `"${w}"`).join(', ');
  if (good.length && bad.length) return `${q(good)} vs ${q(bad)}`;
  if (bad.length) return `words like ${q(bad)}`;
  if (good.length) return `words like ${q(good)}`;
  return 'no strong words';
}

