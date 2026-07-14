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

const FX_USD_TO_CAD = 1.37;

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
interface BlackbookData {
  journal: JournalEntry[]; contacts: NetworkContact[]; ideas: ProjectIdea[];
  tasks: Task[]; goals: Goal[]; finance: FinanceData;
  journalUpdatedAt?: string; contactsUpdatedAt?: string; ideasUpdatedAt?: string;
  tasksUpdatedAt?: string; goalsUpdatedAt?: string; financeUpdatedAt?: string;
}
const DEFAULT_FINANCE: FinanceData = { accounts: [], transactions: [], budgets: [], goals: [] };
const DEFAULT_CONTACTS: NetworkContact[] = [];

/* ───────── Helpers ───────── */
function toCAD(amount: number, currency: Currency): number {
  return currency === 'USD' ? amount * FX_USD_TO_CAD : amount;
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
    journalUpdatedAt: [cloud.journalUpdatedAt, local.journalUpdatedAt].filter(Boolean).sort().pop(),
    contactsUpdatedAt: [cloud.contactsUpdatedAt, local.contactsUpdatedAt].filter(Boolean).sort().pop(),
    ideasUpdatedAt: [cloud.ideasUpdatedAt, local.ideasUpdatedAt].filter(Boolean).sort().pop(),
    tasksUpdatedAt: [cloud.tasksUpdatedAt, local.tasksUpdatedAt].filter(Boolean).sort().pop(),
    goalsUpdatedAt: [cloud.goalsUpdatedAt, local.goalsUpdatedAt].filter(Boolean).sort().pop(),
    financeUpdatedAt: [cloud.financeUpdatedAt, local.financeUpdatedAt].filter(Boolean).sort().pop(),
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
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */

interface DashboardProps {
  journal: JournalEntry[];
  setJournal: (fn: (prev: JournalEntry[]) => JournalEntry[]) => void;
  contacts: NetworkContact[];
  tasks: Task[];
  setTasks: (fn: (prev: Task[]) => Task[]) => void;
  goals: Goal[];
  finance: FinanceData;
  googleEvents: GCalEvent[];
  googleConfigured: boolean;
  googleConnected: boolean;
  googleLoading: boolean;
  onConnectGoogle: () => void;
  onNavigate: (tab: BlackbookTab) => void;
}

function Dashboard({
  journal, setJournal, contacts, tasks, setTasks, goals, finance,
  googleEvents, googleConfigured, googleConnected, googleLoading, onConnectGoogle,
  onNavigate,
}: DashboardProps) {
  const today = localToday();
  const todayEntry = journal.find(e => e.date === today);
  const monthStart = today.slice(0, 7);

  // Today's tasks (open + done)
  const todaysTasks = tasks.filter(t => t.dueDate === today || (!t.dueDate && t.status !== 'done'));
  const open = todaysTasks.filter(t => t.status !== 'done').length;
  const done = todaysTasks.filter(t => t.status === 'done').length;

  // Network counts
  const needs = contacts.filter(c => c.category === 'reply-needed').length;
  const callsBooked = contacts.filter(c => c.category === 'call-booked').length;
  const awaiting = contacts.filter(c => c.category === 'awaiting-reply').length;
  const active = contacts.filter(c => ['call-booked', 'reply-needed', 'warm'].includes(c.category)).length;
  const cold = contacts.filter(c => c.category === 'archived').length;

  // 7-day strip
  const days = useMemo(() => {
    const out: { d: string; n: number; iso: string; today: boolean; weekday: string }[] = [];
    const base = new Date(today + 'T12:00');
    for (let i = 0; i < 7; i++) {
      const dt = new Date(base);
      dt.setDate(base.getDate() + i);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      out.push({
        d: dt.toLocaleDateString('en', { weekday: 'short' }).slice(0, 3),
        n: dt.getDate(),
        iso,
        today: iso === today,
        weekday: dt.toLocaleDateString('en', { weekday: 'long' }),
      });
    }
    return out;
  }, [today]);

  // Active goals — top 2 by progress
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 2);

  // Finance month
  const monthTx = finance.transactions.filter(t => monthKey(t.date) === monthStart);
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + toCAD(t.amount, t.currency), 0);
  const spending = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + toCAD(t.amount, t.currency), 0);
  const saved = income > 0 ? Math.max(0, Math.round(((income - spending) / income) * 100)) : 0;

  // Toggle task
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? {
      ...t, status: t.status === 'done' ? 'todo' : 'done',
      updatedAt: new Date().toISOString(),
    } : t));
  };

  // Today journal body
  const updateJournal = (patch: Partial<JournalEntry>) => {
    setJournal(prev => {
      const exists = prev.find(e => e.date === today);
      if (exists) {
        return prev.map(e => e.date === today ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e);
      }
      return [...prev, {
        id: today, date: today, body: '', tomorrow: '', meetings: [],
        updatedAt: new Date().toISOString(), ...patch,
      }];
    });
  };

  // Quick add task
  const [quickTask, setQuickTask] = useState('');
  const addQuickTask = () => {
    if (!quickTask.trim()) return;
    const now = new Date().toISOString();
    setTasks(prev => [...prev, {
      id: uid(), title: quickTask.trim(), status: 'todo', priority: 'medium',
      dueDate: today, list: 'personal',
      createdAt: now, updatedAt: now,
    }]);
    setQuickTask('');
  };

  const dateObj = new Date(today + 'T12:00');
  const monthName = dateObj.toLocaleDateString('en', { month: 'short' });
  const dayNum = dateObj.getDate();
  const weekday = dateObj.toLocaleDateString('en', { weekday: 'long' });
  const fullDate = dateObj.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

  // Get user first name
  const greetName = 'Ronniel';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div style={{ animation: 'bb-fade 0.32s cubic-bezier(.2,.8,.2,1) both' }}>
      <PageHeader
        title={`${greeting}, ${greetName}`}
        sub={`${fullDate} · ${open} ${open === 1 ? 'thing' : 'things'} on the list today`}
      />

      {/* Top hero row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card hero style={{ padding: 22, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 26, alignItems: 'center' }}>
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <CardLabel style={{ marginBottom: 0 }}>{monthName}</CardLabel>
            <div style={{ fontSize: 68, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.04em', fontFamily: FONT_DISPLAY, color: TOK.ink0 }}>{dayNum}</div>
            <div style={{ fontSize: 12, color: TOK.ink2, marginTop: 4, fontFamily: FONT_TEXT }}>{weekday}</div>
          </div>
          <div style={{ borderLeft: `0.5px solid ${TOK.hairStrong}`, paddingLeft: 24 }}>
            <CardLabel style={{ marginBottom: 4 }}>Today</CardLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: FONT_DISPLAY }}>
              <span style={{ fontSize: 40, fontWeight: 300, letterSpacing: '-0.03em', color: TOK.ink0 }}>
                {googleConnected ? googleEvents.length : todaysTasks.length}
              </span>
              <span style={{ color: TOK.ink2, fontSize: 13, fontFamily: FONT_TEXT }}>
                · {googleConnected ? 'events on calendar' : 'open tasks'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12, color: TOK.ink2, fontFamily: FONT_TEXT }}>
              <span>{open} open</span><span>{done} done</span>
              <span style={{ color: TOK.ink3 }}>· {todayEntry?.body ? 'journaled' : 'no journal yet'}</span>
            </div>
            {!googleConnected && googleConfigured && (
              <button onClick={onConnectGoogle}
                style={{
                  marginTop: 12, fontSize: 12, color: TOK.ink0, background: 'rgba(20,16,12,0.05)',
                  border: 'none', padding: '5px 11px', borderRadius: TOK.rPill, cursor: 'pointer',
                  fontFamily: FONT_TEXT,
                }}>
                {googleLoading ? 'Loading…' : 'Connect Google Calendar'}
              </button>
            )}
            {!googleConfigured && (
              <div style={{ marginTop: 12, fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT }}>
                Add <span style={{ color: TOK.ink1, fontFamily: 'monospace' }}>PUBLIC_GOOGLE_CLIENT_ID</span> to .env to connect calendar
              </div>
            )}
          </div>
        </Card>

        <Card hero style={{ padding: 22 }}>
          <CardLabel>Network pulse</CardLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 44, fontWeight: 300, letterSpacing: '-0.03em', fontFamily: FONT_DISPLAY, color: TOK.ink0 }}>{needs}</span>
            <span style={{ color: TOK.ink2, fontSize: 13, fontFamily: FONT_TEXT }}>
              {needs === 1 ? 'reply needed' : 'replies needed'}
            </span>
          </div>
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12.5, fontFamily: FONT_TEXT }}>
            <PulseRow label="Calls booked" v={callsBooked} />
            <PulseRow label="Awaiting reply" v={awaiting} />
            <PulseRow label="Active" v={active} />
            <PulseRow label="Archived" v={cold} tone={cold > 5 ? 'bad' : undefined} />
          </div>
          <button onClick={() => onNavigate('network')} style={{
            marginTop: 14, fontSize: 12, color: TOK.ink2, background: 'transparent',
            border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONT_TEXT, textDecoration: 'underline',
            textUnderlineOffset: 3, textDecorationColor: TOK.ink3,
          }}>open network →</button>
        </Card>
      </div>

      {/* Today's focus */}
      <Card style={{ marginBottom: 14, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div>
            <CardLabel style={{ marginBottom: 2 }}>Today's focus</CardLabel>
            <div style={{ fontSize: 13, color: TOK.ink2, fontFamily: FONT_TEXT }}>{open} open · {done} done</div>
          </div>
          <button onClick={() => onNavigate('tasks')} style={{
            appearance: 'none', border: 0, background: 'transparent', fontFamily: FONT_TEXT,
            fontSize: 12, color: TOK.ink2, cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
          }}>open tasks →</button>
        </div>

        {/* Quick add */}
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

        {todaysTasks.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: TOK.ink3, fontSize: 13, fontFamily: FONT_TEXT }}>
            All clear. Add a task above ↑
          </div>
        ) : (
          <div>
            {todaysTasks.slice(0, 8).map(item => (
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

      {/* 3-up: 7-day · goals · finance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card>
          <CardLabel>Next 7 days</CardLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {days.map((x, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '8px 0', borderRadius: 10,
                background: x.today ? TOK.ink0 : 'transparent',
                color: x.today ? '#fffaf2' : TOK.ink1,
                fontFamily: FONT_TEXT,
              }}>
                <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 500 }}>{x.d}</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>{x.n}</div>
              </div>
            ))}
          </div>
          <div style={{
            fontSize: 12.5, color: TOK.ink2, padding: '10px 0 0',
            borderTop: `0.5px solid ${TOK.hair}`, marginTop: 12, fontFamily: FONT_TEXT,
          }}>
            {googleConnected ? `${googleEvents.length} upcoming events` : 'No calendar connected · '}
            {!googleConnected && googleConfigured && (
              <span onClick={onConnectGoogle} style={{
                color: TOK.ink0, textDecoration: 'underline', textDecorationColor: TOK.ink3,
                textUnderlineOffset: 3, cursor: 'pointer',
              }}>connect calendar</span>
            )}
          </div>
        </Card>

        <Card>
          <CardLabel>Active goals</CardLabel>
          {activeGoals.length === 0 ? (
            <div style={{ fontSize: 13, color: TOK.ink3, padding: '20px 0', textAlign: 'center', fontFamily: FONT_TEXT }}>
              No active goals · <span onClick={() => onNavigate('goals')} style={{ color: TOK.ink0, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>add one</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
              {activeGoals.map(g => <GoalRow key={g.id} title={g.title} pct={g.progress} />)}
            </div>
          )}
        </Card>

        <Card>
          <CardLabel>This month</CardLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <Mini label="In" v={`$${income.toFixed(0)}`} tone={TOK.good} />
            <Mini label="Out" v={`$${spending.toFixed(0)}`} tone={TOK.bad} />
            <Mini label="Saved" v={`${saved}%`} />
          </div>
          <div style={{ marginTop: 14, height: 5, borderRadius: 999, background: 'rgba(20,16,12,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, saved)}%`, background: TOK.good, height: '100%' }}></div>
          </div>
        </Card>
      </div>

      {/* Today's journal */}
      <Card style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <CardLabel style={{ marginBottom: 0 }}>Journal · today</CardLabel>
          <span style={{ fontSize: 11, color: TOK.ink3, fontFamily: FONT_TEXT }}>private · auto-saving</span>
        </div>
        <textarea
          value={todayEntry?.body || ''}
          onChange={e => updateJournal({ body: e.target.value })}
          rows={3}
          placeholder="What did you do today? Wins, blockers, threads to pull tomorrow…"
          style={{
            width: '100%', background: 'transparent', border: 0, padding: 0,
            fontSize: 14, lineHeight: 1.6, fontFamily: FONT_TEXT, color: TOK.ink0,
            outline: 'none', resize: 'vertical', minHeight: 60,
          }}
        />
      </Card>
    </div>
  );
}

const Mini = ({ label, v, tone }: { label: string; v: string; tone?: string }) => (
  <div>
    <div style={{ fontSize: 11, color: TOK.ink2, fontFamily: FONT_TEXT }}>{label}</div>
    <div style={{
      fontSize: 17, fontWeight: 500, color: tone || TOK.ink0, fontFamily: FONT_TEXT,
      fontVariantNumeric: 'tabular-nums',
    }}>{v}</div>
  </div>
);

const PulseRow = ({ label, v, tone }: { label: string; v: number | string; tone?: 'bad' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', color: TOK.ink1 }}>
    <span>{label}</span>
    <span style={{
      color: tone === 'bad' ? TOK.bad : TOK.ink0, fontWeight: 500,
      fontVariantNumeric: 'tabular-nums',
    }}>{v}</span>
  </div>
);

const GoalRow = ({ title, pct }: { title: string; pct: number }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <span style={{ fontSize: 13, fontFamily: FONT_TEXT, color: TOK.ink0 }}>{title}</span>
      <span style={{ fontSize: 12, color: TOK.ink2, fontVariantNumeric: 'tabular-nums', fontFamily: FONT_TEXT }}>{pct}%</span>
    </div>
    <div style={{ height: 4, borderRadius: 999, background: 'rgba(20,16,12,0.06)', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, background: TOK.ink0, height: '100%' }}></div>
    </div>
  </div>
);

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

function Goals({ goals, setGoals }: {
  goals: Goal[]; setGoals: (fn: (prev: Goal[]) => Goal[]) => void;
}) {
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState<{ title: string; description: string; deadline: string; scope: string }>({
    title: '', description: '', deadline: '', scope: '',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const active = goals.filter(g => g.status === 'active');
  const dueThisMonth = active.filter(g => {
    if (!g.deadline) return false;
    return monthKey(g.deadline) === thisMonthKey();
  }).length;

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
          <Btn ghost>Archive</Btn>
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
              No goals yet · click + Goal to add one
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

function Finance({ finance, setFinance }: {
  finance: FinanceData;
  setFinance: (fn: (prev: FinanceData) => FinanceData) => void;
}) {
  const monthStart = thisMonthKey();
  const monthTx = finance.transactions.filter(t => monthKey(t.date) === monthStart);
  const incomeTx = monthTx.filter(t => t.type === 'income');
  const expenseTx = monthTx.filter(t => t.type === 'expense');
  const income = incomeTx.reduce((s, t) => s + toCAD(t.amount, t.currency), 0);
  const spending = expenseTx.reduce((s, t) => s + toCAD(t.amount, t.currency), 0);
  const net = income - spending;
  const savedPct = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;

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

      {/* Net hero */}
      <Card hero style={{ padding: 26, marginBottom: 14 }}>
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
   BLACKBOOK DASHBOARD (chrome + tab routing)
   ═══════════════════════════════════════════════════════════ */

type BlackbookTab = 'dashboard' | 'journal' | 'network' | 'tasks' | 'goals' | 'finance';
const TABS: BlackbookTab[] = ['dashboard', 'journal', 'network', 'tasks', 'goals', 'finance'];

export function BlackbookDashboard({ onClose, onLogout, passHash, transparent }: {
  onClose: () => void; onLogout?: () => void; passHash: string; transparent?: boolean;
}) {
  const [tab, setTab] = useState<BlackbookTab>('dashboard');
  const [journal, setJournal] = useState<JournalEntry[]>(() => load('journal', []));
  const [contacts, setContacts] = useState<NetworkContact[]>(() => load('contacts', DEFAULT_CONTACTS));
  const [ideas, setIdeas] = useState<ProjectIdea[]>(() => load('ideas', []));
  const [tasks, setTasks] = useState<Task[]>(() => load('tasks', []));
  const [goals, setGoals] = useState<Goal[]>(() => load('goals', []));
  const [finance, setFinance] = useState<FinanceData>(() => load('finance', DEFAULT_FINANCE));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error' | 'retrying'>('saved');
  const [synced, setSynced] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveQueueRef = useRef(new SaveQueue());

  const gcal = useGoogleCalendar();

  const sectionTs = useRef({ journal: '', contacts: '', ideas: '', tasks: '', goals: '', finance: '' });

  const journalRef = useRef(journal);
  const contactsRef = useRef(contacts);
  const ideasRef = useRef(ideas);
  const tasksRef = useRef(tasks);
  const goalsRef = useRef(goals);
  const financeRef = useRef(finance);
  useEffect(() => { journalRef.current = journal; }, [journal]);
  useEffect(() => { contactsRef.current = contacts; }, [contacts]);
  useEffect(() => { ideasRef.current = ideas; }, [ideas]);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);
  useEffect(() => { goalsRef.current = goals; }, [goals]);
  useEffect(() => { financeRef.current = finance; }, [finance]);

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
        journalUpdatedAt: load('journalUpdatedAt', ''),
        contactsUpdatedAt: load('contactsUpdatedAt', ''),
        ideasUpdatedAt: load('ideasUpdatedAt', ''),
        tasksUpdatedAt: load('tasksUpdatedAt', ''),
        goalsUpdatedAt: load('goalsUpdatedAt', ''),
        financeUpdatedAt: load('financeUpdatedAt', ''),
      };

      const merged = mergeCloudLocal(cloud, localData);
      let loadedJournal = merged.journal ?? [];
      let loadedContacts = merged.contacts ?? [];
      const loadedIdeas = merged.ideas ?? [];
      const loadedTasks = merged.tasks ?? [];
      const loadedGoals = merged.goals ?? [];
      const loadedFinance = (merged.finance && typeof merged.finance === 'object' && Array.isArray((merged.finance as any).accounts))
        ? merged.finance : DEFAULT_FINANCE;

      const now = new Date().toISOString();
      sectionTs.current = {
        journal: merged.journalUpdatedAt || now,
        contacts: merged.contactsUpdatedAt || now,
        ideas: merged.ideasUpdatedAt || now,
        tasks: merged.tasksUpdatedAt || now,
        goals: merged.goalsUpdatedAt || now,
        finance: merged.financeUpdatedAt || now,
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

      save('journal', loadedJournal);
      save('contacts', loadedContacts);
      save('ideas', loadedIdeas);
      save('tasks', loadedTasks);
      save('goals', loadedGoals);
      save('finance', loadedFinance);

      const payload: BlackbookData = {
        journal: loadedJournal, contacts: loadedContacts, ideas: loadedIdeas,
        tasks: loadedTasks, goals: loadedGoals, finance: loadedFinance,
        journalUpdatedAt: sectionTs.current.journal,
        contactsUpdatedAt: sectionTs.current.contacts,
        ideasUpdatedAt: sectionTs.current.ideas,
        tasksUpdatedAt: sectionTs.current.tasks,
        goalsUpdatedAt: sectionTs.current.goals,
        financeUpdatedAt: sectionTs.current.finance,
      };
      saveToCloud(passHash, payload);
      setSynced(true);
      setSaveStatus('saved');
    });
  }, [passHash]);

  const buildPayload = useCallback((): BlackbookData => ({
    journal: journalRef.current, contacts: contactsRef.current, ideas: ideasRef.current,
    tasks: tasksRef.current, goals: goalsRef.current, finance: financeRef.current,
    journalUpdatedAt: sectionTs.current.journal,
    contactsUpdatedAt: sectionTs.current.contacts,
    ideasUpdatedAt: sectionTs.current.ideas,
    tasksUpdatedAt: sectionTs.current.tasks,
    goalsUpdatedAt: sectionTs.current.goals,
    financeUpdatedAt: sectionTs.current.finance,
  }), []);

  const syncToCloud = useCallback(() => {
    save('journal', journalRef.current);
    save('contacts', contactsRef.current);
    save('ideas', ideasRef.current);
    save('tasks', tasksRef.current);
    save('goals', goalsRef.current);
    save('finance', financeRef.current);
    save('journalUpdatedAt', sectionTs.current.journal);
    save('contactsUpdatedAt', sectionTs.current.contacts);
    save('ideasUpdatedAt', sectionTs.current.ideas);
    save('tasksUpdatedAt', sectionTs.current.tasks);
    save('goalsUpdatedAt', sectionTs.current.goals);
    save('financeUpdatedAt', sectionTs.current.finance);
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
    save('journalUpdatedAt', sectionTs.current.journal);
    save('contactsUpdatedAt', sectionTs.current.contacts);
    save('ideasUpdatedAt', sectionTs.current.ideas);
    save('tasksUpdatedAt', sectionTs.current.tasks);
    save('goalsUpdatedAt', sectionTs.current.goals);
    save('financeUpdatedAt', sectionTs.current.finance);
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
            {tab === 'dashboard' && (
              <Dashboard
                journal={journal} setJournal={setJournal}
                contacts={contacts} tasks={tasks} setTasks={setTasks}
                goals={goals} finance={finance}
                googleEvents={gcal.events}
                googleConfigured={gcal.isConfigured}
                googleConnected={!!gcal.token}
                googleLoading={gcal.loading}
                onConnectGoogle={gcal.connect}
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
            {tab === 'finance' && <Finance finance={finance} setFinance={setFinance} />}
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
