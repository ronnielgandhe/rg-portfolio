import type { ReactNode, CSSProperties } from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ═══════════════════════════════════════════════════════════
   BLACKBOOK — Paper-warm redesign
   Password-gated, Supabase-synced, glass-card aesthetic.
   Visual system from /design_handoff_blackbook
   ═══════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://czdvtqqanvmgptginlwa.supabase.co';
const SUPABASE_ANON = 'sb_publishable_cNeHCMWzmLHmEfor6SDG3A_RJhF1SCZ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export async function hashPass(pw: string): Promise<string> {
  const data = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const PASS = 'vaishali123!';

const FONT_TEXT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif";
const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif";

const FX_USD_TO_CAD = 1.4073;

/* ───────── Design tokens (paper warm) ───────── */
const TOK = {
  ink0: '#1a1612',
  ink1: '#2a2521',
  ink2: '#5a5249',
  ink3: '#8a8278',
  ink4: '#b5ad9f',
  paper: '#f5f0e8',
  hair: 'rgba(20,16,12,0.07)',
  hairStrong: 'rgba(20,16,12,0.12)',
  glass: 'rgba(255,253,249,0.62)',
  glass2: 'rgba(255,253,249,0.85)',
  good: 'oklch(0.55 0.10 150)',
  bad: 'oklch(0.55 0.14 28)',
  warn: 'oklch(0.66 0.13 70)',
  accent: 'oklch(0.62 0.13 28)',
  rCard: '18px',
  rPill: '999px',
  shadow: '0 0.5px 0 rgba(255,255,255,0.7) inset, 0 1px 0 rgba(20,16,12,0.04), 0 8px 28px -14px rgba(40,30,20,0.18)',
};

/* Backwards-compat Theme shape used by older code paths */
interface Theme {
  bg: string; text: string; textStrong: string; textMuted: string;
  border: string; cardBg: string; inputBg: string; accentSubtle: string;
}
const PAPER_THEME: Theme = {
  bg: TOK.paper,
  text: TOK.ink1,
  textStrong: TOK.ink0,
  textMuted: TOK.ink3,
  border: TOK.hair,
  cardBg: TOK.glass,
  inputBg: 'rgba(255,253,249,0.7)',
  accentSubtle: 'rgba(20,16,12,0.05)',
};
function useBlackbookTheme(): Theme { return PAPER_THEME; }

/* ───────── Types ───────── */
interface Meeting {
  id: string; title: string; person: string; time: string; notes: string; link?: string;
  contactId?: string;
}
interface Deliverable { text: string; done: boolean; }
interface JournalEntry {
  id: string; date: string; body: string; tomorrow: string;
  deliverables?: Deliverable[]; agenda?: string[];
  meetings: Meeting[]; updatedAt: string;
  mood?: 'rough' | 'meh' | 'good' | 'great';
}

type ScoutingStatus = 'researching' | 'ready' | 'archived';
type OutreachStatus = 'queued' | 'dm-sent' | 'replied' | 'call-scheduled' | 'call-done' | 'connected';
type ContactCategory = 'call-booked' | 'reply-needed' | 'warm' | 'awaiting-reply' | 'connected' | 'archived';
type Urgency = 'now' | 'soon' | 'later' | 'waiting';

interface NetworkContact {
  id: string; name: string; company: string; role: string;
  category: ContactCategory; urgency: Urgency;
  whatTheySaid: string; actionNeeded: string; followUpDate?: string;
  linkedinUrl?: string; tags?: string[];
  notes: string; createdAt: string;
  whyReachOut?: string; companyInfo?: string; foundVia?: string;
  scoutingStatus?: ScoutingStatus; outreachStatus?: OutreachStatus;
  platform?: string; lastContactDate?: string; nextAction?: string;
  touches?: { date: string; type: string; note: string }[];
}

type TaskPriority = 'high' | 'medium' | 'low';
type TaskStatus = 'todo' | 'in-progress' | 'done';
interface Task {
  id: string; title: string; status: TaskStatus; priority: TaskPriority;
  dueDate?: string; notes?: string; createdAt: string; updatedAt: string;
  list?: string;
}

type GoalStatus = 'active' | 'completed' | 'paused';
type GoalTimeframe = 'short' | 'long';
interface GoalCheckItem { id: string; text: string; done: boolean; }
interface GoalLogEntry { id: string; text: string; date: string; }
interface Goal {
  id: string; title: string; description: string; status: GoalStatus;
  timeframe: GoalTimeframe; deadline?: string;
  progress: number; checklist: GoalCheckItem[]; log: GoalLogEntry[];
  milestones?: string[]; completedMilestones?: boolean[];
  scope?: string;
  createdAt: string; updatedAt: string;
}
interface ProjectIdea {
  id: string; title: string; description: string;
  tags: string[]; createdAt: string; updatedAt: string;
}

type Currency = 'USD' | 'CAD';
type AccountType = 'checking' | 'savings' | 'tfsa' | 'crypto' | 'cash';
interface Account {
  id: string; name: string; type: AccountType;
  currency: Currency; balance: number; updatedAt: string;
}
interface Transaction {
  id: string; date: string; amount: number; currency: Currency;
  type: 'income' | 'expense'; category: string; note: string; createdAt: string;
}
interface Budget {
  id: string; category: string; monthlyTarget: number; currency: Currency;
}
interface FinancialGoal {
  id: string; name: string; targetAmount: number; currentAmount: number;
  currency: Currency; deadline?: string;
}
interface FinanceData {
  accounts: Account[]; transactions: Transaction[];
  budgets: Budget[]; goals: FinancialGoal[];
}
interface HabitDay {
  water?: boolean; steps?: boolean; pushups?: boolean;
  protein?: boolean; sleep?: boolean; lift?: boolean; weight?: number;
}
type HabitsMap = { [date: string]: HabitDay };
interface FinancePlan {
  checksTotal: number; checksConfirmed: string[]; perCheck: number;
  startBalanceUSD: number; targetUSD: number; targetCAD: number;
}
type TradeStatus = 'planned' | 'open' | 'closed';
interface OptionTrade {
  id: string;
  symbol: string; kind: 'call' | 'put';
  strike: number; expiry: string; contracts: number;
  entryPrice: number;        // premium per share
  entryDate: string;
  entryIV?: number;          // decimal, used for model marks when the chain is down
  exitBy?: string;           // hard exit date, non-negotiable
  targetPrice?: number;      // underlying thesis target
  stopPct?: number;          // alert when premium loses this % (negative)
  takePct?: number;          // alert when premium gains this %
  exitPrice?: number; exitDate?: string;
  status: TradeStatus;
  thesis?: string;
  createdAt: string;
}
interface TradingData {
  budgetUSD: number;         // fun money, hard-walled from the vault
  trades: OptionTrade[];
}
interface BlackbookData {
  journal: JournalEntry[]; contacts: NetworkContact[]; ideas: ProjectIdea[];
  tasks: Task[]; goals: Goal[]; finance: FinanceData;
  habits?: HabitsMap; plan?: FinancePlan; trading?: TradingData;
  journalUpdatedAt?: string; contactsUpdatedAt?: string; ideasUpdatedAt?: string;
  tasksUpdatedAt?: string; goalsUpdatedAt?: string; financeUpdatedAt?: string;
  habitsUpdatedAt?: string; planUpdatedAt?: string; tradingUpdatedAt?: string;
}
const DEFAULT_FINANCE: FinanceData = { accounts: [], transactions: [], budgets: [], goals: [] };
const DEFAULT_CONTACTS: NetworkContact[] = [];
const DEFAULT_PLAN: FinancePlan = {
  // monk mode 60: vault-only counting. the ~$7k aunt fund is ring-fenced
  // (tracked as an account, never in the plan) so worst case can't touch this bar.
  checksTotal: 18, checksConfirmed: [], perCheck: 3000,
  startBalanceUSD: 0, targetUSD: 54000, targetCAD: 76000,
};
const DEFAULT_TRADING: TradingData = {
  // $1,000 fun budget, hard-walled from the vault. stable seed id so
  // devices that open before first sync don't duplicate the planned trade.
  budgetUSD: 1000,
  trades: [{
    id: 'seed-qqq-740c-20260814',
    symbol: 'QQQ', kind: 'call', strike: 740, expiry: '2026-08-14', contracts: 3,
    entryPrice: 1.45, entryDate: '', entryIV: 0.183,
    exitBy: '2026-08-13', targetPrice: 748.65, stopPct: -50, takePct: 100,
    status: 'planned',
    thesis: 'ATH tag: 748.65 needs +3.5% in 5 sessions. CPI Wed 8/12 8:30am ET is the catalyst. Sell into the move, out Thursday regardless.',
    createdAt: '2026-08-08T00:00:00.000Z',
  }],
};

/* ───────── Helpers ───────── */
function toCAD(amount: number, currency: Currency): number {
  return currency === 'USD' ? amount * FX_USD_TO_CAD : amount;
}
function toUSD(amount: number, currency: Currency): number {
  return currency === 'CAD' ? amount / FX_USD_TO_CAD : amount;
}
function monthKey(dateStr: string): string { return dateStr.slice(0, 7); }
function thisMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fmtMoney(amount: number, currency: Currency): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const symbol = currency === 'USD' ? '$' : 'C$';
  return `${sign}${symbol}${abs.toFixed(2)}`;
}
function fmtDateShort(date: string): string {
  try {
    const d = new Date(date + 'T12:00');
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  } catch { return date; }
}
function daysBetween(from: Date, to: Date): number {
  const diff = to.getTime() - from.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/* ───────── Options math (Black-Scholes) ───────── */
const RISK_FREE = 0.04;
function erfApprox(x: number): number {
  // Abramowitz-Stegun 7.1.26, good to ~1.5e-7
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
  return sign * y;
}
const normCdf = (x: number) => 0.5 * (1 + erfApprox(x / Math.SQRT2));
const normPdf = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
interface Greeks { price: number; delta: number; gamma: number; theta: number; vega: number; }
function bsGreeks(S: number, K: number, T: number, sigma: number, isCall: boolean): Greeks {
  if (T <= 0 || sigma <= 0) {
    const intrinsic = Math.max(0, isCall ? S - K : K - S);
    return { price: intrinsic, delta: isCall ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0 };
  }
  const sqT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (RISK_FREE + sigma * sigma / 2) * T) / (sigma * sqT);
  const d2 = d1 - sigma * sqT;
  const disc = Math.exp(-RISK_FREE * T);
  const price = isCall
    ? S * normCdf(d1) - K * disc * normCdf(d2)
    : K * disc * normCdf(-d2) - S * normCdf(-d1);
  const delta = isCall ? normCdf(d1) : normCdf(d1) - 1;
  const gamma = normPdf(d1) / (S * sigma * sqT);
  const thetaYear = isCall
    ? -(S * normPdf(d1) * sigma) / (2 * sqT) - RISK_FREE * K * disc * normCdf(d2)
    : -(S * normPdf(d1) * sigma) / (2 * sqT) + RISK_FREE * K * disc * normCdf(-d2);
  return { price, delta, gamma, theta: thetaYear / 365, vega: (S * normPdf(d1) * sqT) / 100 };
}
// options expire at 4pm ET; years remaining measured to that moment
function yearsToExpiry(expiry: string, asOf = new Date()): number {
  const t = Date.parse(`${expiry}T16:00:00-04:00`) - asOf.getTime();
  return Math.max(0, t / (365 * 24 * 3600 * 1000));
}
function tradingDaysThrough(expiry: string): string[] {
  // today through expiry, weekends skipped
  const out: string[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const end = new Date(`${expiry}T12:00:00`);
  while (d.getTime() <= end.getTime() && out.length < 15) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/* ───────── Storage ───────── */
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`bb-${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function save<T>(key: string, val: T) {
  localStorage.setItem(`bb-${key}`, JSON.stringify(val));
}

/* ───────── Migrations ───────── */
function migrateIfNeeded() {
  if (localStorage.getItem('bb-migrated')) return;
  try {
    const oldLogs = load<any[]>('logs', []);
    if (oldLogs.length > 0) {
      const journal: JournalEntry[] = oldLogs.map(l => ({
        id: l.date, date: l.date,
        body: [l.built, l.notes].filter(Boolean).join('\n'),
        tomorrow: '', meetings: [], updatedAt: new Date().toISOString(),
      }));
      save('journal', journal);
    }
    const oldContacts = load<any[]>('contacts', []);
    if (oldContacts.length > 0) {
      const contacts: NetworkContact[] = oldContacts.map(c => ({
        id: c.id, name: c.name || '', company: c.company || '', role: c.role || '',
        category: 'warm' as ContactCategory, urgency: 'later' as Urgency,
        whatTheySaid: c.notes || '', actionNeeded: c.nextAction || '',
        notes: c.notes || '', createdAt: new Date().toISOString(),
      }));
      save('contacts', contacts);
    }
    const oldProjects = load<any[]>('projects', []);
    if (oldProjects.length > 0) {
      const ideas: ProjectIdea[] = oldProjects.map(p => ({
        id: p.id, title: p.name || '', description: p.nextStep || '',
        tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }));
      save('ideas', ideas);
    }
    localStorage.setItem('bb-migrated', '1');
    localStorage.removeItem('bb-logs');
    localStorage.removeItem('bb-projects');
  } catch { /* silent */ }
}
function migrateContactsV3() {
  if (localStorage.getItem('bb-migrated-v3-contacts')) return;
  const contacts = load<any[]>('contacts', []);
  if (contacts.length === 0) { localStorage.setItem('bb-migrated-v3-contacts', '1'); return; }
  const migrated = contacts.map((c: any) => {
    if (c.category) return c;
    let category: ContactCategory = 'warm';
    let urgency: Urgency = 'later';
    const os = c.outreachStatus as string;
    if (os === 'dm-sent') { category = 'awaiting-reply'; urgency = 'waiting'; }
    else if (os === 'replied') { category = 'reply-needed'; urgency = 'soon'; }
    else if (os === 'call-scheduled') { category = 'call-booked'; urgency = 'now'; }
    else if (os === 'call-done') { category = 'warm'; urgency = 'soon'; }
    else if (os === 'connected') { category = 'connected'; urgency = 'later'; }
    if (c.scoutingStatus === 'archived') category = 'archived';
    return {
      ...c, category, urgency,
      whatTheySaid: c.whatTheySaid || c.notes || '',
      actionNeeded: c.actionNeeded || c.nextAction || '',
    };
  });
  save('contacts', migrated);
  localStorage.setItem('bb-migrated-v3-contacts', '1');
}
function migrateFinance() {
  if (localStorage.getItem('bb-migrated-finance')) return;
  const existing = load<any>('finance', null);
  if (!existing || typeof existing !== 'object' || !Array.isArray(existing.accounts)) {
    save('finance', DEFAULT_FINANCE);
  } else {
    const patched: FinanceData = {
      accounts: Array.isArray(existing.accounts) ? existing.accounts : [],
      transactions: Array.isArray(existing.transactions) ? existing.transactions : [],
      budgets: Array.isArray(existing.budgets) ? existing.budgets : [],
      goals: Array.isArray(existing.goals) ? existing.goals : [],
    };
    save('finance', patched);
  }
  localStorage.setItem('bb-migrated-finance', '1');
}

/* ───────── Cloud sync ───────── */
async function loadFromCloud(passHash: string) {
  const { data } = await supabase
    .from('blackbook').select('data').eq('pass_hash', passHash).single();
  return data?.data as BlackbookData | null;
}
async function saveToCloud(passHash: string, payload: BlackbookData) {
  await supabase.from('blackbook').upsert({
    pass_hash: passHash, data: payload, updated_at: new Date().toISOString(),
  });
}
function mergeCloudLocal(cloud: BlackbookData | null, local: BlackbookData): BlackbookData {
  if (!cloud) return local;
  const pick = <T,>(
    cloudVal: T, cloudTs: string | undefined,
    localVal: T, localTs: string | undefined,
    fallback: T,
  ): T => {
    const cTime = cloudTs ? new Date(cloudTs).getTime() : 0;
    const lTime = localTs ? new Date(localTs).getTime() : 0;
    if (cTime >= lTime) return cloudVal ?? fallback;
    return localVal ?? fallback;
  };
  return {
    journal: pick(cloud.journal, cloud.journalUpdatedAt, local.journal, local.journalUpdatedAt, []),
    contacts: pick(cloud.contacts, cloud.contactsUpdatedAt, local.contacts, local.contactsUpdatedAt, []),
    ideas: pick(cloud.ideas, cloud.ideasUpdatedAt, local.ideas, local.ideasUpdatedAt, []),
    tasks: pick(cloud.tasks, cloud.tasksUpdatedAt, local.tasks, local.tasksUpdatedAt, []),
    goals: pick(cloud.goals, cloud.goalsUpdatedAt, local.goals, local.goalsUpdatedAt, []),
    finance: pick(cloud.finance, cloud.financeUpdatedAt, local.finance, local.financeUpdatedAt, DEFAULT_FINANCE),
    habits: pick(cloud.habits, cloud.habitsUpdatedAt, local.habits, local.habitsUpdatedAt, {}),
    plan: pick(cloud.plan, cloud.planUpdatedAt, local.plan, local.planUpdatedAt, DEFAULT_PLAN),
    trading: pick(cloud.trading, cloud.tradingUpdatedAt, local.trading, local.tradingUpdatedAt, DEFAULT_TRADING),
    journalUpdatedAt: [cloud.journalUpdatedAt, local.journalUpdatedAt].filter(Boolean).sort().pop(),
    contactsUpdatedAt: [cloud.contactsUpdatedAt, local.contactsUpdatedAt].filter(Boolean).sort().pop(),
    ideasUpdatedAt: [cloud.ideasUpdatedAt, local.ideasUpdatedAt].filter(Boolean).sort().pop(),
    tasksUpdatedAt: [cloud.tasksUpdatedAt, local.tasksUpdatedAt].filter(Boolean).sort().pop(),
    goalsUpdatedAt: [cloud.goalsUpdatedAt, local.goalsUpdatedAt].filter(Boolean).sort().pop(),
    financeUpdatedAt: [cloud.financeUpdatedAt, local.financeUpdatedAt].filter(Boolean).sort().pop(),
    habitsUpdatedAt: [cloud.habitsUpdatedAt, local.habitsUpdatedAt].filter(Boolean).sort().pop(),
    planUpdatedAt: [cloud.planUpdatedAt, local.planUpdatedAt].filter(Boolean).sort().pop(),
    tradingUpdatedAt: [cloud.tradingUpdatedAt, local.tradingUpdatedAt].filter(Boolean).sort().pop(),
  };
}

class SaveQueue {
  private pending: (() => Promise<void>) | null = null;
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private maxRetries = 5;
  onStatusChange?: (status: 'saving' | 'saved' | 'error' | 'retrying') => void;

  enqueue(saveFn: () => Promise<void>) {
    this.pending = saveFn;
    this.retryCount = 0;
    this.run();
  }
  private async run() {
    if (!this.pending) return;
    const fn = this.pending;
    this.onStatusChange?.(this.retryCount > 0 ? 'retrying' : 'saving');
    try {
      await fn();
      this.pending = null;
      this.retryCount = 0;
      this.onStatusChange?.('saved');
    } catch {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 15000);
        this.onStatusChange?.('retrying');
        this.retryTimer = setTimeout(() => this.run(), delay);
      } else {
        this.onStatusChange?.('error');
      }
    }
  }
  hasPending() { return this.pending !== null; }
  cancel() { if (this.retryTimer) clearTimeout(this.retryTimer); }
}

/* ───────── Google Calendar (read-only) ───────── */
const GOOGLE_CLIENT_ID =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_GOOGLE_CLIENT_ID) || '';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_TOKEN_KEY = 'bb-google-token';

interface GCalEvent { id: string; title: string; start: string; end?: string; link?: string; }

function loadGoogleScripts(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  return new Promise((resolve, reject) => {
    let gapiLoaded = !!(window as any).gapi;
    let gisLoaded = !!(window as any).google?.accounts?.oauth2;
    const done = () => { if (gapiLoaded && gisLoaded) resolve(); };
    if (!gapiLoaded) {
      const s = document.createElement('script');
      s.src = 'https://apis.google.com/js/api.js';
      s.async = true; s.defer = true;
      s.onload = () => { (window as any).gapi.load('client', () => { gapiLoaded = true; done(); }); };
      s.onerror = reject;
      document.head.appendChild(s);
    }
    if (!gisLoaded) {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true; s.defer = true;
      s.onload = () => { gisLoaded = true; done(); };
      s.onerror = reject;
      document.head.appendChild(s);
    }
    done();
  });
}

function useGoogleCalendar() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(GOOGLE_TOKEN_KEY) || '');
  const [events, setEvents] = useState<GCalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const isConfigured = !!GOOGLE_CLIENT_ID;

  const fetchEvents = useCallback(async (tk: string) => {
    if (!tk) return;
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const max = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(now)}&timeMax=${encodeURIComponent(max)}&singleEvents=true&orderBy=startTime&maxResults=50`,
        { headers: { Authorization: `Bearer ${tk}` } }
      );
      if (res.status === 401) {
        localStorage.removeItem(GOOGLE_TOKEN_KEY);
        setToken('');
        return;
      }
      const data = await res.json();
      const ev: GCalEvent[] = (data.items || []).map((e: any) => ({
        id: e.id,
        title: e.summary || '(no title)',
        start: e.start?.dateTime || e.start?.date || '',
        end: e.end?.dateTime || e.end?.date,
        link: e.hangoutLink || e.htmlLink,
      }));
      setEvents(ev);
    } catch { /* network */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (token) fetchEvents(token); }, [token, fetchEvents]);

  const connect = useCallback(async () => {
    if (!isConfigured) { alert('Google Client ID missing. Set PUBLIC_GOOGLE_CLIENT_ID in .env'); return; }
    try {
      await loadGoogleScripts();
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID, scope: GOOGLE_SCOPES,
        callback: (resp: any) => {
          if (resp.access_token) {
            setToken(resp.access_token);
            localStorage.setItem(GOOGLE_TOKEN_KEY, resp.access_token);
            fetchEvents(resp.access_token);
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (e) { console.error('Google connect failed', e); }
  }, [isConfigured, fetchEvents]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(GOOGLE_TOKEN_KEY);
    setToken('');
    setEvents([]);
  }, []);

  return { token, events, loading, connect, disconnect, isConfigured };
}

/* ───────── Common UI primitives ───────── */
function Card({ children, hero, style, className, onClick }: {
  children: ReactNode; hero?: boolean; style?: CSSProperties; className?: string;
  onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className={className} style={{
      background: hero ? TOK.glass2 : TOK.glass,
      backdropFilter: 'saturate(160%) blur(20px)',
      WebkitBackdropFilter: 'saturate(160%) blur(20px)',
      border: `1px solid ${TOK.hair}`,
      borderRadius: TOK.rCard,
      boxShadow: TOK.shadow,
      padding: 18,
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardLabel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{
    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: TOK.ink3, marginBottom: 10,
    fontFamily: FONT_TEXT, ...style,
  }}>{children}</div>;
}

function Btn({ children, onClick, primary, ghost, style, type, disabled }: {
  children: ReactNode; onClick?: () => void; primary?: boolean; ghost?: boolean;
  style?: CSSProperties; type?: 'button' | 'submit'; disabled?: boolean;
}) {
  const base: CSSProperties = {
    appearance: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: FONT_TEXT, fontSize: 12.5, fontWeight: 500,
    padding: '6px 13px', borderRadius: TOK.rPill,
    border: `1px solid ${TOK.hairStrong}`,
    background: 'rgba(255,253,249,0.85)', color: TOK.ink0,
    transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
  };
  if (primary) {
    base.background = TOK.ink0; base.color = '#fffaf2'; base.borderColor = TOK.ink0;
  }
  if (ghost) {
    base.background = 'transparent'; base.borderColor = 'transparent'; base.color = TOK.ink2;
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...style }}
      onMouseEnter={e => {
        if (disabled) return;
        if (primary) e.currentTarget.style.background = TOK.ink1;
        else if (ghost) { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = TOK.ink0; }
        else e.currentTarget.style.background = '#fff';
      }}
      onMouseLeave={e => {
        if (disabled) return;
        if (primary) e.currentTarget.style.background = TOK.ink0;
        else if (ghost) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TOK.ink2; }
        else e.currentTarget.style.background = 'rgba(255,253,249,0.85)';
      }}
    >
      {children}
    </button>
  );
}

