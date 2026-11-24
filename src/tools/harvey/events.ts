import { useCallback, useRef, useState } from 'react';

export interface SeeAlso {
  section: string;
  title: string;
  source: string;
  jurisdiction?: string;
  quote?: string;
  fullText?: string;
}

export interface NewsItem {
  title: string;
  source: string;
  published: string;
  link: string;
  summary?: string;
}

export interface Trade {
  ticker: string;
  member: string;
  chamber: string;
  party: string;
  state: string;
  side: string;
  size: string;
  filed: string;
  traded: string;
}

export interface StockData {
  query?: string;
  symbol?: string;
  shortName?: string;
  currency?: string;
  price?: number;
  previousClose?: number;
  change?: number;
  changePct?: number;
  dayHigh?: number;
  dayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  exchange?: string;
  closes?: number[];
  error?: string;
  message?: string;
}

export type Pane =
  | { kind: 'statute'; id: string; jurisdiction: string; section: string; title: string; quote: string; fullText?: string; frenchQuote?: string; source?: string; confidence?: number; seeAlso: SeeAlso[] }
  | { kind: 'news'; id: string; query: string; items: NewsItem[] }
  | { kind: 'stock'; id: string; data: StockData }
  | { kind: 'hill'; id: string; ticker: string; trades: Trade[]; source?: string };

export interface ToolRun {
  id: string;
  name: string;
  status: string;
}

export interface HarveyEvent {
  type?: string;
  payload?: Record<string, unknown>;
  [k: string]: unknown;
}

const MAX_PANES = 12;

