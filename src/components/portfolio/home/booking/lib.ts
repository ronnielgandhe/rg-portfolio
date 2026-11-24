export type Slot = { t: string; u: string };
export type MonthData =
  | { status: 'loading' }
  | { status: 'ok'; slots: Slot[]; duration: number; mock?: boolean }
  | { status: 'unconfigured' | 'error'; url: string };

export type YM = { y: number; m: number };

export const PUBLIC_URL = 'https://calendly.com/ronnielgandhe/30min';
export const TITLE = 'call with ronniel gandhe';
export const AHEAD = 3;

export const ymKey = ({ y, m }: YM) => `${y}-${String(m).padStart(2, '0')}`;
export const addMonths = ({ y, m }: YM, n: number): YM => {
  const i = y * 12 + (m - 1) + n;
  return { y: Math.floor(i / 12), m: (i % 12) + 1 };
};
export const cmpYM = (a: YM, b: YM) => (a.y - b.y) * 12 + (a.m - b.m);
export const daysIn = ({ y, m }: YM) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export const weekday = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
export const dayKey = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
export const parseDay = (k: string) => { const [y, m, d] = k.split('-').map(Number); return { y, m, d }; };

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(tz: string, opts: Intl.DateTimeFormatOptions, locale = 'en-US') {
  const k = tz + locale + JSON.stringify(opts);
  let f = fmtCache.get(k);
  if (!f) { f = new Intl.DateTimeFormat(locale, { timeZone: tz, ...opts }); fmtCache.set(k, f); }
  return f;
}

export const localDay = (iso: string | Date, tz: string) =>
  fmt(tz, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en-CA').format(typeof iso === 'string' ? new Date(iso) : iso);

export const timeLabel = (iso: string, tz: string) =>
  fmt(tz, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso)).replace(' ', '').toLowerCase();

export const dayLabel = (k: string) => {
  const { y, m, d } = parseDay(k);
  return fmt('UTC', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(Date.UTC(y, m - 1, d))).toLowerCase();
};

export const monthLabel = ({ y, m }: YM) => fmt('UTC', { month: 'long', year: 'numeric' }).format(new Date(Date.UTC(y, m - 1, 1))).toLowerCase();

export const fullLabel = (iso: string, tz: string) =>
  fmt(tz, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(iso)).toLowerCase();

export function tzLabel(tz: string) {
  const city = tz.split('/').pop()!.replace(/_/g, ' ').toLowerCase();
  const off = fmt(tz, { timeZoneName: 'shortOffset' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value ?? '';
  return `${city} (${off.toLowerCase()})`;
}

export function zones(current: string) {
  const all = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.('timeZone') ?? [];
  return all.includes(current) ? all : [current, ...all];
}

const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function googleUrl(start: string, end: string) {
  const q = new URLSearchParams({ action: 'TEMPLATE', text: TITLE, dates: `${stamp(start)}/${stamp(end)}`, details: 'booked from ronnielgandhe.com' });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function downloadIcs(start: string, end: string, extra: string[] = []) {
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ronnielgandhe.com//booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${stamp(start)}-${Math.random().toString(36).slice(2)}@ronnielgandhe.com`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(TITLE)}`,
    `DESCRIPTION:${esc(['booked from ronnielgandhe.com', ...extra].join('\n'))}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
  a.download = 'call-with-ronniel.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