function Chip({ children, tone, style }: {
  children: ReactNode; tone?: 'good' | 'warn' | 'bad' | 'neutral'; style?: CSSProperties;
}) {
  const palette: Record<string, { bg: string; fg: string; bd: string }> = {
    good: { bg: 'oklch(0.55 0.10 150 / 0.10)', fg: TOK.good, bd: 'oklch(0.55 0.10 150 / 0.20)' },
    warn: { bg: 'oklch(0.66 0.13 70 / 0.13)', fg: 'oklch(0.45 0.10 60)', bd: 'oklch(0.66 0.13 70 / 0.22)' },
    bad: { bg: 'oklch(0.55 0.14 28 / 0.10)', fg: TOK.bad, bd: 'oklch(0.55 0.14 28 / 0.22)' },
    neutral: { bg: 'rgba(20,16,12,0.05)', fg: TOK.ink2, bd: TOK.hair },
  };
  const p = palette[tone || 'neutral'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: TOK.rPill,
      fontSize: 11, fontWeight: 500, fontFamily: FONT_TEXT,
      background: p.bg, color: p.fg, border: `1px solid ${p.bd}`,
      whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

function Input({ value, onChange, placeholder, style, type, autoFocus, onKeyDown }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  style?: CSSProperties; type?: string; autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} type={type || 'text'} autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      style={{
        width: '100%', background: 'rgba(255,253,249,0.7)',
        border: `1px solid ${TOK.hair}`, borderRadius: 10,
        padding: '9px 12px', fontFamily: FONT_TEXT, fontSize: 13.5,
        color: TOK.ink0, transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
        outline: 'none', boxSizing: 'border-box', ...style,
      }}
      onFocus={e => {
        e.target.style.borderColor = TOK.ink3;
        e.target.style.background = 'rgba(255,255,255,0.95)';
        e.target.style.boxShadow = '0 0 0 3px rgba(20,16,12,0.05)';
      }}
      onBlur={e => {
        e.target.style.borderColor = TOK.hair;
        e.target.style.background = 'rgba(255,253,249,0.7)';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows, style }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  rows?: number; style?: CSSProperties;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows || 4}
      style={{
        width: '100%', background: 'rgba(255,253,249,0.7)',
        border: `1px solid ${TOK.hair}`, borderRadius: 10,
        padding: '9px 12px', fontFamily: FONT_TEXT, fontSize: 13.5,
        color: TOK.ink0, transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
        outline: 'none', resize: 'vertical', minHeight: 80,
        lineHeight: 1.55, boxSizing: 'border-box', ...style,
      }}
      onFocus={e => {
        e.target.style.borderColor = TOK.ink3;
        e.target.style.background = 'rgba(255,255,255,0.95)';
        e.target.style.boxShadow = '0 0 0 3px rgba(20,16,12,0.05)';
      }}
      onBlur={e => {
        e.target.style.borderColor = TOK.hair;
        e.target.style.background = 'rgba(255,253,249,0.7)';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      gap: 24, marginBottom: 24, flexWrap: 'wrap',
    }}>
      <div>
        <h1 style={{
          fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 600,
          letterSpacing: '-0.025em', lineHeight: 1.05, margin: 0, color: TOK.ink0,
        }}>{title}</h1>
        {sub && <div style={{
          color: TOK.ink3, fontSize: 13, marginTop: 4, fontFamily: FONT_TEXT,
        }}>{sub}</div>}
      </div>
      {right && <div style={{ display: 'flex', gap: 6 }}>{right}</div>}
    </div>
  );
}

/* ───────── FingerprintIcon ───────── */
function FingerprintIcon({ onClick }: { onClick: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setVisible(true), 3000); return () => clearTimeout(timer); }, []);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const iconSize = isMobile ? 18 : 28;
  return (
    <button onClick={onClick} aria-label="Access" style={{
      position: 'fixed', bottom: isMobile ? 12 : 20, right: isMobile ? 12 : 20, zIndex: 9999,
      background: 'none', border: 'none', cursor: 'pointer',
      opacity: visible ? 0.15 : 0, transition: 'opacity 1.5s ease',
      padding: isMobile ? 4 : 8, color: '#78716c',
    }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.35'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '0.15'; }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/>
        <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 3 0 5.5 2 6 5"/>
        <path d="M9 12c0-1.5 1.5-3 3-3s3 1.5 3 3-1 6-2 8"/>
        <path d="M12 12v4"/>
        <path d="M2 16c1-2 2.5-3.5 4-4.5"/>
        <path d="M18 14c.5 2 .5 4-.5 6"/>
        <path d="M22 20c-1-1.5-2-3.5-2-6"/>
      </svg>
    </button>
  );
}