export function decodeEvent(data: Uint8Array): HarveyEvent | null {
  try {
    return JSON.parse(new TextDecoder().decode(data)) as HarveyEvent;
  } catch {
    return null;
  }
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const str = (v: unknown) => (v === undefined || v === null ? '' : String(v));
const opt = (v: unknown) => (v ? String(v) : undefined);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const list = (v: unknown) => (Array.isArray(v) ? (v as Record<string, unknown>[]) : []);
const place = (v: unknown) => (str(v) === String.fromCharCode(8212) ? '' : str(v));

function newsItems(v: unknown): NewsItem[] {
  return list(v).map((o) => ({ title: str(o.title), source: str(o.source), published: str(o.published), link: str(o.link), summary: opt(o.summary) }));
}

function seeAlso(v: unknown): SeeAlso[] {
  return list(v).map((o) => ({ section: str(o.section), title: str(o.title), source: str(o.source), jurisdiction: opt(o.jurisdiction) && place(o.jurisdiction), quote: opt(o.quote), fullText: opt(o.full_text) }));
}

const TARGETS: Record<string, Pane['kind'][]> = {
  stock: ['stock'], stocks: ['stock'], hill: ['hill'], statute: ['statute'], statutes: ['statute'], news: ['news'], articles: ['news'],
};

function matches(p: Pane, target: string) {
  if (target === 'all' || target === 'everything') return true;
  if (TARGETS[target]?.includes(p.kind)) return true;
  const upper = target.toUpperCase();
  if (p.kind === 'stock' && p.data.symbol?.toUpperCase() === upper) return true;
  if (p.kind === 'hill' && p.ticker.toUpperCase() === upper) return true;
  return false;
}

export function usePanes(onEndCall: () => void) {
  const [panes, setPanes] = useState<Pane[]>([]);
  const [tools, setTools] = useState<ToolRun[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [scrollId, setScrollId] = useState<string | null>(null);
  const endRef = useRef(onEndCall);
  endRef.current = onEndCall;

  const add = useCallback((pane: Pane) => {
    setPanes((prev) => (prev.some((p) => p.id === pane.id) ? prev : [pane, ...prev].slice(0, MAX_PANES)));
    setFocusedId(pane.id);
  }, []);

  const handle = useCallback((evt: HarveyEvent) => {
    const type = evt.type;
    const p = (evt.payload ?? evt) as Record<string, unknown>;

    if (type === 'statute_card') {
      add({
        kind: 'statute',
        id: str(p.id) || uid('statute'),
        jurisdiction: place(p.jurisdiction),
        section: str(p.section),
        title: str(p.title),
        quote: str(p.quote),
        fullText: opt(p.full_text),
        frenchQuote: opt(p.french_quote),
        source: opt(p.source),
        confidence: num(p.confidence),
        seeAlso: seeAlso(p.see_also),
      });
    } else if (type === 'hill_intel') {
      add({
        kind: 'hill',
        id: uid('hill'),
        ticker: str(p.ticker),
        source: opt(p.source),
        trades: list(p.trades).map((o) => ({ ticker: str(o.ticker), member: str(o.member), chamber: str(o.chamber), party: str(o.party), state: str(o.state), side: str(o.side), size: str(o.size), filed: str(o.filed), traded: str(o.traded) })),
      });
    } else if (type === 'news_ticker') {
      add({ kind: 'news', id: uid('news'), query: str(p.query), items: newsItems(p.items) });
    } else if (type === 'article_spotlight') {
      const query = str(p.query);
      const items = newsItems(p.items);
      if (!items.length && p.title) items.push({ title: str(p.title), source: str(p.source), published: str(p.published), link: str(p.link), summary: opt(p.summary) });
      setPanes((prev) => {
        const i = prev.findIndex((x) => x.kind === 'news' && x.query === query);
        if (i === -1) {
          const pane: Pane = { kind: 'news', id: uid('news'), query, items };
          setFocusedId(pane.id);
          return [pane, ...prev].slice(0, MAX_PANES);
        }
        const cur = prev[i] as Extract<Pane, { kind: 'news' }>;
        const bySummary = new Map(items.map((it) => [it.link || it.title, it.summary]));
        const merged = { ...cur, items: cur.items.map((it) => ({ ...it, summary: it.summary || bySummary.get(it.link || it.title) })) };
        return prev.map((x, j) => (j === i ? merged : x));
      });
    } else if (type === 'stock_card') {
      add({
        kind: 'stock',
        id: uid('stock'),
        data: {
          query: opt(p.query), symbol: opt(p.symbol) ?? opt(p.ticker), shortName: opt(p.shortName), currency: opt(p.currency),
          price: num(p.price), previousClose: num(p.previousClose), change: num(p.change), changePct: num(p.changePct),
          dayHigh: num(p.dayHigh), dayLow: num(p.dayLow), fiftyTwoWeekHigh: num(p.fiftyTwoWeekHigh), fiftyTwoWeekLow: num(p.fiftyTwoWeekLow),
          exchange: opt(p.exchange),
          closes: Array.isArray(p.closes) ? (p.closes as unknown[]).map(Number).filter(Number.isFinite) : undefined,
          error: opt(p.error), message: opt(p.message),
        },
      });
    } else if (type === 'tool_call') {
      const id = uid('tool');
      const status = str(p.status) || 'running';
      setTools((prev) => [{ id, name: str(p.name) || 'tool', status }, ...prev]);
      window.setTimeout(() => setTools((prev) => prev.filter((t) => t.id !== id)), status === 'complete' ? 1600 : 3600);
    } else if (type === 'pane_action') {
      const action = str(p.action).toLowerCase();
      const target = str(p.target).toLowerCase();
      if (action === 'dismiss' || action === 'clear' || action === 'remove') {
        setFocusedId(null);
        setPanes((prev) => {
          if (target === 'last') return prev.slice(1);
          if (action === 'clear' || target === 'all' || target === 'everything') return [];
          return prev.filter((x) => !matches(x, target));
        });
      } else if (['expand', 'highlight', 'focus', 'open'].includes(action)) {
        setPanes((prev) => {
          const found = target === 'last' ? prev[0] : prev.find((x) => matches(x, target));
          if (found) { setFocusedId(found.id); setScrollId(found.id); }
          return prev;
        });
      } else if (action === 'collapse' || action === 'close') {
        setFocusedId(null);
      }
    } else if (type === 'end_call') {
      endRef.current();
    }
  }, [add]);

  const openSeeAlso = useCallback((item: SeeAlso) => {
    add({ kind: 'statute', id: uid('statute-see'), jurisdiction: item.jurisdiction ?? '', section: item.section, title: item.title, quote: item.quote ?? item.title, fullText: item.fullText, source: item.source, seeAlso: [] });
  }, [add]);

  const dismiss = useCallback((id: string) => setPanes((prev) => prev.filter((p) => p.id !== id)), []);

  return { panes, tools, focusedId, scrollId, handle, openSeeAlso, dismiss };
}

export interface Line {
  who: 'you' | 'harvey';
  text: string;
  at: number;
}

export interface Utterance {
  text?: string;
  firstReceivedTime?: number;
}

export function mergeTranscript(agent: Utterance[], user: Utterance[]): Line[] {
  const raw: Line[] = [];
  for (const a of agent) { const t = (a.text ?? '').trim(); if (t) raw.push({ who: 'harvey', text: t, at: a.firstReceivedTime ?? 0 }); }
  for (const u of user) { const t = (u.text ?? '').trim(); if (t) raw.push({ who: 'you', text: t, at: u.firstReceivedTime ?? 0 }); }
  raw.sort((a, b) => a.at - b.at);
  const out: Line[] = [];
  for (const ln of raw) {
    const prev = out[out.length - 1];
    if (prev && prev.who === ln.who && (ln.text.startsWith(prev.text) || prev.text.startsWith(ln.text))) out[out.length - 1] = { ...ln, at: prev.at };
    else out.push(ln);
  }
  return out;
}

export const TOOL_LABELS: Record<string, string> = {
  cite_statute: 'pulling the statute',
  current_events: 'reading the news',
  stock_ticker: 'checking the market',
  check_the_hill: 'checking congressional trades',
  manage_screen: 'tidying the screen',
  end_call: 'wrapping up',
};

export type Phase = 'idle' | 'dialing' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'silent' | 'ending' | 'ended';

export interface CallView {
  phase: Phase;
  lines: Line[];
  panes: Pane[];
  tools: ToolRun[];
  focusedId: string | null;
  scrollId: string | null;
  muted: boolean;
  needsTap: boolean;
}

export interface CallActions {
  toggleMute: () => void;
  end: () => void;
  dismiss: (id: string) => void;
  openSeeAlso: (s: SeeAlso) => void;
  tapToHear: () => void;
}

export const EMPTY_VIEW: CallView = { phase: 'connecting', lines: [], panes: [], tools: [], focusedId: null, scrollId: null, muted: false, needsTap: false };

export const NO_ACTIONS: CallActions = { toggleMute: () => {}, end: () => {}, dismiss: () => {}, openSeeAlso: () => {}, tapToHear: () => {} };

export function mmss(sec: number) {
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}