/* ───────── Password Gate ───────── */
export function PasswordGate({ onUnlock, onClose, inline }: { onUnlock: (pw: string) => void; onClose: () => void; inline?: boolean }) {
  const [pw, setPw] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const submit = () => {
    if (pw === PASS) { onUnlock(pw); }
    else { setShake(true); setPw(''); setTimeout(() => setShake(false), 500); }
  };
  return (
    <div style={{
      position: inline ? 'relative' : 'fixed', inset: inline ? undefined : 0,
      width: inline ? '100%' : undefined, height: inline ? '100%' : undefined,
      zIndex: inline ? undefined : 10000,
      background: inline ? 'transparent' : TOK.paper,
      backdropFilter: inline ? undefined : 'blur(40px)',
      WebkitBackdropFilter: inline ? undefined : 'blur(40px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT_TEXT,
    }} onClick={inline ? undefined : onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        animation: shake ? 'bb-shake 0.4s ease' : undefined,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(20,16,12,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={TOK.ink3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/>
            <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 3 0 5.5 2 6 5"/>
            <path d="M9 12c0-1.5 1.5-3 3-3s3 1.5 3 3-1 6-2 8"/>
            <path d="M12 12v4"/>
            <path d="M2 16c1-2 2.5-3.5 4-4.5"/>
            <path d="M18 14c.5 2 .5 4-.5 6"/>
            <path d="M22 20c-1-1.5-2-3.5-2-6"/>
          </svg>
        </div>
        <input ref={inputRef} type="password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="type password"
          style={{
            background: 'rgba(255,253,249,0.7)', border: `1px solid ${TOK.hair}`,
            borderRadius: 10, padding: '12px 20px', color: TOK.ink0,
            fontSize: 15, fontFamily: FONT_TEXT, outline: 'none',
            width: 240, textAlign: 'center', letterSpacing: 2,
          }}
        />
        <span style={{ color: TOK.ink3, fontSize: 14, fontWeight: 500 }}>press enter</span>
      </div>
      <style>{`
        @keyframes bb-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

/* ───────── Wallpaper ───────── */
function Wallpaper() {
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      background: [
        'radial-gradient(48% 38% at 14% 18%, oklch(0.86 0.07 60 / 0.55), transparent 70%)',
        'radial-gradient(40% 35% at 88% 12%, oklch(0.84 0.07 320 / 0.45), transparent 70%)',
        'radial-gradient(55% 45% at 80% 92%, oklch(0.82 0.06 230 / 0.45), transparent 70%)',
        'radial-gradient(38% 35% at 10% 88%, oklch(0.84 0.07 130 / 0.40), transparent 70%)',
        'linear-gradient(180deg, #f0e9df, #e6dfd3)',
      ].join(', '),
      filter: 'saturate(0.92)',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
        backgroundSize: '3px 3px', mixBlendMode: 'multiply', opacity: 0.30,
      }} />
    </div>
  );
}

/* ───────── ID helper ───────── */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ═══════════════════════════════════════════════════════════
   TODAY
   ═══════════════════════════════════════════════════════════ */

type HabitKey = 'water' | 'steps' | 'pushups' | 'protein' | 'sleep' | 'lift';
const HABIT_DEFS: { key: HabitKey; label: string; sub: string }[] = [
  { key: 'water', label: '3L water', sub: 'sip all day' },
  { key: 'steps', label: '10k steps', sub: 'walk it off' },
  { key: 'pushups', label: 'pushups', sub: 'daily set' },
  { key: 'protein', label: '180g protein', sub: 'hit the number' },
  { key: 'sleep', label: 'lights out 11:45', sub: 'no scroll' },
];
const LIFT_DEF = { key: 'lift' as HabitKey, label: 'lift', sub: 'Tue Thu Sat Sun' };

function isLiftDay(iso: string): boolean {
  const d = new Date(iso + 'T12:00').getDay();
  return d === 0 || d === 2 || d === 4 || d === 6;
}
function habitKeysFor(iso: string): HabitKey[] {
  const base: HabitKey[] = ['water', 'steps', 'pushups', 'protein', 'sleep'];
  return isLiftDay(iso) ? [...base, 'lift'] : base;
}
function dayCompletion(habits: HabitsMap, iso: string): { done: number; total: number } {
  const keys = habitKeysFor(iso);
  const day = habits[iso] || {};
  return { done: keys.filter(k => !!day[k]).length, total: keys.length };
}
function habitStreak(habits: HabitsMap, today: string): number {
  const isoOf = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const complete = (iso: string) => {
    const c = dayCompletion(habits, iso);
    return c.total > 0 && c.done === c.total;
  };
  const cursor = new Date(today + 'T12:00');
  if (!complete(today)) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (complete(isoOf(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
  return count;
}
function streakLine(n: number): string {
  if (n === 0) return 'day zero. start now';
  if (n < 3) return 'started. do not break it';
  if (n < 7) return 'stacking days';
  if (n < 14) return 'a week deep. locked in';
  if (n < 30) return 'two weeks plus. keep pushing';
  return 'machine mode';
}

function Today({ habits, setHabits, tasks, setTasks, onNavigate }: {
  habits: HabitsMap;
  setHabits: (fn: (prev: HabitsMap) => HabitsMap) => void;
  tasks: Task[];
  setTasks: (fn: (prev: Task[]) => Task[]) => void;
  onNavigate: (tab: BlackbookTab) => void;
}) {
  const today = localToday();
  const day = habits[today] || {};
  const liftDay = isLiftDay(today);
  const { done: habitsDone, total: habitsTotal } = dayCompletion(habits, today);
  const streak = useMemo(() => habitStreak(habits, today), [habits, today]);

  const toggleHabit = (key: HabitKey) => {
    setHabits(prev => ({ ...prev, [today]: { ...prev[today], [key]: !prev[today]?.[key] } }));
  };

  const [weightDraft, setWeightDraft] = useState(day.weight != null ? String(day.weight) : '');
  useEffect(() => { setWeightDraft(day.weight != null ? String(day.weight) : ''); }, [day.weight]);
  const commitWeight = () => {
    const w = parseFloat(weightDraft);
    setHabits(prev => {
      const d = { ...prev[today] };
      if (isNaN(w) || w <= 0) delete d.weight; else d.weight = Math.round(w * 10) / 10;
      return { ...prev, [today]: d };
    });
  };

  // 30-day heat strip
  const heat = useMemo(() => {
    const out: { iso: string; ratio: number; label: string }[] = [];
    const base = new Date(today + 'T12:00');
    for (let i = 29; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const c = dayCompletion(habits, iso);
      out.push({ iso, ratio: c.total > 0 ? c.done / c.total : 0, label: `${fmtDateShort(iso)} · ${c.done}/${c.total}` });
    }
    return out;
  }, [habits, today]);

  // Weight series
  const weights = useMemo(() =>
    Object.entries(habits)
      .filter(([, v]) => typeof v.weight === 'number')
      .map(([date, v]) => ({ date, w: v.weight as number }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30),
  [habits]);
  const latestW = weights[weights.length - 1];

  // Today's focus: due today, or high priority still open
  const focus = tasks.filter(t => t.dueDate === today || (t.priority === 'high' && t.status !== 'done'));
  const openCount = focus.filter(t => t.status !== 'done').length;

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? {
      ...t, status: t.status === 'done' ? 'todo' : 'done',
      updatedAt: new Date().toISOString(),
    } : t));
  };

  const [quickTask, setQuickTask] = useState('');
  const addQuickTask = () => {
    if (!quickTask.trim()) return;
    const now = new Date().toISOString();
    setTasks(prev => [...prev, {
      id: uid(), title: quickTask.trim(), status: 'todo', priority: 'medium',
      dueDate: today, createdAt: now, updatedAt: now,
    }]);
    setQuickTask('');
  };

  const dateObj = new Date(today + 'T12:00');
  const monthName = dateObj.toLocaleDateString('en', { month: 'short' });
  const dayNum = dateObj.getDate();
  const weekday = dateObj.toLocaleDateString('en', { weekday: 'long' });
  const fullDate = dateObj.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

  const habitTiles = liftDay ? [...HABIT_DEFS, LIFT_DEF] : HABIT_DEFS;
  const goodA = (a: number) => `oklch(0.55 0.10 150 / ${a})`;

  return (
    <div style={{ animation: 'bb-fade 0.32s cubic-bezier(.2,.8,.2,1) both' }}>
      <PageHeader
        title="Today"
        sub={`${fullDate} · ${habitsDone}/${habitsTotal} habits · ${openCount} on the list`}
      />

      {/* Hero: date + streak */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card hero style={{ padding: 22, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 26, alignItems: 'center' }}>
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <CardLabel style={{ marginBottom: 0 }}>{monthName}</CardLabel>
            <div style={{ fontSize: 68, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.04em', fontFamily: FONT_DISPLAY, color: TOK.ink0 }}>{dayNum}</div>
            <div style={{ fontSize: 12, color: TOK.ink2, marginTop: 4, fontFamily: FONT_TEXT }}>{weekday}</div>
          </div>
          <div style={{ borderLeft: `0.5px solid ${TOK.hairStrong}`, paddingLeft: 24 }}>
            <CardLabel style={{ marginBottom: 4 }}>Streak</CardLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: FONT_DISPLAY }}>
              <span style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.03em', color: TOK.ink0, fontVariantNumeric: 'tabular-nums' }}>{streak}</span>
              <span style={{ color: TOK.ink2, fontSize: 13, fontFamily: FONT_TEXT }}>· {streak === 1 ? 'day' : 'days'} all habits done</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: TOK.ink2, fontFamily: FONT_TEXT }}>{streakLine(streak)}</div>
            {liftDay && (
              <div style={{ marginTop: 10 }}>
                <Chip tone={day.lift ? 'good' : 'warn'}>{day.lift ? 'lifted' : 'lift day'}</Chip>
              </div>
            )}
          </div>
        </Card>

        <Card hero style={{ padding: 22 }}>
          <CardLabel>Last 30 days</CardLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 4, marginTop: 6 }}>
            {heat.map(h => (
              <div key={h.iso} title={h.label} style={{
                aspectRatio: '1', borderRadius: 4,
                background: h.ratio === 0 ? 'rgba(20,16,12,0.06)' : goodA(0.18 + 0.72 * h.ratio),
                border: h.iso === today ? `1px solid ${TOK.ink3}` : `1px solid transparent`,
                boxSizing: 'border-box',
              }} />
            ))}
          </div>
          <div style={{
            marginTop: 12, paddingTop: 12, borderTop: `0.5px solid ${TOK.hair}`,
            display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOK.ink2, fontFamily: FONT_TEXT,
          }}>
            <span>Today</span>
            <span style={{ color: TOK.ink0, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{habitsDone} of {habitsTotal} done</span>
          </div>
        </Card>
      </div>

      {/* Habit checklist */}
      <Card style={{ marginBottom: 14, padding: 22 }}>
        <CardLabel>Habits</CardLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {habitTiles.map(h => {
            const on = !!day[h.key];
            return (
              <button key={h.key} onClick={() => toggleHabit(h.key)} style={{
                appearance: 'none', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 14,
                background: on ? 'oklch(0.55 0.10 150 / 0.10)' : 'rgba(255,253,249,0.7)',
                border: `1px solid ${on ? 'oklch(0.55 0.10 150 / 0.25)' : TOK.hair}`,
                transition: 'all 0.15s', fontFamily: FONT_TEXT,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: on ? '0' : `1.5px solid ${TOK.ink3}`,
                  background: on ? TOK.good : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: TOK.ink0 }}>{h.label}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: TOK.ink3, marginTop: 1 }}>{h.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginTop: 14,
          paddingTop: 14, borderTop: `0.5px solid ${TOK.hair}`, fontFamily: FONT_TEXT,
        }}>
          <span style={{ fontSize: 12.5, color: TOK.ink2 }}>Weight</span>
          <input value={weightDraft} type="number" inputMode="decimal"
            onChange={e => setWeightDraft(e.target.value)}
            onBlur={commitWeight}
            onKeyDown={e => e.key === 'Enter' && commitWeight()}
            placeholder="195.0"
            style={{
              width: 90, padding: '6px 10px', fontSize: 13, fontFamily: FONT_TEXT,
              background: 'rgba(255,253,249,0.7)', border: `1px solid ${TOK.hair}`,
              borderRadius: 10, color: TOK.ink0, outline: 'none',
              fontVariantNumeric: 'tabular-nums',
            }} />
          <span style={{ fontSize: 12.5, color: TOK.ink3 }}>lbs</span>
          {latestW && (
            <span style={{ marginLeft: 'auto', fontSize: 12.5, color: TOK.ink2, fontVariantNumeric: 'tabular-nums' }}>
              {latestW.w} lbs · {latestW.w > 185 ? `${(latestW.w - 185).toFixed(1)} to 185` : 'at target'}
            </span>
          )}
        </div>
        {weights.length >= 2 && (
          <div style={{ marginTop: 12 }}>
            <svg viewBox="0 0 300 56" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
              {(() => {
                const lo = Math.min(185, ...weights.map(p => p.w)) - 1;
                const hi = Math.max(185, ...weights.map(p => p.w)) + 1;
                const span = hi - lo || 1;
                const x = (i: number) => weights.length === 1 ? 150 : (i / (weights.length - 1)) * 300;
                const y = (w: number) => 50 - ((w - lo) / span) * 44;
                const pts = weights.map((p, i) => `${x(i).toFixed(1)},${y(p.w).toFixed(1)}`).join(' ');
                return (
                  <>
                    <line x1="0" y1={y(185)} x2="300" y2={y(185)}
                      stroke={TOK.good} strokeWidth="1" strokeDasharray="4 4" opacity="0.5"
                      vectorEffect="non-scaling-stroke" />
                    <polyline points={pts} fill="none" stroke={TOK.ink0} strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                  </>
                );
              })()}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT, marginTop: 4 }}>
              <span>{fmtDateShort(weights[0].date)} · {weights[0].w} lbs</span>
              <span style={{ color: TOK.good }}>185 target</span>
              <span>{fmtDateShort(latestW!.date)} · {latestW!.w} lbs</span>
            </div>
          </div>
        )}
      </Card>

      {/* Today's focus */}
      <Card style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div>
            <CardLabel style={{ marginBottom: 2 }}>Today's focus</CardLabel>
            <div style={{ fontSize: 13, color: TOK.ink2, fontFamily: FONT_TEXT }}>due today or high priority</div>
          </div>
          <button onClick={() => onNavigate('tasks')} style={{
            appearance: 'none', border: 0, background: 'transparent', fontFamily: FONT_TEXT,
            fontSize: 12, color: TOK.ink2, cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
          }}>open tasks →</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: TOK.ink3 }}>+</span>
          <input value={quickTask} onChange={e => setQuickTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuickTask()}
            placeholder="Quick add task… ↵"
            style={{
              flex: 1, background: 'transparent', border: 0, padding: '5px 0',
              fontFamily: FONT_TEXT, fontSize: 13.5, color: TOK.ink0, outline: 'none',
            }} />
        </div>

        {focus.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: TOK.ink3, fontSize: 13, fontFamily: FONT_TEXT }}>
            All clear. Add a task above ↑
          </div>
        ) : (
          <div>
            {focus.slice(0, 10).map(item => (
              <div key={item.id} onClick={() => toggleTask(item.id)}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,16,12,0.025)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px',
                  borderTop: `0.5px solid ${TOK.hair}`, cursor: 'pointer',
                  opacity: item.status === 'done' ? 0.45 : 1, transition: 'opacity 0.18s, background 0.14s',
                  borderRadius: 8,
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: item.status === 'done' ? '0' : `1.5px solid ${TOK.ink3}`,
                  background: item.status === 'done' ? TOK.ink0 : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.status === 'done' && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{
                  flex: 1, fontSize: 14, fontFamily: FONT_TEXT, color: TOK.ink0,
                  textDecoration: item.status === 'done' ? 'line-through' : 'none',
                }}>{item.title}</span>
                {item.priority === 'high' && item.status !== 'done' &&
                  <span style={{ width: 3, height: 14, borderRadius: 2, background: TOK.bad }}></span>}
                {item.list && <Chip>{item.list}</Chip>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   JOURNAL
   ═══════════════════════════════════════════════════════════ */

function Journal({ journal, setJournal, contacts, googleEvents, googleConnected, googleConfigured, onConnectGoogle }: {
  journal: JournalEntry[];
  setJournal: (fn: (prev: JournalEntry[]) => JournalEntry[]) => void;
  contacts: NetworkContact[];
  googleEvents: GCalEvent[];
  googleConnected: boolean;
  googleConfigured: boolean;
  onConnectGoogle: () => void;
}) {
  const today = localToday();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [viewDate, setViewDate] = useState(() => new Date(today + 'T12:00'));

  const entry = journal.find(e => e.date === selectedDate);

  const updateEntry = (patch: Partial<JournalEntry>) => {
    setJournal(prev => {
      const exists = prev.find(e => e.date === selectedDate);
      if (exists) {
        return prev.map(e => e.date === selectedDate ? {
          ...e, ...patch, updatedAt: new Date().toISOString(),
        } : e);
      }
      return [...prev, {
        id: selectedDate, date: selectedDate, body: '', tomorrow: '', meetings: [],
        updatedAt: new Date().toISOString(), ...patch,
      }];
    });
  };

  // Streak calculation
  const streak = useMemo(() => {
    let count = 0;
    let cursor = new Date(today + 'T12:00');
    const haveSet = new Set(
      journal
        .filter(e => (e.body?.trim() || '').length >= 3)
        .map(e => e.date)
    );
    while (true) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      if (haveSet.has(iso)) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return count;
  }, [journal, today]);

  // Calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewDate.toLocaleDateString('en', { month: 'long', year: 'numeric' });

  const calCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calCells.push(null);
  for (let i = 1; i <= daysInMonth; i++) calCells.push(i);

  const haveEntries = useMemo(() => {
    const set = new Set<string>();
    for (const e of journal) {
      if ((e.body?.trim() || '').length >= 3) set.add(e.date);
    }
    return set;
  }, [journal]);

  const monthEntryCount = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return Array.from(haveEntries).filter(d => d.startsWith(prefix)).length;
  }, [haveEntries, year, month]);

  const dateObj = new Date(selectedDate + 'T12:00');
  const niceDate = dateObj.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
  const wordCount = (entry?.body?.trim() || '').split(/\s+/).filter(Boolean).length;

  // Today's meetings — combine google events + journal meetings
  const todaysMeetings = useMemo(() => {
    const j = entry?.meetings || [];
    if (selectedDate !== today) return j.map(m => ({ id: m.id, title: m.title, time: m.time, person: m.person, link: m.link }));
    if (googleConnected) {
      return googleEvents
        .filter(ev => ev.start.startsWith(today))
        .map(ev => ({
          id: ev.id, title: ev.title,
          time: ev.start.includes('T') ? new Date(ev.start).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }) : 'all day',
          person: '', link: ev.link,
        }));
    }
    return j.map(m => ({ id: m.id, title: m.title, time: m.time, person: m.person, link: m.link }));
  }, [entry, googleEvents, googleConnected, selectedDate, today]);

  return (
    <div style={{ animation: 'bb-fade 0.32s cubic-bezier(.2,.8,.2,1) both' }}>
      <PageHeader
        title="Journal"
        sub={`${monthEntryCount} ${monthEntryCount === 1 ? 'entry' : 'entries'} this month · ${streak}-day streak`}
        right={<>
          <Btn ghost onClick={() => setSelectedDate(today)}>Today</Btn>
          <Btn primary onClick={() => updateEntry({ body: entry?.body || '' })}>+ New entry</Btn>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
        {/* Left rail: calendar + streak */}
        <Card style={{ alignSelf: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{
              appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
              fontFamily: FONT_TEXT, fontSize: 14, color: TOK.ink2, padding: '4px 8px', borderRadius: 6,
            }}>‹</button>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: TOK.ink0, fontFamily: FONT_TEXT }}>{monthName}</div>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{
              appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
              fontFamily: FONT_TEXT, fontSize: 14, color: TOK.ink2, padding: '4px 8px', borderRadius: 6,
            }}>›</button>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2,
            fontSize: 11, color: TOK.ink3, marginBottom: 6, textAlign: 'center', fontFamily: FONT_TEXT,
          }}>
            {['S','M','T','W','T','F','S'].map((d,i) => <div key={i}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {calCells.map((n, i) => {
              if (n === null) return <button key={i} disabled style={{
                appearance: 'none', border: 0, background: 'transparent', cursor: 'default',
                aspectRatio: '1', borderRadius: 10,
              }}></button>;
              const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
              const isSelected = iso === selectedDate;
              const has = haveEntries.has(iso);
              const isToday = iso === today;
              return (
                <button key={i} onClick={() => setSelectedDate(iso)} style={{
                  appearance: 'none', border: isToday && !isSelected ? `1px solid ${TOK.ink3}` : 0,
                  cursor: 'pointer', aspectRatio: '1', borderRadius: 10, fontFamily: FONT_TEXT,
                  background: isSelected ? TOK.ink0 : (has ? 'rgba(20,16,12,0.04)' : 'transparent'),
                  color: isSelected ? '#fffaf2' : TOK.ink0,
                  fontSize: 12.5, fontWeight: 500, position: 'relative', transition: 'all 0.15s',
                }}>
                  {n}
                  {has && !isSelected && (
                    <span style={{
                      position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                      width: 3, height: 3, borderRadius: '50%', background: TOK.accent,
                    }}></span>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{
            marginTop: 16, paddingTop: 14, borderTop: `0.5px solid ${TOK.hair}`,
            display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOK.ink2, fontFamily: FONT_TEXT,
          }}>
            <span>Streak</span>
            <span style={{ color: TOK.ink0, fontWeight: 500 }}>{streak} {streak === 1 ? 'day' : 'days'}</span>
          </div>
        </Card>

        {/* Right: entry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card hero style={{ padding: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <CardLabel style={{ marginBottom: 2 }}>{niceDate}</CardLabel>
                <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.018em', fontFamily: FONT_DISPLAY, color: TOK.ink0 }}>
                  How was today?
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['rough','meh','good','great'] as const).map(m => {
                  const active = entry?.mood === m;
                  return (
                    <button key={m} onClick={() => updateEntry({ mood: m })} style={{
                      appearance: 'none', cursor: 'pointer', fontFamily: FONT_TEXT,
                      fontSize: 12, padding: '5px 11px', borderRadius: TOK.rPill,
                      background: active ? TOK.ink0 : 'rgba(255,253,249,0.85)',
                      border: `1px solid ${active ? TOK.ink0 : TOK.hairStrong}`,
                      color: active ? '#fffaf2' : TOK.ink0,
                      transition: 'all 0.15s',
                    }}>{m}</button>
                  );
                })}
              </div>
            </div>
            <textarea
              value={entry?.body || ''}
              onChange={e => updateEntry({ body: e.target.value })}
              rows={6}
              placeholder="Jot down notes, wins, blockers — whatever you want to remember."
              style={{
                width: '100%', background: 'transparent', border: 0, padding: 0,
                fontSize: 14.5, lineHeight: 1.6, marginTop: 14, fontFamily: FONT_TEXT,
                color: TOK.ink0, outline: 'none', resize: 'vertical', minHeight: 140,
              }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 16, paddingTop: 16, borderTop: `0.5px solid ${TOK.hair}`,
            }}>
              <span style={{ fontSize: 12, color: TOK.ink3, fontFamily: FONT_TEXT }}>
                {wordCount} {wordCount === 1 ? 'word' : 'words'} · autosaving
              </span>
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Card>
              <CardLabel>{selectedDate === today ? "Today's meetings" : 'Meetings'}</CardLabel>
              {todaysMeetings.length === 0 ? (
                <div style={{ fontSize: 13, color: TOK.ink3, padding: '16px 0', textAlign: 'center', fontFamily: FONT_TEXT }}>
                  {googleConnected || !googleConfigured ? 'No meetings' : (
                    <span onClick={onConnectGoogle} style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                      Connect calendar
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {todaysMeetings.slice(0, 4).map(m => (
                    <div key={m.id} style={{
                      display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 10,
                      padding: '8px 0', borderTop: `0.5px solid ${TOK.hair}`,
                      fontSize: 13, alignItems: 'center', fontFamily: FONT_TEXT,
                    }}>
                      <span style={{ fontSize: 11, color: TOK.ink3 }}>{m.time}</span>
                      <span style={{ color: TOK.ink0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</span>
                      {m.link && (
                        <a href={m.link} target="_blank" rel="noopener noreferrer" style={{
                          fontSize: 11, color: TOK.good, textDecoration: 'none',
                          padding: '2px 8px', borderRadius: TOK.rPill, background: 'oklch(0.55 0.10 150 / 0.10)',
                          border: '1px solid oklch(0.55 0.10 150 / 0.20)',
                        }}>Join</a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card>
              <CardLabel>Tomorrow's first move</CardLabel>
              <Input value={entry?.tomorrow || ''}
                onChange={v => updateEntry({ tomorrow: v })}
                placeholder="What's the first thing tomorrow?" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NETWORK
   ═══════════════════════════════════════════════════════════ */

const URGENCY_TONE: Record<Urgency, 'good' | 'warn' | 'bad' | 'neutral'> = {
  now: 'bad', soon: 'warn', later: 'neutral', waiting: 'neutral',
};

const CATEGORY_LABEL: Record<ContactCategory, string> = {
  'call-booked': 'Call booked', 'reply-needed': 'Reply needed',
  'warm': 'Warm', 'awaiting-reply': 'Awaiting reply',
  'connected': 'Connected', 'archived': 'Archived',
};

function avatarColor(name: string): string {
  const n = name.charCodeAt(0) || 0;
  const hues = [30, 60, 130, 200, 280, 320, 350, 90, 240];
  const h = hues[n % hues.length];
  return `oklch(0.78 0.10 ${h})`;
}

function Network({ contacts, setContacts, journal }: {
  contacts: NetworkContact[];
  setContacts: (fn: (prev: NetworkContact[]) => NetworkContact[]) => void;
  journal: JournalEntry[];
}) {
  const [filter, setFilter] = useState<'all' | 'active' | 'needs' | 'cold'>('all');
  const [search, setSearch] = useState('');
  const [selId, setSelId] = useState<string | null>(contacts[0]?.id || null);
  const [showNew, setShowNew] = useState(false);
  const [newC, setNewC] = useState<{ name: string; company: string; role: string }>({ name: '', company: '', role: '' });

  const counts = {
    active: contacts.filter(c => ['call-booked', 'reply-needed', 'warm'].includes(c.category)).length,
    needs: contacts.filter(c => c.category === 'reply-needed').length,
    cold: contacts.filter(c => c.category === 'archived').length,
  };

  const visible = useMemo(() => {
    let list = contacts.filter(c => c.category !== 'archived' || filter === 'cold');
    if (filter === 'active') list = list.filter(c => ['call-booked', 'reply-needed', 'warm'].includes(c.category));
    else if (filter === 'needs') list = list.filter(c => c.category === 'reply-needed');
    else if (filter === 'cold') list = list.filter(c => c.category === 'archived');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q));
    }
    return list;
  }, [contacts, filter, search]);

  const sel = contacts.find(c => c.id === selId);

  const updateContact = (id: string, patch: Partial<NetworkContact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    if (selId === id) setSelId(null);
  };

  const createContact = () => {
    if (!newC.name.trim()) return;
    const c: NetworkContact = {
      id: uid(), name: newC.name.trim(), company: newC.company.trim(), role: newC.role.trim(),
      category: 'warm', urgency: 'later',
      whatTheySaid: '', actionNeeded: '', notes: '',
      createdAt: new Date().toISOString(),
    };
    setContacts(prev => [c, ...prev]);
    setSelId(c.id);
    setNewC({ name: '', company: '', role: '' });
    setShowNew(false);
  };

  // Last 3 touches per contact (from journal meetings)
  const touchesFor = (cid: string) => {
    const out: { date: string; type: string; note: string }[] = [];
    for (const e of journal) {
      const m = e.meetings?.filter(mtg => mtg.contactId === cid) || [];
      for (const mtg of m) {
        out.push({
          date: e.date,
          type: mtg.title || 'Meeting',
          note: mtg.notes || '',
        });
      }
    }
    return out.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  };

  const Pill = ({ id, label, n, dot }: { id: typeof filter; label: string; n: number; dot?: string }) => (
    <button onClick={() => setFilter(id)} style={{
      appearance: 'none', border: 0, cursor: 'pointer',
      padding: '6px 12px', borderRadius: TOK.rPill,
      fontSize: 12.5, fontWeight: 500, fontFamily: FONT_TEXT,
      background: filter === id ? TOK.ink0 : 'transparent',
      color: filter === id ? '#fffaf2' : TOK.ink1,
      display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }}></span>}
      <span>{label}</span>
      <span style={{ opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>{n}</span>
    </button>
  );

  return (
    <div style={{ animation: 'bb-fade 0.32s cubic-bezier(.2,.8,.2,1) both' }}>
      <PageHeader
        title="Network"
        sub={`${contacts.length} ${contacts.length === 1 ? 'person' : 'people'} · ${counts.needs} need a reply`}
        right={<>
          <Btn ghost>Import</Btn>
          <Btn primary onClick={() => setShowNew(true)}>+ Person</Btn>
        </>}
      />

      <Card style={{ padding: 6, marginBottom: 14, display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        <Pill id="all" label="All" n={contacts.length} />
        <Pill id="active" label="Active" n={counts.active} dot={TOK.good} />
        <Pill id="needs" label="Needs reply" n={counts.needs} dot={TOK.warn} />
        <Pill id="cold" label="Archived" n={counts.cold} dot={TOK.ink3} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          style={{
            marginLeft: 'auto', width: 200, padding: '5px 11px', fontSize: 12.5,
            background: 'rgba(255,253,249,0.7)', border: `1px solid ${TOK.hair}`,
            borderRadius: 10, fontFamily: FONT_TEXT, color: TOK.ink0, outline: 'none',
          }} />
      </Card>

      {showNew && (
        <Card hero style={{ marginBottom: 14, padding: 18 }}>
          <CardLabel>New contact</CardLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8 }}>
            <Input value={newC.name} onChange={v => setNewC({ ...newC, name: v })} placeholder="Name *" autoFocus />
            <Input value={newC.company} onChange={v => setNewC({ ...newC, company: v })} placeholder="Company" />
            <Input value={newC.role} onChange={v => setNewC({ ...newC, role: v })} placeholder="Role" />
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost onClick={() => { setShowNew(false); setNewC({ name: '', company: '', role: '' }); }}>Cancel</Btn>
              <Btn primary onClick={createContact}>Add</Btn>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 360px' : '1fr', gap: 14, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.length === 0 ? (
            <Card>
              <div style={{ padding: '32px 0', textAlign: 'center', color: TOK.ink3, fontFamily: FONT_TEXT }}>
                {contacts.length === 0 ? 'No contacts yet · add your first person ↑' : 'No matches'}
              </div>
            </Card>
          ) : visible.map(c => {
            const isSel = selId === c.id;
            const initial = (c.name[0] || '?').toUpperCase();
            const tone = c.category === 'reply-needed' ? 'warn' : c.category === 'call-booked' ? 'good' : 'neutral';
            return (
              <div key={c.id} onClick={() => setSelId(c.id)} style={{
                background: isSel ? TOK.glass2 : TOK.glass,
                backdropFilter: 'saturate(160%) blur(20px)',
                WebkitBackdropFilter: 'saturate(160%) blur(20px)',
                border: `1px solid ${isSel ? TOK.ink3 : TOK.hairStrong}`,
                borderRadius: TOK.rCard, boxShadow: TOK.shadow,
                padding: '13px 16px', cursor: 'pointer',
                display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: avatarColor(c.name),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: 13, color: TOK.ink0, fontFamily: FONT_TEXT,
                }}>{initial}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: TOK.ink0, fontFamily: FONT_TEXT }}>{c.name}</span>
                    {(c.role || c.company) && (
                      <span style={{ fontSize: 12, color: TOK.ink2, fontFamily: FONT_TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        · {[c.role, c.company].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                  {c.actionNeeded && (
                    <div style={{ marginTop: 3, fontSize: 12.5, color: TOK.ink1, display: 'flex', gap: 8, fontFamily: FONT_TEXT }}>
                      <span style={{ color: TOK.ink3 }}>→</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.actionNeeded}</span>
                    </div>
                  )}
                </div>
                <Chip tone={tone}>{CATEGORY_LABEL[c.category]}</Chip>
              </div>
            );
          })}
        </div>

        {sel && (
          <Card hero style={{ padding: 22, position: 'sticky', top: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: avatarColor(sel.name),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 22, color: TOK.ink0, fontFamily: FONT_TEXT,
              }}>{(sel.name[0] || '?').toUpperCase()}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em', color: TOK.ink0, fontFamily: FONT_DISPLAY }}>{sel.name}</div>
                <div style={{ fontSize: 12.5, color: TOK.ink2, fontFamily: FONT_TEXT }}>
                  {[sel.role, sel.company].filter(Boolean).join(' · ') || 'No role yet'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
              <select value={sel.category} onChange={e => updateContact(sel.id, { category: e.target.value as ContactCategory })}
                style={{
                  flex: 1, minWidth: 0, padding: '6px 10px', borderRadius: TOK.rPill, fontFamily: FONT_TEXT,
                  fontSize: 12.5, fontWeight: 500, background: TOK.ink0, color: '#fffaf2',
                  border: `1px solid ${TOK.ink0}`, cursor: 'pointer', outline: 'none',
                }}>
                {(Object.keys(CATEGORY_LABEL) as ContactCategory[]).map(cat => (
                  <option key={cat} value={cat} style={{ background: '#fff', color: TOK.ink0 }}>
                    {CATEGORY_LABEL[cat]}
                  </option>
                ))}
              </select>
              {sel.linkedinUrl && <a href={sel.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Btn>LinkedIn</Btn>
              </a>}
              <Btn onClick={() => removeContact(sel.id)} style={{ color: TOK.bad }}>Remove</Btn>
            </div>

            <CardLabel>Next move</CardLabel>
            <textarea
              value={sel.actionNeeded}
              onChange={e => updateContact(sel.id, { actionNeeded: e.target.value })}
              rows={2}
              placeholder="What's the next move?"
              style={{
                width: '100%', padding: '10px 12px', background: 'rgba(20,16,12,0.04)',
                borderRadius: 10, fontSize: 13.5, marginBottom: 12, fontFamily: FONT_TEXT,
                border: `1px solid ${TOK.hair}`, color: TOK.ink0, outline: 'none', resize: 'vertical',
                lineHeight: 1.55, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div>
                <CardLabel style={{ marginBottom: 4 }}>Urgency</CardLabel>
                <select value={sel.urgency} onChange={e => updateContact(sel.id, { urgency: e.target.value as Urgency })}
                  style={{
                    width: '100%', padding: '7px 10px', borderRadius: 10, fontFamily: FONT_TEXT,
                    fontSize: 12.5, background: 'rgba(255,253,249,0.7)', color: TOK.ink0,
                    border: `1px solid ${TOK.hair}`, outline: 'none', cursor: 'pointer',
                  }}>
                  <option value="now">Now</option><option value="soon">Soon</option>
                  <option value="later">Later</option><option value="waiting">Waiting</option>
                </select>
              </div>
              <div>
                <CardLabel style={{ marginBottom: 4 }}>Follow up</CardLabel>
                <Input value={sel.followUpDate || ''} onChange={v => updateContact(sel.id, { followUpDate: v })}
                  placeholder="YYYY-MM-DD" />
              </div>
            </div>

            <CardLabel>What they said</CardLabel>
            <textarea
              value={sel.whatTheySaid}
              onChange={e => updateContact(sel.id, { whatTheySaid: e.target.value })}
              rows={3}
              placeholder="Last conversation summary"
              style={{
                width: '100%', padding: '10px 12px', background: 'rgba(255,253,249,0.7)',
                borderRadius: 10, fontSize: 13, marginBottom: 16, fontFamily: FONT_TEXT,
                border: `1px solid ${TOK.hair}`, color: TOK.ink0, outline: 'none', resize: 'vertical',
                lineHeight: 1.55, boxSizing: 'border-box',
              }}
            />

            <CardLabel>Last 3 touches</CardLabel>
            {(() => {
              const t = touchesFor(sel.id);
              if (t.length === 0) {
                return <div style={{ fontSize: 12, color: TOK.ink3, padding: '12px 0', fontFamily: FONT_TEXT }}>
                  No journal touches yet — log a meeting in Journal
                </div>;
              }
              return (
                <div>
                  {t.map((x, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '60px 1fr', gap: 12,
                      padding: '10px 0', borderTop: i === 0 ? '0' : `0.5px solid ${TOK.hair}`,
                      fontFamily: FONT_TEXT,
                    }}>
                      <span style={{ fontSize: 11, color: TOK.ink3 }}>{fmtDateShort(x.date)}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: TOK.ink0 }}>{x.type}</div>
                        {x.note && <div style={{ fontSize: 12, color: TOK.ink2, marginTop: 2 }}>{x.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TASKS
   ═══════════════════════════════════════════════════════════ */

function Tasks({ tasks, setTasks }: {
  tasks: Task[]; setTasks: (fn: (prev: Task[]) => Task[]) => void;
}) {
  const today = localToday();
  const [quick, setQuick] = useState('');

  const groups = useMemo(() => {
    const open = tasks.filter(t => t.status !== 'done');
    const todayList = open.filter(t => t.dueDate === today);
    const todayPlus6 = (() => {
      const d = new Date(today + 'T12:00');
      d.setDate(d.getDate() + 7);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();
    const week = open.filter(t => t.dueDate && t.dueDate > today && t.dueDate <= todayPlus6);
    const later = open.filter(t => !t.dueDate || t.dueDate > todayPlus6 || t.dueDate < today);
    const done = tasks.filter(t => t.status === 'done').slice(0, 12);
    return { Today: todayList, 'This week': week, Later: later, Done: done };
  }, [tasks, today]);

  const toggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? {
      ...t, status: t.status === 'done' ? 'todo' : 'done',
      updatedAt: new Date().toISOString(),
    } : t));
  };

  const remove = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Quick-add parser: "Email Sam tomorrow #career !high"
  const addQuick = () => {
    if (!quick.trim()) return;
    let title = quick.trim();
    let priority: TaskPriority = 'medium';
    let list: string | undefined;
    let dueDate: string | undefined;

    // !high !med !low
    const pMatch = title.match(/!(high|med|medium|low)/i);
    if (pMatch) {
      const p = pMatch[1].toLowerCase();
      priority = p === 'high' ? 'high' : p === 'low' ? 'low' : 'medium';
      title = title.replace(pMatch[0], '').trim();
    }
    // #tag
    const tMatch = title.match(/#(\w+)/);
    if (tMatch) {
      list = tMatch[1];
      title = title.replace(tMatch[0], '').trim();
    }
    // today / tomorrow
    if (/\btoday\b/i.test(title)) {
      dueDate = today;
      title = title.replace(/\btoday\b/i, '').trim();
    } else if (/\btomorrow\b/i.test(title)) {
      const d = new Date(today + 'T12:00');
      d.setDate(d.getDate() + 1);
      dueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      title = title.replace(/\btomorrow\b/i, '').trim();
    }
    const now = new Date().toISOString();
    setTasks(prev => [...prev, {
      id: uid(), title, status: 'todo', priority,
      dueDate: dueDate || today, list,
      createdAt: now, updatedAt: now,
    }]);
    setQuick('');
  };

  const totalOpen = tasks.filter(t => t.status !== 'done').length;
  const totalDone = tasks.filter(t => t.status === 'done').length;

  return (
    <div style={{ animation: 'bb-fade 0.32s cubic-bezier(.2,.8,.2,1) both' }}>
      <PageHeader
        title="Tasks"
        sub={`${totalOpen} open · ${totalDone} done`}
        right={<>
          <Btn ghost>Filter</Btn>
          <Btn primary onClick={() => { setQuick(''); }}>+ Task</Btn>
        </>}
      />

      <Card style={{ marginBottom: 14, padding: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 18, color: TOK.ink3 }}>+</span>
          <input value={quick} onChange={e => setQuick(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuick()}
            placeholder="Quick add — e.g. 'Email Sam tomorrow #career !high'"
            style={{
              flex: 1, background: 'transparent', border: 0, padding: 0, fontSize: 14,
              fontFamily: FONT_TEXT, color: TOK.ink0, outline: 'none',
            }} />
          <span style={{ fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT }}>↵ to add</span>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {Object.entries(groups).map(([name, list]) => (
          <Card key={name} style={{ padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 18px 8px' }}>
              <CardLabel style={{ marginBottom: 0 }}>{name}</CardLabel>
              <span style={{ fontSize: 11, color: TOK.ink3, fontVariantNumeric: 'tabular-nums', fontFamily: FONT_TEXT }}>{list.length}</span>
            </div>
            {list.length === 0 ? (
              <div style={{ padding: '24px 18px', color: TOK.ink3, fontSize: 12.5, textAlign: 'center', fontFamily: FONT_TEXT }}>Nothing here</div>
            ) : (
              <div style={{ padding: '0 18px 14px' }}>
                {list.map(t => (
                  <div key={t.id} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,16,12,0.025)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 6px',
                      borderTop: `0.5px solid ${TOK.hair}`,
                      cursor: 'pointer', opacity: t.status === 'done' ? 0.45 : 1,
                      borderRadius: 8, transition: 'background 0.14s, opacity 0.18s',
                    }}>
                    <div onClick={() => toggle(t.id)} style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: t.status === 'done' ? '0' : `1.5px solid ${TOK.ink3}`,
                      background: t.status === 'done' ? TOK.ink0 : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {t.status === 'done' && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
                    </div>
                    {t.priority === 'high' && t.status !== 'done' &&
                      <span style={{ width: 3, height: 14, borderRadius: 2, background: TOK.bad }}></span>}
                    <span onClick={() => toggle(t.id)} style={{
                      flex: 1, fontSize: 13.5, fontFamily: FONT_TEXT, color: TOK.ink0,
                      textDecoration: t.status === 'done' ? 'line-through' : 'none',
                    }}>{t.title}</span>
                    {t.list && <Chip>{t.list}</Chip>}
                    <button onClick={() => remove(t.id)} style={{
                      appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                      color: TOK.ink3, fontSize: 14, padding: '4px 6px', fontFamily: FONT_TEXT,
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GOALS
   ═══════════════════════════════════════════════════════════ */

function seed2026Goals(): Goal[] {
  const now = new Date().toISOString();
  const mk = (
    title: string, description: string, scope: string,
    timeframe: GoalTimeframe, deadline: string | undefined, milestones: string[],
  ): Goal => ({
    id: uid(), title, description, status: 'active', timeframe, deadline,
    progress: 0, checklist: [], log: [],
    milestones, completedMilestones: milestones.map(() => false),
    scope, createdAt: now, updatedAt: now,
  });
  return [
    mk('File Laurier late-withdrawal petition', 'submit by Aug 8, then decision pending', 'School',
      'short', '2026-08-08', ['draft petition', 'gather docs', 'submit', 'decision pending']),
    mk('Lock Bluejay extension + raise', 'extension signed, $4,500 per check', 'Career',
      'short', '2026-08-31', ['make the ask', 'get it in writing']),
    mk('185 lb lean', 'cut from 195, keep strength', 'Health',
      'short', '2026-11-30', ['192', '189', '187', '185']),
    mk('$60k+ USD banked', '$7,666 start + 18 checks x $3,000', 'Money',
      'long', '2027-04-30', ['$20k', '$35k', '$50k', '$61.7k']),
    mk('Waterloo Spring 2027', 'CP213 + CP214 in person', 'School',
      'long', '2027-05-04', ['enroll for spring', 'CP213', 'CP214']),
    mk('Degree conferred, then TN at border', 'paper in hand, status sorted', 'School',
      'long', '2027-09-30', ['finish courses', 'degree conferred', 'TN letter', 'cross']),
    mk('Next role at Whop / Polymarket / Kalshi tier', 'undeniable work, warm intros, pick the offer', 'Career',
      'long', undefined, ['ship undeniable work', 'warm intros', 'interview loop']),
  ];
}

function Goals({ goals, setGoals }: {
  goals: Goal[]; setGoals: (fn: (prev: Goal[]) => Goal[]) => void;
}) {
  const [showNew, setShowNew] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [draft, setDraft] = useState<{ title: string; description: string; deadline: string; scope: string }>({
    title: '', description: '', deadline: '', scope: '',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const active = goals.filter(g => g.status === 'active');
  const dueThisMonth = active.filter(g => {
    if (!g.deadline) return false;
    return monthKey(g.deadline) === thisMonthKey();
  }).length;

  const seedPlan = () => {
    setGoals(prev => [...prev, ...seed2026Goals()]);
    setShowMenu(false);
  };

  const addGoal = () => {
    if (!draft.title.trim()) return;
    const now = new Date().toISOString();
    const g: Goal = {
      id: uid(), title: draft.title.trim(), description: draft.description.trim(),
      status: 'active', timeframe: 'short',
      deadline: draft.deadline || undefined,
      scope: draft.scope || undefined,
      progress: 0, checklist: [], log: [],
      milestones: [], completedMilestones: [],
      createdAt: now, updatedAt: now,
    };
    setGoals(prev => [...prev, g]);
    setDraft({ title: '', description: '', deadline: '', scope: '' });
    setShowNew(false);
  };

  const updateGoal = (id: string, patch: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...patch, updatedAt: new Date().toISOString() } : g));
  };

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const toggleMilestone = (g: Goal, idx: number) => {
    const completed = [...(g.completedMilestones || [])];
    completed[idx] = !completed[idx];
    const total = (g.milestones || []).length;
    const doneCount = completed.filter(Boolean).length;
    const progress = total > 0 ? Math.round((doneCount / total) * 100) : g.progress;
    updateGoal(g.id, { completedMilestones: completed, progress });
  };

  const addMilestone = (g: Goal, text: string) => {
    if (!text.trim()) return;
    updateGoal(g.id, {
      milestones: [...(g.milestones || []), text.trim()],
      completedMilestones: [...(g.completedMilestones || []), false],
    });
  };

  return (
    <div style={{ animation: 'bb-fade 0.32s cubic-bezier(.2,.8,.2,1) both' }}>
      <PageHeader
        title="Goals"
        sub={`${active.length} active · ${dueThisMonth} due this month`}
        right={<>
          <div style={{ position: 'relative' }}>
            <Btn ghost onClick={() => setShowMenu(m => !m)}>⋯</Btn>
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 6, zIndex: 20,
                background: TOK.glass2, backdropFilter: 'saturate(160%) blur(20px)',
                WebkitBackdropFilter: 'saturate(160%) blur(20px)',
                border: `1px solid ${TOK.hairStrong}`, borderRadius: 12,
                boxShadow: TOK.shadow, padding: 4, minWidth: 160,
              }}>
                <button onClick={seedPlan} style={{
                  appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', borderRadius: 8, fontFamily: FONT_TEXT,
                  fontSize: 12.5, color: TOK.ink0, whiteSpace: 'nowrap',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,16,12,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >seed 2026 plan</button>
              </div>
            )}
          </div>
          <Btn primary onClick={() => setShowNew(true)}>+ Goal</Btn>
        </>}
      />

      {showNew && (
        <Card hero style={{ marginBottom: 14, padding: 18 }}>
          <CardLabel>New goal</CardLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <Input value={draft.title} onChange={v => setDraft({ ...draft, title: v })} placeholder="Title *" autoFocus />
            <Input value={draft.scope} onChange={v => setDraft({ ...draft, scope: v })} placeholder="Scope (Health, Career…)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <Input value={draft.description} onChange={v => setDraft({ ...draft, description: v })} placeholder="Target / what success looks like" />
            <Input value={draft.deadline} onChange={v => setDraft({ ...draft, deadline: v })} placeholder="Deadline (YYYY-MM-DD)" />
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <Btn ghost onClick={() => { setShowNew(false); setDraft({ title: '', description: '', deadline: '', scope: '' }); }}>Cancel</Btn>
            <Btn primary onClick={addGoal}>Add</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {active.length === 0 && !showNew && (
          <Card>
            <div style={{ padding: '32px 0', textAlign: 'center', color: TOK.ink3, fontFamily: FONT_TEXT }}>
              <div style={{ marginBottom: goals.length === 0 ? 12 : 0 }}>No goals yet · click + Goal to add one</div>
              {goals.length === 0 && <Btn onClick={seedPlan}>seed 2026 plan</Btn>}
            </div>
          </Card>
        )}
        {active.map(g => {
          const expanded = expandedId === g.id;
          const dueText = g.deadline ? fmtDateShort(g.deadline) : 'no deadline';
          return (
            <Card key={g.id} style={{ padding: 22 }}>
              <div onClick={() => setExpandedId(expanded ? null : g.id)} style={{
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start', cursor: 'pointer',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4, whiteSpace: 'nowrap', flexWrap: 'wrap' }}>
                    <CardLabel style={{ marginBottom: 0 }}>{g.scope || 'Goal'}</CardLabel>
                    <span style={{ fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT }}>· due {dueText}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.018em', marginBottom: 4, color: TOK.ink0, fontFamily: FONT_DISPLAY }}>{g.title}</div>
                  {g.description && <div style={{ fontSize: 13, color: TOK.ink2, fontFamily: FONT_TEXT }}>{g.description}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', fontFamily: FONT_DISPLAY, color: TOK.ink0 }}>{g.progress}%</div>
                  <div style={{ fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT }}>complete</div>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: 'rgba(20,16,12,0.06)', marginTop: 16, overflow: 'hidden' }}>
                <div style={{ width: `${g.progress}%`, background: TOK.ink0, height: '100%', borderRadius: 999, transition: 'width 0.25s' }}></div>
              </div>
              {(g.milestones || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                  {(g.milestones || []).map((m, i) => {
                    const done = !!(g.completedMilestones || [])[i];
                    return (
                      <div key={i} onClick={(e) => { e.stopPropagation(); toggleMilestone(g, i); }} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
                        background: done ? 'oklch(0.55 0.12 150 / 0.12)' : 'rgba(20,16,12,0.04)',
                        borderRadius: TOK.rPill, fontSize: 12, cursor: 'pointer', fontFamily: FONT_TEXT,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: done ? TOK.good : TOK.ink4 }}></span>
                        <span style={{ color: done ? TOK.good : TOK.ink1, textDecoration: done ? 'line-through' : 'none' }}>{m}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {expanded && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: `0.5px solid ${TOK.hair}` }}>
                  <CardLabel>Add milestone</CardLabel>
                  <input
                    placeholder="New milestone… ↵"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        addMilestone(g, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    style={{
                      width: '100%', padding: '9px 12px', fontFamily: FONT_TEXT, fontSize: 13.5,
                      background: 'rgba(255,253,249,0.7)', border: `1px solid ${TOK.hair}`,
                      borderRadius: 10, color: TOK.ink0, outline: 'none', marginBottom: 12, boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                    <input type="number" min="0" max="100" value={g.progress}
                      onChange={e => updateGoal(g.id, { progress: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                      style={{
                        padding: '7px 10px', fontFamily: FONT_TEXT, fontSize: 13,
                        background: 'rgba(255,253,249,0.7)', border: `1px solid ${TOK.hair}`,
                        borderRadius: 10, color: TOK.ink0, outline: 'none', boxSizing: 'border-box',
                      }} />
                    <Input value={g.deadline || ''} onChange={v => updateGoal(g.id, { deadline: v })} placeholder="Deadline" />
                    <Input value={g.scope || ''} onChange={v => updateGoal(g.id, { scope: v })} placeholder="Scope" />
                    <Btn onClick={() => updateGoal(g.id, { status: 'completed' })}>Mark complete</Btn>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Btn ghost style={{ color: TOK.bad }} onClick={() => removeGoal(g.id)}>Delete goal</Btn>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FINANCE
   ═══════════════════════════════════════════════════════════ */

function Finance({ finance, setFinance, plan, setPlan, trading, setTrading }: {
  finance: FinanceData;
  setFinance: (fn: (prev: FinanceData) => FinanceData) => void;
  plan: FinancePlan;
  setPlan: (fn: (prev: FinancePlan) => FinancePlan) => void;
  trading: TradingData;
  setTrading: (fn: (prev: TradingData) => TradingData) => void;
}) {
  const monthStart = thisMonthKey();
  const monthTx = finance.transactions.filter(t => monthKey(t.date) === monthStart);
  const incomeTx = monthTx.filter(t => t.type === 'income');
  const expenseTx = monthTx.filter(t => t.type === 'expense');
  const income = incomeTx.reduce((s, t) => s + toCAD(t.amount, t.currency), 0);
  const spending = expenseTx.reduce((s, t) => s + toCAD(t.amount, t.currency), 0);
  const net = income - spending;
  const savedPct = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;

  // The Plan
  const confirmed = plan.checksConfirmed.length;
  const vaulted = confirmed * plan.perCheck;
  const currentUSD = plan.startBalanceUSD + vaulted;
  const currentCAD = currentUSD * FX_USD_TO_CAD;
  const projectedUSD = plan.startBalanceUSD + plan.checksTotal * plan.perCheck;
  const planPct = plan.checksTotal > 0 ? (confirmed / plan.checksTotal) * 100 : 0;
  const lastConfirm = plan.checksConfirmed[confirmed - 1];
  const allConfirmed = confirmed >= plan.checksTotal;
  const confirmCheck = () => {
    setPlan(prev => prev.checksConfirmed.length >= prev.checksTotal
      ? prev
      : { ...prev, checksConfirmed: [...prev.checksConfirmed, localToday()] });
  };
  const undoCheck = () => {
    setPlan(prev => ({ ...prev, checksConfirmed: prev.checksConfirmed.slice(0, -1) }));
  };

  // This-month burn vs $2,000 budget (USD)
  const BURN_BUDGET_USD = 1400;
  const burnUSD = expenseTx.reduce((s, t) => s + toUSD(t.amount, t.currency), 0);
  const burnPct = Math.min(100, (burnUSD / BURN_BUDGET_USD) * 100);
  const overBurn = burnUSD > BURN_BUDGET_USD;

  // Accounts
  const accountsUSD = finance.accounts.reduce((s, a) => s + toUSD(a.balance, a.currency), 0);
  const accountsCAD = accountsUSD * FX_USD_TO_CAD;

  // Compare vs last month
  const lastMonth = (() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();
  const lastMonthTx = finance.transactions.filter(t => monthKey(t.date) === lastMonth);
  const lastNet = lastMonthTx.reduce((s, t) => {
    const v = toCAD(t.amount, t.currency);
    return s + (t.type === 'income' ? v : -v);
  }, 0);
  const netDelta = lastNet !== 0 ? Math.round(((net - lastNet) / Math.abs(lastNet)) * 100) : 0;

  // Recent activity
  const recent = [...finance.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  // Budgets (with progress this month)
  const budgetsWithProgress = finance.budgets.map(b => {
    const spent = monthTx
      .filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((s, t) => s + toCAD(t.amount, t.currency), 0);
    return { ...b, spent };
  });

  // Quick add
  const [quickTx, setQuickTx] = useState('');
  const [showAddTx, setShowAddTx] = useState(false);
  const [draft, setDraft] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '', category: '', note: '', date: localToday(), currency: 'CAD' as Currency,
  });

  const addTransaction = () => {
    const amt = parseFloat(draft.amount);
    if (!amt || !draft.category) return;
    const tx: Transaction = {
      id: uid(), date: draft.date, amount: Math.abs(amt),
      currency: draft.currency, type: draft.type,
      category: draft.category, note: draft.note,
      createdAt: new Date().toISOString(),
    };
    setFinance(prev => ({ ...prev, transactions: [tx, ...prev.transactions] }));
    setDraft({ type: 'expense', amount: '', category: '', note: '', date: localToday(), currency: 'CAD' });
    setShowAddTx(false);
  };

  // Quick add parser: "Coffee 7.50 expense food" or "Stripe 2400 income"
  const addQuickTx = () => {
    const parts = quickTx.trim().split(/\s+/);
    if (parts.length < 2) return;
    let type: 'income' | 'expense' = 'expense';
    let category = 'misc';
    let amount = 0;
    const noteParts: string[] = [];
    for (const p of parts) {
      if (/^-?\d+(\.\d+)?$/.test(p)) {
        amount = Math.abs(parseFloat(p));
      } else if (p === 'income' || p === 'in' || p === '+') {
        type = 'income';
      } else if (p === 'expense' || p === 'out' || p === '-') {
        type = 'expense';
      } else if (['food','rent','transport','subs','salary','shopping','travel','misc','groceries','coffee'].includes(p.toLowerCase())) {
        category = p.toLowerCase();
      } else {
        noteParts.push(p);
      }
    }
    if (!amount) return;
    const tx: Transaction = {
      id: uid(), date: localToday(), amount, currency: 'CAD',
      type, category, note: noteParts.join(' '),
      createdAt: new Date().toISOString(),
    };
    setFinance(prev => ({ ...prev, transactions: [tx, ...prev.transactions] }));
    setQuickTx('');
  };

  const removeTx = (id: string) => {
    setFinance(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  // Budget controls
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [bDraft, setBDraft] = useState({ category: '', monthlyTarget: '' });

  // Account controls
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [aDraft, setADraft] = useState({ name: '', balance: '', currency: 'USD' as Currency, type: 'checking' as AccountType });
  const addAccount = () => {
    if (!aDraft.name.trim() || isNaN(parseFloat(aDraft.balance))) return;
    const a: Account = {
      id: uid(), name: aDraft.name.trim(), type: aDraft.type,
      currency: aDraft.currency, balance: parseFloat(aDraft.balance),
      updatedAt: new Date().toISOString(),
    };
    setFinance(prev => ({ ...prev, accounts: [...prev.accounts, a] }));
    setADraft({ name: '', balance: '', currency: 'USD', type: 'checking' });
    setShowAddAccount(false);
  };
  const removeAccount = (id: string) => {
    setFinance(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== id) }));
  };

  const addBudget = () => {
    if (!bDraft.category.trim() || !parseFloat(bDraft.monthlyTarget)) return;
    const b: Budget = {
      id: uid(), category: bDraft.category.trim(),
      monthlyTarget: parseFloat(bDraft.monthlyTarget), currency: 'CAD',
    };
    setFinance(prev => ({ ...prev, budgets: [...prev.budgets, b] }));
    setBDraft({ category: '', monthlyTarget: '' });
    setShowAddBudget(false);
  };

  const removeBudget = (id: string) => {
    setFinance(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
  };

  const monthName = new Date().toLocaleDateString('en', { month: 'long' });
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  return (
    <div style={{ animation: 'bb-fade 0.32s cubic-bezier(.2,.8,.2,1) both' }}>
      <PageHeader
        title="Finance"
        sub={`${monthName} · ${daysInMonth} days · ${savedPct}% saved`}
        right={<>
          <Btn ghost>Export</Btn>
          <Btn primary onClick={() => setShowAddTx(true)}>+ Transaction</Btn>
        </>}
      />

      {/* The Plan */}
      <Card hero style={{ padding: 26, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <CardLabel style={{ marginBottom: 4 }}>The Plan · $3,000 every check</CardLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 52, fontWeight: 300, letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums',
                fontFamily: FONT_DISPLAY, color: TOK.ink0,
              }}>${currentUSD.toLocaleString()}</span>
              <span style={{ color: TOK.ink2, fontSize: 13, fontFamily: FONT_TEXT, fontVariantNumeric: 'tabular-nums' }}>
                USD · C${Math.round(currentCAD).toLocaleString()}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {confirmed > 0 && <Btn ghost onClick={undoCheck}>undo</Btn>}
            <Btn primary onClick={confirmCheck} disabled={allConfirmed}>
              {allConfirmed ? 'all 18 in the vault' : 'confirm check + $3,000 moved'}
            </Btn>
          </div>
        </div>
        <div style={{ marginTop: 18, height: 8, borderRadius: 999, background: 'rgba(20,16,12,0.06)', overflow: 'hidden' }}>
          <div style={{ width: `${planPct}%`, background: TOK.ink0, height: '100%', borderRadius: 999, transition: 'width 0.25s' }}></div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
          marginTop: 20, paddingTop: 20, borderTop: `0.5px solid ${TOK.hair}`,
        }}>
          <FinanceStat label="Checks in" value={`${confirmed} / ${plan.checksTotal}`}
            sub={lastConfirm ? `last ${fmtDateShort(lastConfirm)}` : 'none yet'} />
          <FinanceStat label="Vaulted" value={`$${vaulted.toLocaleString()}`}
            sub={plan.startBalanceUSD > 0 ? `+ $${plan.startBalanceUSD.toLocaleString()} start` : 'vault only, aunt fund fenced'} tone={TOK.good} />
          <FinanceStat label="Projected Apr 2027" value={`$${projectedUSD.toLocaleString()}`}
            sub={`target $${plan.targetUSD.toLocaleString()}`} />
          <FinanceStat label="In CAD" value={`C$${Math.round(currentCAD).toLocaleString()}`}
            sub={`target C$${plan.targetCAD.toLocaleString()}`} />
        </div>
      </Card>

      {/* Trading desk: fun money lives beside the vault, never inside it */}
      <TradingDesk trading={trading} setTrading={setTrading} />

      {/* This-month burn */}
      <Card style={{ padding: 20, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <CardLabel style={{ marginBottom: 0 }}>{monthName} burn</CardLabel>
          <span style={{
            fontSize: 13, fontFamily: FONT_TEXT, fontVariantNumeric: 'tabular-nums',
            color: overBurn ? TOK.bad : TOK.ink2, fontWeight: 500,
          }}>
            ${Math.round(burnUSD).toLocaleString()} / ${BURN_BUDGET_USD.toLocaleString()}{overBurn ? ' · over' : ''}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: 'rgba(20,16,12,0.06)', overflow: 'hidden' }}>
          <div style={{
            width: `${burnPct}%`, height: '100%', borderRadius: 999,
            background: overBurn ? TOK.bad : TOK.ink0, transition: 'width 0.25s',
          }}></div>
        </div>
      </Card>

      {/* Net this month */}
      <Card style={{ padding: 26, marginBottom: 14 }}>
        <CardLabel>Net this month</CardLabel>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 52, fontWeight: 300, letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums',
            fontFamily: FONT_DISPLAY, color: TOK.ink0,
          }}>
            {net >= 0 ? '+' : '−'}${Math.abs(Math.round(net)).toLocaleString()}
          </span>
          {lastNet !== 0 && (
            <span style={{ color: netDelta >= 0 ? TOK.good : TOK.bad, fontSize: 13, fontFamily: FONT_TEXT }}>
              · {netDelta >= 0 ? 'up' : 'down'} {Math.abs(netDelta)}% vs last month
            </span>
          )}
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
          marginTop: 24, paddingTop: 20, borderTop: `0.5px solid ${TOK.hair}`,
        }}>
          <FinanceStat label="Income" value={`$${Math.round(income).toLocaleString()}`}
            sub={`${incomeTx.length} ${incomeTx.length === 1 ? 'source' : 'sources'}`} tone={TOK.good} />
          <FinanceStat label="Spending" value={`$${Math.round(spending).toLocaleString()}`}
            sub={`${expenseTx.length} transactions`} tone={TOK.bad} />
          <FinanceStat label="Saved" value={`${savedPct}%`} sub="of income" />
        </div>
      </Card>

      {/* Quick add */}
      <Card style={{ marginBottom: 14, padding: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 18, color: TOK.ink3 }}>+</span>
          <input value={quickTx} onChange={e => setQuickTx(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuickTx()}
            placeholder="Quick add — e.g. 'Coffee 7.50 food' or 'Stripe 2400 income salary'"
            style={{
              flex: 1, background: 'transparent', border: 0, padding: 0, fontSize: 14,
              fontFamily: FONT_TEXT, color: TOK.ink0, outline: 'none',
            }} />
          <span style={{ fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT }}>↵ to add</span>
        </div>
      </Card>

      {showAddTx && (
        <Card hero style={{ marginBottom: 14, padding: 18 }}>
          <CardLabel>New transaction</CardLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr', gap: 8, alignItems: 'center' }}>
            <select value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value as 'income' | 'expense' })}
              style={{
                padding: '7px 10px', fontFamily: FONT_TEXT, fontSize: 13,
                background: 'rgba(255,253,249,0.7)', border: `1px solid ${TOK.hair}`,
                borderRadius: 10, color: TOK.ink0, outline: 'none', cursor: 'pointer',
              }}>
              <option value="expense">Expense</option><option value="income">Income</option>
            </select>
            <Input value={draft.amount} onChange={v => setDraft({ ...draft, amount: v })} placeholder="0.00" type="number" />
            <Input value={draft.category} onChange={v => setDraft({ ...draft, category: v })} placeholder="Category" />
            <Input value={draft.note} onChange={v => setDraft({ ...draft, note: v })} placeholder="Note" />
            <Input value={draft.date} onChange={v => setDraft({ ...draft, date: v })} placeholder="YYYY-MM-DD" />
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 10 }}>
            <Btn ghost onClick={() => setShowAddTx(false)}>Cancel</Btn>
            <Btn primary onClick={addTransaction}>Add</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
        {/* Recent activity */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <CardLabel style={{ marginBottom: 0 }}>Recent activity</CardLabel>
            <span style={{ fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT }}>{finance.transactions.length} total</span>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: '32px 20px', color: TOK.ink3, textAlign: 'center', fontFamily: FONT_TEXT, fontSize: 13 }}>
              No transactions yet — add one ↑
            </div>
          ) : (
            <div style={{ padding: '0 20px 14px' }}>
              {recent.map(x => (
                <div key={x.id} style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr auto auto auto', gap: 14,
                  alignItems: 'center', padding: '10px 0',
                  borderTop: `0.5px solid ${TOK.hair}`, fontFamily: FONT_TEXT,
                }}>
                  <span style={{ fontSize: 11.5, color: TOK.ink3, fontVariantNumeric: 'tabular-nums' }}>{fmtDateShort(x.date)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: TOK.ink0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {x.note || x.category}
                    </div>
                  </div>
                  <Chip>{x.category}</Chip>
                  <span style={{
                    fontSize: 13.5, fontWeight: 500,
                    color: x.type === 'income' ? TOK.good : TOK.ink0,
                    textAlign: 'right', minWidth: 84,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {x.type === 'income' ? '+' : '−'}{fmtMoney(x.amount, x.currency)}
                  </span>
                  <button onClick={() => removeTx(x.id)} style={{
                    appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                    color: TOK.ink3, fontSize: 14, padding: '2px 6px', fontFamily: FONT_TEXT,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Budgets */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <CardLabel style={{ marginBottom: 0 }}>Budgets</CardLabel>
            <button onClick={() => setShowAddBudget(true)} style={{
              appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
              fontSize: 12, color: TOK.ink2, padding: '4px 8px', borderRadius: 6, fontFamily: FONT_TEXT,
            }}>+ add</button>
          </div>
          {showAddBudget && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: 6, marginBottom: 14 }}>
              <Input value={bDraft.category} onChange={v => setBDraft({ ...bDraft, category: v })} placeholder="Category" autoFocus />
              <Input value={bDraft.monthlyTarget} onChange={v => setBDraft({ ...bDraft, monthlyTarget: v })} placeholder="$" type="number" />
              <Btn primary onClick={addBudget}>Add</Btn>
            </div>
          )}
          {budgetsWithProgress.length === 0 && !showAddBudget ? (
            <div style={{ padding: '20px 0', color: TOK.ink3, textAlign: 'center', fontFamily: FONT_TEXT, fontSize: 13 }}>
              No budgets yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {budgetsWithProgress.map(b => {
                const pct = b.monthlyTarget > 0 ? Math.min(100, (b.spent / b.monthlyTarget) * 100) : 0;
                const over = b.spent > b.monthlyTarget;
                return (
                  <div key={b.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontFamily: FONT_TEXT }}>
                      <span style={{ fontSize: 13, color: TOK.ink0 }}>{b.category}</span>
                      <span style={{
                        fontSize: 12, color: over ? TOK.bad : TOK.ink2,
                        fontVariantNumeric: 'tabular-nums', display: 'flex', gap: 6, alignItems: 'center',
                      }}>
                        ${b.spent.toFixed(0)} / ${b.monthlyTarget.toFixed(0)}
                        <button onClick={() => removeBudget(b.id)} style={{
                          appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                          color: TOK.ink3, fontSize: 12, padding: 0,
                        }}>×</button>
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 999, background: 'rgba(20,16,12,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, background: over ? TOK.bad : TOK.good, height: '100%', transition: 'width 0.25s' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Accounts */}
      <Card style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <CardLabel style={{ marginBottom: 0 }}>Accounts</CardLabel>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
            {finance.accounts.length > 0 && (
              <span style={{ fontSize: 12, color: TOK.ink2, fontFamily: FONT_TEXT, fontVariantNumeric: 'tabular-nums' }}>
                ≈ ${Math.round(accountsUSD).toLocaleString()} USD · C${Math.round(accountsCAD).toLocaleString()}
              </span>
            )}
            <button onClick={() => setShowAddAccount(true)} style={{
              appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
              fontSize: 12, color: TOK.ink2, padding: '4px 8px', borderRadius: 6, fontFamily: FONT_TEXT,
            }}>+ add</button>
          </div>
        </div>
        {showAddAccount && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px auto auto auto', gap: 6, marginBottom: 14 }}>
            <Input value={aDraft.name} onChange={v => setADraft({ ...aDraft, name: v })} placeholder="Name" autoFocus />
            <Input value={aDraft.balance} onChange={v => setADraft({ ...aDraft, balance: v })} placeholder="0.00" type="number" />
            <select value={aDraft.currency} onChange={e => setADraft({ ...aDraft, currency: e.target.value as Currency })}
              style={{
                padding: '7px 10px', fontFamily: FONT_TEXT, fontSize: 13,
                background: 'rgba(255,253,249,0.7)', border: `1px solid ${TOK.hair}`,
                borderRadius: 10, color: TOK.ink0, outline: 'none', cursor: 'pointer',
              }}>
              <option value="USD">USD</option><option value="CAD">CAD</option>
            </select>
            <select value={aDraft.type} onChange={e => setADraft({ ...aDraft, type: e.target.value as AccountType })}
              style={{
                padding: '7px 10px', fontFamily: FONT_TEXT, fontSize: 13,
                background: 'rgba(255,253,249,0.7)', border: `1px solid ${TOK.hair}`,
                borderRadius: 10, color: TOK.ink0, outline: 'none', cursor: 'pointer',
              }}>
              <option value="checking">Checking</option><option value="savings">Savings</option>
              <option value="tfsa">TFSA</option><option value="crypto">Crypto</option>
              <option value="cash">Cash</option>
            </select>
            <Btn primary onClick={addAccount}>Add</Btn>
          </div>
        )}
        {finance.accounts.length === 0 && !showAddAccount ? (
          <div style={{ padding: '20px 0', color: TOK.ink3, textAlign: 'center', fontFamily: FONT_TEXT, fontSize: 13 }}>
            No accounts yet
          </div>
        ) : (
          <div>
            {finance.accounts.map((a, i) => (
              <div key={a.id} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12,
                alignItems: 'center', padding: '10px 0',
                borderTop: i === 0 ? '0' : `0.5px solid ${TOK.hair}`, fontFamily: FONT_TEXT,
              }}>
                <span style={{ fontSize: 13.5, color: TOK.ink0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                <Chip>{a.type}</Chip>
                <span style={{
                  fontSize: 13.5, fontWeight: 500, color: TOK.ink0,
                  textAlign: 'right', minWidth: 90, fontVariantNumeric: 'tabular-nums',
                }}>{fmtMoney(a.balance, a.currency)}</span>
                <button onClick={() => removeAccount(a.id)} style={{
                  appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                  color: TOK.ink3, fontSize: 14, padding: '2px 6px', fontFamily: FONT_TEXT,
                }}>×</button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

const FinanceStat = ({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: string }) => (
  <div>
    <div style={{ fontSize: 11, color: TOK.ink2, fontFamily: FONT_TEXT }}>{label}</div>
    <div style={{
      fontSize: 22, fontWeight: 500, color: tone || TOK.ink0, marginTop: 2,
      fontVariantNumeric: 'tabular-nums', fontFamily: FONT_DISPLAY,
    }}>{value}</div>
    <div style={{ fontSize: 11, color: TOK.ink3, marginTop: 2, fontFamily: FONT_TEXT }}>{sub}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   TRADING DESK · fun money, hard-walled from the vault
   ═══════════════════════════════════════════════════════════ */

interface ChainOpt {
  strike: number; bid: number | null; ask: number | null; mid: number | null;
  last: number | null; iv: number | null; volume: number | null; openInterest: number | null;
}
interface ChainQuote {
  symbol: string; spot: number; prevClose: number | null; marketTime: number | null;
  source: 'chain' | 'spot-only'; calls: ChainOpt[]; puts: ChainOpt[];
}

function tradeLabel(t: OptionTrade): string {
  const exp = fmtDateShort(t.expiry);
  return `${t.symbol} ${t.strike}${t.kind === 'call' ? 'C' : 'P'} ${exp} ×${t.contracts}`;
}

function TradingDesk({ trading, setTrading }: {
  trading: TradingData;
  setTrading: (fn: (prev: TradingData) => TradingData) => void;
}) {
  const [live, setLive] = useState<Record<string, ChainQuote>>({});
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [fetching, setFetching] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [gridId, setGridId] = useState<string | null>(null);
  const [fillId, setFillId] = useState<string | null>(null);
  const [fillPrice, setFillPrice] = useState('');
  const [closeId, setCloseId] = useState<string | null>(null);
  const [closePrice, setClosePrice] = useState('');
  const [tDraft, setTDraft] = useState({
    symbol: 'QQQ', kind: 'call' as 'call' | 'put', strike: '', expiry: '',
    contracts: '1', entryPrice: '', iv: '', exitBy: '', status: 'open' as 'open' | 'planned', thesis: '',
  });

  const active = trading.trades.filter(t => t.status !== 'closed');
  const closed = trading.trades.filter(t => t.status === 'closed')
    .sort((a, b) => (b.exitDate || '').localeCompare(a.exitDate || ''));

  const fetchLive = useCallback(async () => {
    const keys = Array.from(new Set(active.map(t => `${t.symbol}|${t.expiry}`)));
    if (keys.length === 0) return;
    setFetching(true);
    try {
      const results = await Promise.all(keys.map(async k => {
        const [symbol, expiry] = k.split('|');
        const res = await fetch(`/api/options-chain?symbol=${symbol}&expiry=${expiry}`);
        if (!res.ok) return null;
        return { k, q: await res.json() as ChainQuote };
      }));
      setLive(prev => {
        const next = { ...prev };
        for (const r of results) if (r?.q?.spot) next[r.k] = r.q;
        return next;
      });
      setFetchedAt(new Date());
    } catch { /* keep last snapshot */ }
    setFetching(false);
  }, [trading.trades]);

  useEffect(() => {
    fetchLive();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') fetchLive();
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchLive]);

  // per-trade live view: mark, iv, greeks. chain mid wins, model price is the fallback
  const view = (t: OptionTrade) => {
    const q = live[`${t.symbol}|${t.expiry}`];
    const spot = q?.spot ?? null;
    const chainList = q ? (t.kind === 'call' ? q.calls : q.puts) : [];
    const opt = chainList.find(o => Math.abs(o.strike - t.strike) < 0.001);
    const iv = opt?.iv ?? t.entryIV ?? 0.2;
    const T = yearsToExpiry(t.expiry);
    const g = spot != null ? bsGreeks(spot, t.strike, T, iv, t.kind === 'call') : null;
    const mark = opt?.mid ?? opt?.last ?? (g ? g.price : null);
    const markSource = opt?.mid != null ? 'mid' : opt?.last != null ? 'last' : g ? 'model' : null;
    return { q, spot, opt, iv, T, g, mark, markSource };
  };

  // fun-money accounting
  const realized = closed.reduce((s, t) => s + ((t.exitPrice ?? 0) - t.entryPrice) * 100 * t.contracts, 0);
  const openTrades = active.filter(t => t.status === 'open');
  const openCost = openTrades.reduce((s, t) => s + t.entryPrice * 100 * t.contracts, 0);
  const openValue = openTrades.reduce((s, t) => {
    const v = view(t);
    return s + (v.mark != null ? v.mark * 100 * t.contracts : t.entryPrice * 100 * t.contracts);
  }, 0);
  const cash = trading.budgetUSD + realized - openCost;
  const equity = cash + openValue;
  const openPnl = openValue - openCost;
  const deployedPct = Math.min(100, Math.max(0, (openCost / Math.max(1, trading.budgetUSD + realized)) * 100));

  // win-rate stats, the number everything else hinges on
  const results = closed.map(t => ((t.exitPrice ?? 0) - t.entryPrice) / t.entryPrice * 100);
  const wins = results.filter(r => r > 0);
  const losses = results.filter(r => r <= 0);
  const wr = results.length ? wins.length / results.length : 0;
  const avgWin = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0;
  const expectancy = results.length ? wr * avgWin - (1 - wr) * avgLoss : 0;

  const patch = (id: string, p: Partial<OptionTrade>) =>
    setTrading(prev => ({ ...prev, trades: prev.trades.map(t => t.id === id ? { ...t, ...p } : t) }));
  const removeTrade = (id: string) =>
    setTrading(prev => ({ ...prev, trades: prev.trades.filter(t => t.id !== id) }));

  const addTrade = () => {
    const strike = parseFloat(tDraft.strike);
    const contracts = parseInt(tDraft.contracts);
    const entry = parseFloat(tDraft.entryPrice);
    if (!tDraft.symbol.trim() || !strike || !contracts || !entry || !/^\d{4}-\d{2}-\d{2}$/.test(tDraft.expiry)) return;
    const t: OptionTrade = {
      id: uid(), symbol: tDraft.symbol.trim().toUpperCase(), kind: tDraft.kind,
      strike, expiry: tDraft.expiry, contracts, entryPrice: entry,
      entryDate: tDraft.status === 'open' ? localToday() : '',
      entryIV: tDraft.iv ? parseFloat(tDraft.iv) / 100 : undefined,
      exitBy: tDraft.exitBy || undefined,
      stopPct: -50, takePct: 100,
      status: tDraft.status, thesis: tDraft.thesis || undefined,
      createdAt: new Date().toISOString(),
    };
    setTrading(prev => ({ ...prev, trades: [t, ...prev.trades] }));
    setTDraft({ symbol: 'QQQ', kind: 'call', strike: '', expiry: '', contracts: '1', entryPrice: '', iv: '', exitBy: '', status: 'open', thesis: '' });
    setShowAdd(false);
  };

  const fmtUsd = (v: number, dec = 0) => `${v < 0 ? '-' : ''}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
  const fmtSigned = (v: number, dec = 0) => `${v >= 0 ? '+' : '-'}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;

  const spotChips = Array.from(new Map(Object.values(live).map(q => [q.symbol, q])).values());

  return (
    <Card style={{ padding: 22, marginBottom: 14, border: `1px solid oklch(0.62 0.13 28 / 0.35)` }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <CardLabel style={{ marginBottom: 0 }}>Trading Desk</CardLabel>
          <Chip tone="bad">fun money · walled from vault</Chip>
          {spotChips.map(q => {
            const chg = q.prevClose ? (q.spot - q.prevClose) / q.prevClose * 100 : null;
            return (
              <Chip key={q.symbol}>
                {q.symbol} ${q.spot.toFixed(2)}{chg != null ? ` · ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%` : ''}
              </Chip>
            );
          })}
          {fetchedAt && (
            <span style={{ fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT }}>
              as of {fetchedAt.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn ghost onClick={fetchLive} disabled={fetching}>{fetching ? 'refreshing…' : 'refresh'}</Btn>
          <Btn primary onClick={() => setShowAdd(s => !s)}>+ Trade</Btn>
        </div>
      </div>

      {/* equity strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
        marginTop: 18, paddingTop: 18, borderTop: `0.5px solid ${TOK.hair}`,
      }}>
        <FinanceStat label="Fun-money equity" value={fmtUsd(equity)} sub={`of $${trading.budgetUSD.toLocaleString()} budget`}
          tone={equity >= trading.budgetUSD ? TOK.good : undefined} />
        <FinanceStat label="Dry powder" value={fmtUsd(cash)} sub={`${Math.round(deployedPct)}% deployed`} />
        <FinanceStat label="Open P&L" value={openTrades.length ? fmtSigned(openPnl) : '·'}
          sub={openTrades.length ? `${openTrades.length} open` : 'no open positions'}
          tone={openPnl > 0 ? TOK.good : openPnl < 0 ? TOK.bad : undefined} />
        <FinanceStat label="Realized" value={closed.length ? fmtSigned(realized) : '·'}
          sub={`${closed.length} closed`} tone={realized > 0 ? TOK.good : realized < 0 ? TOK.bad : undefined} />
      </div>

      {/* budget wall */}
      <div style={{ marginTop: 14, height: 6, borderRadius: 999, background: 'rgba(20,16,12,0.06)', overflow: 'hidden' }}>
        <div style={{
          width: `${deployedPct}%`, height: '100%', borderRadius: 999,
          background: deployedPct > 85 ? TOK.bad : TOK.accent, transition: 'width 0.25s',
        }}></div>
      </div>

      {/* add form */}
      {showAdd && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `0.5px solid ${TOK.hair}` }}>
          <CardLabel>New trade</CardLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 8 }}>
            <Input value={tDraft.symbol} onChange={v => setTDraft({ ...tDraft, symbol: v })} placeholder="QQQ" />
            <select value={tDraft.kind} onChange={e => setTDraft({ ...tDraft, kind: e.target.value as 'call' | 'put' })}
              style={{ padding: '7px 10px', fontFamily: FONT_TEXT, fontSize: 13, background: 'rgba(255,253,249,0.7)', border: `1px solid ${TOK.hair}`, borderRadius: 10, color: TOK.ink0, outline: 'none', cursor: 'pointer' }}>
              <option value="call">Call</option><option value="put">Put</option>
            </select>
            <Input value={tDraft.strike} onChange={v => setTDraft({ ...tDraft, strike: v })} placeholder="Strike" type="number" />
            <Input value={tDraft.expiry} onChange={v => setTDraft({ ...tDraft, expiry: v })} placeholder="Expiry YYYY-MM-DD" />
            <Input value={tDraft.contracts} onChange={v => setTDraft({ ...tDraft, contracts: v })} placeholder="Contracts" type="number" />
            <Input value={tDraft.entryPrice} onChange={v => setTDraft({ ...tDraft, entryPrice: v })} placeholder="Fill (per share)" type="number" />
            <Input value={tDraft.iv} onChange={v => setTDraft({ ...tDraft, iv: v })} placeholder="IV % (opt.)" type="number" />
            <Input value={tDraft.exitBy} onChange={v => setTDraft({ ...tDraft, exitBy: v })} placeholder="Exit by YYYY-MM-DD" />
            <select value={tDraft.status} onChange={e => setTDraft({ ...tDraft, status: e.target.value as 'open' | 'planned' })}
              style={{ padding: '7px 10px', fontFamily: FONT_TEXT, fontSize: 13, background: 'rgba(255,253,249,0.7)', border: `1px solid ${TOK.hair}`, borderRadius: 10, color: TOK.ink0, outline: 'none', cursor: 'pointer' }}>
              <option value="open">Filled</option><option value="planned">Planned</option>
            </select>
            <Input value={tDraft.thesis} onChange={v => setTDraft({ ...tDraft, thesis: v })} placeholder="Thesis" />
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 10 }}>
            <Btn ghost onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn primary onClick={addTrade}>Add</Btn>
          </div>
        </div>
      )}

      {/* positions */}
      {active.length === 0 && (
        <div style={{ padding: '24px 0 8px', color: TOK.ink3, textAlign: 'center', fontFamily: FONT_TEXT, fontSize: 13 }}>
          Flat · no positions
        </div>
      )}
      {active.map(t => {
        const v = view(t);
        const costBasis = t.entryPrice * 100 * t.contracts;
        const markValue = v.mark != null ? v.mark * 100 * t.contracts : null;
        const pnl = markValue != null ? markValue - costBasis : null;
        const pnlPct = pnl != null ? (pnl / costBasis) * 100 : null;
        const dte = Math.max(0, Math.ceil((Date.parse(`${t.expiry}T16:00:00-04:00`) - Date.now()) / 86400000));
        const posTheta = v.g ? v.g.theta * 100 * t.contracts : null;
        const alerts: { text: string; tone: 'good' | 'warn' | 'bad' | 'neutral' }[] = [];
        if (t.exitBy) {
          const exitDays = Math.ceil((Date.parse(`${t.exitBy}T16:00:00-04:00`) - Date.now()) / 86400000);
          if (exitDays < 0) alerts.push({ text: 'PAST EXIT · close it', tone: 'bad' });
          else if (exitDays === 0) alerts.push({ text: 'EXIT TODAY', tone: 'bad' });
          else if (exitDays === 1) alerts.push({ text: 'exit tomorrow', tone: 'warn' });
          else alerts.push({ text: `exit in ${exitDays}d`, tone: 'neutral' });
        }
        if (t.status === 'open' && v.mark != null) {
          if (t.takePct != null && v.mark >= t.entryPrice * (1 + t.takePct / 100)) alerts.push({ text: `+${t.takePct}% hit · sell into it`, tone: 'good' });
          if (t.stopPct != null && v.mark <= t.entryPrice * (1 + t.stopPct / 100)) alerts.push({ text: `${t.stopPct}% stop · cut it`, tone: 'bad' });
        }
        if (t.status === 'open' && posTheta != null && markValue != null && markValue > 0 && Math.abs(posTheta) > 0.25 * markValue) {
          alerts.push({ text: 'decay dominating', tone: 'warn' });
        }
        const gridOpen = gridId === t.id;
        return (
          <div key={t.id} style={{ marginTop: 16, paddingTop: 14, borderTop: `0.5px solid ${TOK.hair}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Chip tone={t.status === 'open' ? 'good' : 'warn'}>{t.status}</Chip>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: TOK.ink0, fontFamily: FONT_DISPLAY, letterSpacing: '-0.01em' }}>
                  {tradeLabel(t)}
                </span>
                <span style={{ fontSize: 12.5, color: TOK.ink2, fontFamily: FONT_TEXT, fontVariantNumeric: 'tabular-nums' }}>
                  {t.status === 'open' ? `in ${t.entryPrice.toFixed(2)} · ${fmtUsd(costBasis)}` : `plan ${t.entryPrice.toFixed(2)} · ${fmtUsd(costBasis)}`}
                </span>
                {v.mark != null && (
                  <span style={{ fontSize: 12.5, color: TOK.ink1, fontFamily: FONT_TEXT, fontVariantNumeric: 'tabular-nums' }}>
                    mark {v.mark.toFixed(2)}{v.markSource !== 'mid' ? ` (${v.markSource})` : ''}
                  </span>
                )}
                {t.status === 'open' && pnl != null && (
                  <span style={{
                    fontSize: 13.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontFamily: FONT_TEXT,
                    color: pnl >= 0 ? TOK.good : TOK.bad,
                  }}>
                    {fmtSigned(pnl)} ({pnlPct! >= 0 ? '+' : ''}{pnlPct!.toFixed(0)}%)
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {t.status === 'planned' && (
                  fillId === t.id ? (
                    <>
                      <div style={{ width: 90 }}>
                        <Input value={fillPrice} onChange={setFillPrice} placeholder="fill" type="number" autoFocus />
                      </div>
                      <Btn primary onClick={() => {
                        const p = parseFloat(fillPrice);
                        if (p > 0) { patch(t.id, { status: 'open', entryPrice: p, entryDate: localToday() }); setFillId(null); setFillPrice(''); }
                      }}>Filled</Btn>
                      <Btn ghost onClick={() => { setFillId(null); setFillPrice(''); }}>×</Btn>
                    </>
                  ) : (
                    <Btn primary onClick={() => { setFillId(t.id); setFillPrice(String(v.mark?.toFixed(2) ?? t.entryPrice)); }}>Mark filled</Btn>
                  )
                )}
                {t.status === 'open' && (
                  closeId === t.id ? (
                    <>
                      <div style={{ width: 90 }}>
                        <Input value={closePrice} onChange={setClosePrice} placeholder="exit" type="number" autoFocus />
                      </div>
                      <Btn primary onClick={() => {
                        const p = parseFloat(closePrice);
                        if (p >= 0) { patch(t.id, { status: 'closed', exitPrice: p, exitDate: localToday() }); setCloseId(null); setClosePrice(''); }
                      }}>Close</Btn>
                      <Btn ghost onClick={() => { setCloseId(null); setClosePrice(''); }}>×</Btn>
                    </>
                  ) : (
                    <Btn ghost onClick={() => { setCloseId(t.id); setClosePrice(String(v.mark?.toFixed(2) ?? '')); }}>Close</Btn>
                  )
                )}
                <Btn ghost onClick={() => setGridId(gridOpen ? null : t.id)}>{gridOpen ? 'hide grid' : 'P&L grid'}</Btn>
                <button onClick={() => removeTrade(t.id)} style={{
                  appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                  color: TOK.ink3, fontSize: 14, padding: '2px 6px', fontFamily: FONT_TEXT,
                }}>×</button>
              </div>
            </div>

            {/* greeks + alerts */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 8, fontFamily: FONT_TEXT, fontSize: 12, color: TOK.ink2, fontVariantNumeric: 'tabular-nums' }}>
              {v.g && (
                <>
                  <span>Δ {(v.g.delta * t.contracts * 100).toFixed(0)}sh ({v.g.delta.toFixed(3)})</span>
                  <span>Γ {v.g.gamma.toFixed(4)}</span>
                  <span style={{ color: posTheta != null && posTheta < 0 ? TOK.bad : undefined }}>
                    θ {posTheta != null ? `${fmtSigned(posTheta)}/day` : '·'}
                  </span>
                  <span>ν {fmtUsd(v.g.vega * 100 * t.contracts)}/IVpt</span>
                  <span>IV {(v.iv * 100).toFixed(1)}%</span>
                </>
              )}
              <span>{dte === 0 ? 'expires today' : `${dte}d to expiry`}</span>
              {t.targetPrice && v.spot != null && (
                <span>target {t.targetPrice.toFixed(2)} ({((t.targetPrice / v.spot - 1) * 100).toFixed(1)}% away)</span>
              )}
              {alerts.map((a, i) => <Chip key={i} tone={a.tone}>{a.text}</Chip>)}
            </div>
            {t.thesis && (
              <div style={{ marginTop: 6, fontSize: 12, color: TOK.ink3, fontFamily: FONT_TEXT, lineHeight: 1.5 }}>{t.thesis}</div>
            )}

            {/* P&L grid: value at close of each remaining session, across underlying levels */}
            {gridOpen && v.spot != null && (
              <PnlGrid trade={t} spot={v.spot} iv={v.iv} />
            )}
          </div>
        );
      })}

      {/* the record */}
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: `0.5px solid ${TOK.hair}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <CardLabel style={{ marginBottom: 0 }}>The record</CardLabel>
          <span style={{ fontSize: 11.5, color: TOK.ink3, fontFamily: FONT_TEXT }}>
            {closed.length}/30 measured · size stays flat till 30
          </span>
        </div>
        <div style={{ marginTop: 10, height: 5, borderRadius: 999, background: 'rgba(20,16,12,0.06)', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, closed.length / 30 * 100)}%`, background: TOK.ink0, height: '100%', borderRadius: 999 }}></div>
        </div>
        {closed.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 14 }}>
            <FinanceStat label="Win rate" value={`${Math.round(wr * 100)}%`} sub={`${wins.length}W · ${losses.length}L`} />
            <FinanceStat label="Avg win" value={`+${avgWin.toFixed(0)}%`} sub="of premium" tone={TOK.good} />
            <FinanceStat label="Avg loss" value={`-${avgLoss.toFixed(0)}%`} sub="of premium" tone={TOK.bad} />
            <FinanceStat label="Expectancy" value={`${expectancy >= 0 ? '+' : ''}${expectancy.toFixed(1)}%`} sub="per trade"
              tone={expectancy > 0 ? TOK.good : TOK.bad} />
          </div>
        )}
        {closed.slice(0, 5).map(t => {
          const pnl = ((t.exitPrice ?? 0) - t.entryPrice) * 100 * t.contracts;
          const pct = ((t.exitPrice ?? 0) - t.entryPrice) / t.entryPrice * 100;
          return (
            <div key={t.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderTop: `0.5px solid ${TOK.hair}`, marginTop: 8,
              fontFamily: FONT_TEXT, fontSize: 12.5,
            }}>
              <span style={{ color: TOK.ink1 }}>{tradeLabel(t)}</span>
              <span style={{ color: TOK.ink3, fontVariantNumeric: 'tabular-nums' }}>
                {t.entryPrice.toFixed(2)} → {(t.exitPrice ?? 0).toFixed(2)} · {t.exitDate ? fmtDateShort(t.exitDate) : ''}
              </span>
              <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: pnl >= 0 ? TOK.good : TOK.bad }}>
                {fmtSigned(pnl)} ({pct >= 0 ? '+' : ''}{pct.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PnlGrid({ trade, spot, iv }: { trade: OptionTrade; spot: number; iv: number }) {
  const days = tradingDaysThrough(trade.expiry);
  if (days.length === 0) return null;
  const step = Math.max(1, Math.round(spot * 0.0075));
  const raw = [spot - 2 * step, spot - step, spot, spot + step, spot + 2 * step, spot + 3 * step, trade.strike];
  if (trade.targetPrice) raw.push(trade.targetPrice);
  const levels = Array.from(new Set(raw.map(x => Math.round(x)))).sort((a, b) => b - a);
  const costBasis = trade.entryPrice * 100 * trade.contracts;
  const cell = (S: number, day: string) => {
    const T = Math.max(0, (Date.parse(`${trade.expiry}T16:00:00-04:00`) - Date.parse(`${day}T16:00:00-04:00`)) / (365 * 24 * 3600 * 1000));
    const val = bsGreeks(S, trade.strike, T, iv, trade.kind === 'call').price * 100 * trade.contracts;
    return val - costBasis;
  };
  const matrix = levels.map(S => days.map(d => cell(S, d)));
  const maxAbs = Math.max(1, ...matrix.flat().map(Math.abs));
  return (
    <div style={{ marginTop: 12, overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontFamily: FONT_TEXT, fontSize: 11.5, fontVariantNumeric: 'tabular-nums', minWidth: 420 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 10px 4px 0', color: TOK.ink3, fontWeight: 500 }}>{trade.symbol} @ close</th>
            {days.map(d => (
              <th key={d} style={{ padding: '4px 8px', color: TOK.ink3, fontWeight: 500, textAlign: 'right' }}>
                {fmtDateShort(d)}{d === trade.exitBy ? ' ⏎' : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {levels.map((S, i) => (
            <tr key={S}>
              <td style={{
                padding: '3px 10px 3px 0', color: TOK.ink1, fontWeight: S === Math.round(trade.strike) ? 600 : 400,
                whiteSpace: 'nowrap',
              }}>
                {S}{S === Math.round(trade.strike) ? ' · K' : ''}{trade.targetPrice && S === Math.round(trade.targetPrice) ? ' · tgt' : ''}
              </td>
              {matrix[i].map((v2, j) => {
                const a = Math.min(0.5, Math.abs(v2) / maxAbs * 0.5);
                return (
                  <td key={j} style={{
                    padding: '3px 8px', textAlign: 'right', color: TOK.ink0,
                    background: v2 >= 0 ? `oklch(0.55 0.10 150 / ${a})` : `oklch(0.55 0.14 28 / ${a})`,
                  }}>
                    {v2 >= 0 ? '+' : '-'}{Math.abs(Math.round(v2)).toLocaleString()}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT }}>
        position P&L in $ at each session close · IV held at {(iv * 100).toFixed(1)}% · ⏎ = hard exit day
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   IDEAS
   ═══════════════════════════════════════════════════════════ */

function Ideas({ ideas, setIdeas }: {
  ideas: ProjectIdea[]; setIdeas: (fn: (prev: ProjectIdea[]) => ProjectIdea[]) => void;
}) {
  const [quick, setQuick] = useState('');

  const addQuick = () => {
    let title = quick.trim();
    if (!title) return;
    const tags: string[] = [];
    title = title.replace(/#(\w+)/g, (_, t) => { tags.push(t); return ''; }).trim();
    if (!title) return;
    const now = new Date().toISOString();
    setIdeas(prev => [{ id: uid(), title, description: '', tags, createdAt: now, updatedAt: now }, ...prev]);
    setQuick('');
  };

  const updateIdea = (id: string, patch: Partial<ProjectIdea>) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i));
  };
  const removeIdea = (id: string) => setIdeas(prev => prev.filter(i => i.id !== id));

  const sorted = [...ideas].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  return (
    <div style={{ animation: 'bb-fade 0.32s cubic-bezier(.2,.8,.2,1) both' }}>
      <PageHeader
        title="Ideas"
        sub={`${ideas.length} ${ideas.length === 1 ? 'idea' : 'ideas'} parked`}
      />

      <Card style={{ marginBottom: 14, padding: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 18, color: TOK.ink3 }}>+</span>
          <input value={quick} onChange={e => setQuick(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuick()}
            placeholder="Park an idea, e.g. 'Voice journal on the walk home #ai'"
            style={{
              flex: 1, background: 'transparent', border: 0, padding: 0, fontSize: 14,
              fontFamily: FONT_TEXT, color: TOK.ink0, outline: 'none',
            }} />
          <span style={{ fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT }}>↵ to add</span>
        </div>
      </Card>

      {sorted.length === 0 ? (
        <Card>
          <div style={{ padding: '32px 0', textAlign: 'center', color: TOK.ink3, fontFamily: FONT_TEXT }}>
            Nothing parked yet · add one ↑
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
          {sorted.map(idea => (
            <Card key={idea.id} style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: TOK.ink0, fontFamily: FONT_DISPLAY, letterSpacing: '-0.01em' }}>
                  {idea.title}
                </span>
                <button onClick={() => removeIdea(idea.id)} style={{
                  appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                  color: TOK.ink3, fontSize: 14, padding: '2px 6px', fontFamily: FONT_TEXT, flexShrink: 0,
                }}>×</button>
              </div>
              {idea.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {idea.tags.map(t => <Chip key={t}>#{t}</Chip>)}
                </div>
              )}
              <textarea
                value={idea.description}
                onChange={e => updateIdea(idea.id, { description: e.target.value })}
                rows={2}
                placeholder="Notes, angle, next step…"
                style={{
                  width: '100%', background: 'transparent', border: 0, padding: 0, marginTop: 10,
                  fontSize: 13, lineHeight: 1.55, fontFamily: FONT_TEXT, color: TOK.ink1,
                  outline: 'none', resize: 'vertical', minHeight: 40, boxSizing: 'border-box',
                }}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BLACKBOOK DASHBOARD (chrome + tab routing)
   ═══════════════════════════════════════════════════════════ */

type BlackbookTab = 'today' | 'finance' | 'goals' | 'tasks' | 'journal' | 'network' | 'ideas';
const TABS: BlackbookTab[] = ['today', 'finance', 'goals', 'tasks', 'journal', 'network', 'ideas'];

export function BlackbookDashboard({ onClose, onLogout, passHash, transparent }: {
  onClose: () => void; onLogout?: () => void; passHash: string; transparent?: boolean;
}) {
  const [tab, setTab] = useState<BlackbookTab>('today');
  const [journal, setJournal] = useState<JournalEntry[]>(() => load('journal', []));
  const [contacts, setContacts] = useState<NetworkContact[]>(() => load('contacts', DEFAULT_CONTACTS));
  const [ideas, setIdeas] = useState<ProjectIdea[]>(() => load('ideas', []));
  const [tasks, setTasks] = useState<Task[]>(() => load('tasks', []));
  const [goals, setGoals] = useState<Goal[]>(() => load('goals', []));
  const [finance, setFinance] = useState<FinanceData>(() => load('finance', DEFAULT_FINANCE));
  const [habits, setHabits] = useState<HabitsMap>(() => load('habits', {}));
  const [plan, setPlan] = useState<FinancePlan>(() => ({ ...DEFAULT_PLAN, ...load<Partial<FinancePlan>>('plan', {}) }));
  const [trading, setTrading] = useState<TradingData>(() => ({ ...DEFAULT_TRADING, ...load<Partial<TradingData>>('trading', {}) }));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error' | 'retrying'>('saved');
  const [synced, setSynced] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveQueueRef = useRef(new SaveQueue());

  const gcal = useGoogleCalendar();

  const sectionTs = useRef({ journal: '', contacts: '', ideas: '', tasks: '', goals: '', finance: '', habits: '', plan: '', trading: '' });

  const journalRef = useRef(journal);
  const contactsRef = useRef(contacts);
  const ideasRef = useRef(ideas);
  const tasksRef = useRef(tasks);
  const goalsRef = useRef(goals);
  const financeRef = useRef(finance);
  const habitsRef = useRef(habits);
  const planRef = useRef(plan);
  const tradingRef = useRef(trading);
  useEffect(() => { journalRef.current = journal; }, [journal]);
  useEffect(() => { contactsRef.current = contacts; }, [contacts]);
  useEffect(() => { ideasRef.current = ideas; }, [ideas]);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { goalsRef.current = goals; }, [goals]);
  useEffect(() => { financeRef.current = finance; }, [finance]);
  useEffect(() => { habitsRef.current = habits; }, [habits]);
  useEffect(() => { planRef.current = plan; }, [plan]);
  useEffect(() => { tradingRef.current = trading; }, [trading]);

  useEffect(() => {
    saveQueueRef.current.onStatusChange = setSaveStatus;
    return () => { saveQueueRef.current.cancel(); };
  }, []);

  useEffect(() => { migrateIfNeeded(); migrateContactsV3(); migrateFinance(); }, []);

  // Load from cloud + merge
  useEffect(() => {
    loadFromCloud(passHash).then(cloud => {
      const localData: BlackbookData = {
        journal: load('journal', []),
        contacts: load('contacts', DEFAULT_CONTACTS),
        ideas: load('ideas', []),
        tasks: load('tasks', []),
        goals: load('goals', []),
        finance: load('finance', DEFAULT_FINANCE),
        habits: load('habits', {}),
        plan: load('plan', DEFAULT_PLAN),
        trading: load('trading', DEFAULT_TRADING),
        journalUpdatedAt: load('journalUpdatedAt', ''),
        contactsUpdatedAt: load('contactsUpdatedAt', ''),
        ideasUpdatedAt: load('ideasUpdatedAt', ''),
        tasksUpdatedAt: load('tasksUpdatedAt', ''),
        goalsUpdatedAt: load('goalsUpdatedAt', ''),
        financeUpdatedAt: load('financeUpdatedAt', ''),
        habitsUpdatedAt: load('habitsUpdatedAt', ''),
        planUpdatedAt: load('planUpdatedAt', ''),
        tradingUpdatedAt: load('tradingUpdatedAt', ''),
      };

      const merged = mergeCloudLocal(cloud, localData);
      let loadedJournal = merged.journal ?? [];
      let loadedContacts = merged.contacts ?? [];
      const loadedIdeas = merged.ideas ?? [];
      const loadedTasks = merged.tasks ?? [];
      const loadedGoals = merged.goals ?? [];
      const loadedFinance = (merged.finance && typeof merged.finance === 'object' && Array.isArray((merged.finance as any).accounts))
        ? merged.finance : DEFAULT_FINANCE;
      const loadedHabits = (merged.habits && typeof merged.habits === 'object') ? merged.habits : {};
      const loadedPlan: FinancePlan = (merged.plan && typeof merged.plan === 'object' && Array.isArray((merged.plan as any).checksConfirmed))
        ? { ...DEFAULT_PLAN, ...merged.plan } : DEFAULT_PLAN;
      const loadedTrading: TradingData = (merged.trading && typeof merged.trading === 'object' && Array.isArray((merged.trading as any).trades))
        ? { ...DEFAULT_TRADING, ...merged.trading } : DEFAULT_TRADING;

      const now = new Date().toISOString();
      sectionTs.current = {
        journal: merged.journalUpdatedAt || now,
        contacts: merged.contactsUpdatedAt || now,
        ideas: merged.ideasUpdatedAt || now,
        tasks: merged.tasksUpdatedAt || now,
        goals: merged.goalsUpdatedAt || now,
        finance: merged.financeUpdatedAt || now,
        habits: merged.habitsUpdatedAt || now,
        plan: merged.planUpdatedAt || now,
        trading: merged.tradingUpdatedAt || now,
      };

      // Dedup
      for (const entry of loadedJournal) {
        if (entry.meetings?.length > 1) {
          const seen = new Set<string>();
          entry.meetings = entry.meetings.filter(m => {
            const k = `${m.person}|${m.time}|${m.title}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        }
      }
      const seen = new Set<string>();
      loadedContacts = loadedContacts.filter(c => {
        if (!c.name?.trim()) return false;
        const k = `${c.name}|${c.company}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      setJournal(loadedJournal);
      setContacts(loadedContacts);
      setIdeas(loadedIdeas);
      setTasks(loadedTasks);
      setGoals(loadedGoals);
      setFinance(loadedFinance);
      setHabits(loadedHabits);
      setPlan(loadedPlan);
      setTrading(loadedTrading);

      save('journal', loadedJournal);
      save('contacts', loadedContacts);
      save('ideas', loadedIdeas);
      save('tasks', loadedTasks);
      save('goals', loadedGoals);
      save('finance', loadedFinance);
      save('habits', loadedHabits);
      save('plan', loadedPlan);
      save('trading', loadedTrading);

      const payload: BlackbookData = {
        journal: loadedJournal, contacts: loadedContacts, ideas: loadedIdeas,
        tasks: loadedTasks, goals: loadedGoals, finance: loadedFinance,
        habits: loadedHabits, plan: loadedPlan, trading: loadedTrading,
        journalUpdatedAt: sectionTs.current.journal,
        contactsUpdatedAt: sectionTs.current.contacts,
        ideasUpdatedAt: sectionTs.current.ideas,
        tasksUpdatedAt: sectionTs.current.tasks,
        goalsUpdatedAt: sectionTs.current.goals,
        financeUpdatedAt: sectionTs.current.finance,
        habitsUpdatedAt: sectionTs.current.habits,
        planUpdatedAt: sectionTs.current.plan,
        tradingUpdatedAt: sectionTs.current.trading,
      };
      saveToCloud(passHash, payload);
      setSynced(true);
      setSaveStatus('saved');
    });
  }, [passHash]);

  const buildPayload = useCallback((): BlackbookData => ({
    journal: journalRef.current, contacts: contactsRef.current, ideas: ideasRef.current,
    tasks: tasksRef.current, goals: goalsRef.current, finance: financeRef.current,
    habits: habitsRef.current, plan: planRef.current, trading: tradingRef.current,
    journalUpdatedAt: sectionTs.current.journal,
    contactsUpdatedAt: sectionTs.current.contacts,
    ideasUpdatedAt: sectionTs.current.ideas,
    tasksUpdatedAt: sectionTs.current.tasks,
    goalsUpdatedAt: sectionTs.current.goals,
    financeUpdatedAt: sectionTs.current.finance,
    habitsUpdatedAt: sectionTs.current.habits,
    planUpdatedAt: sectionTs.current.plan,
    tradingUpdatedAt: sectionTs.current.trading,
  }), []);

  const syncToCloud = useCallback(() => {
    save('journal', journalRef.current);
    save('contacts', contactsRef.current);
    save('ideas', ideasRef.current);
    save('tasks', tasksRef.current);
    save('goals', goalsRef.current);
    save('finance', financeRef.current);
    save('habits', habitsRef.current);
    save('plan', planRef.current);
    save('trading', tradingRef.current);
    save('journalUpdatedAt', sectionTs.current.journal);
    save('contactsUpdatedAt', sectionTs.current.contacts);
    save('ideasUpdatedAt', sectionTs.current.ideas);
    save('tasksUpdatedAt', sectionTs.current.tasks);
    save('goalsUpdatedAt', sectionTs.current.goals);
    save('financeUpdatedAt', sectionTs.current.finance);
    save('habitsUpdatedAt', sectionTs.current.habits);
    save('planUpdatedAt', sectionTs.current.plan);
    save('tradingUpdatedAt', sectionTs.current.trading);
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveQueueRef.current.enqueue(() => saveToCloud(passHash, buildPayload()));
    }, 800);
  }, [passHash, buildPayload]);

  const flushToCloud = useCallback(() => {
    save('journal', journalRef.current); save('contacts', contactsRef.current);
    save('ideas', ideasRef.current); save('tasks', tasksRef.current);
    save('goals', goalsRef.current); save('finance', financeRef.current);
    save('habits', habitsRef.current); save('plan', planRef.current);
    save('trading', tradingRef.current);
    save('journalUpdatedAt', sectionTs.current.journal);
    save('contactsUpdatedAt', sectionTs.current.contacts);
    save('ideasUpdatedAt', sectionTs.current.ideas);
    save('tasksUpdatedAt', sectionTs.current.tasks);
    save('goalsUpdatedAt', sectionTs.current.goals);
    save('financeUpdatedAt', sectionTs.current.finance);
    save('habitsUpdatedAt', sectionTs.current.habits);
    save('planUpdatedAt', sectionTs.current.plan);
    save('tradingUpdatedAt', sectionTs.current.trading);
    const payload = buildPayload();
    fetch(`${SUPABASE_URL}/rest/v1/blackbook?pass_hash=eq.${passHash}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ data: payload, updated_at: new Date().toISOString() }),
      keepalive: true,
    }).catch(() => {});
  }, [passHash, buildPayload]);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    flushToCloud();
    if (saveQueueRef.current.hasPending() || saveStatus === 'saving' || saveStatus === 'retrying') {
      e.preventDefault();
    }
  }, [flushToCloud, saveStatus]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flushToCloud();
    };
    const handlePageHide = () => flushToCloud();
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [handleBeforeUnload, flushToCloud]);

  useEffect(() => { if (synced) { sectionTs.current.journal = new Date().toISOString(); syncToCloud(); } }, [journal]);
  useEffect(() => { if (synced) { sectionTs.current.contacts = new Date().toISOString(); syncToCloud(); } }, [contacts]);
  useEffect(() => { if (synced) { sectionTs.current.ideas = new Date().toISOString(); syncToCloud(); } }, [ideas]);
  useEffect(() => { if (synced) { sectionTs.current.tasks = new Date().toISOString(); syncToCloud(); } }, [tasks]);
  useEffect(() => { if (synced) { sectionTs.current.goals = new Date().toISOString(); syncToCloud(); } }, [goals]);
  useEffect(() => { if (synced) { sectionTs.current.finance = new Date().toISOString(); syncToCloud(); } }, [finance]);
  useEffect(() => { if (synced) { sectionTs.current.habits = new Date().toISOString(); syncToCloud(); } }, [habits]);
  useEffect(() => { if (synced) { sectionTs.current.plan = new Date().toISOString(); syncToCloud(); } }, [plan]);
  useEffect(() => { if (synced) { sectionTs.current.trading = new Date().toISOString(); syncToCloud(); } }, [trading]);

  const today = new Date();
  const dateLine = today.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' }) + ' · ' + today.getFullYear();

  return (
    <div style={{
      position: transparent ? 'relative' : 'fixed',
      inset: transparent ? undefined : 0,
      width: transparent ? '100%' : undefined,
      height: transparent ? '100%' : undefined,
      zIndex: transparent ? undefined : 10001,
      color: TOK.ink0, fontFamily: FONT_TEXT,
      fontSize: 14, overflow: 'hidden',
      background: TOK.paper,
    }}>
      <Wallpaper />

      {/* Top chrome */}
      <header style={{
        position: 'relative', zIndex: 5,
        height: 52, display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', padding: '0 22px',
        background: 'rgba(245,240,232,0.55)',
        backdropFilter: 'saturate(180%) blur(26px)',
        WebkitBackdropFilter: 'saturate(180%) blur(26px)',
        borderBottom: `1px solid ${TOK.hair}`,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, letterSpacing: '-0.01em' }}>
          <span aria-hidden style={{
            width: 18, height: 18, borderRadius: 5,
            background: 'linear-gradient(160deg, #2a2320, #100c0a)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.15)',
            position: 'relative', flexShrink: 0,
          }}>
            <span aria-hidden style={{
              position: 'absolute', left: 4, top: 4,
              width: 6, height: 6, borderRadius: 2, background: TOK.accent,
            }} />
          </span>
          <span style={{ fontFamily: FONT_TEXT, fontSize: 14, color: TOK.ink0 }}>Blackbook</span>
          <span style={{
            color: TOK.ink3, fontWeight: 500, fontSize: 12.5,
            marginLeft: 8, fontFamily: FONT_TEXT,
          }}>{dateLine}</span>
        </div>

        {/* Tab pill */}
        <nav style={{
          display: 'flex', gap: 2, padding: 3,
          background: 'rgba(20,16,12,0.05)',
          border: `1px solid ${TOK.hair}`,
          borderRadius: TOK.rPill,
        }}>
          {TABS.map(tb => {
            const active = tab === tb;
            return (
              <button key={tb} onClick={() => setTab(tb)} style={{
                appearance: 'none', border: 0,
                background: active ? 'rgba(255,253,249,0.95)' : 'transparent',
                color: active ? TOK.ink0 : TOK.ink2,
                fontFamily: FONT_TEXT, fontSize: 12.5, padding: '6px 14px',
                borderRadius: TOK.rPill, cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)' : undefined,
              }}>
                {tb.charAt(0).toUpperCase() + tb.slice(1)}
              </button>
            );
          })}
        </nav>

        {/* Right chrome */}
        <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 12, color: TOK.ink3, fontSize: 12 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 11px', borderRadius: TOK.rPill,
            background: 'rgba(20,16,12,0.05)', color: TOK.ink2, fontWeight: 500, fontFamily: FONT_TEXT,
          }}>
            <span aria-hidden style={{
              width: 6, height: 6, borderRadius: '50%',
              background: saveStatus === 'error' ? TOK.bad : saveStatus === 'retrying' ? TOK.warn : TOK.good,
            }}></span>
            {saveStatus === 'saved' ? 'All synced' :
             saveStatus === 'saving' ? 'Saving…' :
             saveStatus === 'retrying' ? 'Retrying…' :
             saveStatus === 'error' ? 'Save failed' : 'Synced'}
          </span>
          {onLogout && <button onClick={onLogout} style={{
            appearance: 'none', cursor: 'pointer', fontFamily: FONT_TEXT,
            fontSize: 12, padding: '5px 12px', borderRadius: TOK.rPill,
            background: 'transparent', border: `1px solid ${TOK.hair}`, color: TOK.ink2,
          }}>Lock</button>}
          <button onClick={onClose} style={{
            appearance: 'none', cursor: 'pointer', fontFamily: FONT_TEXT,
            fontSize: 12, padding: '5px 12px', borderRadius: TOK.rPill,
            background: 'transparent', border: `1px solid ${TOK.hair}`, color: TOK.ink2,
          }}>Done</button>
        </div>
      </header>

      {/* Stage */}
      <main style={{
        position: 'relative', zIndex: 1,
        height: 'calc(100% - 52px)',
        overflowY: 'auto', overflowX: 'hidden',
      }}>
        <div style={{ padding: '32px 40px 80px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            {tab === 'today' && (
              <Today
                habits={habits} setHabits={setHabits}
                tasks={tasks} setTasks={setTasks}
                onNavigate={setTab}
              />
            )}
            {tab === 'journal' && (
              <Journal
                journal={journal} setJournal={setJournal} contacts={contacts}
                googleEvents={gcal.events} googleConnected={!!gcal.token}
                googleConfigured={gcal.isConfigured} onConnectGoogle={gcal.connect}
              />
            )}
            {tab === 'network' && <Network contacts={contacts} setContacts={setContacts} journal={journal} />}
            {tab === 'tasks' && <Tasks tasks={tasks} setTasks={setTasks} />}
            {tab === 'goals' && <Goals goals={goals} setGoals={setGoals} />}
            {tab === 'finance' && <Finance finance={finance} setFinance={setFinance} plan={plan} setPlan={setPlan} trading={trading} setTrading={setTrading} />}
            {tab === 'ideas' && <Ideas ideas={ideas} setIdeas={setIdeas} />}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes bb-fade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════ */

export default function Blackbook() {
  const [state, setState] = useState<'hidden' | 'password' | 'open'>('hidden');
  const [passHash, setPassHash] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (state === 'open' || state === 'password')) setState('hidden');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state]);

  useEffect(() => {
    if (state !== 'hidden') {
      document.body.classList.add('blackbook-active');
    } else {
      document.body.classList.remove('blackbook-active');
    }
    return () => document.body.classList.remove('blackbook-active');
  }, [state]);

  const handleUnlock = async (pw: string) => {
    const hash = await hashPass(pw);
    setPassHash(hash);
    setState('open');
  };

  return (
    <>
      <FingerprintIcon onClick={() => setState('password')} />
      {state === 'password' && (
        <PasswordGate onUnlock={handleUnlock} onClose={() => setState('hidden')} />
      )}
      {state === 'open' && <BlackbookDashboard onClose={() => setState('hidden')} onLogout={() => setState('password')} passHash={passHash} />}
    </>
  );
}
